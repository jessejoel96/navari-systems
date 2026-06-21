/**
 * POST /api/cash-requests/cycles/[cycleId]/send-to-cfo
 * Sends the compiled cash request summary to CFO (or CEO) for validation.
 */

import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { Resend } from "resend";
import crypto from "crypto";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.RESEND_FROM_EMAIL!;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL!;

const APPROVER_EMAILS: Record<string, string> = {
  cfo: process.env.CFO_EMAIL ?? "",
  ceo: process.env.CEO_EMAIL ?? "",
};

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ cycleId: string }> }
) {
  const { cycleId } = await params;
  const body = await req.json().catch(() => ({})) as { approver_role?: string };
  const approverRole = body.approver_role ?? "cfo";

  const supabase = createServiceClient();

  const { data: cycle } = await supabase
    .from("cash_request_cycles")
    .select(`
      *,
      cash_requests(
        id, status, amount_requested, amount_approved,
        entities(name, code, country)
      )
    `)
    .eq("id", cycleId)
    .single();

  if (!cycle) return NextResponse.json({ error: "Cycle not found" }, { status: 404 });
  if (!cycle.compiled_file_path) {
    return NextResponse.json({ error: "Compile the sheet first" }, { status: 422 });
  }

  const approverEmail = APPROVER_EMAILS[approverRole];
  if (!approverEmail) {
    return NextResponse.json({ error: `No email configured for ${approverRole}` }, { status: 400 });
  }

  const token = crypto.randomBytes(32).toString("hex");
  const approveUrl = `${APP_URL}/approve-cash-requests?token=${token}&cycle=${cycleId}&action=approve`;
  const downloadUrl = `${APP_URL}/api/storage?path=${encodeURIComponent(cycle.compiled_file_path)}`;

  const requests = (cycle.cash_requests ?? []) as Array<{
    id: string;
    status: string;
    amount_requested: number;
    entities: { name: string; code: string; country: string } | null;
  }>;

  const grandTotal = requests.reduce((s, r) => s + (r.amount_requested ?? 0), 0);

  const tableRows = requests.map((r) => {
    const entity = Array.isArray(r.entities) ? r.entities[0] : r.entities;
    return `<tr>
      <td style="padding:6px 12px;font-size:12px;border-bottom:1px solid #F1F5F9;">${entity?.name ?? "—"}</td>
      <td style="padding:6px 12px;font-size:12px;border-bottom:1px solid #F1F5F9;">${entity?.country ?? "—"}</td>
      <td style="padding:6px 12px;font-size:12px;border-bottom:1px solid #F1F5F9;">${r.status.toUpperCase()}</td>
      <td style="padding:6px 12px;font-size:12px;text-align:right;border-bottom:1px solid #F1F5F9;">${(r.amount_requested ?? 0).toLocaleString("fr-FR")} XAF</td>
    </tr>`;
  }).join("");

  await resend.emails.send({
    from: FROM,
    to: approverEmail,
    cc: process.env.AP_ACCOUNTANT_EMAIL,
    subject: `[ACTION REQUIRED] Cash Requests Validation — ${cycle.label} — ${grandTotal.toLocaleString("fr-FR")} XAF`,
    html: `
      <div style="font-family:Inter,system-ui,sans-serif;max-width:640px;margin:0 auto;">
        <div style="background:#1F6DB3;padding:24px;border-radius:12px 12px 0 0;">
          <h2 style="color:white;margin:0;font-size:18px;">Cash Requests — ${cycle.label}</h2>
          <p style="color:rgba(255,255,255,0.8);margin:6px 0 0;font-size:13px;">
            ${requests.length} entities · ${grandTotal.toLocaleString("fr-FR")} XAF total
          </p>
        </div>
        <div style="border:1px solid #E2E8F0;border-top:none;padding:24px;border-radius:0 0 12px 12px;">
          <p style="font-size:14px;color:#374151;margin:0 0 20px;">
            Please review and validate the compiled cash requests for ${cycle.label}.
            The full breakdown is attached in Excel below.
          </p>

          <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
            <thead>
              <tr style="background:#F1F5F9;">
                <th style="padding:8px 12px;font-size:11px;font-weight:600;color:#64748B;text-align:left;">Entity</th>
                <th style="padding:8px 12px;font-size:11px;font-weight:600;color:#64748B;text-align:left;">Country</th>
                <th style="padding:8px 12px;font-size:11px;font-weight:600;color:#64748B;text-align:left;">Status</th>
                <th style="padding:8px 12px;font-size:11px;font-weight:600;color:#64748B;text-align:right;">Amount</th>
              </tr>
            </thead>
            <tbody>${tableRows}</tbody>
            <tfoot>
              <tr style="background:#1F6DB3;">
                <td colspan="3" style="padding:8px 12px;font-size:12px;font-weight:700;color:white;">TOTAL</td>
                <td style="padding:8px 12px;font-size:13px;font-weight:700;color:white;text-align:right;">${grandTotal.toLocaleString("fr-FR")} XAF</td>
              </tr>
            </tfoot>
          </table>

          <div style="display:flex;gap:12px;margin-bottom:24px;">
            <a href="${downloadUrl}"
               style="display:inline-block;background:#374151;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-size:14px;font-weight:600;">
              Download Compiled Sheet
            </a>
            <a href="${approveUrl}"
               style="display:inline-block;background:#16A34A;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-size:14px;font-weight:600;">
              Approve All Requests
            </a>
          </div>

          <p style="font-size:12px;color:#94A3B8;">
            On behalf of Tina-Randa, AP Accountant — Intel HRC
          </p>
        </div>
      </div>
    `,
  });

  await supabase
    .from("cash_request_cycles")
    .update({ status: "cfo_review", cfo_sent_at: new Date().toISOString() })
    .eq("id", cycleId);

  return NextResponse.json({ ok: true, sent_to: approverEmail });
}
