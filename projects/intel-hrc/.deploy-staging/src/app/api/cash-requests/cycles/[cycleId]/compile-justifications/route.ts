/**
 * POST /api/cash-requests/cycles/[cycleId]/compile-justifications
 * Builds a consolidated Excel showing:
 * - Summary sheet: previous-month expenses per entity vs. approved cash
 * - Per-entity sheet: expense line items
 * Returns the file as a download and stores it in Storage.
 */

import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import ExcelJS from "exceljs";

const MONTH_NAMES = [
  "JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC",
];

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ cycleId: string }> }
) {
  const { cycleId } = await params;
  const supabase = createServiceClient();

  const { data: cycle } = await supabase
    .from("cash_request_cycles")
    .select(`
      *,
      cash_requests(
        id, entity_id, period,
        amount_requested, amount_approved,
        opening_balance, expense_actual_amount,
        justification_status, justification_notes,
        entities(name, code, country),
        cash_request_line_items(sn, description, budget_code, amount_requested, item_type, remarks)
      )
    `)
    .eq("id", cycleId)
    .single();

  if (!cycle) return NextResponse.json({ error: "Cycle not found" }, { status: 404 });

  const requests = (cycle.cash_requests ?? []) as Array<{
    id: string;
    entity_id: string;
    period: string;
    amount_requested: number;
    amount_approved: number | null;
    opening_balance: number | null;
    expense_actual_amount: number | null;
    justification_status: string;
    justification_notes: string | null;
    entities: { name: string; code: string; country: string } | null;
    cash_request_line_items: Array<{
      sn: number;
      description: string;
      budget_code: string | null;
      amount_requested: number;
      item_type: string;
      remarks: string | null;
    }>;
  }>;

  const withJustification = requests.filter((r) =>
    ["submitted", "confirmed", "queried"].includes(r.justification_status)
  );

  if (withJustification.length === 0) {
    return NextResponse.json({ error: "No justifications submitted yet" }, { status: 422 });
  }

  const wb = new ExcelJS.Workbook();
  wb.creator = "Intel HRC AP Workflow";
  wb.created = new Date();

  const BLUE_FILL: ExcelJS.Fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF1F6DB3" } };
  const GREEN_FILL: ExcelJS.Fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF16A34A" } };
  const AMBER_FILL: ExcelJS.Fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFD97706" } };
  const SLATE_FILL: ExcelJS.Fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF334155" } };
  const ALT_FILL: ExcelJS.Fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF8FAFC" } };

  // ── SUMMARY SHEET ──────────────────────────────────────────────────────
  const sumWs = wb.addWorksheet("SUMMARY");
  sumWs.columns = [
    { key: "entity", width: 18 },
    { key: "country", width: 14 },
    { key: "prev_approved", width: 22 },
    { key: "opening_balance", width: 20 },
    { key: "actual_expenses", width: 22 },
    { key: "variance", width: 18 },
    { key: "next_requested", width: 20 },
    { key: "next_approved", width: 20 },
    { key: "just_status", width: 16 },
  ];

  const titleRow = sumWs.addRow([`CASH REQUEST & EXPENSE SUMMARY — ${cycle.label}`]);
  sumWs.mergeCells("A1:I1");
  titleRow.getCell(1).font = { bold: true, size: 13, color: { argb: "FFFFFFFF" } };
  titleRow.getCell(1).fill = BLUE_FILL;
  titleRow.getCell(1).alignment = { horizontal: "center" };
  sumWs.getRow(1).height = 28;

  const expPeriod = cycle.expense_period_label ?? `Previous to ${cycle.label}`;
  const subRow = sumWs.addRow([
    `Expense Period: ${expPeriod}`, "", "", "", "", "", `Request Period: ${cycle.label}`, "", "",
  ]);
  sumWs.mergeCells("A2:F2");
  sumWs.mergeCells("G2:I2");
  subRow.getCell(1).font = { italic: true, size: 9, color: { argb: "FF64748B" } };
  subRow.getCell(7).font = { italic: true, size: 9, color: { argb: "FF64748B" } };

  const hdr = sumWs.addRow([
    "Entity", "Country",
    "Prev. Approved (XAF)", "Opening Balance (XAF)", "Actual Expenses (XAF)", "Variance (XAF)",
    "Next Requested (XAF)", "Next Approved (XAF)", "Justif. Status",
  ]);
  hdr.height = 30;
  hdr.eachCell((cell) => {
    cell.font = { bold: true, size: 9, color: { argb: "FFFFFFFF" } };
    cell.fill = SLATE_FILL;
    cell.alignment = { horizontal: "center", wrapText: true };
  });

  let grandPrevApproved = 0;
  let grandActual = 0;
  let grandNextReq = 0;
  let grandNextApproved = 0;

  requests.forEach((req, i) => {
    const entity = Array.isArray(req.entities) ? req.entities[0] : req.entities;
    const variance = (req.opening_balance ?? 0) + (req.amount_approved ?? 0) - (req.expense_actual_amount ?? 0);

    const row = sumWs.addRow([
      entity?.name ?? "—",
      entity?.country ?? "—",
      req.amount_approved ?? 0,
      req.opening_balance ?? "",
      req.expense_actual_amount ?? "",
      variance !== 0 ? variance : "",
      req.amount_requested ?? 0,
      req.amount_approved ?? "",
      req.justification_status.toUpperCase(),
    ]);

    [3,4,5,6,7,8].forEach((c) => { row.getCell(c).numFmt = '#,##0'; });
    const jCell = row.getCell(9);
    jCell.fill = req.justification_status === "confirmed"
      ? GREEN_FILL
      : req.justification_status === "queried"
        ? AMBER_FILL
        : { type: "pattern", pattern: "solid", fgColor: { argb: "FFE2E8F0" } };
    jCell.font = { size: 9, bold: true, color: { argb: "FFFFFFFF" } };
    jCell.alignment = { horizontal: "center" };

    if (i % 2 === 1) {
      ["A","B","C","D","E","F","G","H"].forEach((col) => {
        const cell = row.getCell(col);
        if (!cell.fill || (cell.fill as ExcelJS.FillPattern).fgColor?.argb === undefined) {
          cell.fill = ALT_FILL;
        }
      });
    }

    grandPrevApproved += req.amount_approved ?? 0;
    grandActual += req.expense_actual_amount ?? 0;
    grandNextReq += req.amount_requested ?? 0;
    grandNextApproved += req.amount_approved ?? 0;
  });

  const totRow = sumWs.addRow([
    "TOTAL", "",
    grandPrevApproved, "", grandActual, grandPrevApproved - grandActual,
    grandNextReq, grandNextApproved, "",
  ]);
  totRow.eachCell((cell) => {
    cell.font = { bold: true, size: 9, color: { argb: "FFFFFFFF" } };
    cell.fill = BLUE_FILL;
  });
  [3,4,5,6,7,8].forEach((c) => { totRow.getCell(c).numFmt = '#,##0'; });

  // ── PER-ENTITY SHEETS ──────────────────────────────────────────────────
  for (const req of withJustification) {
    const entity = Array.isArray(req.entities) ? req.entities[0] : req.entities;
    const code = entity?.code ?? "UNKN";
    const ws = wb.addWorksheet(code.substring(0, 31));

    ws.columns = [
      { key: "sn", width: 5 },
      { key: "description", width: 40 },
      { key: "budget_code", width: 14 },
      { key: "amount", width: 22 },
      { key: "remarks", width: 28 },
    ];

    ws.mergeCells("A1:E1");
    const t = ws.getCell("A1");
    t.value = `${entity?.name ?? code} — Expense Justification — ${expPeriod}`;
    t.font = { bold: true, size: 12, color: { argb: "FFFFFFFF" } };
    t.fill = BLUE_FILL;
    t.alignment = { horizontal: "center" };
    ws.getRow(1).height = 26;

    // Meta block
    ws.mergeCells("A2:E2");
    ws.getCell("A2").value = [
      `Country: ${entity?.country ?? "—"}`,
      `Opening Balance: ${(req.opening_balance ?? 0).toLocaleString("fr-FR")} XAF`,
      `Total Expenses: ${(req.expense_actual_amount ?? 0).toLocaleString("fr-FR")} XAF`,
      `Status: ${req.justification_status.toUpperCase()}`,
    ].join("   |   ");
    ws.getCell("A2").font = { size: 9, color: { argb: "FF64748B" } };
    ws.getCell("A2").alignment = { horizontal: "center" };

    const expLines = (req.cash_request_line_items ?? []).filter((l) => l.item_type === "expense");
    const reqLines = (req.cash_request_line_items ?? []).filter((l) => l.item_type === "request");

    // ---- EXPENSE SECTION ----
    if (expLines.length > 0) {
      const expHdr = ws.addRow(["", "PREVIOUS MONTH EXPENSES", "", "", ""]);
      ws.mergeCells(`A${expHdr.number}:E${expHdr.number}`);
      expHdr.getCell(1).font = { bold: true, size: 10, color: { argb: "FF16A34A" } };
      expHdr.getCell(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF0FDF4" } };

      const eh = ws.addRow(["S/N", "DESCRIPTION / PURPOSE", "BUDGET CODE", "AMOUNT (XAF)", "REMARKS"]);
      eh.eachCell((cell) => {
        cell.font = { bold: true, size: 9, color: { argb: "FFFFFFFF" } };
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF15803D" } };
        cell.alignment = { horizontal: "center" };
      });

      expLines.forEach((line, idx) => {
        const row = ws.addRow([line.sn ?? idx+1, line.description, line.budget_code ?? "", line.amount_requested, line.remarks ?? ""]);
        row.getCell(4).numFmt = '#,##0';
        if (idx % 2 === 1) row.eachCell((cell) => { cell.fill = ALT_FILL; });
      });

      const expTot = ws.addRow(["", "TOTAL EXPENSES", "", req.expense_actual_amount ?? 0, ""]);
      expTot.eachCell((cell) => { cell.font = { bold: true, size: 9, color: { argb: "FFFFFFFF" } }; cell.fill = GREEN_FILL; });
      expTot.getCell(4).numFmt = '#,##0';
    }

    ws.addRow([]);

    // ---- CASH REQUEST SECTION ----
    if (reqLines.length > 0) {
      const reqHdr = ws.addRow(["", "NEXT MONTH CASH REQUEST", "", "", ""]);
      ws.mergeCells(`A${reqHdr.number}:E${reqHdr.number}`);
      reqHdr.getCell(1).font = { bold: true, size: 10, color: { argb: "FF1F6DB3" } };
      reqHdr.getCell(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFEFF6FF" } };

      const rh = ws.addRow(["S/N", "DESCRIPTION / PURPOSE", "BUDGET CODE", "AMOUNT REQUESTED (XAF)", "REMARKS"]);
      rh.eachCell((cell) => {
        cell.font = { bold: true, size: 9, color: { argb: "FFFFFFFF" } };
        cell.fill = BLUE_FILL;
        cell.alignment = { horizontal: "center" };
      });

      reqLines.forEach((line, idx) => {
        const row = ws.addRow([line.sn ?? idx+1, line.description, line.budget_code ?? "", line.amount_requested, line.remarks ?? ""]);
        row.getCell(4).numFmt = '#,##0';
        if (idx % 2 === 1) row.eachCell((cell) => { cell.fill = ALT_FILL; });
      });

      const reqTot = ws.addRow(["", "TOTAL REQUESTED", "", req.amount_requested ?? 0, ""]);
      reqTot.eachCell((cell) => { cell.font = { bold: true, size: 9, color: { argb: "FFFFFFFF" } }; cell.fill = BLUE_FILL; });
      reqTot.getCell(4).numFmt = '#,##0';
    }

    // Notes
    if (req.justification_notes) {
      ws.addRow([]);
      const notesRow = ws.addRow(["", `Query/Notes: ${req.justification_notes}`, "", "", ""]);
      ws.mergeCells(`B${notesRow.number}:E${notesRow.number}`);
      notesRow.getCell(2).fill = AMBER_FILL;
      notesRow.getCell(2).font = { size: 9, color: { argb: "FFFFFFFF" }, bold: true };
    }
  }

  // Generate and upload
  const buf = await wb.xlsx.writeBuffer();
  const buffer = Buffer.from(buf);

  const monthLabel = `${MONTH_NAMES[cycle.period_month - 1]}-${cycle.period_year}`;
  const filename = `justification-summary-${monthLabel}.xlsx`;
  const storagePath = `cash-requests/${cycleId}/compiled/${filename}`;

  await supabase.storage.from("invoice-files").upload(storagePath, buffer, {
    contentType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    upsert: true,
  });

  await supabase.from("cash_request_cycles").update({
    justification_compiled_file_path: storagePath,
    justification_compiled_at: new Date().toISOString(),
  }).eq("id", cycleId);

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "X-Entity-Count": String(withJustification.length),
    },
  });
}
