/**
 * POST /api/cash-requests/[requestId]/submit
 *
 * Entity submits their cash request Excel.
 * Parses the first sheet for line items (Description, Amount columns).
 * Can be triggered manually (upload) or via Tina uploading a received attachment.
 */

import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import ExcelJS from "exceljs";

function parseCashRequestExcel(
  buffer: Buffer
): Promise<Array<{ sn: number; description: string; budget_code: string; amount_requested: number; remarks: string }>> {
  return new Promise(async (resolve) => {
    const wb = new ExcelJS.Workbook();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await wb.xlsx.load(buffer as any);

    const ws = wb.worksheets[0];
    if (!ws) return resolve([]);

    const lines: Array<{ sn: number; description: string; budget_code: string; amount_requested: number; remarks: string }> = [];
    let sn = 0;

    ws.eachRow((row, rowNumber) => {
      if (rowNumber <= 3) return; // Skip typical header rows

      const cells = row.values as (string | number | null | undefined)[];

      // Try to find numeric amount column and text description
      // Column positions vary by entity — use heuristic: first text col = description, first number = amount
      let description = "";
      let amount = 0;
      let budgetCode = "";
      let remarks = "";

      for (let i = 1; i < cells.length; i++) {
        const val = cells[i];
        if (typeof val === "string" && val.trim() && !description) {
          description = val.trim();
        } else if (typeof val === "number" && val > 0 && !amount) {
          amount = Math.round(val);
        } else if (typeof val === "string" && val.trim() && description && !remarks) {
          remarks = val.trim();
        }
      }

      if (description && amount > 0) {
        sn++;
        lines.push({ sn, description, budget_code: budgetCode, amount_requested: amount, remarks });
      }
    });

    resolve(lines);
  });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ requestId: string }> }
) {
  const { requestId } = await params;
  const supabase = createServiceClient();

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const totalAmountRaw = formData.get("total_amount") as string | null;

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  const { data: cashReq } = await supabase
    .from("cash_requests")
    .select("id, cycle_id, entity_id, status, entities(name, code)")
    .eq("id", requestId)
    .single();

  if (!cashReq) return NextResponse.json({ error: "Cash request not found" }, { status: 404 });

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // Upload file
  const storagePath = `cash-requests/${cashReq.cycle_id}/${cashReq.entity_id}/${file.name}`;
  await supabase.storage.from("invoice-files").upload(storagePath, buffer, {
    contentType: file.type || "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    upsert: true,
  });

  // Parse line items from Excel
  let lineItems: Awaited<ReturnType<typeof parseCashRequestExcel>> = [];
  if (file.name.endsWith(".xlsx") || file.name.endsWith(".xls")) {
    try {
      lineItems = await parseCashRequestExcel(buffer);
    } catch {
      // Non-fatal — still save the file
    }
  }

  const totalAmount = totalAmountRaw
    ? parseInt(totalAmountRaw, 10)
    : lineItems.reduce((s, l) => s + l.amount_requested, 0);

  const now = new Date().toISOString();

  await supabase
    .from("cash_requests")
    .update({
      status: "submitted",
      submission_file_path: storagePath,
      submission_received_at: now,
      amount_requested: totalAmount,
    })
    .eq("id", requestId);

  // Delete old line items and insert new ones
  await supabase.from("cash_request_line_items").delete().eq("cash_request_id", requestId);

  if (lineItems.length > 0) {
    await supabase.from("cash_request_line_items").insert(
      lineItems.map((l) => ({
        cash_request_id: requestId,
        sn: l.sn,
        description: l.description,
        budget_code: l.budget_code,
        amount_requested: l.amount_requested,
        remarks: l.remarks,
      }))
    );
  }

  // Update cycle status if all submitted
  if (cashReq.cycle_id) {
    const { data: allReqs } = await supabase
      .from("cash_requests")
      .select("status")
      .eq("cycle_id", cashReq.cycle_id);

    const allSubmitted = (allReqs ?? []).every((r: { status: string }) =>
      ["submitted", "approved"].includes(r.status)
    );

    if (allSubmitted) {
      await supabase
        .from("cash_request_cycles")
        .update({ status: "all_submitted" })
        .eq("id", cashReq.cycle_id);
    }
  }

  await supabase.from("audit_events").insert({
    event_type: "cash_request_submitted",
    payload: {
      request_id: requestId,
      cycle_id: cashReq.cycle_id,
      entity_id: cashReq.entity_id,
      file_name: file.name,
      total_amount: totalAmount,
      line_items: lineItems.length,
    },
  });

  return NextResponse.json({
    ok: true,
    storage_path: storagePath,
    total_amount: totalAmount,
    line_items_parsed: lineItems.length,
    line_items: lineItems,
  });
}
