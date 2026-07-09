import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const toolRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const cacheDir = resolve(toolRoot, ".cache");
const statePath = resolve(cacheDir, "budget-state.json");
const defaultsPath = resolve(toolRoot, "budget.defaults.json");
const localPath = resolve(toolRoot, "budget.local.json");

export type BudgetLimits = {
  monthly: Record<string, number>;
  daily: Record<string, number>;
  per_run: Record<string, number>;
};

export type BudgetState = {
  month: string;
  monthUsage: Record<string, number>;
  day: string;
  dayUsage: Record<string, number>;
  lastUpdated: string;
};

export type BudgetCheck = {
  allowed: boolean;
  metric: string;
  requested: number;
  remainingDaily: number;
  remainingMonthly: number;
  reason?: string;
};

function monthKey(d = new Date()): string {
  return d.toISOString().slice(0, 7);
}

function dayKey(d = new Date()): string {
  return d.toISOString().slice(0, 10);
}

export function loadBudgetLimits(): BudgetLimits {
  const defaults = JSON.parse(readFileSync(defaultsPath, "utf8")) as BudgetLimits & {
    description?: string;
  };
  if (!existsSync(localPath)) {
    return { monthly: defaults.monthly, daily: defaults.daily, per_run: defaults.per_run };
  }
  const local = JSON.parse(readFileSync(localPath, "utf8")) as Partial<BudgetLimits>;
  return {
    monthly: { ...defaults.monthly, ...local.monthly },
    daily: { ...defaults.daily, ...local.daily },
    per_run: { ...defaults.per_run, ...local.per_run },
  };
}

export function loadBudgetState(): BudgetState {
  mkdirSync(cacheDir, { recursive: true });
  const now = new Date();
  const empty: BudgetState = {
    month: monthKey(now),
    monthUsage: {},
    day: dayKey(now),
    dayUsage: {},
    lastUpdated: now.toISOString(),
  };
  if (!existsSync(statePath)) return empty;

  const parsed = JSON.parse(readFileSync(statePath, "utf8")) as BudgetState;
  const currentMonth = monthKey(now);
  const currentDay = dayKey(now);

  return {
    month: currentMonth,
    monthUsage: parsed.month === currentMonth ? parsed.monthUsage : {},
    day: currentDay,
    dayUsage: parsed.day === currentDay ? parsed.dayUsage : {},
    lastUpdated: parsed.lastUpdated ?? now.toISOString(),
  };
}

export function saveBudgetState(state: BudgetState): void {
  mkdirSync(cacheDir, { recursive: true });
  writeFileSync(
    statePath,
    JSON.stringify({ ...state, lastUpdated: new Date().toISOString() }, null, 2),
    "utf8",
  );
}

function getUsage(state: BudgetState, metric: string): { daily: number; monthly: number } {
  return {
    daily: state.dayUsage[metric] ?? 0,
    monthly: state.monthUsage[metric] ?? 0,
  };
}

export function checkBudget(metric: string, amount: number, limits = loadBudgetLimits()): BudgetCheck {
  const state = loadBudgetState();
  const usage = getUsage(state, metric);
  const dailyLimit = limits.daily[metric];
  const monthlyLimit = limits.monthly[metric];

  const remainingDaily = dailyLimit !== undefined ? dailyLimit - usage.daily : Infinity;
  const remainingMonthly = monthlyLimit !== undefined ? monthlyLimit - usage.monthly : Infinity;
  const remaining = Math.min(remainingDaily, remainingMonthly);

  if (amount > remaining) {
    return {
      allowed: false,
      metric,
      requested: amount,
      remainingDaily: Math.max(0, remainingDaily),
      remainingMonthly: Math.max(0, remainingMonthly),
      reason: `Budget exceeded for ${metric}: need ${amount}, remaining ${Math.max(0, remaining)} (daily ${usage.daily}/${dailyLimit ?? "∞"}, monthly ${usage.monthly}/${monthlyLimit ?? "∞"})`,
    };
  }

  return {
    allowed: true,
    metric,
    requested: amount,
    remainingDaily: remainingDaily - amount,
    remainingMonthly: remainingMonthly - amount,
  };
}

export function recordBudgetUsage(metrics: Record<string, number>): BudgetState {
  const state = loadBudgetState();
  const now = new Date();
  const currentMonth = monthKey(now);
  const currentDay = dayKey(now);

  const next: BudgetState = {
    month: currentMonth,
    monthUsage: currentMonth === state.month ? { ...state.monthUsage } : {},
    day: currentDay,
    dayUsage: currentDay === state.day ? { ...state.dayUsage } : {},
    lastUpdated: now.toISOString(),
  };

  for (const [metric, amount] of Object.entries(metrics)) {
    if (amount <= 0) continue;
    next.dayUsage[metric] = (next.dayUsage[metric] ?? 0) + amount;
    next.monthUsage[metric] = (next.monthUsage[metric] ?? 0) + amount;
  }

  saveBudgetState(next);
  return next;
}

export function assertBudget(metric: string, amount: number): void {
  const check = checkBudget(metric, amount);
  if (!check.allowed) {
    throw new Error(check.reason ?? `Budget denied for ${metric}`);
  }
}

export function clampApolloEnrichLimit(requested: number): number {
  const limits = loadBudgetLimits();
  const maxPerRun = limits.per_run.apollo_enrich_limit_max ?? 10;
  const check = checkBudget("apollo_enrich_credits", requested);
  if (!check.allowed) return 0;
  return Math.min(requested, maxPerRun, Math.floor(check.remainingDaily), Math.floor(check.remainingMonthly));
}

export type BudgetOverviewRow = {
  metric: string;
  label: string;
  dailyUsed: number;
  dailyLimit: number;
  monthlyUsed: number;
  monthlyLimit: number;
  status: "ok" | "warn" | "critical";
};

const METRIC_LABELS: Record<string, string> = {
  apollo_enrich_credits: "Apollo enrich credits",
  exa_searches: "Exa searches",
  brave_searches: "Brave searches",
  hunter_requests: "Hunter requests",
  renidly_requests: "Renidly requests",
  snov_requests: "Snov requests",
  openai_outreach: "OpenAI personalization",
  resend_emails: "Resend emails",
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

export function getBudgetOverview(): BudgetOverviewRow[] {
  const limits = loadBudgetLimits();
  const state = loadBudgetState();
  const metrics = new Set([
    ...Object.keys(limits.monthly),
    ...Object.keys(limits.daily),
  ]);

  return [...metrics].map((metric) => {
    const dailyUsed = state.dayUsage[metric] ?? 0;
    const monthlyUsed = state.monthUsage[metric] ?? 0;
    const dailyLimit = limits.daily[metric] ?? 0;
    const monthlyLimit = limits.monthly[metric] ?? 0;
    const status =
      rowStatus(dailyUsed, dailyLimit) === "critical" || rowStatus(monthlyUsed, monthlyLimit) === "critical"
        ? "critical"
        : rowStatus(dailyUsed, dailyLimit) === "warn" || rowStatus(monthlyUsed, monthlyLimit) === "warn"
          ? "warn"
          : "ok";

    return {
      metric,
      label: METRIC_LABELS[metric] ?? metric,
      dailyUsed,
      dailyLimit,
      monthlyUsed,
      monthlyLimit,
      status,
    };
  });
}

export function getStateFilePath(): string {
  return statePath;
}
