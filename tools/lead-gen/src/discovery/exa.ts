import { optionalEnv, requireEnv } from "../env.js";
import type { IcpConfig } from "../types.js";
import type { DiscoveryResult } from "./parse.js";

const EXA_SEARCH_URL = "https://api.exa.ai/search";

export function hasExaKey(): boolean {
  return Boolean(optionalEnv("EXA_API_KEY"));
}

export function buildExaPeopleQuery(icp: IcpConfig): string {
  const titles = icp.person_titles.slice(0, 3).join(" or ");
  const industries = icp.organization_industries.slice(0, 3).join(", ");
  const locations = icp.person_locations.slice(0, 2).join(" or ");
  const keywords = (icp.keywords ?? []).slice(0, 2).join(" ");

  return [titles, industries, locations, keywords, "SMB 11-200 employees"]
    .filter(Boolean)
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
}

export function buildExaCompanyQuery(icp: IcpConfig): string {
  const industries = icp.organization_industries.slice(0, 3).join(", ");
  const locations = icp.person_locations.slice(0, 2).join(" or ");
  const keywords = (icp.keywords ?? []).slice(0, 2).join(" ");

  return [`companies in ${industries}`, locations, keywords, "11 to 200 employees"]
    .filter(Boolean)
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
}

type ExaSearchResult = {
  title?: string;
  url?: string;
  text?: string;
  highlights?: string[];
};

export async function exaSearch(
  query: string,
  options: { category?: "people" | "company"; numResults?: number } = {},
): Promise<DiscoveryResult[]> {
  const key = requireEnv("EXA_API_KEY");
  const numResults = options.numResults ?? 20;

  const response = await fetch(EXA_SEARCH_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": key,
    },
    body: JSON.stringify({
      query,
      type: "auto",
      category: options.category ?? "people",
      numResults: Math.min(numResults, 100),
      contents: { highlights: { numSentences: 2, highlightsPerUrl: 1 } },
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Exa search failed (${response.status}): ${body.slice(0, 400)}`);
  }

  const data = (await response.json()) as { results?: ExaSearchResult[] };

  return (data.results ?? [])
    .filter((result) => result.url && result.title)
    .map((result) => ({
      title: result.title!,
      url: result.url!,
      description: result.highlights?.[0] ?? result.text?.slice(0, 280) ?? "",
    }));
}

export async function discoverWithExa(icp: IcpConfig): Promise<DiscoveryResult[]> {
  const limit = icp.per_page * icp.max_pages;
  const peopleQuery = buildExaPeopleQuery(icp);
  const companyQuery = buildExaCompanyQuery(icp);

  const [people, companies] = await Promise.all([
    exaSearch(peopleQuery, { category: "people", numResults: Math.min(limit, 50) }),
    exaSearch(companyQuery, { category: "company", numResults: Math.min(Math.ceil(limit / 2), 25) }),
  ]);

  return [...people, ...companies];
}
