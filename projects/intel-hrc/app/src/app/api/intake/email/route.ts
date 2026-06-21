/**
 * POST /api/intake/email
 *
 * Resend inbound webhook (`email.received`) — fetches email body + attachments
 * via Receiving API, classifies intent, runs OCR, creates invoice records,
 * and notifies Tina.
 *
 * Resend setup:
 *   Event: email.received
 *   URL:   https://ap.intelhrc.navari.systems/api/intake/email
 */

import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { parseEmail, type ParsedEmail } from "@/lib/ai/parse-email";
import { extractInvoiceFromImage } from "@/lib/ai/extract-invoice";
import { notifyNewInvoice, notifyEmailParsed } from "@/lib/email/notify";
import {
  intakeFromFormData,
  intakeFromLegacyJson,
  intakeFromResendWebhook,
  type IntakeEmail,
} from "@/lib/email/resend-intake";

export async function POST(req: NextRequest) {
  const supabase = createServiceClient();
  const contentType = req.headers.get("content-type") || "";

  try {
    let intake: IntakeEmail | null = null;
    let skipped = false;

    if (contentType.includes("multipart/form-data")) {
      intake = await intakeFromFormData(await req.formData());
    } else {
      const rawBody = await req.text();

      if (!rawBody) {
        return NextResponse.json({ error: "Empty body" }, { status: 400 });
      }

      if (contentType.includes("application/json")) {
        const json = JSON.parse(rawBody) as Record<string, unknown>;

        if (json.type === "email.received") {
          intake = await intakeFromResendWebhook(rawBody, req.headers);
        } else if (json.type) {
          // Other Resend events (delivered, bounced, etc.) — ack without processing
          skipped = true;
        } else {
          intake = intakeFromLegacyJson(json);
        }
      } else {
        // Best-effort JSON parse for non-standard content types
        try {
          const json = JSON.parse(rawBody) as Record<string, unknown>;
          if (json.type === "email.received") {
            intake = await intakeFromResendWebhook(rawBody, req.headers);
          } else if (json.type) {
            skipped = true;
          } else {
            intake = intakeFromLegacyJson(json);
          }
        } catch {
          return NextResponse.json(
            { error: "Unsupported content type" },
            { status: 400 }
          );
        }
      }
    }

    if (skipped) {
      return NextResponse.json({ ok: true, skipped: true });
    }

    if (!intake) {
      return NextResponse.json({ ok: true, skipped: true });
    }

    const result = await processIntake(supabase, intake);
    return NextResponse.json(result);
  } catch (err) {
    console.error("Email intake error:", err);

    const message = err instanceof Error ? err.message : String(err);
    const isVerification =
      message.toLowerCase().includes("signature") ||
      message.toLowerCase().includes("webhook");

    await supabase.from("audit_events").insert({
      event_type: "email_intake_error",
      payload: { error: message },
    });

    return NextResponse.json(
      { ok: false, error: isVerification ? "Invalid webhook" : "Processing error" },
      { status: isVerification ? 401 : 500 }
    );
  }
}

