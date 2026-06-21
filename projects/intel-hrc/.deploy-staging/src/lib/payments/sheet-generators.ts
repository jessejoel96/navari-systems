/**
 * Payment sheet generators — Bank (monthly) and Maviance (one-off).
 * Mirrors the real Excel templates: Supplier Payment Sheet 2026.xlsx and MAVIANCE REPORT.xlsx
 */

import ExcelJS from "exceljs";

export const PAYMENT_CATEGORIES = [
  "Rent",
  "Telecom",
  "Security",
  "Consultancy",
  "Software",
  "Office Supplies",
  "Insurance",
  "Legal / Accounting",
  "Utilities",
  "Transport / Logistics",
  "Marketing / Events",
  "Other",
] as const;

export type PaymentCategory = (typeof PAYMENT_CATEGORIES)[number];

const MONTH_NAMES = [
  "JAN", "FEB", "MAR", "APR", "MAY", "JUN",
  "JUL", "AUG", "SEP", "OCT", "NOV", "DEC",
];

export interface BankPaymentLine {
  sn: number;
  supplier: string;
  entity_code: string;
  invoice_date: string;
  due_date: string;
  invoice_number: string;
  description: string;
  wht_base: number;
  amount_ht: number;
  vat: number;
  wht: number;
  arrears: number;
  advance_avoir: number;
  total: number;
  is_recurring: boolean;
  category: string;
}

export interface MaviancePaymentLine {
  sn: number;
  date: string;
  description: string;
  beneficiary: string;
  category: string;
  amount_requested: number;
  cfo_approval: string;
  ceo_approval: string;
  amount_released: number;
  payment_method: string;
  receipt_ref: string;
  remarks: string;
}

