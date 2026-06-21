/**
 * POST /api/payments/send-for-approval
 *
 * Sends an email to CFO or CEO with the payment sheet bundle for review.
 * Creates an approval record and returns a signed token URL.
 *
 * Body: { batch_id: string }
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

const APPROVER_NAMES: Record<string, string> = {
  cfo: "Enow Mengotkpa (CFO)",
  ceo: "D.N Fonderson (CEO)",
};

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export async function POST(req: NextRequest) {
  const supabase = createServiceClient();
  const { batch_id } = await req.json();

  if (!batch_id) {
    return NextResponse.json({ error: "Missing batch_id" }, { status: 400 });
  }

  const { data: batch, error: batchErr } = await supabase
    .from("payment_batches")
    .select("*, payment_lines(invoice_id, amount, suppliers:supplier_id(name))")
    .eq("id", batch_id)
    .single();

  if (batchErr || !batch) {
    return NextResponse.json({ error: "Batch not found" }, { status: 404 });
  }

  const approverEmail = APPROVER_EMAILS[batch.approver_role];
  if (!approverEmail) {
    return NextResponse.json(
      { error: `No email configured for ${batch.approver_role}` },
      { status: 400 }
    );
  }

  // Generate a signed token for approve/reject actions
  const token = crypto.randomBytes(32).toString("hex");
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

  // Create approval record
  const { data: approval } = await supabase
    .from("approvals")
    .insert({
      approver_email: approverEmail,
      approver_role: batch.approver_role,
      decision: "pending",
      reminder_count: 0,
    })
    .select("id")
    .single();

  // Store hash on the batch
  await supabase
    .from("payment_batches")
    .update({ status: "sent", notes: `approval_token_hash:${tokenHash}` })
    .eq("id", batch_id);

  const period = `${MONTH_NAMES[batch.period_month - 1]} ${batch.period_year}`;
  const sheetLabel = batch.sheet_type === "bank" ? "Supplier Payment Sheet" : "Maviance Report";
  const approveUrl = `${APP_URL}/approve-payment?token=${token}&batch=${batch_id}&action=approve`;
  const rejectUrl = `${APP_URL}/approve-payment?token=${token}&batch=${batch_id}&action=reject`;

  const lines = (batch.payment_lines ?? []) as Array<{ amount: number; suppliers?: { name: string } }>;

  const lineItems = lines
    .slice(0, 20)
    .map((l, i) => `<tr>
      <td style="padding:6px 12px;font-size:12px;border-bottom:1px solid #F1F5F9;">${i + 1}</td>
      <td style="padding:6px 12px;font-size:12px;border-bottom:1px solid #F1F5F9;">${(l.suppliers as any)?.name ?? "—"}</td>
      <td style="padding:6px 12px;font-size:12px;text-align:right;border-bottom:1px solid #F1F5F9;">${l.amount.toLocaleString("fr-FR")} XAF</td>
    </tr>`)
    .join("");

  const moreLine = lines.length > 20
    ? `<tr><td colspan="3" style="padding:6px 12px;font-size:11px;color:#94A3B8;">…and ${lines.length - 20} more lines</td></tr>`
    : "";

  await resend.emails.send({
    from: FROM,
    to: approverEmail,
    cc: process.env.AP_ACCOUNTANT_EMAIL,
    subject: `[ACTION REQUIRED] ${sheetLabel} — ${period} — ${batch.total_amount.toLocaleString("fr-FR")} XAF`,
    html: `
      <div style="font-family:Inter,system-ui,sans-serif;max-width:600px;margin:0 auto;">
        <div style="background:#1F6DB3;padding:24px;border-radius:12px 12px 0 0;">
          <h2 style="color:white;margin:0;font-size:18px;">${sheetLabel} — ${period}</h2>
          <p style="color:rgba(255,255,255,0.8);margin:6px 0 0;font-size:13px;">
            Approval required · ${APPROVER_NAMES[batch.approver_role]}
          </p>
        </div>

        <div style="border:1px solid #E2E8F0;border-top:none;padding:24px;border-radius:0 0 12px 12px;">
          <p style="font-size:14px;color:#374151;margin:0 0 20px;">
            Please review the payment batch below and approve or reject.
            The physical payment sheet and signed invoice copies will be scanned and uploaded into the system after your signature.
          </p>

          <div style="background:#F7F9FB;border-radius:8px;padding:16px;margin-bottom:20px;">
            <table style="width:100%;font-size:13px;border-collapse:collapse;">
              <tr>
                <td style="padding:4px 0;color:#6B7280;">Sheet type</td>
                <td style="padding:4px 0;font-weight:600;color:#111827;">${sheetLabel}</td>
              </tr>
              <tr>
                <td style="padding:4px 0;color:#6B7280;">Period</td>
                <td style="padding:4px 0;font-weight:600;color:#111827;">${period}</td>
              </tr>
              <tr>
                <td style="padding:4px 0;color:#6B7280;">Total amount</td>
                <td style="padding:4px 0;font-weight:700;color:#1F6DB3;font-size:15px;">${batch.total_amount.toLocaleString("fr-FR")} XAF</td>
              </tr>
              <tr>
                <td style="padding:4px 0;color:#6B7280;">Line items</td>
                <td style="padding:4px 0;font-weight:600;color:#111827;">${lines.length} suppliers</td>
              </tr>
            </table>
          </div>

          <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
            <thead>
              <tr style="background:#F1F5F9;">
                <th style="padding:8px 12px;font-size:11px;font-weight:600;color:#64748B;text-align:left;">#</th>
                <th style="padding:8px 12px;font-size:11px;font-weight:600;color:#64748B;text-align:left;">Supplier</th>
                <th style="padding:8px 12px;font-size:11px;font-weight:600;color:#64748B;text-align:right;">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${lineItems}
              ${moreLine}
            </tbody>
          </table>

          <div style="display:flex;gap:12px;margin-bottom:24px;">
            <a href="${approveUrl}"
               style="display:inline-block;background:#16A34A;color:white;padding:12px 28px;border-radius:8px;text-decoration:none;font-size:14px;font-weight:600;">
              Approve Batch
            </a>
            <a href="${rejectUrl}"
               style="display:inline-block;background:#DC2626;color:white;padding:12px 28px;border-radius:8px;text-decoration:none;font-size:14px;font-weight:600;">
              Reject
            </a>
          </div>

          <p style="font-size:12px;color:#94A3B8;margin:0;">
            After approving, please sign the printed payment sheet and each invoice listed.
            Tina will scan and upload the signed documents into the system.<br><br>
            On behalf of Tina-Randa, AP Accountant — Intel HRC
          </p>
        </div>
      </div>
    `,
  });

  return NextResponse.json({
    ok: true,
    approval_id: approval?.id,
    sent_to: approverEmail,
    batch_status: "sent",
  });
}
