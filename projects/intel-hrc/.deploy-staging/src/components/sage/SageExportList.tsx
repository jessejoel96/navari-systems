"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Download,
  CheckCircle2,
  FileText,
  Loader2,
  AlertTriangle,
  Eye,
  FolderOpen,
  Package,
} from "lucide-react";
import { formatDate, formatCurrency } from "@/lib/utils";

interface SageExportListProps {
  exports: any[];
  readyInvoices: any[];
  pendingImport: any[];
}

export function SageExportList({
  exports,
  readyInvoices,
  pendingImport,
}: SageExportListProps) {
  const [generating, setGenerating] = useState<string | null>(null);
  const [confirming, setConfirming] = useState<string | null>(null);
  const [preview, setPreview] = useState<{ invoiceId: string; data: any } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [batchLoading, setBatchLoading] = useState(false);

  async function handleGenerate(invoiceId: string) {
    setGenerating(invoiceId);
    setError(null);
    try {
      const res = await fetch(`/api/sage-export/${invoiceId}`);
      if (!res.ok) {
        const body = await res.json();
        setError(body.error || "Export failed");
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
      window.location.reload();
    } catch {
      setError("Network error");
    } finally {
      setGenerating(null);
    }
  }

  async function handlePreview(invoiceId: string) {
    setGenerating(invoiceId);
    setError(null);
    const res = await fetch(`/api/sage-export/${invoiceId}/preview`);
    const data = await res.json();
    setGenerating(null);
    if (!res.ok) {
      setError(data.error || "Preview failed");
      return;
    }
    setPreview({ invoiceId, data });
  }

  async function handleConfirm(invoiceId: string) {
    setConfirming(invoiceId);
    setError(null);
    const res = await fetch(`/api/sage-export/${invoiceId}/confirm`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ confirmed_by: "Tina-Randa" }),
    });
    const data = await res.json();
    setConfirming(null);
    if (!res.ok) {
      setError(data.error || "Confirm failed");
      return;
    }
    window.location.reload();
  }

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function handleBatchExport() {
    if (selected.size === 0) return;
    const ids = [...selected];
    const entities = new Set(
      readyInvoices.filter((i) => ids.includes(i.id)).map((i) => i.entities?.code)
    );
    if (entities.size > 1) {
      setError("Batch export requires invoices from the same entity");
      return;
    }

    setBatchLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/sage-export/batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invoice_ids: ids }),
      });
      if (!res.ok) {
        const body = await res.json();
        setError(body.error || "Batch export failed");
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      const disposition = res.headers.get("Content-Disposition") ?? "";
      const match = disposition.match(/filename="(.+)"/);
      a.download = match ? match[1] : "sage-batch.txt";
      a.href = url;
      a.click();
      URL.revokeObjectURL(url);
      window.location.reload();
    } catch {
      setError("Network error");
    } finally {
      setBatchLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Sage Exports</h1>
        <p className="mt-1 text-sm text-gray-500">
          Review invoices → generate .txt → import in Sage 100 → confirm import → payment queue.
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Preview modal */}
      {preview && (
        <div className="rounded-xl border border-brand-blue/20 bg-white overflow-hidden">
          <div className="flex items-center justify-between border-b border-gray-100 px-5 py-3 bg-brand-blue-light/30">
            <div>
              <p className="text-sm font-semibold text-gray-800">{preview.data.file_name}</p>
              <p className="text-xs text-gray-500">
                {preview.data.entity_code} · Journal {preview.data.journal} · Folder: {preview.data.sage_folder}
              </p>
            </div>
            <button onClick={() => setPreview(null)} className="text-xs text-gray-400 hover:text-gray-600">
              Close
            </button>
          </div>
          <div className="overflow-x-auto max-h-64">
            <table className="w-full text-xs font-mono">
              <thead className="sticky top-0 bg-gray-50">
                <tr className="text-left text-gray-500">
                  <th className="px-4 py-2">Journal</th>
                  <th className="px-4 py-2">Date</th>
                  <th className="px-4 py-2">Account</th>
                  <th className="px-4 py-2">Aux</th>
                  <th className="px-4 py-2">Label</th>
                  <th className="px-4 py-2 text-right">Dr</th>
                  <th className="px-4 py-2 text-right">Cr</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {preview.data.lines?.map((l: any, i: number) => (
                  <tr key={i}>
                    <td className="px-4 py-1.5">{l.journal}</td>
                    <td className="px-4 py-1.5">{l.date}</td>
                    <td className="px-4 py-1.5">{l.account}</td>
                    <td className="px-4 py-1.5">{l.aux_credit || "—"}</td>
                    <td className="px-4 py-1.5 font-sans truncate max-w-[180px]">{l.label}</td>
                    <td className="px-4 py-1.5 text-right">{l.debit?.toLocaleString("fr-FR") ?? ""}</td>
                    <td className="px-4 py-1.5 text-right">{l.credit?.toLocaleString("fr-FR") ?? ""}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Ready for export */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-700">
            Ready for Export
            {readyInvoices.length > 0 && (
              <span className="ml-2 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
                {readyInvoices.length}
              </span>
            )}
          </h2>
          {selected.size > 0 && (
            <button
              onClick={handleBatchExport}
              disabled={batchLoading}
              className="flex items-center gap-2 rounded-lg bg-brand-blue px-4 py-2 text-xs font-medium text-white hover:bg-brand-blue-deep disabled:opacity-50"
            >
              {batchLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Package className="h-3.5 w-3.5" />}
              Batch Export ({selected.size})
            </button>
          )}
        </div>

        {readyInvoices.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50/50 py-10 text-center text-sm text-gray-400">
            No approved invoices. Mark invoices as <strong>Ready for Sage</strong> from the Invoice Inbox first.
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {readyInvoices.map((inv: any) => (
              <motion.div
                key={inv.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-xl border border-gray-100 bg-white p-4"
              >
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={selected.has(inv.id)}
                    onChange={() => toggleSelect(inv.id)}
                    className="mt-1 h-4 w-4 rounded border-gray-300"
                  />
                  <div className="min-w-0 flex-1">
                    <Link href={`/invoices/${inv.id}`} className="truncate text-sm font-medium text-gray-800 hover:text-brand-blue">
                      {inv.description || inv.invoice_number}
                    </Link>
                    <p className="mt-0.5 text-xs text-gray-400">
                      {inv.entities?.code} · {inv.suppliers?.name ?? "—"} · {formatCurrency(inv.gross_amount)}
                    </p>
                    <p className="mt-0.5 text-[10px] text-gray-400">
                      {inv.invoice_type?.replace(/_/g, " ")} · {inv.invoice_date ? formatDate(inv.invoice_date) : "—"}
                    </p>
                    {inv.entities?.sage_folder && (
                      <p className="mt-1 flex items-center gap-1 text-[10px] text-amber-700">
                        <FolderOpen className="h-3 w-3" />
                        g:\Sage\Companies\{inv.entities.sage_folder}
                      </p>
                    )}
                  </div>
                </div>
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={() => handlePreview(inv.id)}
                    disabled={generating === inv.id}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-gray-200 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50"
                  >
                    <Eye className="h-3.5 w-3.5" /> Preview
                  </button>
                  <button
                    onClick={() => handleGenerate(inv.id)}
                    disabled={generating === inv.id}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-brand-blue py-1.5 text-xs font-medium text-white hover:bg-brand-blue-deep disabled:opacity-50"
                  >
                    {generating === inv.id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Download className="h-3.5 w-3.5" />
                    )}
                    Generate .txt
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Pending Sage import confirmation */}
      {pendingImport.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-gray-700">
            Pending Sage Import Confirmation
            <span className="ml-2 rounded-full bg-cyan-50 px-2 py-0.5 text-xs font-medium text-cyan-700">
              {pendingImport.length}
            </span>
          </h2>
          <p className="text-xs text-gray-500">
            After importing the .txt into Sage 100, confirm here so the invoice moves to the payment queue.
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            {pendingImport.map((inv: any) => (
              <div key={inv.id} className="flex items-center justify-between rounded-xl border border-cyan-100 bg-cyan-50/30 p-4">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-gray-800">
                    {inv.description || inv.invoice_number}
                  </p>
                  <p className="mt-0.5 text-xs text-gray-500">
                    {inv.entities?.code} · {formatCurrency(inv.gross_amount)}
                  </p>
                </div>
                <button
                  onClick={() => handleConfirm(inv.id)}
                  disabled={confirming === inv.id}
                  className="ml-3 flex shrink-0 items-center gap-1.5 rounded-lg bg-teal-600 px-3 py-2 text-xs font-medium text-white hover:bg-teal-700 disabled:opacity-50"
                >
                  {confirming === inv.id ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  )}
                  Confirm Imported
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Export history */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-gray-700">Export History</h2>
        {exports.length === 0 ? (
          <div className="flex flex-col items-center rounded-xl border border-gray-100 bg-white py-16 text-center">
            <Download className="h-10 w-10 text-gray-200" />
            <p className="mt-3 text-sm text-gray-400">No exports yet</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-gray-100 bg-white">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50 text-left">
                  <th className="px-5 py-3 text-xs font-medium text-gray-500">File</th>
                  <th className="px-5 py-3 text-xs font-medium text-gray-500">Invoice</th>
                  <th className="px-5 py-3 text-xs font-medium text-gray-500">Entity</th>
                  <th className="px-5 py-3 text-xs font-medium text-gray-500">Journal</th>
                  <th className="px-5 py-3 text-xs font-medium text-gray-500">Lines</th>
                  <th className="px-5 py-3 text-xs font-medium text-gray-500">Generated</th>
                  <th className="px-5 py-3 text-xs font-medium text-gray-500">Imported</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {exports.map((exp: any) => (
                  <tr key={exp.id} className="hover:bg-gray-50">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-gray-400" />
                        <span className="font-medium text-gray-800 text-xs">{exp.file_name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-gray-600">
                      {exp.invoices?.description || exp.invoices?.invoice_number || "—"}
                    </td>
                    <td className="px-5 py-3.5 text-gray-600">{exp.entities?.code}</td>
                    <td className="px-5 py-3.5">
                      <span className="rounded bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
                        {exp.journal_code}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-gray-600">{exp.line_count}</td>
                    <td className="px-5 py-3.5 text-gray-500 text-xs">
                      {formatDate(exp.generated_at)}
                    </td>
                    <td className="px-5 py-3.5">
                      {exp.imported_at ? (
                        <span className="flex items-center gap-1 text-xs text-emerald-600">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          {formatDate(exp.imported_at)}
                        </span>
                      ) : (
                        <span className="text-xs text-amber-600">Awaiting confirm</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
