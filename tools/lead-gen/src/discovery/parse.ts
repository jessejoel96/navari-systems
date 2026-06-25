import type { Prospect } from "../types.js";

export type DiscoveryResult = {
  title: string;
  url: string;
  description: string;
};

const LINKEDIN_RE = /linkedin\.com\/in\/([a-zA-Z0-9_-]+)/i;
const DOMAIN_RE = /(?:https?:\/\/)?(?:www\.)?([a-z0-9][-a-z0-9]*\.[a-z]{2,})/i;
const SKIP_DOMAINS = new Set([
  "linkedin.com",
  "facebook.com",
  "twitter.com",
  "x.com",
  "instagram.com",
  "youtube.com",
  "wikipedia.org",
  "google.com",
  "indeed.com",
  "glassdoor.com",
]);

function extractDomain(url: string): string | undefined {
  try {
    const host = new URL(url).hostname.replace(/^www\./, "");
    if (SKIP_DOMAINS.has(host)) return undefined;
    return host;
  } catch {
    const match = url.match(DOMAIN_RE);
    const domain = match?.[1]?.toLowerCase();
    if (!domain || SKIP_DOMAINS.has(domain)) return undefined;
    return domain;
  }
}

function parseLinkedInProspect(result: DiscoveryResult): Prospect | null {
  const match = result.url.match(LINKEDIN_RE);
  if (!match) return null;

  const slug = match[1];
  const titleParts = result.title.split(/[-–|]/).map((s) => s.trim());
  const namePart = titleParts[0] ?? slug.replace(/-/g, " ");
  const rolePart = titleParts[1];
  const companyPart = titleParts[2];

  const nameTokens = namePart.split(/\s+/).filter(Boolean);
  const first_name = nameTokens[0];
  const last_name = nameTokens.length > 1 ? nameTokens.slice(1).join(" ") : undefined;

  return {
    first_name,
    last_name,
    full_name: namePart,
    title: rolePart,
    company_name: companyPart,
    linkedin_url: result.url.split("?")[0],
    source: "web-linkedin",
    icp_score: 0,
    icp_tier: "cold" as const,
    raw: { search_result: result },
  };
}

function parseCompanyProspect(result: DiscoveryResult): Prospect | null {
  const domain = extractDomain(result.url);
  if (!domain) return null;

  const company_name = result.title.split(/[-–|]/)[0]?.trim() || domain;

  return {
    company_name,
    company_domain: domain,
    source: "web-company",
    icp_score: 0,
    icp_tier: "cold" as const,
    raw: { search_result: result },
  };
}

export function parseSearchResults(results: DiscoveryResult[]): Prospect[] {
  const seen = new Set<string>();
  const prospects: Prospect[] = [];

  for (const result of results) {
    const linkedin = parseLinkedInProspect(result);
    if (linkedin) {
      const key = linkedin.linkedin_url ?? linkedin.full_name ?? "";
      if (key && !seen.has(key)) {
        seen.add(key);
        prospects.push(linkedin);
      }
      continue;
    }

    const company = parseCompanyProspect(result);
    if (company?.company_domain && !seen.has(company.company_domain)) {
      seen.add(company.company_domain);
      prospects.push(company);
    }
  }

  return prospects;
}
