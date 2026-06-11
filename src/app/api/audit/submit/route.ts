import { NextResponse } from "next/server";
import { openai } from "@/lib/openai";
import { auditFullName } from "@/lib/audit/contact";
import { buildReflectPrompt } from "@/lib/audit/prompts";
import { getFallbackReflection } from "@/lib/audit/fallback";
import { auditAnswersSchema } from "@/lib/audit/schema";
import {
  auditAlertEmailHtml,
  auditLeadNotificationHtml,
  auditReceivedEmailHtml,
} from "@/lib/audit/email-template";
import { sendAuditEmail } from "@/lib/audit/send-email";
import { upsertResendContact } from "@/lib/resend/contacts";
import type { AuditAnswers } from "@/lib/audit/types";

export async function POST(req: Request) {
  let answers: AuditAnswers;

  try {
    const body = await req.json();
    answers = auditAnswersSchema.parse(body) as AuditAnswers;
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const fullName = auditFullName(answers);

  let auditId: string | null = null;
  let dbSaved = false;

  try {
    const { createServerClient } = await import("@/lib/supabase/server");
    const supabase = createServerClient();
    const { data, error } = await supabase
      .from("audit_leads")
      .insert({
        name: fullName,
        first_name: answers.firstName,
        last_name: answers.lastName,
        email: answers.email,
        phone: answers.phone,
        company: answers.company,
        industry: answers.industry,
        sub_industry: answers.subIndustry || null,
        primary_goal: answers.primaryGoal || null,
        secondary_goals: answers.secondaryGoals.length ? answers.secondaryGoals : null,
        revenue_range: answers.revenue,
        team_size: answers.teamSize,
        workforce_type: answers.workforceType || null,
        departments: answers.departments,
        tools: answers.tools,
        dynamic_q1: answers.dynamicQ1,
        dynamic_a1: answers.dynamicA1,
        dynamic_q2: answers.dynamicQ2,
        dynamic_a2: answers.dynamicA2,
        suggested_challenges: answers.suggestedChallenges.length ? answers.suggestedChallenges : null,
        selected_challenges: answers.selectedChallenges.length ? answers.selectedChallenges : null,
        urgency: answers.urgency || null,
        pain_point: answers.painPoint || null,
      })
      .select("id")
      .single();

    if (error) throw error;
    auditId = data?.id ?? null;
    dbSaved = true;
  } catch (err) {
    console.error("[audit/submit] Supabase save failed:", err);
  }

  const resendContact = await upsertResendContact({
    email: answers.email,
    firstName: answers.firstName,
    lastName: answers.lastName,
    company: answers.company,
    phone: answers.phone,
    source: "audit-tool",
  });

  if (!resendContact.ok) {
    console.error("[audit/submit] Resend contact sync failed:", resendContact.error);
  }

  const notifyTo = process.env.NOTIFICATION_EMAIL;

  const [receiptResult, notifyResult] = await Promise.all([
    sendAuditEmail({
      to: answers.email,
      subject: "We received your audit — Navari Systems",
      html: auditReceivedEmailHtml(fullName),
    }),
    notifyTo
      ? sendAuditEmail({
          to: notifyTo,
          subject: `New audit lead: ${fullName} <${answers.email}>`,
          html: auditLeadNotificationHtml(
            fullName,
            answers.email,
            answers as unknown as Record<string, unknown>
          ),
        })
      : Promise.resolve({ ok: false as const, error: "NOTIFICATION_EMAIL not set" }),
  ]);

  if (!receiptResult.ok) {
    console.error("[audit/submit] Receipt email failed:", receiptResult.error);
  }
  if (!notifyResult.ok) {
    console.error("[audit/submit] Lead notification failed:", notifyResult.error);
  }

  let reflection = "";
  let aiSucceeded = false;

  try {
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === "missing") {
      throw new Error("No API key");
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: buildReflectPrompt(answers) }],
      response_format: { type: "json_object" },
      temperature: 0.6,
      max_tokens: 400,
    });

    const text = response.choices[0]?.message?.content ?? "{}";
    const parsed = JSON.parse(text);
    if (parsed.paragraph1 && parsed.paragraph2) {
      reflection = `${parsed.paragraph1}\n\n${parsed.paragraph2}`;
      aiSucceeded = true;
    } else {
      throw new Error("Invalid reflection shape");
    }
  } catch (err) {
    console.error("[audit/submit] OpenAI reflection failed:", err);
    reflection = getFallbackReflection(answers);

    if (notifyTo) {
      await sendAuditEmail({
        to: notifyTo,
        subject: `[ALERT] Audit AI failure — ${fullName} <${answers.email}>`,
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
      await supabase.from("audit_leads").update({ reflection }).eq("id", auditId);
    } catch (err) {
      console.error("[audit/submit] Reflection update failed:", err);
    }
  }

  return NextResponse.json({
    auditId,
    reflection,
    aiSucceeded,
    dbSaved,
    receiptEmailSent: receiptResult.ok,
    notifyEmailSent: notifyResult.ok,
    resendContactSynced: resendContact.ok,
  });
}