/** Generate the Supplier Payment Sheet (bank, monthly) */
export async function generateBankPaymentSheet(
  lines: BankPaymentLine[],
  month: number,
  year: number
): Promise<Buffer> {
  const wb = new ExcelJS.Workbook();
  wb.creator = "Intel HRC AP Workflow";
  wb.created = new Date();

  const sheetName = `${MONTH_NAMES[month - 1]} ${String(year).slice(2)}`;
  const ws = wb.addWorksheet(sheetName);

  // Column widths
  ws.columns = [
    { key: "sn", width: 5 },
    { key: "supplier", width: 28 },
    { key: "invoice_date", width: 14 },
    { key: "due_date", width: 12 },
    { key: "invoice_number", width: 18 },
    { key: "description", width: 36 },
    { key: "wht_base", width: 14 },
    { key: "amount_ht", width: 14 },
    { key: "vat", width: 12 },
    { key: "wht", width: 12 },
    { key: "arrears", width: 12 },
    { key: "advance_avoir", width: 14 },
    { key: "total", width: 16 },
    { key: "entity", width: 10 },
    { key: "category", width: 16 },
  ];

  // Row 1: Title
  ws.mergeCells("A1:O1");
  const titleCell = ws.getCell("A1");
  titleCell.value = "MONTHLY SUPPLIER PAYMENT SHEET";
  titleCell.font = { bold: true, size: 13, color: { argb: "FFFFFFFF" } };
  titleCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF1F6DB3" } };
  titleCell.alignment = { horizontal: "center", vertical: "middle" };
  ws.getRow(1).height = 28;

  // Row 2: Period
  ws.mergeCells("A2:O2");
  const periodCell = ws.getCell("A2");
  periodCell.value = `${MONTH_NAMES[month - 1]} ${year}`;
  periodCell.font = { bold: true, size: 11, color: { argb: "FF1F6DB3" } };
  periodCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFE8F0F9" } };
  periodCell.alignment = { horizontal: "center", vertical: "middle" };
  ws.getRow(2).height = 20;

  // Row 3: Headers
  const headers = [
    "S/N", "SUPPLIER", "DATE DE FACTURATION", "DUE DATE",
    "INVOICE NUMBER", "DESCRIPTION", "WHT BASE", "AMOUNT HT",
    "VAT", "WHT", "ARREARS", "ADVANCE/AVOIR", "TOTAL DUE", "ENTITY", "CATEGORY",
  ];
  const headerRow = ws.addRow(headers);
  headerRow.eachCell((cell) => {
    cell.font = { bold: true, size: 9, color: { argb: "FFFFFFFF" } };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF334155" } };
    cell.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
    cell.border = {
      bottom: { style: "thin", color: { argb: "FF475569" } },
    };
  });
  headerRow.height = 30;

  // Data rows
  let rowNum = 4;
  for (const line of lines) {
    const row = ws.addRow([
      line.sn,
      line.supplier,
      line.invoice_date,
      line.due_date,
      line.invoice_number,
      line.description,
      line.wht_base || "",
      line.amount_ht,
      line.vat || "",
      line.wht || "",
      line.arrears || "",
      line.advance_avoir || "",
      line.total,
      line.entity_code,
      line.category,
    ]);

    const isRecurring = line.is_recurring;
    row.eachCell((cell, colNum) => {
      cell.font = { size: 9 };
      cell.alignment = { vertical: "middle" };
      // Highlight recurring rows in light blue
      if (isRecurring) {
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFDBEAFE" } };
      } else if (rowNum % 2 === 0) {
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF8FAFC" } };
      }
      // Right-align amounts
      if (colNum >= 7 && colNum <= 13) {
        cell.alignment = { horizontal: "right", vertical: "middle" };
        if (typeof cell.value === "number" && cell.value !== 0) {
          cell.numFmt = '#,##0';
        } else if (cell.value === "") {
          cell.value = null;
        }
      }
    });
    rowNum++;
  }

  // Totals row
  const totalsRow = ws.addRow([
    "", "TOTAL PAYABLE", "", "", "", "",
    lines.reduce((s, l) => s + (l.wht_base || 0), 0),
    lines.reduce((s, l) => s + l.amount_ht, 0),
    lines.reduce((s, l) => s + (l.vat || 0), 0),
    lines.reduce((s, l) => s + (l.wht || 0), 0),
    lines.reduce((s, l) => s + (l.arrears || 0), 0),
    lines.reduce((s, l) => s + (l.advance_avoir || 0), 0),
    lines.reduce((s, l) => s + l.total, 0),
    "", "",
  ]);
  totalsRow.eachCell((cell, colNum) => {
    cell.font = { bold: true, size: 9, color: { argb: "FFFFFFFF" } };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF1F6DB3" } };
    if (colNum >= 7 && colNum <= 13 && cell.value) {
      cell.numFmt = '#,##0';
      cell.alignment = { horizontal: "right", vertical: "middle" };
    }
  });

  // Blank row then approval section
  ws.addRow([]);
  const approvalRow = ws.addRow([
    "", "HEAD OF TAX, PAYROLL & AP", "", "", "",
    "CFO / CEO SIGNATURE", "", "", "", "", "", "", "", "", "",
  ]);
  approvalRow.eachCell((cell) => {
    if (cell.value) {
      cell.font = { bold: true, size: 9, color: { argb: "FF374151" } };
      cell.border = {
        bottom: { style: "medium", color: { argb: "FF1F6DB3" } },
      };
    }
  });

  const buf = await wb.xlsx.writeBuffer();
  return Buffer.from(buf);
}

