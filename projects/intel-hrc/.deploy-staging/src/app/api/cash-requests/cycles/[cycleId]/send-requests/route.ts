/**
 * POST /api/cash-requests/cycles/[cycleId]/send-requests
 * Send cash request emails to all entity contacts in this cycle.
 * Called on (or around) the 24th of each month.
 */

import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.RESEND_FROM_EMAIL!;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL!;
const TINA_EMAIL = process.env.AP_ACCOUNTANT_EMAIL!;

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ cycleId: string }> }
) {
  const { cycleId } = await params;
  const supabase = createServiceClient();

  const { data: cycle } = await supabase
    .from("cash_request_cycles")
    .select("*, cash_requests(id, entity_id, entities(name, code, contact_email, contact_name))")
    .eq("id", cycleId)
    .single();

  if (!cycle) return NextResponse.json({ error: "Cycle not found" }, { status: 404 });

  if (cycle.status !== "draft" && cycle.status !== "requests_sent") {
    return NextResponse.json({ error: "Requests already sent or cycle is past collection stage" }, { status: 422 });
  }

  const deadline = cycle.deadline_date
    ? new Date(cycle.deadline_date).toLocaleDateString("en-GB", {
        day: "numeric", month: "long", year: "numeric",
      })
    : "the 28th";

  const requests = (cycle.cash_requests ?? []) as Array<{
    id: string;
    entity_id: string;
    entities: { name: string; code: string; contact_email: string | null; contact_name: string | null } | null;
  }>;

  const sent: string[] = [];
  const failed: Array<{ entity: string; reason: string }> = [];

  for (const req of requests) {
    const entity = Array.isArray(req.entities) ? req.entities[0] : req.entities;
    if (!entity?.contact_email) {
      failed.push({ entity: entity?.code ?? req.entity_id, reason: "No contact email configured" });
      continue;
    }

    const uploadUrl = `${APP_URL}/cash-requests/submit/${req.id}`;

    const { error: emailErr } = await resend.emails.send({
      from: FROM,
      to: entity.contact_email,
      cc: TINA_EMAIL,
      subject: `[ACTION REQUIRED] Cash Request Submission — ${cycle.label}`,
      html: `
        <div style="font-family:Inter,system-ui,sans-serif;max-width:600px;margin:0 auto;">
          <div style="background:#1F6DB3;padding:24px;border-radius:12px 12px 0 0;">
            <h2 style="color:white;margin:0;font-size:18px;">Cash Request — ${cycle.label}</h2>
            <p style="color:rgba(255,255,255,0.8);margin:6px 0 0;font-size:13px;">${entity.name} (${entity.code})</p>
          </div>

          <div style="border:1px solid #E2E8F0;border-top:none;padding:24px;border-radius:0 0 12px 12px;">
            <p style="font-size:14px;color:#374151;margin:0 0 16px;">
              Dear ${entity.contact_name ?? entity.name} team,
            </p>
            <p style="font-size:14px;color:#374151;margin:0 0 16px;">
              Please submit your <strong>cash request for ${cycle.label}</strong> by
              <strong>${deadline}</strong>.
            </p>

            <p style="font-size:14px;color:#374151;margin:0 0 8px;">Your submission should include:</p>
            <ul style="font-size:14px;color:#374151;margin:0 0 20px;padding-left:20px;">
              <li>Budget line items with amounts (in XAF)</li>
              <li>Purpose / description for each line</li>
              <li>Opening wallet balance</li>
              <li>Any outstanding justifications</li>
            </ul>

            <p style="font-size:14px;color:#374151;margin:0 0 20px;">
              You can upload your Excel file directly via the link below, or reply to this email
              with the file attached — it will be picked up automatically.
            </p>

            <a href="${uploadUrl}"
               style="display:inline-block;background:#1F6DB3;color:white;padding:12px 28px;border-radius:8px;text-decoration:none;font-size:14px;font-weight:600;margin-bottom:24px;">
              Submit Cash Request
            </a>

            <div style="background:#F8FAFC;border-radius:8px;padding:14px;font-size:12px;color:#64748B;">
              <strong>Deadline:</strong> ${deadline}<br>
              <strong>Period:</strong> ${cycle.label}<br>
              <strong>Entity:</strong> ${entity.name} (${entity.code})<br><br>
              Submissions received after the deadline may not be included in the compiled batch.
            </div>

            <p style="font-size:12px;color:#94A3B8;margin:20px 0 0;">
              On behalf of Tina-Randa, AP Accountant — Intel HRC
            </p>
          </div>
        </div>
      `,
    });

    if (emailErr) {
      failed.push({ entity: entity.code, reason: emailErr.message });
    } else {
      sent.push(entity.code);
      await supabase
        .from("cash_requests")
        .update({ request_email_sent_at: new Date().toISOString(), status: "requested" })
        .eq("id", req.id);
    }
  }

  await supabase
    .from("cash_request_cycles")
    .update({ status: "requests_sent", request_sent_at: new Date().toISOString() })
    .eq("id", cycleId);

  await supabase.from("audit_events").insert({
    event_type: "cash_request_blast_sent",
    payload: { cycle_id: cycleId, period: cycle.label, sent, failed },
  });

  return NextResponse.json({ ok: true, sent, failed, total: requests.length });
}
