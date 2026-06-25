import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { optionalEnv, requireEnv } from "./env.js";
import { assertBudget, loadBudgetLimits, recordBudgetUsage } from "./budget.js";
import { personalizeEmail } from "./personalize.js";
import {
  getProspectsForOutreach,
  markOutreachSent,
  queueOutreachMessage,
} from "./supabase.js";
import type { Prospect } from "./types.js";

const toolRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");

export type SequenceStep = {
  step: number;
  delay_days: number;
  name: string;
};

export type OutreachSequence = {
  name: string;
  description: string;
  steps: SequenceStep[];
};

export function loadSequence(name = "navari-intro-3"): OutreachSequence {
  const path = resolve(toolRoot, "sequences", `${name}.json`);
  return JSON.parse(readFileSync(path, "utf8")) as OutreachSequence;
}

async function sendViaResend(to: string, subject: string, body: string) {
  const key = requireEnv("RESEND_API_KEY");
  const from = optionalEnv("RESEND_FROM_EMAIL") ?? "Navari Systems <jesse@navari.systems>";

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [to],
      subject,
      text: body,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Resend send failed (${response.status}): ${err.slice(0, 400)}`);
  }

  return response.json();
}

export async function runOutreach(options: {
  sequence?: string;
  tier?: "hot" | "warm";
  limit?: number;
  dryRun?: boolean;
  skipBudget?: boolean;
}) {
  const sequence = loadSequence(options.sequence);
  const tier = options.tier ?? "hot";
  const limits = loadBudgetLimits();
  const requestedLimit = options.limit ?? 10;
  const maxBatch = limits.per_run.outreach_batch_max ?? 10;

  if (!options.dryRun && !options.skipBudget) {
    assertBudget("outreach_sends", Math.min(requestedLimit, maxBatch));
    assertBudget("openai_outreach", Math.min(requestedLimit, maxBatch));
  }

  const limit = Math.min(requestedLimit, maxBatch);
  const prospects = await getProspectsForOutreach(tier, limit);

  const results: Array<{
    prospect_id: string;
    email: string;
    subject: string;
    status: string;
  }> = [];

  for (const row of prospects) {
    const prospect = row as Prospect & { id: string };
    if (!prospect.email) continue;

    const step = (row.outreach_step as number | null) ?? 0;
    const nextStep = step + 1;
    const sequenceStep = sequence.steps.find((s) => s.step === nextStep);
    if (!sequenceStep) continue;

    const personalized = await personalizeEmail(prospect, nextStep, sequence.name);

    if (options.dryRun) {
      results.push({
        prospect_id: prospect.id,
        email: prospect.email,
        subject: personalized.subject,
        status: "dry-run",
      });
      console.log(`\n--- ${prospect.full_name} <${prospect.email}> ---`);
      console.log(`Subject: ${personalized.subject}\n${personalized.body}\n`);
      continue;
    }

    await sendViaResend(prospect.email, personalized.subject, personalized.body);
    await queueOutreachMessage({
      prospect_id: prospect.id,
      sequence_name: sequence.name,
      step_index: nextStep,
      subject: personalized.subject,
      body: personalized.body,
      status: "sent",
    });
    await markOutreachSent(prospect.id, nextStep);

    if (!options.dryRun && !options.skipBudget) {
      recordBudgetUsage({ outreach_sends: 1, openai_outreach: 1, resend_emails: 1 });
    }

    results.push({
      prospect_id: prospect.id,
      email: prospect.email,
      subject: personalized.subject,
      status: "sent",
    });

    await sleep(1200);
  }

  return { sequence: sequence.name, sent: results.filter((r) => r.status === "sent").length, results };
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
