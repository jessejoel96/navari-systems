/**
 * POST /api/cash-requests/[requestId]/confirm
 *
 * Tina confirms (or queries) a submitted cash request or justification.
 *
 * Body:
 *   type: "cash_request" | "justification"
 *   action: "confirm" | "query"
 *   notes?: string
 *   approved_amount?: number  (for cash_request confirm — how much is actually approved)
 *   confirmed_by?: string
 */

import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.RESEND_FROM_EMAIL!;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL!;

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ requestId: string }> }
) {
  const { requestId } = await params;
  const body = await req.json() as {
    type: "cash_request" | "justification";
    action: "confirm" | "query";
    notes?: string;
    approved_amount?: number;
    confirmed_by?: string;
  };

  const supabase = createServiceClient();

  const { data: cashReq } = await supabase
    .from("cash_requests")
    .select("id, entity_id, cycle_id, period, amount_requested, entities(name, code, contact_email, contact_name)")
    .eq("id", requestId)
    .single();

  if (!cashReq) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const entity = Array.isArray(cashReq.entities) ? cashReq.entities[0] : cashReq.entities as {
    name: string; code: string; contact_email: string | null; contact_name: string | null
  } | null;

  const now = new Date().toISOString();
  const confirmedBy = body.confirmed_by ?? "Tina-Randa";

  const update: Record<string, unknown> = {};

  if (body.type === "cash_request") {
    if (body.action === "confirm") {
      update.cr_confirmed_at = now;
      update.cr_confirmed_by = confirmedBy;
      update.status = "approved";
      if (body.approved_amount !== undefined) update.amount_approved = body.approved_amount;
      if (body.notes) update.notes = body.notes;
    } else {
      update.status = "queried";
      update.notes = body.notes ?? "";
    }
  } else {
    if (body.action === "confirm") {
      update.justification_confirmed_at = now;
      update.justification_confirmed_by = confirmedBy;
      update.justification_status = "confirmed";
      if (body.notes) update.justification_notes = body.notes;
    } else {
      update.justification_status = "queried";
      update.justification_notes = body.notes ?? "";
    }
  }

  await supabase.from("cash_requests").update(update).eq("id", requestId);

  // Send email to entity if they have a contact
  if (entity?.contact_email) {
    const isConfirm = body.action === "confirm";
    const label = body.type === "cash_request" ? "Cash Request" : "Expense Justification";

    const subjectPrefix = isConfirm ? "[CONFIRMED]" : "[ACTION REQUIRED]";
    const headerColor = isConfirm ? "#16A34A" : "#D97706";
    const headerTitle = isConfirm
      ? `✓ ${label} Confirmed — ${cashReq.period}`
      : `⚠ Clarification Needed — ${label} — ${cashReq.period}`;

    let bodyContent = "";
    if (isConfirm) {
      bodyContent = `
        <p style="font-size:14px;color:#374151;margin:0 0 12px;">
          Your <strong>${label}</strong> for <strong>${cashReq.period}</strong> has been reviewed and confirmed.
        </p>
        ${body.approved_amount !== undefined && body.type === "cash_request" ? `
          <div style="background:#F0FDF4;border:1px solid #BBF7D0;border-radius:8px;padding:12px;font-size:13px;color:#15803D;margin-bottom:16px;">
            <strong>Approved amount:</strong> ${body.approved_amount.toLocaleString("fr-FR")} XAF
            ${body.notes ? `<br><strong>Notes:</strong> ${body.notes}` : ""}
          </div>
        ` : ""}
        ${body.notes && body.type !== "cash_request" ? `<p style="font-size:13px;color:#374151;"><strong>Notes:</strong> ${body.notes}</p>` : ""}
      `;
    } else {
      bodyContent = `
        <p style="font-size:14px;color:#374151;margin:0 0 12px;">
          We have reviewed your <strong>${label}</strong> for <strong>${cashReq.period}</strong> and need some clarifications before we can proceed.
        </p>
        <div style="background:#FFFBEB;border:1px solid #FDE68A;border-radius:8px;padding:12px;font-size:13px;color:#92400E;margin-bottom:16px;">
          ${body.notes ?? "Please contact Tina-Randa for details."}
        </div>
        <a href="${APP_URL}/cash-requests/submit/${requestId}"
           style="display:inline-block;background:#D97706;color:white;padding:10px 20px;border-radius:8px;text-decoration:none;font-size:13px;font-weight:600;">
          Re-submit Updated ${label}
        </a>
      `;
    }

    await resend.emails.send({
      from: FROM,
      to: entity.contact_email,
      cc: process.env.AP_ACCOUNTANT_EMAIL,
      subject: `${subjectPrefix} ${label} — ${cashReq.period} — ${entity.name}`,
      html: `
        <div style="font-family:Inter,system-ui,sans-serif;max-width:540px;margin:0 auto;">
          <div style="background:${headerColor};padding:20px;border-radius:10px 10px 0 0;">
            <h2 style="color:white;margin:0;font-size:16px;">${headerTitle}</h2>
          </div>
          <div style="border:1px solid #E2E8F0;border-top:none;padding:20px;border-radius:0 0 10px 10px;">
            <p style="font-size:14px;color:#374151;margin:0 0 12px;">
              Dear ${entity.contact_name ?? entity.name} team,
            </p>
            ${bodyContent}
            <p style="font-size:12px;color:#94A3B8;margin-top:20px;">
              On behalf of Tina-Randa, AP Accountant — Intel HRC
            </p>
          </div>
        </div>
      `,
    });
  }

  await supabase.from("audit_events").insert({
    event_type: `${body.type}_${body.action}ed`,
    payload: { request_id: requestId, type: body.type, action: body.action, notes: body.notes, confirmed_by: confirmedBy },
  });

  return NextResponse.json({ ok: true, action: body.action, type: body.type });
}
