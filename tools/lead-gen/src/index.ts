#!/usr/bin/env node
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import "./env.js";
import { formatDailyOverview, getDailyOverview } from "./daily.js";
import { loadIcp, runDeliver, runExport, runFetch, runOutreach } from "./pipeline.js";

const [, , command, ...args] = process.argv;

function flag(name: string): string | undefined {
  const index = args.indexOf(name);
  return index >= 0 ? args[index + 1] : undefined;
}

function hasFlag(name: string): boolean {
  return args.includes(name);
}

async function main() {
  if (command === "fetch") {
    const icpPath = flag("--icp");
    const icp = loadIcp(icpPath);
    const limit = flag("--limit");
    if (limit) icp.per_page = Math.min(Number(limit), 100);

    const { runId, summary, prospects } = await runFetch(icp, { dryRun: hasFlag("--dry-run") });

    console.log("\n=== Navari Lead Discovery ===\n");
    console.log(JSON.stringify(summary, null, 2));

    const preview = prospects
      .sort((a, b) => b.icp_score - a.icp_score)
      .slice(0, 10)
      .map((p) => ({
        name: p.full_name ?? p.company_name,
        title: p.title,
        company: p.company_name,
        email: p.email ?? "(none)",
        source: p.source,
        score: p.icp_score,
        tier: p.icp_tier,
      }));

    console.log("\nTop prospects:\n");
    console.table(preview);

    if (!hasFlag("--dry-run")) {
      console.log(`\nRun ID: ${runId}`);
      console.log(`Outreach: npm run lead:outreach:dry`);
    }

    return;
  }

  if (command === "outreach") {
    const { sent, sequence, results } = await runOutreach({
      sequence: flag("--sequence") ?? "navari-intro-3",
      tier: (flag("--tier") as "hot" | "warm") ?? "hot",
      limit: flag("--limit") ? Number(flag("--limit")) : 10,
      dryRun: hasFlag("--dry-run"),
    });

    console.log(`\n=== Outreach (${sequence}) ===`);
    console.log(hasFlag("--dry-run") ? `Previewed ${results.length} messages` : `Sent ${sent} messages`);
    return;
  }

  if (command === "deliver") {
    const { csvPath, count } = await runDeliver();
    console.log(`Delivered ${count} hot/warm leads to ${csvPath}`);
    return;
  }

  if (command === "export") {
    const runId = args[0] ?? flag("--run");
    if (!runId) throw new Error("Usage: export <run-id>");
    const csvPath = await runExport(runId);
    console.log(`Exported to ${csvPath}`);
    return;
  }

  if (command === "status" || command === "daily") {
    const icpPath = flag("--icp");
    const icp = loadIcp(icpPath);
    const overview = await getDailyOverview(icp);
    console.log(formatDailyOverview(overview));

    if (command === "daily" && hasFlag("--json")) {
      console.log(JSON.stringify(overview, null, 2));
    }
    return;
  }

  const toolRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
  console.log(`
Navari Outbound — discover leads + personalized outreach (no Apollo required)

Commands:
  status | daily [--icp path] [--json]     Credit budget + pipeline overview + today's plan
  fetch [--icp path] [--limit N] [--dry-run]     Web discovery → enrich → score → Supabase
  outreach [--tier hot|warm] [--dry-run]          AI-personalized email via Resend
  deliver                                         Export hot/warm leads to CSV
  export <run-id>                                 Export a fetch run

Daily workflow: npm run lead:status → research observations → lead:fetch:dry → lead:fetch → lead:outreach:dry
Budget file: ${resolve(toolRoot, "budget.defaults.json")} (override: budget.local.json)
State cache: ${resolve(toolRoot, ".cache/budget-state.json")}

Default discovery: Exa + Brave + Apollo hybrid (when keys are set)
Apollo free plan: search is free; enrichment only when has_email=true (cap: apollo_enrich_limit)
Enrichment waterfall: Renidly → Hunter → Snov → Hunter verify

Setup (.env.local):
  EXA_API_KEY, BRAVE_API_KEY, APOLLO_API_KEY (optional), RENIDLY_API_KEY, HUNTER_API_KEY, SNOV_*
  OPENAI_API_KEY, RESEND_API_KEY, Supabase keys

ICP: ${resolve(toolRoot, "icp.navari.json")}
`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
