import { optionalEnv, requireEnv } from "./env.js";
import type { Prospect } from "./types.js";

const RENIDLY_BASE = "https://renidly.com";

type RenidlyEnvelope<T> = {
  success: boolean;
  statusCode: number;
  message: string;
  errors: Record<string, string> | null;
  data: T | null;
};

async function renidlyGet<T>(path: string, params: Record<string, string> = {}): Promise<T | null> {
  const key = requireEnv("RENIDLY_API_KEY");
  const url = new URL(`${RENIDLY_BASE}${path}`);
  for (const [name, value] of Object.entries(params)) {
    if (value) url.searchParams.set(name, value);
  }

  const response = await fetch(url, {
    headers: { "X-renidly-apikey": key },
  });

  const body = (await response.json()) as RenidlyEnvelope<T>;
  if (!body.success || body.data === null) {
    return null;
  }

  return body.data;
}

function linkedinHandleFromUrl(url?: string): string | undefined {
  if (!url) return undefined;
  const match = url.match(/linkedin\.com\/in\/([a-zA-Z0-9_-]+)/i);
  return match?.[1];
}

function mapRenidlyPerson(record: Record<string, unknown>): Prospect {
  const positions = (record.full_positions ?? record.positions ?? []) as Array<
    Record<string, unknown>
  >;
  const current = positions[0] ?? {};
  const handle = (record.handle as string | undefined) ?? linkedinHandleFromUrl(record.url as string);

  const first_name = record.first_name as string | undefined;
  const last_name = record.last_name as string | undefined;

  return {
    external_id: record.id as string | undefined,
    first_name,
    last_name,
    full_name:
      [first_name, last_name].filter(Boolean).join(" ") ||
      (record.full_name as string | undefined),
    title: (current.title ?? record.headline ?? record.title) as string | undefined,
    company_name: (current.company_name ?? current.company ?? record.company_name) as
      | string
      | undefined,
    company_domain: (current.company_domain ?? current.domain ?? record.company_domain) as
      | string
      | undefined,
    company_industry: (current.industry ?? record.industry) as string | undefined,
    location:
      [record.geo_city, record.geo_country].filter(Boolean).join(", ") ||
      (record.location as string | undefined),
    linkedin_url: handle ? `https://www.linkedin.com/in/${handle}` : undefined,
    email: (record.email ?? record.work_email ?? record.primary_email) as string | undefined,
    email_status: record.email ? "renidly" : undefined,
    source: "renidly",
    icp_score: 0,
    icp_tier: "cold" as const,
    raw: { renidly: record },
  };
}

function extractPeopleRecords(data: unknown): Record<string, unknown>[] {
  if (Array.isArray(data)) return data as Record<string, unknown>[];
  if (!data || typeof data !== "object") return [];

  const record = data as Record<string, unknown>;
  for (const key of ["results", "people", "items", "profiles"]) {
    const value = record[key];
    if (Array.isArray(value)) return value as Record<string, unknown>[];
  }

  return [];
}

export function hasRenidlyKey(): boolean {
  return Boolean(optionalEnv("RENIDLY_API_KEY"));
}

export async function enrichByHandle(handle: string): Promise<Prospect | null> {
  const data = await renidlyGet<Record<string, unknown>>("/api/data/v1/people/profile", {
    handle,
  });
  return data ? mapRenidlyPerson(data) : null;
}

export async function enrichPerson(params: {
  handle?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  domain?: string;
  entityId?: string;
}): Promise<Prospect | null> {
  const query: Record<string, string> = {};
  if (params.handle) query.handle = params.handle;
  if (params.email) query.email = params.email;
  if (params.firstName) query.first_name = params.firstName;
  if (params.lastName) query.last_name = params.lastName;
  if (params.domain) query.domain = params.domain;
  if (params.entityId) query.entityId = params.entityId;

  const data = await renidlyGet<Record<string, unknown>>("/api/v2/person/enrich", query);
  return data ? mapRenidlyPerson(data) : null;
}

export async function enrichOrganization(domain: string): Promise<{
  name?: string;
  industry?: string;
  employeeCount?: string;
} | null> {
  const data = await renidlyGet<Record<string, unknown>>("/api/v2/organization/enrich", {
    domain,
  });
  if (!data) return null;

  return {
    name: (data.name ?? data.company_name) as string | undefined,
    industry: data.industry as string | undefined,
    employeeCount: String(data.employee_count ?? data.headcount ?? ""),
  };
}

export async function searchPeople(query: string, limit = 25): Promise<Prospect[]> {
  const data = await renidlyGet<unknown>("/api/v2/discover/people", {
    q: query,
    limit: String(Math.min(limit, 100)),
  });

  return extractPeopleRecords(data).map(mapRenidlyPerson);
}

export async function enrichProspectWithRenidly(prospect: Prospect): Promise<Prospect> {
  if (!hasRenidlyKey()) return prospect;

  const handle =
    linkedinHandleFromUrl(prospect.linkedin_url) ??
    (prospect.raw?.renidly as { handle?: string } | undefined)?.handle;

  let enriched: Prospect | null = null;

  if (handle) {
    enriched = await enrichByHandle(handle);
  } else if (prospect.first_name && prospect.last_name && prospect.company_domain) {
    enriched = await enrichPerson({
      firstName: prospect.first_name,
      lastName: prospect.last_name,
      domain: prospect.company_domain,
    });
  } else if (prospect.email) {
    enriched = await enrichPerson({ email: prospect.email });
  }

  if (!enriched) return prospect;

  return {
    ...prospect,
    ...enriched,
    external_id: enriched.external_id ?? prospect.external_id,
    email: enriched.email ?? prospect.email,
    email_status: enriched.email_status ?? prospect.email_status,
    company_name: enriched.company_name ?? prospect.company_name,
    company_domain: enriched.company_domain ?? prospect.company_domain,
    company_industry: enriched.company_industry ?? prospect.company_industry,
    title: enriched.title ?? prospect.title,
    linkedin_url: enriched.linkedin_url ?? prospect.linkedin_url,
    source: prospect.source.includes("renidly") ? prospect.source : `${prospect.source}+renidly`,
    raw: { ...prospect.raw, ...enriched.raw },
  };
}
