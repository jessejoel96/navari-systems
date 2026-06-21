"use client";

import { useState, useTransition } from "react";
import {
  CreditCard,
  Smartphone,
  History,
  Download,
  Send,
  CheckCircle2,
  ChevronDown,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { cn, formatCurrency, formatDate } from "@/lib/utils";
import { AppPageHeader } from "@/components/layout/AppPageHeader";
import { paymentScheduleLabel } from "@/lib/invoices/payment-schedule";
import { BatchDocumentsPanel, type BatchWithDocs } from "@/components/payments/BatchDocumentsPanel";
import { storageDownloadUrl } from "@/lib/payments/documents";

type Tab = "bank" | "maviance" | "history";

interface InvoiceRow {
  id: string;
  invoice_number: string;
  description: string;
  gross_amount: number;
  invoice_date: string;
  is_recurring: boolean;
  payment_category: string | null;
  payment_channel: string;
  payment_schedule?: string | null;
  scheduled_payment_day?: number | null;
  scheduled_payment_weekday?: number | null;
  suppliers?: { name: string } | null;
  entities?: { code: string } | null;
  status: string;
}

interface BatchRow extends BatchWithDocs {
  period_month: number;
  period_year: number;
  signed_sheet_path: string | null;
  signed_invoice_paths: string[];
  created_at: string;
}

const MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

const FULL_MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function batchStatusBadge(status: string) {
  const cfg: Record<string, { label: string; className: string }> = {
    draft: { label: "Draft", className: "bg-gray-100 text-gray-600" },
    sent: { label: "Sent for approval", className: "bg-amber-50 text-amber-700" },
    approved: { label: "Approved", className: "bg-green-50 text-green-700" },
    documents_archived: { label: "Documents archived", className: "bg-violet-50 text-violet-700" },
    rejected: { label: "Rejected", className: "bg-red-50 text-red-700" },
    executed: { label: "Paid", className: "bg-blue-50 text-blue-700" },
  };
  const c = cfg[status] ?? cfg.draft;
  return (
    <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium", c.className)}>
      {c.label}
    </span>
  );
}

export function PaymentsShell({
  bankInvoices,
  mavianceInvoices,
  batches,
  currentMonth,
  currentYear,
}: {
  bankInvoices: InvoiceRow[];
  mavianceInvoices: InvoiceRow[];
  batches: BatchRow[];
  currentMonth: number;
  currentYear: number;
}) {
  const [tab, setTab] = useState<Tab>("bank");
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [approverRole, setApproverRole] = useState<"cfo" | "ceo">("cfo");
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<string | null>(null);
  const [uploadingBatchId, setUploadingBatchId] = useState<string | null>(null);

  const invoices = tab === "bank" ? bankInvoices : mavianceInvoices;
  const filtered = invoices.filter((inv) => {
    if (!inv.invoice_date) return false;
    const d = new Date(inv.invoice_date);
    return d.getFullYear() === selectedYear && d.getMonth() + 1 === selectedMonth;
  });

  const currentBatch = batches.find(
    (b) =>
      b.sheet_type === tab &&
      b.period_month === selectedMonth &&
      b.period_year === selectedYear
  );

  const totalAmount = filtered.reduce((s, inv) => s + (inv.gross_amount || 0), 0);

  async function handleGenerateSheet() {
    startTransition(async () => {
      setFeedback(null);
      const res = await fetch("/api/payments/generate-sheet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sheet_type: tab,
          month: selectedMonth,
          year: selectedYear,
          approver_role: approverRole,
        }),
      });
      const data = await res.json();
      if (data.ok) {
        setFeedback(`Sheet generated — ${data.invoice_count} invoices · ${data.total_amount?.toLocaleString("fr-FR")} XAF`);
        if (data.download_url) {
          window.open(data.download_url, "_blank");
        }
        // Refresh
        setTimeout(() => window.location.reload(), 1500);
      } else {
        setFeedback(`Error: ${data.error}`);
      }
    });
  }

  async function handleSendForApproval() {
    if (!currentBatch) return;
    startTransition(async () => {
      setFeedback(null);
      const res = await fetch("/api/payments/send-for-approval", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ batch_id: currentBatch.id }),
      });
      const data = await res.json();
      if (data.ok) {
        setFeedback(`Approval email sent to ${data.sent_to}`);
        setTimeout(() => window.location.reload(), 1500);
      } else {
        setFeedback(`Error: ${data.error}`);
      }
    });
  }

  async function handleUploadSigned(
    batchId: string,
    docType: "sheet" | "invoice",
    file: File,
    invoiceId?: string
  ) {
    setUploadingBatchId(batchId);
    const form = new FormData();
    form.append("batch_id", batchId);
    form.append("type", docType);
    form.append("file", file);
    if (invoiceId) form.append("invoice_id", invoiceId);
    const res = await fetch("/api/payments/upload-signed", { method: "POST", body: form });
    const data = await res.json();
    setUploadingBatchId(null);
    if (data.ok) {
      if (data.archived) {
        setFeedback("All signed documents uploaded — batch archived");
      } else if (data.checklist) {
        setFeedback(
          `Uploaded · Sheet ${data.checklist.has_signed_sheet ? "✓" : "—"} · Invoices ${data.checklist.signed_invoices}/${data.checklist.required_invoices}`
        );
      } else {
        setFeedback("Signed document uploaded successfully");
      }
      setTimeout(() => window.location.reload(), 1000);
    } else {
      setFeedback(`Upload error: ${data.error}`);
    }
  }

  const tabs: { id: Tab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: "bank", label: "Bank Payments", icon: CreditCard },
    { id: "maviance", label: "Maviance", icon: Smartphone },
    { id: "history", label: "History", icon: History },
  ];

  return (
    <div className="space-y-6">
      <AppPageHeader
        title="Payments"
        description="Bank supplier runs monthly (15th) · Maviance one-offs weekly (Friday) · assign per invoice."
      >
        <div className="flex items-center gap-2">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-blue/30"
          >
            {FULL_MONTHS.map((m, i) => (
              <option key={m} value={i + 1}>{m}</option>
            ))}
          </select>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-blue/30"
          >
            {[2025, 2026, 2027].map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
      </AppPageHeader>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-0">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                "flex items-center gap-2 border-b-2 px-5 py-3 text-sm font-medium transition-colors",
                tab === t.id
                  ? "border-brand-blue text-brand-blue"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              )}
            >
              <t.icon className="h-4 w-4" />
              {t.label}
            </button>
          ))}
        </nav>
      </div>

      {tab === "history" ? (
        <HistoryView batches={batches} onUploadSigned={handleUploadSigned} uploadingBatchId={uploadingBatchId} />
      ) : (
        <>
          {/* Feedback */}
          {feedback && (
            <div className="rounded-lg bg-blue-50 px-4 py-2.5 text-sm text-blue-700 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              {feedback}
            </div>
          )}

          {/* Batch status card */}
          <div className="rounded-xl border border-gray-100 bg-white p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                  {FULL_MONTHS[selectedMonth - 1]} {selectedYear} ·{" "}
                  {tab === "bank" ? "Bank Payment Sheet" : "Maviance Report"}
                </p>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-gray-900">
                    {formatCurrency(totalAmount)}
                  </span>
                  <span className="text-sm text-gray-400">{filtered.length} invoices</span>
                </div>
                {currentBatch && (
                  <div className="mt-2 flex items-center gap-2">
                    {batchStatusBadge(currentBatch.status)}
                    {currentBatch.approved_by && (
                      <span className="text-xs text-gray-400">
                        by {currentBatch.approved_by} · {currentBatch.approved_at ? formatDate(currentBatch.approved_at) : ""}
                      </span>
                    )}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3">
                {/* Approver selector */}
                <div className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-sm">
                  <span className="text-gray-500 text-xs">Approver:</span>
                  <select
                    value={approverRole}
                    onChange={(e) => setApproverRole(e.target.value as "cfo" | "ceo")}
                    className="bg-transparent font-medium text-gray-700 focus:outline-none"
                  >
                    <option value="cfo">CFO</option>
                    <option value="ceo">CEO</option>
                  </select>
                </div>

                {/* Generate sheet button */}
                <button
                  onClick={handleGenerateSheet}
                  disabled={isPending || filtered.length === 0}
                  className="flex items-center gap-2 rounded-lg bg-brand-blue px-4 py-2 text-sm font-medium text-white hover:bg-brand-blue-deep disabled:opacity-50 transition-colors"
                >
                  {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                  Generate Sheet
                </button>

                {/* Send for approval */}
                {currentBatch && currentBatch.status === "draft" && (
                  <button
                    onClick={handleSendForApproval}
                    disabled={isPending}
                    className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
                  >
                    <Send className="h-4 w-4" />
                    Send for Approval
                  </button>
                )}
              </div>
            </div>

            {/* Signed documents panel */}
            {currentBatch &&
              ["approved", "documents_archived"].includes(currentBatch.status) && (
                <div className="mt-4">
                  <BatchDocumentsPanel
                    batch={currentBatch}
                    onUpload={handleUploadSigned}
                    uploading={uploadingBatchId === currentBatch.id}
                  />
                </div>
              )}
          </div>

          {/* Invoice table */}
          <div className="overflow-hidden rounded-xl border border-gray-100 bg-white">
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center py-16 text-center">
                <CreditCard className="h-10 w-10 text-gray-200" />
                <p className="mt-3 text-sm font-medium text-gray-500">
                  No sage_imported {tab} invoices for {FULL_MONTHS[selectedMonth - 1]} {selectedYear}
                </p>
                <p className="mt-1 text-xs text-gray-400">
                  Only invoices with status <code className="rounded bg-teal-50 px-1 py-0.5 text-teal-700">sage_imported</code> appear here
                </p>
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/50 text-left">
                    <th className="px-5 py-3 text-xs font-medium text-gray-500">Supplier</th>
                    <th className="px-5 py-3 text-xs font-medium text-gray-500">Invoice #</th>
                    <th className="px-5 py-3 text-xs font-medium text-gray-500">Description</th>
                    <th className="px-5 py-3 text-xs font-medium text-gray-500">Category</th>
                    <th className="px-5 py-3 text-xs font-medium text-gray-500">Date</th>
                    <th className="px-5 py-3 text-xs font-medium text-gray-500">Schedule</th>
                    <th className="px-5 py-3 text-right text-xs font-medium text-gray-500">Amount</th>
                    <th className="px-5 py-3 text-xs font-medium text-gray-500">Type</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.map((inv) => (
                    <tr key={inv.id} className="hover:bg-gray-50">
                      <td className="px-5 py-3.5 font-medium text-gray-800">
                        {inv.suppliers?.name ?? "—"}
                      </td>
                      <td className="px-5 py-3.5 text-gray-500 font-mono text-xs">
                        {inv.invoice_number ?? "—"}
                      </td>
                      <td className="px-5 py-3.5 text-gray-600 max-w-[200px] truncate">
                        {inv.description ?? "—"}
                      </td>
                      <td className="px-5 py-3.5 text-gray-500 text-xs">
                        {inv.payment_category ?? "—"}
                      </td>
                      <td className="px-5 py-3.5 text-gray-500 text-xs">
                        {inv.invoice_date ? formatDate(inv.invoice_date) : "—"}
                      </td>
                      <td className="px-5 py-3.5 text-gray-500 text-xs">
                        {paymentScheduleLabel(inv)}
                      </td>
                      <td className="px-5 py-3.5 text-right font-medium text-gray-800">
                        {formatCurrency(inv.gross_amount)}
                      </td>
                      <td className="px-5 py-3.5">
                        {inv.is_recurring ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-medium text-blue-700">
                            <RefreshCw className="h-2.5 w-2.5" />
                            Recurring
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-full bg-gray-50 px-2 py-0.5 text-[10px] font-medium text-gray-500">
                            One-off
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t border-gray-100 bg-gray-50/50">
                    <td colSpan={6} className="px-5 py-3 text-xs font-semibold text-gray-500">
                      TOTAL — {filtered.length} invoices
                    </td>
                    <td className="px-5 py-3 text-right text-sm font-bold text-gray-900">
                      {formatCurrency(totalAmount)}
                    </td>
                    <td />
                  </tr>
                </tfoot>
              </table>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function HistoryView({
  batches,
  onUploadSigned,
  uploadingBatchId,
}: {
  batches: BatchRow[];
  onUploadSigned: (batchId: string, docType: "sheet" | "invoice", file: File, invoiceId?: string) => void;
  uploadingBatchId: string | null;
}) {
  const [expanded, setExpanded] = useState<string | null>(null);

  const grouped = batches.reduce(
    (acc, b) => {
      const key = `${b.period_year}-${String(b.period_month).padStart(2, "0")}`;
      if (!acc[key]) acc[key] = [];
      acc[key].push(b);
      return acc;
    },
    {} as Record<string, BatchRow[]>
  );

  const sortedKeys = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

  if (sortedKeys.length === 0) {
    return (
      <div className="flex flex-col items-center py-20 text-center">
        <History className="h-10 w-10 text-gray-200" />
        <p className="mt-3 text-sm font-medium text-gray-500">No payment history yet</p>
        <p className="mt-1 text-xs text-gray-400">Generated sheets will appear here by month</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {sortedKeys.map((key) => {
        const [year, monthStr] = key.split("-");
        const month = parseInt(monthStr, 10);
        const monthBatches = grouped[key];
        const isOpen = expanded === key;

        return (
          <div key={key} className="rounded-xl border border-gray-100 bg-white overflow-hidden">
            <button
              onClick={() => setExpanded(isOpen ? null : key)}
              className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="font-semibold text-gray-800">
                  {FULL_MONTHS[month - 1]} {year}
                </span>
                <div className="flex gap-1.5">
                  {monthBatches.map((b) => batchStatusBadge(b.status))}
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-gray-600">
                  {formatCurrency(monthBatches.reduce((s, b) => s + b.total_amount, 0))}
                </span>
                <ChevronDown
                  className={cn("h-4 w-4 text-gray-400 transition-transform", isOpen && "rotate-180")}
                />
              </div>
            </button>

            {isOpen && (
              <div className="border-t border-gray-100 divide-y divide-gray-50">
                {monthBatches.map((batch) => (
                  <div key={batch.id} className="px-5 py-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-800">
                            {batch.sheet_type === "bank" ? "Bank Payment Sheet" : "Maviance Report"}
                          </span>
                          {batchStatusBadge(batch.status)}
                          <span className="text-xs text-gray-400">
                            Approver: {batch.approver_role.toUpperCase()}
                          </span>
                        </div>
                        <div className="mt-1 text-xs text-gray-500 flex items-center gap-3">
                          <span className="font-semibold text-gray-700">{formatCurrency(batch.total_amount)}</span>
                          <span>Generated {formatDate(batch.created_at)}</span>
                          {batch.approved_at && (
                            <span className="flex items-center gap-1 text-green-600">
                              <CheckCircle2 className="h-3 w-3" />
                              Approved {formatDate(batch.approved_at)} by {batch.approved_by}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {batch.generated_file_path && (
                          <a
                            href={storageDownloadUrl(batch.generated_file_path)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                          >
                            <Download className="h-3 w-3" /> Generated sheet
                          </a>
                        )}
                      </div>
                    </div>

                    {["approved", "documents_archived"].includes(batch.status) && (
                      <div className="mt-4">
                        <BatchDocumentsPanel
                          batch={batch}
                          onUpload={onUploadSigned}
                          uploading={uploadingBatchId === batch.id}
                          compact
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
