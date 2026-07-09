import { getBudgetOverview, checkBudget, loadBudgetLimits, type BudgetOverviewRow } from "./budget.js";
import { getOutboundPipelineStats, type PipelineStats } from "./supabase.js";
import type { IcpConfig } from "./types.js";

export type DailyRecommendation = {
  id: string;
  priority: "high" | "medium" | "low" | "blocked";
  action: string;
  command?: string;
  reason: string;
};

export type DailyOverview = {
  generatedAt: string;
  budget: BudgetOverviewRow[];
  pipeline: PipelineStats | null;
  recommendations: DailyRecommendation[];
  canFetch: boolean;
  canOutreach: boolean;
  suggestedApolloEnrichLimit: number;
};

function buildRecommendations(
  pipeline: PipelineStats | null,
  budget: BudgetOverviewRow[],
): DailyRecommendation[] {
  const recs: DailyRecommendation[] = [];
  const apollo = budget.find((b) => b.metric === "apollo_enrich_credits");
  const fetchRuns = budget.find((b) => b.metric === "fetch_runs");
  const outreach = budget.find((b) => b.metric === "outreach_sends");

  recs.push({
    id: "status",
    priority: "high",
    action: "Review credit meters and pipeline counts",
    command: "npm run lead:status",
    reason: "Start every session here before spending API credits.",
  });

  if (pipeline && pipeline.missingObservationHot > 0) {
    recs.push({
      id: "research",
      priority: "high",
      action: `Document observations for ${pipeline.missingObservationHot} hot lead(s)`,
      command: "/lead-gen research",
      reason: "Layer One gate — no touch 1 without a specific observation.",
    });
  }

  const fetchAllowed = fetchRuns ? fetchRuns.dailyUsed < fetchRuns.dailyLimit : true;
  if (fetchAllowed && checkBudget("fetch_runs", 1).allowed) {
    recs.push({
      id: "fetch-dry",
      priority: "medium",
      action: "Preview discovery (no enrichment cost)",
      command: "npm run lead:fetch:dry",
      reason: "Validate ICP and prospect quality before spending enrich credits.",
    });
    if (apollo && apollo.dailyUsed < apollo.dailyLimit && apollo.monthlyUsed < apollo.monthlyLimit) {
      recs.push({
        id: "fetch",
        priority: "medium",
        action: "Run fetch within Apollo daily cap",
        command: "npm run lead:fetch",
        reason: `Apollo enrich remaining today: ~${Math.max(0, apollo.dailyLimit - apollo.dailyUsed)} credits.`,
      });
    }
  } else {
    recs.push({
      id: "fetch-blocked",
      priority: "blocked",
      action: "Skip fetch — daily fetch or Apollo budget exhausted",
      reason: "Use manual research + Hunter only, or raise limits in budget.local.json.",
    });
  }

  if (pipeline && pipeline.readyForOutreach > 0 && outreach && outreach.dailyUsed < outreach.dailyLimit) {
    recs.push({
      id: "outreach-dry",
      priority: "high",
      action: `Dry-run outreach for up to ${Math.min(pipeline.readyForOutreach, 10)} ready lead(s)`,
      command: "npm run lead:outreach:dry -- --tier hot --limit 5",
      reason: "Verify observation-based copy before any live send.",
    });
  }

  if (pipeline && pipeline.pendingResearch > 0) {
    recs.push({
      id: "research-warm",
      priority: "low",
      action: `15-min research pass on ${pipeline.pendingResearch} warm prospect(s)`,
      command: "prospect-researcher agent",
      reason: "Convert warm → hot with documented observations.",
    });
  }

  return recs;
}

export async function getDailyOverview(icp?: IcpConfig): Promise<DailyOverview> {
  const limits = loadBudgetLimits();
  const budget = getBudgetOverview();
  let pipeline: PipelineStats | null = null;

  try {
    pipeline = await getOutboundPipelineStats();
  } catch {
    pipeline = null;
  }

  const apolloRequested = icp?.apollo_enrich_limit ?? limits.per_run.apollo_enrich_limit_max ?? 10;
  const suggestedApolloEnrichLimit = Math.min(
    apolloRequested,
    limits.per_run.apollo_enrich_limit_max ?? 10,
  );

  const canFetch = checkBudget("fetch_runs", 1).allowed && checkBudget("apollo_enrich_credits", 1).allowed;
  const canOutreach =
    checkBudget("outreach_sends", 1).allowed && checkBudget("openai_outreach", 1).allowed;

  return {
    generatedAt: new Date().toISOString(),
    budget,
    pipeline,
    recommendations: buildRecommendations(pipeline, budget),
    canFetch,
    canOutreach,
    suggestedApolloEnrichLimit,
  };
}

export function formatDailyOverview(overview: DailyOverview): string {
  const lines: string[] = [
    "",
    "=== Navari Outbound — Daily Overview ===",
    "",
    `Generated: ${overview.generatedAt}`,
    "",
    "Credit budget",
    "────────────────────────────────────────",
  ];

  for (const row of overview.budget.filter((r) => r.dailyLimit > 0 || r.monthlyLimit > 0)) {
    const dailyPct =
      row.dailyLimit > 0 ? Math.round((row.dailyUsed / row.dailyLimit) * 100) : 0;
    const monthlyPct =
      row.monthlyLimit > 0 ? Math.round((row.monthlyUsed / row.monthlyLimit) * 100) : 0;
    const flag = row.status === "critical" ? " ⛔" : row.status === "warn" ? " ⚠" : "";
    lines.push(
      `${row.label}${flag}`,
      `  Today:    ${row.dailyUsed}/${row.dailyLimit} (${dailyPct}%)`,
      `  Month:    ${row.monthlyUsed}/${row.monthlyLimit} (${monthlyPct}%)`,
    );
  }

  if (overview.pipeline) {
    const p = overview.pipeline;
    lines.push(
      "",
      "Pipeline",
      "────────────────────────────────────────",
      `Hot / warm / cold:     ${p.hot} / ${p.warm} / ${p.cold}`,
      `Ready for outreach:    ${p.readyForOutreach}`,
      `Missing observation:   ${p.missingObservationHot} hot`,
      `In sequence:           ${p.inSequence}`,
      `Contacted today:       ${p.contactedToday}`,
    );
  } else {
    lines.push("", "Pipeline: Supabase unavailable (check keys / migrations)");
  }

  lines.push("", "Today's plan", "────────────────────────────────────────");
  for (const rec of overview.recommendations) {
    const icon =
      rec.priority === "blocked" ? "⛔" : rec.priority === "high" ? "→" : rec.priority === "medium" ? "·" : "○";
    lines.push(`${icon} ${rec.action}`);
    if (rec.command) lines.push(`    $ ${rec.command}`);
    lines.push(`    ${rec.reason}`);
  }

  lines.push(
    "",
    `Fetch allowed: ${overview.canFetch ? "yes" : "no"} | Outreach allowed: ${overview.canOutreach ? "yes" : "no"}`,
    `Suggested apollo_enrich_limit this run: ${overview.suggestedApolloEnrichLimit}`,
    "",
  );

  return lines.join("\n");
}
