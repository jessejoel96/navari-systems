/**
 * POST /api/cash-requests/[requestId]/submit-justification
 *
 * Entity (or Tina on their behalf) uploads the previous-month expense/justification
 * sheet. Parses line items tagged as 'expense'. Sends receipt confirmation to entity.
 */

import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { Resend } from "resend";
import ExcelJS from "exceljs";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.RESEND_FROM_EMAIL!;

async function parseExpenseExcel(buffer: Buffer): Promise<{
  openingBalance: number;
  totalExpenses: number;
  lines: Array<{ sn: number; description: string; budget_code: string; amount: number; remarks: string }>;
}> {
  const wb = new ExcelJS.Workbook();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await wb.xlsx.load(buffer as any);
  const ws = wb.worksheets[0];
  if (!ws) return { openingBalance: 0, totalExpenses: 0, lines: [] };

  let openingBalance = 0;
  const lines: Array<{ sn: number; description: string; budget_code: string; amount: number; remarks: string }> = [];
  let sn = 0;

  ws.eachRow((row, rowNumber) => {
    const cells = row.values as (string | number | null | undefined)[];
    const rowText = cells.join(" ").toLowerCase();

    // Try to detect opening balance row
    if (rowText.includes("ouverture") || rowText.includes("opening") || rowText.includes("solde")) {
      for (const val of cells) {
        if (typeof val === "number" && val > 0) { openingBalance = Math.round(val); break; }
      }
      return;
    }

    if (rowNumber <= 3) return;

    let description = "";
    let amount = 0;
    let remarks = "";

    for (let i = 1; i < cells.length; i++) {
      const val = cells[i];
      if (typeof val === "string" && val.trim() && !description) description = val.trim();
      else if (typeof val === "number" && val > 0 && !amount) amount = Math.round(val);
      else if (typeof val === "string" && val.trim() && description && !remarks) remarks = val.trim();
    }

    if (description && amount > 0) {
      sn++;
      lines.push({ sn, description, budget_code: "", amount, remarks });
    }
  });

  return {
    openingBalance,
    totalExpenses: lines.reduce((s, l) => s + l.amount, 0),
    lines,
  };
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ requestId: string }> }
) {
  const { requestId } = await params;
  const supabase = createServiceClient();

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

  const { data: cashReq } = await supabase
    .from("cash_requests")
    .select("id, cycle_id, entity_id, period, entities(name, code, contact_email, contact_name)")
    .eq("id", requestId)
    .single();

  if (!cashReq) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const entity = Array.isArray(cashReq.entities) ? cashReq.entities[0] : cashReq.entities as {
    name: string; code: string; contact_email: string | null; contact_name: string | null
  } | null;

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // Upload file
  const storagePath = `cash-requests/${cashReq.cycle_id}/${cashReq.entity_id}/justification-${file.name}`;
  await supabase.storage.from("invoice-files").upload(storagePath, buffer, {
    contentType: file.type || "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    upsert: true,
  });

  // Parse expense lines
  type ParsedResult = { openingBalance: number; totalExpenses: number; lines: Array<{ sn: number; description: string; budget_code: string; amount: number; remarks: string }> };
  let parsed: ParsedResult = { openingBalance: 0, totalExpenses: 0, lines: [] };
  if (file.name.endsWith(".xlsx") || file.name.endsWith(".xls")) {
    try { parsed = await parseExpenseExcel(buffer); } catch { /* non-fatal */ }
  }

  const now = new Date().toISOString();

  // Update cash_request record
  await supabase.from("cash_requests").update({
    justification_path: storagePath,
    justification_received_at: now,
    justification_status: "submitted",
    opening_balance: parsed.openingBalance || null,
    expense_actual_amount: parsed.totalExpenses || null,
  }).eq("id", requestId);

  // Remove old expense line items and insert new ones
  await supabase.from("cash_request_line_items")
    .delete()
    .eq("cash_request_id", requestId)
    .eq("item_type", "expense");

  if (parsed.lines.length > 0) {
    await supabase.from("cash_request_line_items").insert(
      parsed.lines.map((l: { sn: number; description: string; budget_code: string; amount: number; remarks: string }) => ({
        cash_request_id: requestId,
        sn: l.sn,
        description: l.description,
        budget_code: l.budget_code,
        amount_requested: l.amount,
        item_type: "expense",
        remarks: l.remarks,
      }))
    );
  }

  // Send receipt confirmation to entity
  if (entity?.contact_email) {
    await resend.emails.send({
      from: FROM,
      to: entity.contact_email,
      cc: process.env.AP_ACCOUNTANT_EMAIL,
      subject: `[RECEIVED] Justification Submission — ${cashReq.period} — ${entity.name}`,
      html: `
        <div style="font-family:Inter,system-ui,sans-serif;max-width:540px;margin:0 auto;">
          <div style="background:#16A34A;padding:20px;border-radius:10px 10px 0 0;">
            <h2 style="color:white;margin:0;font-size:16px;">✓ Justification Received</h2>
          </div>
          <div style="border:1px solid #E2E8F0;border-top:none;padding:20px;border-radius:0 0 10px 10px;">
            <p style="font-size:14px;color:#374151;margin:0 0 12px;">
              Dear ${entity.contact_name ?? entity.name} team,
            </p>
            <p style="font-size:14px;color:#374151;margin:0 0 16px;">
              We have received your <strong>expense justification</strong> for <strong>${cashReq.period}</strong>.
            </p>
            <div style="background:#F0FDF4;border:1px solid #BBF7D0;border-radius:8px;padding:12px;font-size:12px;color:#15803D;margin-bottom:16px;">
              <strong>File received:</strong> ${file.name}<br>
              ${parsed.totalExpenses > 0 ? `<strong>Total expenses parsed:</strong> ${parsed.totalExpenses.toLocaleString("fr-FR")} XAF` : ""}
            </div>
            <p style="font-size:13px;color:#64748B;">
              Tina-Randa will review your submission and follow up if any clarifications are needed.
            </p>
            <p style="font-size:12px;color:#94A3B8;margin-top:16px;">
              On behalf of Intel HRC Finance — AP Accountant
            </p>
          </div>
        </div>
      `,
    });
  }

  await supabase.from("audit_events").insert({
    event_type: "justification_submitted",
    payload: { request_id: requestId, entity_id: cashReq.entity_id, file: file.name, total_expenses: parsed.totalExpenses },
  });

  return NextResponse.json({
    ok: true,
    storage_path: storagePath,
    opening_balance: parsed.openingBalance,
    total_expenses: parsed.totalExpenses,
    lines_parsed: parsed.lines.length,
  });
}
