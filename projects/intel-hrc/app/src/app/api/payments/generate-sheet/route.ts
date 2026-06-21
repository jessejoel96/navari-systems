/**
 * POST /api/payments/generate-sheet
 *
 * Generates a Bank or Maviance payment sheet for a given month.
 * Creates a payment_batch record, uploads the .xlsx to Storage, and returns the URL.
 *
 * Body: { sheet_type: "bank" | "maviance", month: number, year: number, approver_role: "cfo" | "ceo" }
 */

import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import {
  generateBankPaymentSheet,
  generateMavianceSheet,
  type BankPaymentLine,
  type MaviancePaymentLine,
} from "@/lib/payments/sheet-generators";

export async function POST(req: NextRequest) {
  const supabase = createServiceClient();

  const body = await req.json();
  const { sheet_type, month, year, approver_role = "cfo" } = body as {
    sheet_type: "bank" | "maviance";
    month: number;
    year: number;
    approver_role: "cfo" | "ceo";
  };

  if (!sheet_type || !month || !year) {
    return NextResponse.json({ error: "Missing sheet_type, month, or year" }, { status: 400 });
  }

  // Fetch sage_imported invoices for this month that match the channel
  const channel = sheet_type === "bank" ? "bank" : "maviance";

  const startDate = `${year}-${String(month).padStart(2, "0")}-01`;
  const endDate = `${year}-${String(month).padStart(2, "0")}-${new Date(year, month, 0).getDate()}`;

  const { data: invoices, error } = await supabase
    .from("invoices")
    .select(
      "id, supplier_id, suppliers:supplier_id(name), entities(code), invoice_date, due_date, invoice_number, description, gross_amount, net_amount, vat_amount, wht_amount, is_recurring, payment_category, payment_channel"
    )
    .eq("status", "sage_imported")
    .eq("payment_channel", channel)
    .gte("invoice_date", startDate)
    .lte("invoice_date", endDate)
    .order("invoice_date", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const rows = invoices ?? [];

  // Generate Excel
  let excelBuffer: Buffer;
  const monthLabel = `${String(month).padStart(2, "0")}-${year}`;
  const filename = `${sheet_type === "bank" ? "payment-sheet" : "maviance-sheet"}-${monthLabel}.xlsx`;

  if (sheet_type === "bank") {
    const lines: BankPaymentLine[] = rows.map((inv: any, i: number) => ({
      sn: i + 1,
      supplier: (inv.suppliers as any)?.name ?? "—",
      entity_code: (inv.entities as any)?.code ?? "—",
      invoice_date: inv.invoice_date ?? "",
      due_date: inv.due_date ?? "",
      invoice_number: inv.invoice_number ?? "",
      description: inv.description ?? "",
      wht_base: inv.wht_amount ? inv.net_amount : 0,
      amount_ht: inv.net_amount ?? 0,
      vat: inv.vat_amount ?? 0,
      wht: inv.wht_amount ?? 0,
      arrears: 0,
      advance_avoir: 0,
      total: inv.gross_amount ?? 0,
      is_recurring: inv.is_recurring ?? false,
      category: inv.payment_category ?? "Other",
    }));
    excelBuffer = await generateBankPaymentSheet(lines, month, year);
  } else {
    const lines: MaviancePaymentLine[] = rows.map((inv: any, i: number) => ({
      sn: i + 1,
      date: inv.invoice_date ?? "",
      description: inv.description ?? "",
      beneficiary: (inv.suppliers as any)?.name ?? "—",
      category: inv.payment_category ?? "Other",
      amount_requested: inv.gross_amount ?? 0,
      cfo_approval: "",
      ceo_approval: "",
      amount_released: 0,
      payment_method: "Mobile Money",
      receipt_ref: "",
      remarks: "",
    }));
    excelBuffer = await generateMavianceSheet(lines, month, year);
  }

  // Upload to storage
  const storagePath = `payment-sheets/${year}/${monthLabel}/${filename}`;
  await supabase.storage
    .from("invoice-files")
    .upload(storagePath, excelBuffer, {
      contentType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      upsert: true,
    });

  // Create or update batch record
  const totalAmount = rows.reduce((s: number, inv: any) => s + (inv.gross_amount ?? 0), 0);

  const { data: existingBatch } = await supabase
    .from("payment_batches")
    .select("id")
    .eq("sheet_type", sheet_type)
    .eq("period_month", month)
    .eq("period_year", year)
    .eq("approver_role", approver_role)
    .maybeSingle();

  let batchId: string;
  if (existingBatch) {
    await supabase
      .from("payment_batches")
      .update({
        total_amount: totalAmount,
        generated_file_path: storagePath,
        status: "draft",
      })
      .eq("id", existingBatch.id);
    batchId = existingBatch.id;
  } else {
    const { data: batch } = await supabase
      .from("payment_batches")
      .insert({
        sheet_type,
        period_month: month,
        period_year: year,
        approver_role,
        total_amount: totalAmount,
        generated_file_path: storagePath,
        status: "draft",
      })
      .select("id")
      .single();
    batchId = batch?.id;
  }

  // Link payment_lines to this batch
  if (rows.length > 0 && batchId) {
    for (const inv of rows) {
      const { data: existing } = await supabase
        .from("payment_lines")
        .select("id")
        .eq("invoice_id", inv.id)
        .maybeSingle();

      if (existing) {
        await supabase
          .from("payment_lines")
          .update({ batch_id: batchId, payment_type: channel, amount: inv.gross_amount ?? 0 })
          .eq("id", existing.id);
      } else {
        await supabase.from("payment_lines").insert({
          invoice_id: inv.id,
          entity_id: null,
          supplier_id: inv.supplier_id,
          payment_type: channel,
          amount: inv.gross_amount ?? 0,
          scheduled_date: sheet_type === "bank"
            ? `${year}-${String(month).padStart(2, "0")}-15`
            : inv.invoice_date,
          batch_id: batchId,
        });
      }
    }
  }

  // Track generated sheet in payment_documents
  if (batchId) {
    await supabase
      .from("payment_documents")
      .delete()
      .eq("batch_id", batchId)
      .eq("doc_type", "generated_sheet");

    await supabase.from("payment_documents").insert({
      batch_id: batchId,
      invoice_id: null,
      doc_type: "generated_sheet",
      file_name: filename,
      storage_path: storagePath,
      mime_type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      size_bytes: excelBuffer.length,
      uploaded_by: "system",
    });
  }

  const downloadUrl = `/api/storage?path=${encodeURIComponent(storagePath)}`;

  return NextResponse.json({
    ok: true,
    batch_id: batchId,
    invoice_count: rows.length,
    total_amount: totalAmount,
    file_path: storagePath,
    download_url: downloadUrl,
    filename,
  });
}
