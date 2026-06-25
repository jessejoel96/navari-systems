import { braveSearch, hasBraveKey } from "./brave.js";
import { buildDiscoveryQueries } from "./queries.js";
import { discoverWithExa, hasExaKey } from "./exa.js";
import { parseSearchResults } from "./parse.js";
import { discoverApolloProspects, hasApolloKey } from "../apollo.js";
import type { IcpConfig, Prospect } from "../types.js";

function dedupeProspects(prospects: Prospect[]): Prospect[] {
  const seen = new Set<string>();
  const unique: Prospect[] = [];

  for (const prospect of prospects) {
    const key =
      prospect.apollo_id ??
      prospect.linkedin_url ??
      prospect.email ??
      `${prospect.full_name ?? ""}:${prospect.company_domain ?? prospect.company_name ?? ""}`;

    if (!key || seen.has(key)) continue;
    seen.add(key);
    unique.push(prospect);
  }

  return unique;
}

async function discoverWithBrave(icp: IcpConfig): Promise<Prospect[]> {
  const queries = buildDiscoveryQueries(icp);
  const allResults = [];

  for (const query of queries) {
    const batch = await braveSearch(query, Math.min(icp.per_page, 20));
    allResults.push(...batch);
    await sleep(400);
  }

  return parseSearchResults(allResults);
}

async function discoverWithExaPeople(icp: IcpConfig): Promise<Prospect[]> {
  const results = await discoverWithExa(icp);
  return parseSearchResults(results).map((prospect) => ({
    ...prospect,
    source: prospect.source.startsWith("web") ? prospect.source.replace("web", "exa") : `exa-${prospect.source}`,
  }));
}

export async function discoverProspects(icp: IcpConfig): Promise<Prospect[]> {
  const provider = icp.discovery_provider ?? "hybrid";
  const limit = icp.per_page * icp.max_pages;

  if (provider === "exa") {
    if (!hasExaKey()) {
      throw new Error("EXA_API_KEY is required when discovery_provider is exa.");
    }
    return (await discoverWithExaPeople(icp)).slice(0, limit);
  }

  if (provider === "web") {
    if (!hasBraveKey()) {
      throw new Error(
        "BRAVE_API_KEY is required for web discovery. Add it to .env.local (or set discovery_provider to exa/hybrid with EXA_API_KEY).",
      );
    }
    return (await discoverWithBrave(icp)).slice(0, limit);
  }

  if (provider === "hybrid") {
    const batches: Prospect[] = [];

    if (hasExaKey()) {
      batches.push(...(await discoverWithExaPeople(icp)));
    }

    if (hasBraveKey()) {
      batches.push(...(await discoverWithBrave(icp)));
    }

    if (hasApolloKey()) {
      batches.push(...(await discoverApolloProspects(icp)));
    }

    if (batches.length === 0) {
      throw new Error(
        "Hybrid discovery needs at least one of EXA_API_KEY, BRAVE_API_KEY, or APOLLO_API_KEY in .env.local.",
      );
    }

    return dedupeProspects(batches).slice(0, limit);
  }

  throw new Error(`Unsupported discovery_provider: ${provider}`);
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export { hasBraveKey, hasExaKey, hasApolloKey };
