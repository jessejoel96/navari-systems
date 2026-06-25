import { optionalEnv, requireEnv } from "./env.js";
import type { IcpConfig, Prospect } from "./types.js";

const APOLLO_BASE = "https://api.apollo.io/api/v1";
const BULK_MATCH_MAX = 10;

export type ApolloPerson = {
  id?: string;
  first_name?: string;
  last_name?: string;
  last_name_obfuscated?: string;
  name?: string;
  title?: string;
  linkedin_url?: string;
  email?: string;
  email_status?: string;
  has_email?: boolean;
  city?: string;
  state?: string;
  country?: string;
  organization?: {
    name?: string;
    primary_domain?: string;
    industry?: string;
    estimated_num_employees?: number;
  };
};

type ApolloSearchResponse = {
  people?: ApolloPerson[];
  total_entries?: number;
};

type ApolloBulkMatchResponse = {
  matches?: ApolloPerson[];
  credits_consumed?: number;
};

let enrichCreditsUsed = 0;

export function resetApolloEnrichBudget(): void {
  enrichCreditsUsed = 0;
}

export function getApolloEnrichCreditsUsed(): number {
  return enrichCreditsUsed;
}

function buildSearchParams(icp: IcpConfig, page: number): URLSearchParams {
  const params = new URLSearchParams();
  params.set("page", String(page));
  params.set("per_page", String(Math.min(icp.per_page, 100)));

  for (const title of icp.person_titles) params.append("person_titles[]", title);
  for (const seniority of icp.person_seniorities) params.append("person_seniorities[]", seniority);
  for (const industry of icp.organization_industries) {
    params.append("organization_industries[]", industry);
  }
  for (const range of icp.organization_num_employees_ranges) {
    params.append("organization_num_employees_ranges[]", range);
  }
  for (const location of icp.person_locations) params.append("person_locations[]", location);
  for (const tag of icp.q_organization_keyword_tags ?? icp.keywords ?? []) {
    params.append("q_organization_keyword_tags[]", tag);
  }

  return params;
}

async function apolloFetch(path: string, init?: RequestInit) {
  const key = requireEnv("APOLLO_API_KEY");
  const response = await fetch(`${APOLLO_BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      accept: "application/json",
      "Cache-Control": "no-cache",
      "x-api-key": key,
      ...(init?.headers ?? {}),
    },
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Apollo ${path} failed (${response.status}): ${body.slice(0, 500)}`);
  }

  return response.json() as Promise<Record<string, unknown>>;
}

export async function searchPeople(icp: IcpConfig): Promise<ApolloPerson[]> {
  const people: ApolloPerson[] = [];
  const maxPages =
    icp.apollo_plan === "free"
      ? Math.min(icp.max_pages, 2)
      : icp.max_pages;

  for (let page = 1; page <= maxPages; page++) {
    const params = buildSearchParams(icp, page);
    const data = (await apolloFetch(`/mixed_people/api_search?${params.toString()}`, {
      method: "POST",
    })) as ApolloSearchResponse;

    const batch = data.people ?? [];
    people.push(...batch);
    if (batch.length < icp.per_page) break;
    await sleep(350);
  }

  return people;
}

export async function bulkEnrichPeople(ids: string[]): Promise<ApolloPerson[]> {
  if (ids.length === 0) return [];
  if (ids.length > BULK_MATCH_MAX) {
    throw new Error(`Apollo bulk_match accepts at most ${BULK_MATCH_MAX} ids per request`);
  }

  const data = (await apolloFetch(
    "/people/bulk_match?reveal_personal_emails=false&reveal_phone_number=false",
    {
      method: "POST",
      body: JSON.stringify({ details: ids.map((id) => ({ id })) }),
    },
  )) as ApolloBulkMatchResponse;

  enrichCreditsUsed += data.credits_consumed ?? ids.length;
  return data.matches ?? [];
}

