import type { SupabaseClient } from "@supabase/supabase-js";

export type PaymentDocType = "generated_sheet" | "signed_sheet" | "signed_invoice";

export interface BatchDocumentStatus {
  batchId: string;
  hasSignedSheet: boolean;
  requiredInvoiceCount: number;
  signedInvoiceCount: number;
  isComplete: boolean;
  documents: Array<{
    id: string;
    doc_type: PaymentDocType;
    invoice_id: string | null;
    file_name: string;
    storage_path: string;
    mime_type: string | null;
    uploaded_by: string | null;
    created_at: string;
  }>;
  invoiceIds: string[];
  signedInvoiceIds: string[];
}

export async function getBatchDocumentStatus(
  supabase: SupabaseClient,
  batchId: string
): Promise<BatchDocumentStatus> {
  const [{ data: lines }, { data: documents }] = await Promise.all([
    supabase.from("payment_lines").select("invoice_id").eq("batch_id", batchId),
    supabase
      .from("payment_documents")
      .select("id, doc_type, invoice_id, file_name, storage_path, mime_type, uploaded_by, created_at")
      .eq("batch_id", batchId)
      .order("created_at", { ascending: false }),
  ]);

  const invoiceIds = (lines ?? [])
    .map((l: { invoice_id: string | null }) => l.invoice_id)
    .filter((id): id is string => !!id);

  const docs = documents ?? [];
  const hasSignedSheet = docs.some((d) => d.doc_type === "signed_sheet");
  const signedInvoiceIds = [
    ...new Set(
      docs
        .filter((d) => d.doc_type === "signed_invoice" && d.invoice_id)
        .map((d) => d.invoice_id as string)
    ),
  ];

  const requiredInvoiceCount = invoiceIds.length;
  const signedInvoiceCount = invoiceIds.filter((id) => signedInvoiceIds.includes(id)).length;
  const isComplete =
    hasSignedSheet &&
    requiredInvoiceCount > 0 &&
    signedInvoiceCount === requiredInvoiceCount;

  return {
    batchId,
    hasSignedSheet,
    requiredInvoiceCount,
    signedInvoiceCount,
    isComplete,
    documents: docs,
    invoiceIds,
    signedInvoiceIds,
  };
}

export async function checkAndArchiveBatch(
  supabase: SupabaseClient,
  batchId: string,
  actor = "Tina-Randa"
): Promise<{ archived: boolean; status: BatchDocumentStatus }> {
  const status = await getBatchDocumentStatus(supabase, batchId);

  if (!status.isComplete) {
    return { archived: false, status };
  }

  const { data: batch } = await supabase
    .from("payment_batches")
    .select("status")
    .eq("id", batchId)
    .single();

  if (batch?.status === "approved") {
    await supabase
      .from("payment_batches")
      .update({ status: "documents_archived" })
      .eq("id", batchId);

    await supabase.from("audit_events").insert({
      event_type: "payment_documents_archived",
      payload: {
        batch_id: batchId,
        signed_invoice_count: status.signedInvoiceCount,
        actor,
      },
    });
  }

  return { archived: true, status };
}

export function storageDownloadUrl(storagePath: string): string {
  return `/api/storage?path=${encodeURIComponent(storagePath)}`;
}