/** Generate the Maviance tracker (one-off mobile payments) */
export async function generateMavianceSheet(
  lines: MaviancePaymentLine[],
  month: number,
  year: number,
  walletOpeningBalance: number = 0
): Promise<Buffer> {
  const wb = new ExcelJS.Workbook();
  wb.creator = "Intel HRC AP Workflow";
  wb.created = new Date();

  const sheetName = `${MONTH_NAMES[month - 1]} ${String(year).slice(2)}`;
  const ws = wb.addWorksheet(sheetName);

  ws.columns = [
    { key: "sn", width: 5 },
    { key: "date", width: 12 },
    { key: "description", width: 36 },
    { key: "beneficiary", width: 24 },
    { key: "category", width: 16 },
    { key: "amount_requested", width: 18 },
    { key: "cfo_approval", width: 14 },
    { key: "ceo_approval", width: 14 },
    { key: "amount_released", width: 16 },
    { key: "payment_method", width: 16 },
    { key: "receipt_ref", width: 16 },
    { key: "remarks", width: 24 },
  ];

  // Title
  ws.mergeCells("A1:L1");
  const titleCell = ws.getCell("A1");
  titleCell.value = "MAVIANCE REPORT";
  titleCell.font = { bold: true, size: 13, color: { argb: "FFFFFFFF" } };
  titleCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF0F766E" } };
  titleCell.alignment = { horizontal: "center", vertical: "middle" };
  ws.getRow(1).height = 28;

  // Period + wallet balance
  ws.mergeCells("A2:F2");
  ws.getCell("A2").value = `${MONTH_NAMES[month - 1]} ${year}`;
  ws.getCell("A2").font = { bold: true, size: 10, color: { argb: "FF0F766E" } };
  ws.getCell("A2").fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFD1FAE5" } };
  ws.getCell("A2").alignment = { horizontal: "center" };

  ws.mergeCells("G2:L2");
  ws.getCell("G2").value = `WALLET OPENING BALANCE: ${walletOpeningBalance.toLocaleString("fr-FR")} XAF`;
  ws.getCell("G2").font = { bold: true, size: 10 };
  ws.getCell("G2").fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFD1FAE5" } };
  ws.getCell("G2").alignment = { horizontal: "right" };
  ws.getRow(2).height = 20;

  // Headers
  const headers = [
    "S/N", "DATE", "DESCRIPTION / PURPOSE", "BENEFICIARY", "CATEGORY",
    "AMOUNT REQUESTED (XAF)", "CFO APPROVAL", "CEO APPROVAL",
    "AMOUNT RELEASED (XAF)", "PAYMENT METHOD", "RECEIPT / REF NO.", "REMARKS",
  ];
  const headerRow = ws.addRow(headers);
  headerRow.height = 32;
  headerRow.eachCell((cell) => {
    cell.font = { bold: true, size: 9, color: { argb: "FFFFFFFF" } };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF0F766E" } };
    cell.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
  });

  // Data rows
  let rowNum = 4;
  for (const line of lines) {
    const row = ws.addRow([
      line.sn,
      line.date,
      line.description,
      line.beneficiary,
      line.category,
      line.amount_requested,
      line.cfo_approval || "",
      line.ceo_approval || "",
      line.amount_released || "",
      line.payment_method || "",
      line.receipt_ref || "",
      line.remarks || "",
    ]);
    row.eachCell((cell, colNum) => {
      cell.font = { size: 9 };
      cell.alignment = { vertical: "middle" };
      if (rowNum % 2 === 0) {
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF0FDF4" } };
      }
      if (colNum === 6 || colNum === 9) {
        cell.alignment = { horizontal: "right", vertical: "middle" };
        if (typeof cell.value === "number" && cell.value !== 0) {
          cell.numFmt = '#,##0';
        }
      }
    });
    rowNum++;
  }

  // Totals
  const totalsRow = ws.addRow([
    "", "TOTAL", "", "", "",
    lines.reduce((s, l) => s + l.amount_requested, 0),
    "", "",
    lines.reduce((s, l) => s + (l.amount_released || 0), 0),
    "", "", "",
  ]);
  totalsRow.eachCell((cell, colNum) => {
    cell.font = { bold: true, size: 9, color: { argb: "FFFFFFFF" } };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF0F766E" } };
    if ((colNum === 6 || colNum === 9) && cell.value) {
      cell.numFmt = '#,##0';
      cell.alignment = { horizontal: "right", vertical: "middle" };
    }
  });

  const buf = await wb.xlsx.writeBuffer();
  return Buffer.from(buf);
}
