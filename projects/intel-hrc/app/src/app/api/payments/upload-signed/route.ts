/**
 * POST /api/payments/upload-signed
 *
 * Tina uploads scanned signed payment sheet and/or signed invoice copies.
 * Tracks in payment_documents; auto-archives batch when complete.
 */

import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { checkAndArchiveBatch } from "@/lib/payments/documents";

export async function POST(req: NextRequest) {
  const supabase = createServiceClient();
  const formData = await req.formData();

  const batchId = formData.get("batch_id") as string;
  const docType = (formData.get("type") as string) || "sheet";
  const file = formData.get("file") as File | null;
  const invoiceId = formData.get("invoice_id") as string | null;
  const uploadedBy = (formData.get("uploaded_by") as string) || "Tina-Randa";

  if (!batchId || !file) {
    return NextResponse.json({ error: "Missing batch_id or file" }, { status: 400 });
  }

  if (docType === "invoice" && !invoiceId) {
    return NextResponse.json({ error: "invoice_id required for signed invoice upload" }, { status: 400 });
  }

  const { data: batch } = await supabase
    .from("payment_batches")
    .select("id, status")
    .eq("id", batchId)
    .single();

  if (!batch) {
    return NextResponse.json({ error: "Batch not found" }, { status: 404 });
  }

  if (!["approved", "documents_archived"].includes(batch.status)) {
    return NextResponse.json(
      { error: "Documents can only be uploaded after batch approval" },
      { status: 422 }
    );
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const paymentDocType = docType === "sheet" ? "signed_sheet" : "signed_invoice";
  const storagePath =
    docType === "sheet"
      ? `payment-sheets/signed/${batchId}/signed-sheet-${file.name}`
      : `payment-sheets/signed/${batchId}/invoices/${invoiceId}-${file.name}`;

  const { error: uploadErr } = await supabase.storage
    .from("invoice-files")
    .upload(storagePath, buffer, {
      contentType: file.type || "application/octet-stream",
      upsert: true,
    });

  if (uploadErr) {
    return NextResponse.json({ error: uploadErr.message }, { status: 500 });
  }

  // Upsert payment_documents (replace prior signed_sheet or signed_invoice for same invoice)
  if (paymentDocType === "signed_sheet") {
    await supabase.from("payment_documents").delete().eq("batch_id", batchId).eq("doc_type", "signed_sheet");
  } else if (invoiceId) {
    await supabase
      .from("payment_documents")
      .delete()
      .eq("batch_id", batchId)
      .eq("doc_type", "signed_invoice")
      .eq("invoice_id", invoiceId);
  }

  const { data: doc } = await supabase
    .from("payment_documents")
    .insert({
      batch_id: batchId,
      invoice_id: invoiceId,
      doc_type: paymentDocType,
      file_name: file.name,
      storage_path: storagePath,
      mime_type: file.type || null,
      size_bytes: buffer.length,
      uploaded_by: uploadedBy,
    })
    .select("id")
    .single();

  // Legacy columns for backwards compatibility
  if (docType === "sheet") {
    await supabase
      .from("payment_batches")
      .update({ signed_sheet_path: storagePath })
      .eq("id", batchId);
  } else if (invoiceId) {
    const { data: batchRow } = await supabase
      .from("payment_batches")
      .select("signed_invoice_paths")
      .eq("id", batchId)
      .single();

    const existing: string[] = (batchRow?.signed_invoice_paths as string[]) ?? [];
    const withoutThis = existing.filter((p) => !p.includes(`/${invoiceId}-`));
    await supabase
      .from("payment_batches")
      .update({ signed_invoice_paths: [...withoutThis, storagePath] })
      .eq("id", batchId);
  }

  await supabase.from("audit_events").insert({
    event_type: "payment_document_uploaded",
    payload: {
      batch_id: batchId,
      invoice_id: invoiceId,
      doc_type: paymentDocType,
      file_name: file.name,
      uploaded_by: uploadedBy,
    },
  });

  const { archived, status } = await checkAndArchiveBatch(supabase, batchId, uploadedBy);

  return NextResponse.json({
    ok: true,
    path: storagePath,
    document_id: doc?.id,
    archived,
    checklist: {
      has_signed_sheet: status.hasSignedSheet,
      signed_invoices: status.signedInvoiceCount,
      required_invoices: status.requiredInvoiceCount,
      is_complete: status.isComplete,
      batch_status: archived ? "documents_archived" : batch.status,
    },
  });
}
