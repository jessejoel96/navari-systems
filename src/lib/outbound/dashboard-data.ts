import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { createServerClient } from "@/lib/supabase/server";

const toolRoot = join(process.cwd(), "tools", "lead-gen");

export type BudgetRow = {
  metric: string;
  label: string;
  dailyUsed: number;
  dailyLimit: number;
  monthlyUsed: number;
  monthlyLimit: number;
  status: "ok" | "warn" | "critical";
};

export type OutboundDashboardData = {
  generatedAt: string;
  budget: BudgetRow[];
  pipeline: {
    hot: number;
    warm: number;
    cold: number;
    readyForOutreach: number;
    missingObservationHot: number;
    inSequence: number;
    contactedToday: number;
  } | null;
  hotLeads: Array<{
    id: string;
    full_name: string | null;
    title: string | null;
    company_name: string | null;
    icp_score: number;
    outreach_status: string;
    hasObservation: boolean;
  }>;
};

const LABELS: Record<string, string> = {
  apollo_enrich_credits: "Apollo enrich",
  exa_searches: "Exa searches",
  brave_searches: "Brave searches",
  hunter_requests: "Hunter",
  openai_outreach: "OpenAI",
  resend_emails: "Resend",
  fetch_runs: "Fetch runs",
  outreach_sends: "Outreach sends",
};

function rowStatus(used: number, limit: number): "ok" | "warn" | "critical" {
  if (limit <= 0) return "ok";
  const ratio = used / limit;
  if (ratio >= 1) return "critical";
  if (ratio >= 0.8) return "warn";
  return "ok";
}

function loadBudgetOverview(): BudgetRow[] {
  const defaultsPath = join(toolRoot, "budget.defaults.json");
  const statePath = join(toolRoot, ".cache", "budget-state.json");
  if (!existsSync(defaultsPath)) return [];

  const defaults = JSON.parse(readFileSync(defaultsPath, "utf8")) as {
    monthly: Record<string, number>;
    daily: Record<string, number>;
  };
  const state = existsSync(statePath)
    ? (JSON.parse(readFileSync(statePath, "utf8")) as {
        dayUsage?: Record<string, number>;
        monthUsage?: Record<string, number>;
      })
    : { dayUsage: {}, monthUsage: {} };

  const metrics = new Set([...Object.keys(defaults.monthly), ...Object.keys(defaults.daily)]);

  return [...metrics].map((metric) => {
    const dailyUsed = state.dayUsage?.[metric] ?? 0;
    const monthlyUsed = state.monthUsage?.[metric] ?? 0;
    const dailyLimit = defaults.daily[metric] ?? 0;
    const monthlyLimit = defaults.monthly[metric] ?? 0;
    const status =
      rowStatus(dailyUsed, dailyLimit) === "critical" || rowStatus(monthlyUsed, monthlyLimit) === "critical"
        ? "critical"
        : rowStatus(dailyUsed, dailyLimit) === "warn" || rowStatus(monthlyUsed, monthlyLimit) === "warn"
          ? "warn"
          : "ok";

    return {
      metric,
      label: LABELS[metric] ?? metric,
      dailyUsed,
      dailyLimit,
      monthlyUsed,
      monthlyLimit,
      status,
    };
  });
}

function hasObservation(raw: unknown): boolean {
  if (!raw || typeof raw !== "object") return false;
  const obs = (raw as Record<string, unknown>).observation;
  return typeof obs === "string" && obs.trim().length > 20;
}

export async function getOutboundDashboardData(): Promise<OutboundDashboardData> {
  const budget = loadBudgetOverview().filter((r) => r.dailyLimit > 0 || r.monthlyLimit > 0);
  let supabase: ReturnType<typeof createServerClient> | null = null;
  try {
    supabase = createServerClient();
  } catch {
    supabase = null;
  }

  if (!supabase) {
    return {
      generatedAt: new Date().toISOString(),
      budget,
      pipeline: null,
      hotLeads: [],
    };
  }

  const countTier = async (tier: string) => {
    const { count } = await supabase
      .from("outbound_prospects")
      .select("*", { count: "exact", head: true })
      .eq("icp_tier", tier);
    return count ?? 0;
  };

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const [hot, warm, cold, inSequence, contactedToday] = await Promise.all([
    countTier("hot"),
    countTier("warm"),
    countTier("cold"),
    supabase
      .from("outbound_prospects")
      .select("*", { count: "exact", head: true })
      .in("outreach_status", ["in_sequence", "contacted"])
      .then((r) => r.count ?? 0),
    supabase
      .from("outbound_prospects")
      .select("*", { count: "exact", head: true })
      .gte("last_contacted_at", todayStart.toISOString())
      .then((r) => r.count ?? 0),
  ]);

  const { data: hotRows } = await supabase
    .from("outbound_prospects")
    .select("id, full_name, title, company_name, icp_score, outreach_status, raw")
    .eq("icp_tier", "hot")
    .order("icp_score", { ascending: false })
    .limit(15);

  const withEmail = hotRows ?? [];
  const missingObservationHot = withEmail.filter((r) => !hasObservation(r.raw)).length;
  const readyForOutreach = withEmail.filter((r) => hasObservation(r.raw)).length;

  return {
    generatedAt: new Date().toISOString(),
    budget,
    pipeline: {
      hot,
      warm,
      cold,
      readyForOutreach,
      missingObservationHot,
      inSequence,
      contactedToday,
    },
    hotLeads: withEmail.map((r) => ({
      id: r.id as string,
      full_name: r.full_name as string | null,
      title: r.title as string | null,
      company_name: r.company_name as string | null,
      icp_score: r.icp_score as number,
      outreach_status: r.outreach_status as string,
      hasObservation: hasObservation(r.raw),
    })),
  };
}

export function isOutboundAuthorized(searchParams: URLSearchParams, headerKey?: string | null): boolean {
  const secret = process.env.LEAD_FETCH_SECRET;
  if (!secret) return process.env.NODE_ENV === "development";
  return searchParams.get("key") === secret || headerKey === secret;
}
