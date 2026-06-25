import { mkdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { randomUUID } from "node:crypto";
import type { FetchRunSummary, Prospect } from "./types.js";

const cacheDir = resolve(dirname(fileURLToPath(import.meta.url)), "../.cache");
const prospectsPath = resolve(cacheDir, "local-prospects.json");
const runsPath = resolve(cacheDir, "local-fetch-runs.json");

export type LocalProspectRow = Prospect & {
  id: string;
  fetch_run_id: string;
  delivery_status: string;
  outreach_status: string;
  outreach_step: number;
  last_contacted_at?: string | null;
};

type LocalFetchRun = {
  id: string;
  icp_name: string;
  status: string;
  summary?: FetchRunSummary;
  created_at: string;
  completed_at?: string;
};

function ensureCache() {
  mkdirSync(cacheDir, { recursive: true });
}

function readProspects(): LocalProspectRow[] {
  ensureCache();
  if (!existsSync(prospectsPath)) return [];
  return JSON.parse(readFileSync(prospectsPath, "utf8")) as LocalProspectRow[];
}

function writeProspects(rows: LocalProspectRow[]) {
  ensureCache();
  writeFileSync(prospectsPath, JSON.stringify(rows, null, 2));
}

function readRuns(): LocalFetchRun[] {
  ensureCache();
  if (!existsSync(runsPath)) return [];
  return JSON.parse(readFileSync(runsPath, "utf8")) as LocalFetchRun[];
}

function writeRuns(runs: LocalFetchRun[]) {
  ensureCache();
  writeFileSync(runsPath, JSON.stringify(runs, null, 2));
}

export function isSchemaMissingError(message: string): boolean {
  return message.includes("Could not find the table") || message.includes("schema cache");
}

export function createLocalFetchRun(icpName: string): string {
  const id = randomUUID();
  const runs = readRuns();
  runs.push({ id, icp_name: icpName, status: "running", created_at: new Date().toISOString() });
  writeRuns(runs);
  return id;
}

export function completeLocalFetchRun(runId: string, summary: FetchRunSummary, status: "completed" | "failed") {
  const runs = readRuns().map((run) =>
    run.id === runId
      ? { ...run, status, summary, completed_at: new Date().toISOString() }
      : run,
  );
  writeRuns(runs);
}

export function saveLocalProspects(runId: string, prospects: Prospect[]): number {
  const existing = readProspects();
  const byEmail = new Map(existing.filter((p) => p.email).map((p) => [p.email!, p]));

  for (const prospect of prospects) {
    const row: LocalProspectRow = {
      ...prospect,
      id: randomUUID(),
      fetch_run_id: runId,
      delivery_status: "pending",
      outreach_status: "pending",
      outreach_step: 0,
    };

    if (prospect.email && byEmail.has(prospect.email)) {
      const prev = byEmail.get(prospect.email)!;
      Object.assign(prev, row, { id: prev.id });
      continue;
    }

    existing.push(row);
    if (prospect.email) byEmail.set(prospect.email, row);
  }

  writeProspects(existing);
  return prospects.length;
}

export function getLocalProspectsForOutreach(tier: "hot" | "warm", limit: number) {
  return readProspects()
    .filter((p) => p.icp_tier === tier && p.email && ["pending", "in_sequence"].includes(p.outreach_status))
    .sort((a, b) => b.icp_score - a.icp_score)
    .slice(0, limit);
}

export function getLocalPipelineStats() {
  const rows = readProspects();
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const hasObservation = (raw: unknown) => {
    if (!raw || typeof raw !== "object") return false;
    const obs = (raw as Record<string, unknown>).observation;
    return typeof obs === "string" && obs.trim().length > 20;
  };

  const hotRows = rows.filter((r) => r.icp_tier === "hot" && r.email);
  const missingObservationHot = hotRows.filter((r) => !hasObservation(r.raw)).length;
  const readyForOutreach = hotRows.filter((r) => hasObservation(r.raw)).length;

  return {
    hot: rows.filter((r) => r.icp_tier === "hot").length,
    warm: rows.filter((r) => r.icp_tier === "warm").length,
    cold: rows.filter((r) => r.icp_tier === "cold").length,
    readyForOutreach,
    missingObservationHot,
    inSequence: rows.filter((r) => ["in_sequence", "contacted"].includes(r.outreach_status)).length,
    contactedToday: rows.filter(
      (r) => r.last_contacted_at && new Date(r.last_contacted_at) >= todayStart,
    ).length,
    pendingResearch: rows.filter((r) => r.icp_tier === "warm" && !r.email).length,
  };
}

export function queueLocalOutreachMessage(input: {
  prospect_id: string;
  sequence_name: string;
  step_index: number;
  subject: string;
  body: string;
  status: string;
}) {
  const messagesPath = resolve(cacheDir, "local-outreach-messages.json");
  const messages = existsSync(messagesPath)
    ? (JSON.parse(readFileSync(messagesPath, "utf8")) as unknown[])
    : [];
  messages.push({ ...input, id: randomUUID(), created_at: new Date().toISOString() });
  writeFileSync(messagesPath, JSON.stringify(messages, null, 2));
}
