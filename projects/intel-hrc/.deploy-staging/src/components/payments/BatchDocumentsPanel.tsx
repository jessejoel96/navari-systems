"use client";

import {
  Upload,
  CheckCircle2,
  Loader2,
  FileText,
  ExternalLink,
  Archive,
} from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";
import { storageDownloadUrl } from "@/lib/payments/documents";

export interface PaymentDocument {
  id: string;
  doc_type: string;
  invoice_id: string | null;
  file_name: string;
  storage_path: string;
  uploaded_by: string | null;
  created_at: string;
}

export interface BatchLineInvoice {
  id: string;
  invoice_number: string | null;
  description: string | null;
  gross_amount: number;
  suppliers?: { name: string } | null;
}

export interface BatchWithDocs {
  id: string;
  status: string;
  sheet_type: string;
  approver_role: string;
  total_amount: number;
  approved_at: string | null;
  approved_by: string | null;
  generated_file_path: string | null;
  payment_lines?: Array<{
    invoice_id: string;
    amount: number;
    invoices: BatchLineInvoice | BatchLineInvoice[] | null;
  }>;
  payment_documents?: PaymentDocument[];
}

function normalizeInvoice(
  inv: BatchLineInvoice | BatchLineInvoice[] | null | undefined
): BatchLineInvoice | null {
  if (!inv) return null;
  return Array.isArray(inv) ? inv[0] ?? null : inv;
}

export function getBatchChecklist(batch: BatchWithDocs) {
  const lines = batch.payment_lines ?? [];
  const docs = batch.payment_documents ?? [];
  const invoiceLines = lines
    .map((l) => ({ line: l, invoice: normalizeInvoice(l.invoices) }))
    .filter((x) => x.invoice);

  const hasSignedSheet = docs.some((d) => d.doc_type === "signed_sheet");
  const signedInvoiceIds = new Set(
    docs.filter((d) => d.doc_type === "signed_invoice" && d.invoice_id).map((d) => d.invoice_id!)
  );
  const requiredCount = invoiceLines.length;
  const signedCount = invoiceLines.filter((x) => signedInvoiceIds.has(x.invoice!.id)).length;
  const isComplete = hasSignedSheet && requiredCount > 0 && signedCount === requiredCount;

  const docByInvoice = new Map<string, PaymentDocument>();
  for (const d of docs) {
    if (d.doc_type === "signed_invoice" && d.invoice_id) {
      docByInvoice.set(d.invoice_id, d);
    }
  }

  const signedSheetDoc = docs.find((d) => d.doc_type === "signed_sheet");
  const generatedDoc = docs.find((d) => d.doc_type === "generated_sheet");

  return {
    invoiceLines,
    hasSignedSheet,
    signedCount,
    requiredCount,
    isComplete,
    docByInvoice,
    signedSheetDoc,
    generatedDoc,
    allDocs: docs,
  };
}

interface BatchDocumentsPanelProps {
  batch: BatchWithDocs;
  onUpload: (batchId: string, docType: "sheet" | "invoice", file: File, invoiceId?: string) => void;
  uploading: boolean;
  compact?: boolean;
}

