import { NextResponse } from "next/server";
import { z } from "zod";
import { openai } from "@/lib/openai";
import { buildDiscoverySummaryPrompt } from "@/lib/discovery/prompts";
import { getFallbackDiscoverySummary } from "@/lib/discovery/fallback";
import { discoveryAnswersSchema, discoverySummarySchema } from "@/lib/discovery/schema";
import {
  completeDiscoverySession,
  discoveryStorageReady,
  markDiscoverySessionFailed,
} from "@/lib/airtable/discovery";
import {
  discoveryAirtableFailureAlertHtml,
  discoveryLeadNotificationHtml,
} from "@/lib/discovery/email-template";
import { sendDiscoveryEmail } from "@/lib/discovery/send-email";
import { discoveryCompleteLimit, discoveryIpLimit } from "@/lib/discovery/rate-limit";
import { upsertResendContact } from "@/lib/resend/contacts";
import type { DiscoveryAnswers, DiscoverySummary } from "@/lib/discovery/types";

const bodySchema = z.object({
  recordId: z.string().min(1),
  sessionId: z.string().min(8),
  publicToken: z.string().min(16).optional(),
  answers: discoveryAnswersSchema,
});

function notificationEmail(): string {
  return process.env.NOTIFICATION_EMAIL ?? "jessejoel@navari.systems";
}

export async function POST(req: Request) {
  const ipLimit = discoveryIpLimit(req);
  if (!ipLimit.success) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  if (!discoveryStorageReady()) {
    return NextResponse.json({ error: "Discovery storage not configured" }, { status: 503 });
  }

  let recordId: string;
  let sessionId: string;
  let answers: DiscoveryAnswers;

  try {
    const body = await req.json();
    const parsed = bodySchema.parse(body);
    recordId = parsed.recordId;
    sessionId = parsed.sessionId;
    answers = parsed.answers as DiscoveryAnswers;
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const completeLimit = discoveryCompleteLimit(sessionId);
  if (!completeLimit.success) {
    return NextResponse.json({ error: "Complete limit reached for this session" }, { status: 429 });
  }

  const fullName = `${answers.firstName} ${answers.lastName}`.trim();
  let summary: DiscoverySummary;
  let aiSucceeded = false;

  try {
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === "missing") {
      throw new Error("No API key");
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: buildDiscoverySummaryPrompt(answers) }],
      response_format: { type: "json_object" },
      temperature: 0.5,
      max_tokens: 1400,
    });

    const text = response.choices[0]?.message?.content ?? "{}";
    const raw = JSON.parse(text);
    summary = discoverySummarySchema.parse(raw);
    aiSucceeded = true;
  } catch (err) {
    console.error("[discovery/complete] OpenAI failed:", err);
    summary = getFallbackDiscoverySummary(answers);
  }

  try {
    await completeDiscoverySession({ recordId, answers, summary });
  } catch (err) {
    console.error("[discovery/complete] Airtable failed:", err);
    try {
      await markDiscoverySessionFailed(recordId);
    } catch {
      /* best effort */
    }

    await sendDiscoveryEmail({
      to: notificationEmail(),
      subject: `[ALERT] Discovery Airtable failure — ${fullName}`,
      html: discoveryAirtableFailureAlertHtml(
        fullName,
        answers.email,
        err instanceof Error ? err.message : String(err)
      ),
    });

    return NextResponse.json(
      {
        error: "We could not save your consultation. Please try again or email us directly.",
        code: "AIRTABLE_SAVE_FAILED",
      },
      { status: 503 }
    );
  }

  await upsertResendContact({
    email: answers.email,
    firstName: answers.firstName,
    lastName: answers.lastName,
    source: "discovery-consultation",
  });

  const proposalTag = answers.wantsProposal ? " [PROPOSAL 48H]" : "";
  const teamEmail = await sendDiscoveryEmail({
    to: notificationEmail(),
    subject: `New discovery lead — ${answers.company} (${fullName})${proposalTag}`,
    html: discoveryLeadNotificationHtml(answers, summary),
  });

  return NextResponse.json({
    summary,
    aiSucceeded,
    teamNotified: teamEmail.ok,
  });
}
