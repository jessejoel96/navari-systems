import { optionalEnv, requireEnv } from "./env.js";
import type { IcpConfig, Prospect } from "./types.js";

const APOLLO_BASE = "https://api.apollo.io/api/v1";

type ApolloPerson = {
  id?: string;
  first_name?: string;
  last_name?: string;
  name?: string;
  title?: string;
  linkedin_url?: string;
  email?: string;
  email_status?: string;
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

function buildSearchParams(icp: IcpConfig, page: number): URLSearchParams {
  const params = new URLSearchParams();
  params.set("page", String(page));
  params.set("per_page", String(icp.per_page));

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

  for (let page = 1; page <= icp.max_pages; page++) {
    const params = buildSearchParams(icp, page);
    const data = await apolloFetch(`/mixed_people/api_search?${params.toString()}`, {
      method: "POST",
    });
    const batch = (data.people ?? []) as ApolloPerson[];
    people.push(...batch);
    if (batch.length < icp.per_page) break;
  }

  return people;
}

export async function enrichPerson(person: ApolloPerson): Promise<ApolloPerson | null> {
  const payload: Record<string, unknown> = {
    reveal_personal_emails: false,
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

  const match = data.person as ApolloPerson | undefined;
  return match ?? null;
}

export function mapApolloPerson(person: ApolloPerson, enriched?: ApolloPerson | null): Prospect {
  const p = enriched ?? person;
  const location = [p.city, p.state, p.country].filter(Boolean).join(", ");

  return {
    apollo_id: p.id,
    first_name: p.first_name,
    last_name: p.last_name,
    full_name: p.name ?? ([p.first_name, p.last_name].filter(Boolean).join(" ") || undefined),
    title: p.title,
    email: p.email,
    email_status: p.email_status,
    linkedin_url: p.linkedin_url,
    company_name: p.organization?.name,
    company_domain: p.organization?.primary_domain,
    company_industry: p.organization?.industry,
    company_size: p.organization?.estimated_num_employees
      ? String(p.organization.estimated_num_employees)
      : undefined,
    location: location || undefined,
    source: "apollo",
    raw: { search: person, enriched: enriched ?? null },
  };
}

export function hasApolloKey(): boolean {
  return Boolean(optionalEnv("APOLLO_API_KEY"));
}
