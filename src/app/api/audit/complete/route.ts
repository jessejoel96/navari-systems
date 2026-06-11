import { NextResponse } from "next/server";
import { z } from "zod";
import { openai } from "@/lib/openai";
import { auditFullName } from "@/lib/audit/contact";
import { buildAnalysisPrompt } from "@/lib/audit/prompts";
import { getFallbackAnalysis } from "@/lib/audit/fallback";
import { auditAnswersSchema } from "@/lib/audit/schema";
import { auditResultEmailHtml, auditAlertEmailHtml } from "@/lib/audit/email-template";
import { sendAuditEmail } from "@/lib/audit/send-email";
import type { AuditAnswers, AuditAnalysis } from "@/lib/audit/types";

const schema = z.object({
  auditId: z.string().uuid().optional().nullable(),
  answers: auditAnswersSchema,
});

export async function POST(req: Request) {
  let auditId: string | null = null;
  let answers: AuditAnswers;

  try {
    const body = await req.json();
    const parsed = schema.parse(body);
    auditId = parsed.auditId ?? null;
    answers = parsed.answers as AuditAnswers;
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const fullName = auditFullName(answers);

  let analysis: AuditAnalysis;
  let aiSucceeded = false;

  try {
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === "missing") {
      throw new Error("No API key");
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: buildAnalysisPrompt(answers) }],
      response_format: { type: "json_object" },
      temperature: 0.5,
      max_tokens: 1200,
    });

    const text = response.choices[0]?.message?.content ?? "{}";
    const raw = JSON.parse(text);

    if (!raw.leaks || !raw.totals || !raw.profile) {
      throw new Error("Incomplete analysis response");
    }

    analysis = raw as AuditAnalysis;
    aiSucceeded = true;
  } catch (err) {
    console.error("[audit/complete] OpenAI analysis failed:", err);
    analysis = getFallbackAnalysis(answers);

    const notifyTo = process.env.NOTIFICATION_EMAIL;
    if (notifyTo) {
      await sendAuditEmail({
        to: notifyTo,
        subject: `[ALERT] Audit analysis AI failure — ${fullName} <${answers.email}>`,
        html: auditAlertEmailHtml(
          fullName,
          answers.email,
          String(err),
          answers as unknown as Record<string, unknown>
        ),
      });
    }
  }

  if (auditId) {
    try {
      const { createServerClient } = await import("@/lib/supabase/server");
      const supabase = createServerClient();
      await supabase
        .from("audit_leads")
        .update({ analysis, profile: analysis.profile, confirmed: true })
        .eq("id", auditId);
    } catch (err) {
      console.error("[audit/complete] Supabase update failed:", err);
    }
  }

  const result = await sendAuditEmail({
    to: answers.email,
    subject: `Your Navari Systems Operations Assessment — ${fullName}`,
    html: auditResultEmailHtml(fullName, answers.email, analysis),
  });

  const emailSent = result.ok;
  if (!result.ok) {
    console.error("[audit/complete] Results email failed:", result.error);

    const notifyTo = process.env.NOTIFICATION_EMAIL;
    if (notifyTo) {
      await sendAuditEmail({
        to: notifyTo,
        subject: `[ALERT] Audit results email failed — ${fullName} <${answers.email}>`,
        html: auditAlertEmailHtml(
          fullName,
          answers.email,
          result.error,
          answers as unknown as Record<string, unknown>
        ),
      });
    }
  } else if (auditId) {
    try {
      const { createServerClient } = await import("@/lib/supabase/server");
      const supabase = createServerClient();
      await supabase.from("audit_leads").update({ email_sent: true }).eq("id", auditId);
    } catch (err) {
      console.error("[audit/complete] email_sent update failed:", err);
    }
  }

  return NextResponse.json({ analysis, aiSucceeded, emailSent, emailError: result.ok ? null : result.error });
}