export async function enrichPerson(person: ApolloPerson): Promise<ApolloPerson | null> {
  const payload: Record<string, unknown> = {
    reveal_personal_emails: false,
    reveal_phone_number: false,
  };

  if (person.id) payload.id = person.id;
  if (person.email) payload.email = person.email;
  if (person.linkedin_url) payload.linkedin_url = person.linkedin_url;
  if (person.first_name) payload.first_name = person.first_name;
  if (person.last_name) payload.last_name = person.last_name;
  if (person.organization?.primary_domain) {
    payload.domain = person.organization.primary_domain;
  }

  const data = await apolloFetch("/people/match", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  enrichCreditsUsed += 1;
  const match = data.person as ApolloPerson | undefined;
  return match ?? null;
}

export function mapApolloPerson(person: ApolloPerson, enriched?: ApolloPerson | null): Prospect {
  const p = enriched ?? person;
  const location = [p.city, p.state, p.country].filter(Boolean).join(", ");

  return {
    apollo_id: p.id ?? person.id,
    first_name: p.first_name ?? person.first_name,
    last_name: p.last_name,
    full_name:
      p.name ??
      ([p.first_name ?? person.first_name, p.last_name].filter(Boolean).join(" ") || undefined),
    title: p.title ?? person.title,
    email: p.email,
    email_status: p.email_status,
    linkedin_url: p.linkedin_url,
    company_name: p.organization?.name ?? person.organization?.name,
    company_domain: p.organization?.primary_domain,
    company_industry: p.organization?.industry,
    company_size: p.organization?.estimated_num_employees
      ? String(p.organization.estimated_num_employees)
      : undefined,
    location: location || undefined,
    source: enriched ? "apollo-enriched" : "apollo-search",
    icp_score: 0,
    icp_tier: "cold" as const,
    raw: {
      apollo_search: person,
      apollo_enriched: enriched ?? null,
      has_email: person.has_email ?? Boolean(p.email),
    },
  };
}

export function discoverApolloProspects(icp: IcpConfig): Promise<Prospect[]> {
  return searchPeople(icp).then((people) => people.map((person) => mapApolloPerson(person)));
}

function shouldEnrichOnFreePlan(person: ApolloPerson): boolean {
  return person.has_email === true;
}

function enrichLimit(icp: IcpConfig): number {
  if (icp.apollo_plan === "paid") {
    return icp.apollo_enrich_limit > 0 ? icp.apollo_enrich_limit : 100;
  }
  return Math.min(icp.apollo_enrich_limit, 50);
}

export async function enrichApolloProspects(
  prospects: Prospect[],
  icp: IcpConfig,
): Promise<Prospect[]> {
  resetApolloEnrichBudget();
  const limit = enrichLimit(icp);
  if (limit === 0) return prospects;

  const candidates = prospects.filter((prospect) => {
    if (!prospect.apollo_id) return false;
    if (prospect.email) return false;

    const search = prospect.raw?.apollo_search as ApolloPerson | undefined;
    if (icp.apollo_plan === "free") {
      return shouldEnrichOnFreePlan(search ?? { has_email: prospect.raw?.has_email as boolean });
    }
    return true;
  });

  const toEnrich = candidates.slice(0, limit);
  if (toEnrich.length === 0) return prospects;

  const enrichedById = new Map<string, ApolloPerson>();

  for (let index = 0; index < toEnrich.length; index += BULK_MATCH_MAX) {
    if (enrichCreditsUsed >= limit) break;

    const batch = toEnrich.slice(index, index + BULK_MATCH_MAX);
    const remaining = limit - enrichCreditsUsed;
    const ids = batch.map((p) => p.apollo_id!).slice(0, remaining);

    try {
      const matches = await bulkEnrichPeople(ids);
      for (const match of matches) {
        if (match.id) enrichedById.set(match.id, match);
      }
    } catch {
      for (const prospect of batch) {
        if (!prospect.apollo_id || enrichCreditsUsed >= limit) continue;
        try {
          const search = prospect.raw?.apollo_search as ApolloPerson | undefined;
          const match = await enrichPerson(search ?? { id: prospect.apollo_id });
          if (match?.id) enrichedById.set(match.id, match);
        } catch {
          // skip single-record failures
        }
      }
    }

    await sleep(400);
  }

  return prospects.map((prospect) => {
    if (!prospect.apollo_id) return prospect;
    const enriched = enrichedById.get(prospect.apollo_id);
    if (!enriched) return prospect;

    const search = (prospect.raw?.apollo_search as ApolloPerson | undefined) ?? {};
    return mapApolloPerson(search, enriched);
  });
}

export function hasApolloKey(): boolean {
  return Boolean(optionalEnv("APOLLO_API_KEY"));
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