export function BatchDocumentsPanel({
  batch,
  onUpload,
  uploading,
  compact = false,
}: BatchDocumentsPanelProps) {
  const canUpload = ["approved", "documents_archived"].includes(batch.status);
  const checklist = getBatchChecklist(batch);

  if (!canUpload && checklist.allDocs.length === 0) {
    return null;
  }

  return (
    <div className={cn("rounded-xl border border-gray-100 bg-white", compact ? "p-4" : "p-5")}>
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <h3 className="text-sm font-semibold text-gray-800">Signed Documents</h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Upload scanned signed payment sheet and each signed invoice after CFO/CEO approval.
          </p>
        </div>
        {batch.status === "documents_archived" && (
          <span className="inline-flex items-center gap-1 rounded-full bg-violet-50 px-2.5 py-1 text-[11px] font-medium text-violet-700">
            <Archive className="h-3 w-3" /> Archived
          </span>
        )}
      </div>

      {/* Progress bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-xs text-gray-500 mb-1.5">
          <span>
            Signed sheet {checklist.hasSignedSheet ? "✓" : "—"} · Invoices{" "}
            {checklist.signedCount}/{checklist.requiredCount}
          </span>
          {checklist.isComplete && (
            <span className="text-emerald-600 font-medium">Complete</span>
          )}
        </div>
        <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
          <div
            className={cn(
              "h-full rounded-full transition-all",
              checklist.isComplete ? "bg-emerald-500" : "bg-brand-blue"
            )}
            style={{
              width: `${
                checklist.requiredCount === 0
                  ? checklist.hasSignedSheet
                    ? 100
                    : 0
                  : ((checklist.hasSignedSheet ? 1 : 0) + checklist.signedCount) /
                    (checklist.requiredCount + 1) *
                    100
              }%`,
            }}
          />
        </div>
      </div>

      {/* Generated sheet download */}
      {(checklist.generatedDoc || batch.generated_file_path) && (
        <DocumentRow
          label="Generated payment sheet (.xlsx)"
          doc={checklist.generatedDoc}
          fallbackPath={batch.generated_file_path}
        />
      )}

      {/* Signed payment sheet */}
      <div className="mt-3 flex items-center justify-between gap-3 rounded-lg border border-gray-100 px-3 py-2.5">
        <div className="flex items-center gap-2 min-w-0">
          {checklist.hasSignedSheet ? (
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
          ) : (
            <FileText className="h-4 w-4 shrink-0 text-gray-300" />
          )}
          <span className="text-sm text-gray-700 truncate">Signed payment sheet</span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {checklist.signedSheetDoc && (
            <a
              href={storageDownloadUrl(checklist.signedSheetDoc.storage_path)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs text-brand-blue hover:underline"
            >
              View <ExternalLink className="h-3 w-3" />
            </a>
          )}
          {canUpload && (
            <label className="cursor-pointer flex items-center gap-1 rounded-lg bg-green-600 px-2.5 py-1.5 text-xs font-medium text-white hover:bg-green-700">
              {uploading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Upload className="h-3 w-3" />}
              {checklist.hasSignedSheet ? "Replace" : "Upload"}
              <input
                type="file"
                className="hidden"
                accept=".pdf,image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) onUpload(batch.id, "sheet", file);
                }}
              />
            </label>
          )}
        </div>
      </div>

      {/* Per-invoice signed uploads */}
      {checklist.invoiceLines.length > 0 && (
        <div className="mt-3 space-y-1.5 max-h-64 overflow-y-auto">
          <p className="text-[11px] font-medium uppercase tracking-wide text-gray-400 px-1">
            Signed invoices ({checklist.signedCount}/{checklist.requiredCount})
          </p>
          {checklist.invoiceLines.map(({ invoice }) => {
            if (!invoice) return null;
            const signedDoc = checklist.docByInvoice.get(invoice.id);
            const isSigned = !!signedDoc;

            return (
              <div
                key={invoice.id}
                className={cn(
                  "flex items-center justify-between gap-3 rounded-lg border px-3 py-2",
                  isSigned ? "border-emerald-100 bg-emerald-50/30" : "border-gray-100 bg-gray-50/50"
                )}
              >
                <div className="flex items-center gap-2 min-w-0">
                  {isSigned ? (
                    <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
                  ) : (
                    <FileText className="h-3.5 w-3.5 shrink-0 text-gray-300" />
                  )}
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-gray-800 truncate">
                      {invoice.suppliers?.name ?? invoice.invoice_number ?? "Invoice"}
                    </p>
                    <p className="text-[10px] text-gray-400 truncate">
                      {invoice.description ?? invoice.invoice_number} · {formatCurrency(invoice.gross_amount)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {signedDoc && (
                    <a
                      href={storageDownloadUrl(signedDoc.storage_path)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] text-brand-blue hover:underline flex items-center gap-0.5"
                    >
                      View
                    </a>
                  )}
                  {canUpload && (
                    <label className="cursor-pointer flex items-center gap-1 rounded border border-gray-200 bg-white px-2 py-1 text-[10px] font-medium text-gray-600 hover:bg-gray-50">
                      {uploading ? (
                        <Loader2 className="h-2.5 w-2.5 animate-spin" />
                      ) : (
                        <Upload className="h-2.5 w-2.5" />
                      )}
                      {isSigned ? "Replace" : "Upload"}
                      <input
                        type="file"
                        className="hidden"
                        accept=".pdf,image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) onUpload(batch.id, "invoice", file, invoice.id);
                        }}
                      />
                    </label>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {checklist.requiredCount === 0 && canUpload && (
        <p className="mt-2 text-xs text-amber-600">
          No invoices linked to this batch yet. Regenerate the payment sheet to link invoices.
        </p>
      )}
    </div>
  );
}

function DocumentRow({
  label,
  doc,
  fallbackPath,
}: {
  label: string;
  doc?: PaymentDocument;
  fallbackPath?: string | null;
}) {
  const path = doc?.storage_path ?? fallbackPath;
  if (!path) return null;

  return (
    <div className="flex items-center justify-between gap-3 rounded-lg bg-gray-50 px-3 py-2">
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <FileText className="h-4 w-4 text-gray-400" />
        {label}
      </div>
      <a
        href={storageDownloadUrl(path)}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-1 text-xs font-medium text-brand-blue hover:underline"
      >
        Download <ExternalLink className="h-3 w-3" />
      </a>
    </div>
  );
}
