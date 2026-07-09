import { randomBytes } from "crypto";
import {
  createRecord,
  findRecordByFormula,
  isAirtableConfigured,
  updateRecord,
} from "./client";
import type { DiscoveryAnswers, DiscoverySummary } from "@/lib/discovery/types";

type DiscoveryFields = {
  session_id: string;
  public_token: string;
  status: "in_progress" | "completed" | "failed";
  answers_json?: string;
  summary_json?: string;
  contact_email?: string;
  contact_name?: string;
  company?: string;
  estimated_investment?: string;
  estimated_timeline?: string;
  completed_at?: string;
};

function newSessionId(): string {
  return randomBytes(16).toString("hex");
}

function newPublicToken(): string {
  return randomBytes(24).toString("hex");
}

export function discoveryStorageReady(): boolean {
  return isAirtableConfigured();
}

export async function createDiscoverySession(): Promise<{
  recordId: string;
  sessionId: string;
  publicToken: string;
}> {
  const sessionId = newSessionId();
  const publicToken = newPublicToken();

  const record = await createRecord<DiscoveryFields>({
    session_id: sessionId,
    public_token: publicToken,
    status: "in_progress",
    answers_json: "{}",
  });

  return {
    recordId: record.id,
    sessionId,
    publicToken,
  };
}

export async function completeDiscoverySession(params: {
  recordId: string;
  answers: DiscoveryAnswers;
  summary: DiscoverySummary;
}): Promise<void> {
  const contactName = `${params.answers.firstName} ${params.answers.lastName}`.trim();

  await updateRecord<DiscoveryFields>(params.recordId, {
    status: "completed",
    answers_json: JSON.stringify(params.answers),
    summary_json: JSON.stringify(params.summary),
    contact_email: params.answers.email,
    contact_name: contactName,
    company: params.answers.company,
    estimated_investment: params.summary.estimatedInvestment,
    estimated_timeline: params.summary.estimatedTimeline,
    completed_at: new Date().toISOString(),
  });
}

export async function markDiscoverySessionFailed(recordId: string): Promise<void> {
  await updateRecord<DiscoveryFields>(recordId, { status: "failed" });
}

export async function getDiscoveryByPublicToken(publicToken: string): Promise<{
  answers: DiscoveryAnswers | null;
  summary: DiscoverySummary | null;
  status: string;
  contactName: string | null;
  company: string | null;
  completedAt: string | null;
} | null> {
  const record = await findRecordByFormula<DiscoveryFields>(
    `{public_token} = '${publicToken.replace(/'/g, "\\'")}'`
  );

  if (!record) return null;

  const fields = record.fields;
  let answers: DiscoveryAnswers | null = null;
  let summary: DiscoverySummary | null = null;

  try {
    if (fields.answers_json) {
      answers = JSON.parse(fields.answers_json) as DiscoveryAnswers;
    }
  } catch {
    answers = null;
  }

  try {
    if (fields.summary_json) {
      summary = JSON.parse(fields.summary_json) as DiscoverySummary;
    }
  } catch {
    summary = null;
  }

  return {
    answers,
    summary,
    status: fields.status,
    contactName: fields.contact_name ?? null,
    company: fields.company ?? null,
    completedAt: fields.completed_at ?? null,
  };
}
