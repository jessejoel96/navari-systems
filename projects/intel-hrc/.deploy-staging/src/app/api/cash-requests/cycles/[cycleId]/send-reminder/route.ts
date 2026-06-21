/**
 * POST /api/cash-requests/cycles/[cycleId]/send-reminder
 * Sends a reminder only to entities that have not yet submitted.
 */

import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.RESEND_FROM_EMAIL!;
const TINA_EMAIL = process.env.AP_ACCOUNTANT_EMAIL!;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL!;

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ cycleId: string }> }
) {
  const { cycleId } = await params;
  const supabase = createServiceClient();

  const { data: cycle } = await supabase
    .from("cash_request_cycles")
    .select("*, cash_requests(id, status, entity_id, entities(name, code, contact_email, contact_name))")
    .eq("id", cycleId)
    .single();

  if (!cycle) return NextResponse.json({ error: "Cycle not found" }, { status: 404 });

  const pending = (cycle.cash_requests ?? []).filter(
    (r: { status: string }) => !["submitted", "approved"].includes(r.status)
  ) as Array<{
    id: string;
    entities: { name: string; code: string; contact_email: string | null; contact_name: string | null } | null;
  }>;

  if (pending.length === 0) {
    return NextResponse.json({ ok: true, message: "All entities have submitted — no reminders needed", reminded: [] });
  }

  const deadline = cycle.deadline_date
    ? new Date(cycle.deadline_date).toLocaleDateString("en-GB", { day: "numeric", month: "long" })
    : "the 28th";

  const reminded: string[] = [];

  for (const req of pending) {
    const entity = Array.isArray(req.entities) ? req.entities[0] : req.entities;
    if (!entity?.contact_email) continue;

    await resend.emails.send({
      from: FROM,
      to: entity.contact_email,
      cc: TINA_EMAIL,
      subject: `[REMINDER] Cash Request Submission Due — ${cycle.label}`,
      html: `
        <div style="font-family:Inter,system-ui,sans-serif;max-width:560px;margin:0 auto;">
          <div style="background:#D97706;padding:20px;border-radius:10px 10px 0 0;">
            <h2 style="color:white;margin:0;font-size:16px;">⏰ Reminder: Cash Request Due ${deadline}</h2>
          </div>
          <div style="border:1px solid #E2E8F0;border-top:none;padding:20px;border-radius:0 0 10px 10px;">
            <p style="font-size:14px;color:#374151;margin:0 0 12px;">
              We have not yet received the <strong>${cycle.label}</strong> cash request from
              <strong>${entity.name} (${entity.code})</strong>.
            </p>
            <p style="font-size:14px;color:#374151;margin:0 0 16px;">
              Please submit your Excel file before <strong>${deadline}</strong> to be included
              in this month's compiled batch.
            </p>
            <a href="${APP_URL}/cash-requests/submit/${req.id}"
               style="display:inline-block;background:#D97706;color:white;padding:10px 24px;border-radius:8px;text-decoration:none;font-size:14px;font-weight:600;">
              Submit Now
            </a>
            <p style="font-size:12px;color:#94A3B8;margin:16px 0 0;">
              On behalf of Tina-Randa, AP Accountant — Intel HRC
            </p>
          </div>
        </div>
      `,
    });

    reminded.push(entity.code);
  }

  await supabase
    .from("cash_request_cycles")
    .update({ reminder_sent_at: new Date().toISOString() })
    .eq("id", cycleId);

  return NextResponse.json({ ok: true, reminded, pending: pending.length });
}