async function processIntake(
  supabase: ReturnType<typeof createServiceClient>,
  intake: IntakeEmail
) {
  const { from, subject, textBody, htmlBody, attachments, source, resendEmailId } =
    intake;

  const body = textBody || stripHtml(htmlBody);
  const hasAttachments = attachments.length > 0;

  const parsed: ParsedEmail = await parseEmail(subject, body, from, hasAttachments);

  await supabase.from("audit_events").insert({
    event_type: "email_received",
    payload: {
      from,
      subject,
      source,
      resend_email_id: resendEmailId ?? null,
      intent: parsed.intent,
      confidence: parsed.confidence,
      urgency: parsed.urgency,
      summary: parsed.summary,
      demands: parsed.demands,
      requests_met: parsed.requests_met,
      attachment_count: attachments.length,
    },
  });

  let invoiceId: string | undefined;

  if (
    (parsed.intent === "invoice" || parsed.intent === "po_response") &&
    attachments.length > 0
  ) {
    const docAttachment = attachments[0];
    const base64 = docAttachment.content.toString("base64");
    const extracted = await extractInvoiceFromImage(
      base64,
      docAttachment.contentType
    );

    let entityId: string | null = null;
    const entityHint =
      extracted.suggested_entity?.value || parsed.entity_hint;
    if (entityHint) {
      const { data: entity } = await supabase
        .from("entities")
        .select("id")
        .eq("code", entityHint)
        .single();
      entityId = entity?.id || null;
    }

    if (!entityId) {
      const { data: fallback } = await supabase
        .from("entities")
        .select("id")
        .limit(1)
        .single();
      entityId = fallback?.id || null;
    }

    let supplierId: string | null = null;
    const supplierName =
      extracted.supplier_name?.value || parsed.supplier_name;
    if (supplierName) {
      const { data: supplier } = await supabase
        .from("suppliers")
        .select("id")
        .ilike("name", `%${supplierName}%`)
        .limit(1)
        .single();
      supplierId = supplier?.id || null;
    }

    const { data: invoice, error: invError } = await supabase
      .from("invoices")
      .insert({
        entity_id: entityId,
        supplier_id: supplierId,
        invoice_number: extracted.invoice_number?.value || null,
        invoice_date: extracted.invoice_date?.value || null,
        due_date: extracted.due_date?.value || null,
        description:
          extracted.description?.value || parsed.summary || subject,
        invoice_type: extracted.suggested_invoice_type?.value || "standard",
        gross_amount: extracted.gross_amount?.value || 0,
        net_amount: extracted.net_amount?.value || 0,
        vat_amount: extracted.vat_amount?.value || 0,
        wht_amount: extracted.wht_amount?.value || 0,
        expense_account: extracted.suggested_expense_account?.value || null,
        po_number: extracted.po_number?.value || parsed.po_number || null,
        status: "extracted",
        ocr_json: extracted,
        ocr_confidence: overallConfidence(extracted),
        label: `${supplierName || "Unknown"} — ${subject}`,
      })
      .select("id")
      .single();

    if (!invError && invoice) {
      const createdId: string = invoice.id;
      invoiceId = createdId;

      for (const att of attachments) {
        const storagePath = `invoices/${createdId}/${att.filename}`;
        const { error: uploadErr } = await supabase.storage
          .from("invoice-files")
          .upload(storagePath, att.content, {
            contentType: att.contentType,
            upsert: true,
          });

        if (!uploadErr) {
          await supabase.from("invoice_files").insert({
            invoice_id: createdId,
            file_name: att.filename,
            storage_path: storagePath,
            mime_type: att.contentType,
            size_bytes: att.content.length,
          });
        }
      }

      let entityCode = entityHint || "HQ";
      if (entityId) {
        const { data: ent } = await supabase
          .from("entities")
          .select("code")
          .eq("id", entityId)
          .single();
        entityCode = ent?.code || entityCode;
      }

      await notifyNewInvoice({
        id: createdId,
        supplier_name: supplierName || "Unknown",
        amount: extracted.gross_amount?.value || 0,
        entity_code: entityCode,
        description: extracted.description?.value || subject,
        source: "email",
        confidence: overallConfidenceLabel(extracted),
      });
    }
  } else {
    await notifyEmailParsed({
      intent: parsed.intent,
      supplier_name: parsed.supplier_name,
      summary: parsed.summary,
      action_required: parsed.action_required,
      urgency: parsed.urgency,
      demands: parsed.demands,
      requests_met: parsed.requests_met,
      invoice_id: invoiceId,
    });
  }

  return {
    ok: true,
    intent: parsed.intent,
    invoice_id: invoiceId ?? null,
    source,
    attachments_processed: attachments.length,
  };
}

function stripHtml(html: string): string {
  return html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function overallConfidence(extracted: Record<string, any>): number {
  const fields = [
    "supplier_name",
    "invoice_number",
    "invoice_date",
    "gross_amount",
  ];
  const scores = { high: 1, medium: 0.6, low: 0.2 };
  let total = 0;
  let count = 0;

  for (const f of fields) {
    const conf = extracted[f]?.confidence;
    if (conf && scores[conf as keyof typeof scores] !== undefined) {
      total += scores[conf as keyof typeof scores];
      count++;
    }
  }

  return count > 0 ? Math.round((total / count) * 100) / 100 : 0;
}

function overallConfidenceLabel(
  extracted: Record<string, any>
): "high" | "medium" | "low" {
  const score = overallConfidence(extracted);
  if (score >= 0.8) return "high";
  if (score >= 0.5) return "medium";
  return "low";
}
