import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { discoverProspects } from "./discovery/index.js";
import { enrichProspect } from "./enrichment.js";
import {
  discoverApolloProspects,
  enrichApolloProspects,
  getApolloEnrichCreditsUsed,
  hasApolloKey,
} from "./apollo.js";
import { scoreProspect } from "./score.js";
import {
  completeFetchRun,
  createFetchRun,
  exportRunToCsv,
  listUndeliveredHot,
  markDelivered,
  saveProspects,
} from "./supabase.js";
import { icpSchema, type FetchRunSummary, type IcpConfig, type Prospect } from "./types.js";

const toolRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");

export function loadIcp(path?: string): IcpConfig {
  const icpPath = path ?? resolve(toolRoot, "icp.navari.json");
  const raw = JSON.parse(readFileSync(icpPath, "utf8"));
  return icpSchema.parse(raw);
}

async function discover(icp: IcpConfig): Promise<Prospect[]> {
  if (icp.discovery_provider === "apollo") {
    if (!hasApolloKey()) {
      throw new Error("APOLLO_API_KEY required when discovery_provider is apollo");
    }
    return discoverApolloProspects(icp);
  }
  return discoverProspects(icp);
}

export async function runFetch(icp: IcpConfig, options: { dryRun?: boolean } = {}) {
  const provider = icp.discovery_provider ?? "hybrid";
  const runId = options.dryRun ? `dry-${Date.now()}` : await createFetchRun(icp);
  let discovered = await discover(icp);

  if (!options.dryRun && hasApolloKey() && icp.apollo_enrich_limit > 0) {
    const hasApolloProspects = discovered.some((p) => p.apollo_id || p.source.startsWith("apollo"));
    if (hasApolloProspects) {
      discovered = await enrichApolloProspects(discovered, icp);
    }
  }

  const enriched: Prospect[] = [];
  for (const prospect of discovered) {
    let current = scoreProspect(prospect, icp);
    if (!options.dryRun) {
      current = scoreProspect(await enrichProspect(current, icp), icp);
    }
    enriched.push(current);
  }

  const summary: FetchRunSummary = {
    run_id: runId,
    icp_name: icp.name,
    provider,
    searched: discovered.length,
    enriched: enriched.filter((p) => p.email).length,
    verified: enriched.filter((p) => p.email_status === "valid" || p.email_status === "verified").length,
    saved: 0,
    hot: enriched.filter((p) => p.icp_tier === "hot").length,
    warm: enriched.filter((p) => p.icp_tier === "warm").length,
    cold: enriched.filter((p) => p.icp_tier === "cold").length,
    apollo_credits_used: getApolloEnrichCreditsUsed(),
  };

  if (!options.dryRun) {
    summary.saved = await saveProspects(runId, enriched);
    await completeFetchRun(runId, summary, "completed");
  }

  return { runId, summary, prospects: enriched };
}

export async function runDeliver() {
  const prospects = await listUndeliveredHot();
  const reportsDir = resolve(toolRoot, "reports");
  mkdirSync(reportsDir, { recursive: true });

  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const csvPath = resolve(reportsDir, `leads-${stamp}.csv`);

  const headers = [
    "id",
    "full_name",
    "title",
    "email",
    "company_name",
    "company_domain",
    "linkedin_url",
    "icp_score",
    "icp_tier",
    "source",
  ];
  const lines = [headers.join(",")];
  const ids: string[] = [];

  for (const row of prospects) {
    ids.push(row.id as string);
    lines.push(
      headers
        .map((h) => {
          const value = String((row as Record<string, unknown>)[h] ?? "");
          return value.includes(",") ? `"${value.replace(/"/g, '""')}"` : value;
        })
        .join(","),
    );
  }

  writeFileSync(csvPath, lines.join("\n"), "utf8");
  await markDelivered(ids);

  return { csvPath, count: prospects.length };
}

export async function runExport(runId: string) {
  const csv = await exportRunToCsv(runId);
  const reportsDir = resolve(toolRoot, "reports");
  mkdirSync(reportsDir, { recursive: true });
  const csvPath = resolve(reportsDir, `run-${runId}.csv`);
  writeFileSync(csvPath, csv, "utf8");
  return csvPath;
}

export { runOutreach } from "./outreach.js";
