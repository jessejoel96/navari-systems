"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Download,
  Eye,
  Loader2,
  FolderOpen,
  RefreshCw,
} from "lucide-react";
import { cn, formatCurrency, formatDate, getStatusColor, getStatusLabel } from "@/lib/utils";

interface InvoiceDetailProps {
  invoice: Record<string, any>;
}

export function InvoiceDetail({ invoice }: InvoiceDetailProps) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [preview, setPreview] = useState<Record<string, any> | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function updateStatus(status: "reviewed" | "approved" | "rejected") {
    setLoading(status);
    setError(null);
    const res = await fetch(`/api/invoices/${invoice.id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    const data = await res.json();
    setLoading(null);
    if (!res.ok) {
      setError(data.error || "Update failed");
      return;
    }
    router.refresh();
  }

  async function loadPreview() {
    setLoading("preview");
    setError(null);
    const res = await fetch(`/api/sage-export/${invoice.id}/preview`);
    const data = await res.json();
    setLoading(null);
    if (!res.ok) {
      setError(data.error || "Preview failed");
      return;
    }
    setPreview(data);
  }

  async function generateTxt() {
    setLoading("export");
    setError(null);
    const res = await fetch(`/api/sage-export/${invoice.id}`);
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Export failed");
      setLoading(null);
      return;
    }
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const disposition = res.headers.get("Content-Disposition") ?? "";
    const match = disposition.match(/filename="(.+)"/);
    a.download = match ? match[1] : "sage-export.txt";
    a.href = url;
    a.click();
    URL.revokeObjectURL(url);
    setLoading(null);
    router.refresh();
  }

  async function confirmImport() {
    setLoading("confirm");
    setError(null);
    const res = await fetch(`/api/sage-export/${invoice.id}/confirm`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ confirmed_by: "Tina-Randa" }),
    });
    const data = await res.json();
    setLoading(null);
    if (!res.ok) {
      setError(data.error || "Confirm failed");
      return;
    }
    router.refresh();
  }

  const canReview = ["received", "extracted", "rejected"].includes(invoice.status);
  const canApprove = ["received", "extracted", "reviewed", "matched", "pending_approval", "rejected"].includes(invoice.status);
  const canExport = ["approved", "sage_exported"].includes(invoice.status);
  const canConfirm = invoice.status === "sage_exported";

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/invoices"
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-semibold text-gray-900 truncate">
            {invoice.description || invoice.invoice_number || "Invoice"}
          </h1>
          <p className="text-sm text-gray-500">
            {invoice.entities?.code} · {invoice.suppliers?.name ?? "No supplier"}
          </p>
        </div>
        <span className={cn("rounded-full px-3 py-1 text-xs font-medium", getStatusColor(invoice.status))}>
          {getStatusLabel(invoice.status)}
        </span>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-wrap gap-2">
        {canReview && (
          <button
            onClick={() => updateStatus("reviewed")}
            disabled={!!loading}
            className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            {loading === "reviewed" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Eye className="h-4 w-4" />}
            Mark Reviewed
          </button>
        )}
        {canApprove && (
          <button
            onClick={() => updateStatus("approved")}
            disabled={!!loading}
            className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
          >
            {loading === "approved" ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
            Ready for Sage
          </button>
        )}
        {canApprove && (
          <button
            onClick={() => updateStatus("rejected")}
            disabled={!!loading}
            className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-100 disabled:opacity-50"
          >
            <XCircle className="h-4 w-4" />
            Reject
          </button>
        )}
        {canExport && (
          <>
            <button
              onClick={loadPreview}
              disabled={!!loading}
              className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              {loading === "preview" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Eye className="h-4 w-4" />}
              Preview Sage Lines
            </button>
            <button
              onClick={generateTxt}
              disabled={!!loading}
              className="flex items-center gap-2 rounded-lg bg-brand-blue px-4 py-2 text-sm font-medium text-white hover:bg-brand-blue-deep disabled:opacity-50"
            >
              {loading === "export" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
              Generate .txt
            </button>
          </>
        )}
        {canConfirm && (
          <button
            onClick={confirmImport}
            disabled={!!loading}
            className="flex items-center gap-2 rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700 disabled:opacity-50"
          >
            {loading === "confirm" ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
            Confirm Imported in Sage
          </button>
        )}
        {invoice.status === "sage_imported" && (
          <Link
            href="/payments"
            className="flex items-center gap-2 rounded-lg border border-teal-200 bg-teal-50 px-4 py-2 text-sm font-medium text-teal-700 hover:bg-teal-100"
          >
            Go to Payments →
          </Link>
        )}
      </div>

      {/* Sage folder hint */}
      {invoice.entities?.sage_folder && canExport && (
        <div className="flex items-center gap-2 rounded-lg bg-amber-50 border border-amber-100 px-4 py-3 text-sm text-amber-800">
          <FolderOpen className="h-4 w-4 shrink-0" />
          Import into Sage folder: <code className="font-mono font-semibold">g:\Sage\Companies\{invoice.entities.sage_folder}</code>
        </div>
      )}

      {/* Preview panel */}
      {preview && (
        <div className="rounded-xl border border-gray-100 bg-white overflow-hidden">
          <div className="flex items-center justify-between border-b border-gray-100 px-5 py-3 bg-gray-50/50">
            <div>
              <p className="text-sm font-semibold text-gray-800">Sage Entry Preview</p>
              <p className="text-xs text-gray-500">
                {preview.file_name} · Journal {preview.journal} ·{" "}
                {preview.balanced ? (
                  <span className="text-emerald-600">Balanced</span>
                ) : (
                  <span className="text-red-600">Not balanced</span>
                )}
              </p>
            </div>
            <button onClick={() => setPreview(null)} className="text-xs text-gray-400 hover:text-gray-600">
              Close
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-gray-100 text-left text-gray-500">
                  <th className="px-4 py-2">Journal</th>
                  <th className="px-4 py-2">Date</th>
                  <th className="px-4 py-2">Account</th>
                  <th className="px-4 py-2">Aux Cr</th>
                  <th className="px-4 py-2">Label</th>
                  <th className="px-4 py-2 text-right">Debit</th>
                  <th className="px-4 py-2 text-right">Credit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 font-mono">
                {preview.lines?.map((line: any, i: number) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="px-4 py-2">{line.journal}</td>
                    <td className="px-4 py-2">{line.date}</td>
                    <td className="px-4 py-2">{line.account}</td>
                    <td className="px-4 py-2">{line.aux_credit || "—"}</td>
                    <td className="px-4 py-2 max-w-[200px] truncate font-sans">{line.label}</td>
                    <td className="px-4 py-2 text-right">{line.debit?.toLocaleString("fr-FR") ?? ""}</td>
                    <td className="px-4 py-2 text-right">{line.credit?.toLocaleString("fr-FR") ?? ""}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Details grid */}
      <div className="grid grid-cols-2 gap-6">
        <DetailCard title="Invoice">
          <DetailRow label="Invoice #" value={invoice.invoice_number} />
          <DetailRow label="Date" value={invoice.invoice_date ? formatDate(invoice.invoice_date) : null} />
          <DetailRow label="Type" value={invoice.invoice_type?.replace(/_/g, " ")} />
          <DetailRow label="PO Number" value={invoice.po_number} />
          <DetailRow label="Description" value={invoice.description} />
        </DetailCard>

        <DetailCard title="Amounts (FCFA)">
          <DetailRow label="Gross" value={formatCurrency(invoice.gross_amount)} />
          <DetailRow label="Net" value={invoice.net_amount ? formatCurrency(invoice.net_amount) : "—"} />
          <DetailRow label="VAT" value={invoice.vat_amount ? formatCurrency(invoice.vat_amount) : "—"} />
          <DetailRow label="WHT" value={invoice.wht_amount ? formatCurrency(invoice.wht_amount) : "—"} />
          <DetailRow label="Expense Account" value={invoice.expense_account} mono />
        </DetailCard>

        <DetailCard title="Payment Routing">
          <DetailRow label="Channel" value={invoice.payment_channel === "maviance" ? "Maviance" : "Bank"} />
          <DetailRow label="Category" value={invoice.payment_category} />
          <DetailRow
            label="Recurring"
            value={
              invoice.is_recurring ? (
                <span className="inline-flex items-center gap-1 text-blue-700">
                  <RefreshCw className="h-3 w-3" /> Monthly (15th)
                </span>
              ) : (
                "One-off"
              )
            }
          />
        </DetailCard>

        <DetailCard title="Sage">
          <DetailRow label="Entity" value={`${invoice.entities?.code} — ${invoice.entities?.name}`} />
          <DetailRow label="Journal" value={invoice.entities?.purchase_journal} />
          <DetailRow label="Sage Folder" value={invoice.entities?.sage_folder} mono />
          <DetailRow label="Supplier Aux" value={invoice.suppliers?.aux_code} mono />
          <DetailRow label="Supplier Account" value={invoice.suppliers?.supplier_account} mono />
        </DetailCard>
      </div>
    </div>
  );
}

function DetailCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-5">
      <h2 className="mb-4 text-sm font-semibold text-gray-800">{title}</h2>
      <dl className="space-y-2.5">{children}</dl>
    </div>
  );
}

function DetailRow({
  label,
  value,
  mono,
}: {
  label: string;
  value: React.ReactNode;
  mono?: boolean;
}) {
  return (
    <div className="flex justify-between gap-4 text-sm">
      <dt className="text-gray-500 shrink-0">{label}</dt>
      <dd className={cn("text-right text-gray-800", mono && "font-mono text-xs")}>
        {value ?? "—"}
      </dd>
    </div>
  );
}
