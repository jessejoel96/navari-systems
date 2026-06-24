import { braveSearch, hasBraveKey } from "./brave.js";
import { buildDiscoveryQueries } from "./queries.js";
import { parseSearchResults } from "./parse.js";
import type { IcpConfig, Prospect } from "../types.js";

export async function discoverProspects(icp: IcpConfig): Promise<Prospect[]> {
  if (!hasBraveKey()) {
    throw new Error(
      "BRAVE_API_KEY is required for web discovery. Add it to .env.local (or set discovery_provider to apollo with APOLLO_API_KEY).",
    );
  }

  const queries = buildDiscoveryQueries(icp);
  const allResults = [];

  for (const query of queries) {
    const batch = await braveSearch(query, Math.min(icp.per_page, 20));
    allResults.push(...batch);
    await sleep(400);
  }

  const parsed = parseSearchResults(allResults);
  return parsed.slice(0, icp.per_page * icp.max_pages);
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export { hasBraveKey };
