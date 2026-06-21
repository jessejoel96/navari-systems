/**
 * POST /api/cash-requests/cycles/[cycleId]/compile
 * Compiles all submitted entity cash requests into one master Excel.
 * Sheet per entity + consolidated Summary tab.
 */

import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import ExcelJS from "exceljs";

const MONTH_NAMES = [
  "JAN", "FEB", "MAR", "APR", "MAY", "JUN",
  "JUL", "AUG", "SEP", "OCT", "NOV", "DEC",
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
        id, entity_id, status, amount_requested, amount_approved,
        submission_file_path, notes,
        entities(name, code, country),
        cash_request_line_items(sn, description, budget_code, amount_requested, amount_approved, remarks)
      )
    `)
    .eq("id", cycleId)
    .single();

  if (!cycle) return NextResponse.json({ error: "Cycle not found" }, { status: 404 });

  const requests = (cycle.cash_requests ?? []) as Array<{
    id: string;
    entity_id: string;
    status: string;
    amount_requested: number;
    amount_approved: number | null;
    notes: string | null;
    entities: { name: string; code: string; country: string } | null;
    cash_request_line_items: Array<{
      sn: number;
      description: string;
      budget_code: string | null;
      amount_requested: number;
      amount_approved: number | null;
      remarks: string | null;
    }>;
  }>;

  const submitted = requests.filter((r) => ["submitted", "approved"].includes(r.status));

  if (submitted.length === 0) {
    return NextResponse.json({ error: "No submitted cash requests to compile" }, { status: 422 });
  }

  const wb = new ExcelJS.Workbook();
  wb.creator = "Intel HRC AP Workflow";
  wb.created = new Date();

  const HEADER_FILL: ExcelJS.Fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF1F6DB3" } };
  const ALT_FILL: ExcelJS.Fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF8FAFC" } };

  // Summary sheet (first)
  const summaryWs = wb.addWorksheet("SUMMARY");
  summaryWs.columns = [
    { key: "entity", width: 20 },
    { key: "country", width: 16 },
    { key: "status", width: 14 },
    { key: "requested", width: 20 },
    { key: "approved", width: 20 },
    { key: "remarks", width: 30 },
  ];

  const summaryTitle = summaryWs.addRow([`CASH REQUEST SUMMARY — ${cycle.label}`]);
  summaryWs.mergeCells("A1:F1");
  summaryTitle.getCell(1).font = { bold: true, size: 13, color: { argb: "FFFFFFFF" } };
  summaryTitle.getCell(1).fill = HEADER_FILL;
  summaryTitle.getCell(1).alignment = { horizontal: "center" };
  summaryWs.getRow(1).height = 28;

  const summaryHeaders = summaryWs.addRow(["Entity", "Country", "Status", "Amount Requested (XAF)", "Amount Approved (XAF)", "Notes"]);
  summaryHeaders.eachCell((cell) => {
    cell.font = { bold: true, size: 9, color: { argb: "FFFFFFFF" } };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF334155" } };
    cell.alignment = { horizontal: "center" };
  });

  let grandTotal = 0;
  let grandApproved = 0;

  requests.forEach((req, i) => {
    const entity = Array.isArray(req.entities) ? req.entities[0] : req.entities;
    const row = summaryWs.addRow([
      entity?.name ?? req.entity_id,
      entity?.country ?? "—",
      req.status.toUpperCase(),
      req.amount_requested ?? 0,
      req.amount_approved ?? "",
      req.notes ?? "",
    ]);
    grandTotal += req.amount_requested ?? 0;
    grandApproved += req.amount_approved ?? 0;

    row.getCell(4).numFmt = '#,##0';
    row.getCell(5).numFmt = '#,##0';
    if (i % 2 === 1) {
      row.eachCell((cell) => { cell.fill = ALT_FILL; });
    }
  });

  const totalRow = summaryWs.addRow(["TOTAL", "", "", grandTotal, grandApproved || "", ""]);
  totalRow.eachCell((cell) => {
    cell.font = { bold: true, size: 9, color: { argb: "FFFFFFFF" } };
    cell.fill = HEADER_FILL;
  });
  totalRow.getCell(4).numFmt = '#,##0';
  totalRow.getCell(5).numFmt = '#,##0';

  // One sheet per submitted entity
  for (const req of submitted) {
    const entity = Array.isArray(req.entities) ? req.entities[0] : req.entities;
    const entityCode = entity?.code ?? "UNKNOWN";
    const sheetName = entityCode.substring(0, 31);

    const ws = wb.addWorksheet(sheetName);
    ws.columns = [
      { key: "sn", width: 6 },
      { key: "description", width: 40 },
      { key: "budget_code", width: 14 },
      { key: "amount_requested", width: 22 },
      { key: "amount_approved", width: 22 },
      { key: "remarks", width: 28 },
    ];

    // Title
    ws.mergeCells("A1:F1");
    const title = ws.getCell("A1");
    title.value = `${entity?.name ?? entityCode} — Cash Request — ${cycle.label}`;
    title.font = { bold: true, size: 12, color: { argb: "FFFFFFFF" } };
    title.fill = HEADER_FILL;
    title.alignment = { horizontal: "center" };
    ws.getRow(1).height = 26;

    // Meta
    ws.mergeCells("A2:F2");
    ws.getCell("A2").value = `Country: ${entity?.country ?? "—"}  |  Status: ${req.status.toUpperCase()}  |  Total Requested: ${(req.amount_requested ?? 0).toLocaleString("fr-FR")} XAF`;
    ws.getCell("A2").font = { size: 9, color: { argb: "FF64748B" } };
    ws.getCell("A2").alignment = { horizontal: "center" };

    // Headers
    const headers = ws.addRow(["S/N", "DESCRIPTION / PURPOSE", "BUDGET CODE", "AMOUNT REQUESTED (XAF)", "AMOUNT APPROVED (XAF)", "REMARKS"]);
    headers.height = 28;
    headers.eachCell((cell) => {
      cell.font = { bold: true, size: 9, color: { argb: "FFFFFFFF" } };
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF334155" } };
      cell.alignment = { horizontal: "center", wrapText: true };
    });

    const lineItems = req.cash_request_line_items ?? [];

    if (lineItems.length === 0) {
      const row = ws.addRow(["", "No line items parsed — see attached original file", "", req.amount_requested ?? 0, "", ""]);
      row.getCell(4).numFmt = '#,##0';
    } else {
      lineItems.forEach((line, idx) => {
        const row = ws.addRow([
          line.sn ?? idx + 1,
          line.description,
          line.budget_code ?? "",
          line.amount_requested,
          line.amount_approved ?? "",
          line.remarks ?? "",
        ]);
        row.getCell(4).numFmt = '#,##0';
        if (line.amount_approved) row.getCell(5).numFmt = '#,##0';
        if (idx % 2 === 1) {
          row.eachCell((cell) => { cell.fill = ALT_FILL; });
        }
      });
    }

    // Totals
    const entityTotal = ws.addRow(["", "TOTAL", "", req.amount_requested ?? 0, req.amount_approved ?? "", ""]);
    entityTotal.eachCell((cell) => {
      cell.font = { bold: true, size: 9, color: { argb: "FFFFFFFF" } };
      cell.fill = HEADER_FILL;
    });
    entityTotal.getCell(4).numFmt = '#,##0';
    entityTotal.getCell(5).numFmt = '#,##0';

    // Approval section
    ws.addRow([]);
    ws.addRow(["", "Prepared by (Regional Office)", "", "", "Approved by (HQ Finance)", ""]);
  }

  // Generate buffer and upload
  const buf = await wb.xlsx.writeBuffer();
  const buffer = Buffer.from(buf);

  const monthLabel = `${MONTH_NAMES[cycle.period_month - 1]}-${cycle.period_year}`;
  const filename = `cash-request-compiled-${monthLabel}.xlsx`;
  const storagePath = `cash-requests/${cycleId}/compiled/${filename}`;

  await supabase.storage.from("invoice-files").upload(storagePath, buffer, {
    contentType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    upsert: true,
  });

  await supabase
    .from("cash_request_cycles")
    .update({
      status: "compiled",
      compiled_at: new Date().toISOString(),
      compiled_file_path: storagePath,
    })
    .eq("id", cycleId);

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "X-Entity-Count": String(submitted.length),
      "X-Grand-Total": String(grandTotal),
    },
  });
}
