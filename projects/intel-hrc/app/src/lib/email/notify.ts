/**
 * Notification system — sends emails to Tina via Resend.
 * Uses Supabase + Resend integration for delivery.
 */

import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM = process.env.RESEND_FROM_EMAIL!;
const TINA_EMAIL = process.env.AP_ACCOUNTANT_EMAIL!;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL!;

export async function notifyNewInvoice(invoice: {
  id: string;
  supplier_name: string;
  amount: number;
  entity_code: string;
  description: string;
  source: "upload" | "email";
  confidence?: string;
}) {
  const subject = `New invoice: ${invoice.supplier_name} — ${invoice.amount.toLocaleString()} FCFA (${invoice.entity_code})`;

  await resend.emails.send({
    from: FROM,
    to: TINA_EMAIL,
    subject,
    html: `
      <div style="font-family: Inter, system-ui, sans-serif; max-width: 560px; margin: 0 auto;">
        <div style="background: #1F6DB3; padding: 20px 24px; border-radius: 12px 12px 0 0;">
          <h2 style="color: white; margin: 0; font-size: 16px;">New Invoice Received</h2>
        </div>
        <div style="border: 1px solid #E5E7EB; border-top: none; padding: 24px; border-radius: 0 0 12px 12px;">
          <table style="width: 100%; font-size: 14px; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; color: #6B7280; width: 120px;">Supplier</td>
              <td style="padding: 8px 0; font-weight: 600; color: #111827;">${invoice.supplier_name}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #6B7280;">Amount</td>
              <td style="padding: 8px 0; font-weight: 600; color: #111827;">${invoice.amount.toLocaleString()} FCFA</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #6B7280;">Entity</td>
              <td style="padding: 8px 0; color: #111827;">${invoice.entity_code}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #6B7280;">Description</td>
              <td style="padding: 8px 0; color: #111827;">${invoice.description || "—"}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #6B7280;">Source</td>
              <td style="padding: 8px 0; color: #111827;">${invoice.source === "email" ? "Email forwarding" : "Manual upload"}</td>
            </tr>
            ${invoice.confidence ? `
            <tr>
              <td style="padding: 8px 0; color: #6B7280;">AI Confidence</td>
              <td style="padding: 8px 0; color: ${invoice.confidence === "high" ? "#22A447" : invoice.confidence === "medium" ? "#F59E0B" : "#DC2626"}; font-weight: 500;">${invoice.confidence.charAt(0).toUpperCase() + invoice.confidence.slice(1)}</td>
            </tr>` : ""}
          </table>
          <div style="margin-top: 24px;">
            <a href="${APP_URL}/invoices/${invoice.id}"
               style="display: inline-block; background: #1F6DB3; color: white; padding: 10px 24px; border-radius: 8px; text-decoration: none; font-size: 14px; font-weight: 500;">
              Review Invoice
            </a>
          </div>
          <p style="margin-top: 16px; font-size: 12px; color: #9CA3AF;">
            On behalf of Tina-Randa, AP Accountant — Intel HRC
          </p>
        </div>
      </div>
    `,
  });
}

export async function notifyEmailParsed(parsed: {
  intent: string;
  supplier_name: string | null;
  summary: string;
  action_required: string;
  urgency: string;
  demands: string[];
  requests_met: string[];
  invoice_id?: string;
}) {
  const urgencyBadge =
    parsed.urgency === "overdue"
      ? "🔴 OVERDUE"
      : parsed.urgency === "urgent"
      ? "🟡 URGENT"
      : "";

  const subject = `${urgencyBadge ? urgencyBadge + " " : ""}AP Email: ${parsed.intent.replace(/_/g, " ")} — ${parsed.supplier_name || "Unknown sender"}`;

  const demandsHtml = parsed.demands.length > 0
    ? `<div style="margin-top: 16px;">
        <p style="font-size: 13px; font-weight: 600; color: #DC2626; margin: 0 0 8px;">Demands / Requests from sender:</p>
        <ul style="margin: 0; padding-left: 20px; font-size: 13px; color: #374151;">
          ${parsed.demands.map((d) => `<li style="padding: 2px 0;">${d}</li>`).join("")}
        </ul>
      </div>`
    : "";

  const metHtml = parsed.requests_met.length > 0
    ? `<div style="margin-top: 16px;">
        <p style="font-size: 13px; font-weight: 600; color: #22A447; margin: 0 0 8px;">Requests fulfilled by this email:</p>
        <ul style="margin: 0; padding-left: 20px; font-size: 13px; color: #374151;">
          ${parsed.requests_met.map((r) => `<li style="padding: 2px 0;">${r}</li>`).join("")}
        </ul>
      </div>`
    : "";

  await resend.emails.send({
    from: FROM,
    to: TINA_EMAIL,
    subject,
    html: `
      <div style="font-family: Inter, system-ui, sans-serif; max-width: 560px; margin: 0 auto;">
        <div style="background: ${parsed.urgency === "overdue" ? "#DC2626" : parsed.urgency === "urgent" ? "#F59E0B" : "#1F6DB3"}; padding: 20px 24px; border-radius: 12px 12px 0 0;">
          <h2 style="color: white; margin: 0; font-size: 16px;">
            ${parsed.intent.replace(/_/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase())}
          </h2>
          <p style="color: rgba(255,255,255,0.8); margin: 4px 0 0; font-size: 13px;">
            ${parsed.supplier_name || "Unknown sender"}
          </p>
        </div>
        <div style="border: 1px solid #E5E7EB; border-top: none; padding: 24px; border-radius: 0 0 12px 12px;">
          <p style="font-size: 14px; color: #374151; line-height: 1.6; margin: 0;">${parsed.summary}</p>

          <div style="margin-top: 20px; background: #F7F9FB; border-radius: 8px; padding: 14px 16px;">
            <p style="font-size: 12px; color: #6B7280; margin: 0 0 4px;">Next action:</p>
            <p style="font-size: 14px; font-weight: 600; color: #111827; margin: 0;">${parsed.action_required}</p>
          </div>

          ${demandsHtml}
          ${metHtml}

          ${parsed.invoice_id ? `
          <div style="margin-top: 24px;">
            <a href="${APP_URL}/invoices/${parsed.invoice_id}"
               style="display: inline-block; background: #1F6DB3; color: white; padding: 10px 24px; border-radius: 8px; text-decoration: none; font-size: 14px; font-weight: 500;">
              View in AP Workflow
            </a>
          </div>` : ""}

          <p style="margin-top: 16px; font-size: 12px; color: #9CA3AF;">
            Intel HRC AP Workflow · Automated email classification
          </p>
        </div>
      </div>
    `,
  });
}
