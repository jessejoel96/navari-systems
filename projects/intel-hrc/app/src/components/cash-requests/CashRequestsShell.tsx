"use client";

import { useState } from "react";
import {
  Send, RefreshCw, Download, FileSpreadsheet,
  CheckCircle, Clock, AlertCircle, ChevronDown, ChevronRight,
  Plus, Bell, MessageSquare, Upload, Check, X, Eye,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

/* ──────────────────────── Types ──────────────────────── */

type Entity = { name: string; code: string; country: string; contact_email: string | null };

type LineItem = {
  sn: number;
  description: string;
  budget_code: string | null;
  amount_requested: number;
  amount_approved: number | null;
  item_type: string;
  remarks: string | null;
};

type CashRequest = {
  id: string;
  entity_id: string;
  status: string;
  amount_requested: number;
  amount_approved: number | null;
  opening_balance: number | null;
  expense_actual_amount: number | null;
  submission_received_at: string | null;
  request_email_sent_at: string | null;
  justification_path: string | null;
  justification_received_at: string | null;
  justification_status: string;
  justification_confirmed_at: string | null;
  justification_notes: string | null;
  cr_confirmed_at: string | null;
  notes: string | null;
  entities: Entity | null;
  cash_request_line_items?: LineItem[];
};

type Cycle = {
  id: string;
  label: string;
  period_month: number;
  period_year: number;
  status: string;
  request_sent_at: string | null;
  deadline_date: string | null;
  reminder_sent_at: string | null;
  compiled_at: string | null;
  compiled_file_path: string | null;
  justification_compiled_at: string | null;
  justification_compiled_file_path: string | null;
  cfo_sent_at: string | null;
  cfo_approved_at: string | null;
  expense_period_label: string | null;
  cash_requests: CashRequest[];
};

/* ──────────────────── Helpers ──────────────────── */

const CYCLE_STATUS_COLORS: Record<string, string> = {
  draft: "bg-slate-100 text-slate-600",
  requests_sent: "bg-blue-100 text-blue-700",
  all_submitted: "bg-amber-100 text-amber-700",
  compiled: "bg-purple-100 text-purple-700",
  cfo_review: "bg-orange-100 text-orange-700",
  approved: "bg-green-100 text-green-700",
};

const CYCLE_STATUS_LABEL: Record<string, string> = {
  draft: "Draft",
  requests_sent: "Emails Sent",
  all_submitted: "All Submitted",
  compiled: "Compiled",
  cfo_review: "Awaiting CFO",
  approved: "Approved",
};

function fmt(n: number | null | undefined) {
  if (!n) return "—";
  return n.toLocaleString("fr-FR") + " XAF";
}

function fmtDate(d: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

/* ── Status chips ── */

function CRStatusChip({ status, confirmedAt }: { status: string; confirmedAt: string | null }) {
  if (confirmedAt) return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
      <Check className="w-3 h-3" /> Confirmed
    </span>
  );
  const map: Record<string, string> = {
    pending: "bg-slate-100 text-slate-500",
    requested: "bg-blue-100 text-blue-600",
    submitted: "bg-amber-100 text-amber-700",
    approved: "bg-green-100 text-green-700",
    queried: "bg-red-100 text-red-600",
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${map[status] ?? "bg-slate-100 text-slate-500"}`}>
      {status}
    </span>
  );
}

function JustStatusChip({ status }: { status: string }) {
  const map: Record<string, { cls: string; label: string }> = {
    pending: { cls: "bg-slate-100 text-slate-500", label: "Not received" },
    submitted: { cls: "bg-amber-100 text-amber-700", label: "Received" },
    confirmed: { cls: "bg-emerald-100 text-emerald-700", label: "Confirmed" },
    queried: { cls: "bg-red-100 text-red-600", label: "Queried" },
  };
  const cfg = map[status] ?? { cls: "bg-slate-100 text-slate-500", label: status };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${cfg.cls}`}>
      {cfg.label}
    </span>
  );
}

/* ── Query/Confirm Modal ── */

function ActionModal({
  requestId, docType, action, entityName, onClose, onDone,
}: {
  requestId: string;
  docType: "cash_request" | "justification";
  action: "confirm" | "query";
  entityName: string;
  onClose: () => void;
  onDone: () => void;
}) {
  const [notes, setNotes] = useState("");
  const [approvedAmount, setApprovedAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isConfirm = action === "confirm";
  const label = docType === "cash_request" ? "Cash Request" : "Justification";

  async function submit() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/cash-requests/${requestId}/confirm`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: docType,
          action,
          notes: notes || undefined,
          approved_amount: approvedAmount ? parseInt(approvedAmount, 10) : undefined,
        }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error ?? "Failed");
      onDone();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm">
        <div className={`flex items-center gap-2 mb-4 ${isConfirm ? "text-green-700" : "text-amber-700"}`}>
          {isConfirm ? <CheckCircle className="w-5 h-5" /> : <MessageSquare className="w-5 h-5" />}
          <h3 className="font-bold text-slate-800">
            {isConfirm ? "Confirm" : "Query"} — {label}
          </h3>
        </div>
        <p className="text-sm text-slate-500 mb-4">{entityName}</p>

        {isConfirm && docType === "cash_request" && (
          <div className="mb-3">
            <label className="block text-xs font-medium text-slate-500 mb-1">
              Approved Amount (XAF) — leave blank to use requested amount
            </label>
            <input
              type="number"
              value={approvedAmount}
              onChange={(e) => setApprovedAmount(e.target.value)}
              placeholder="e.g. 2500000"
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
        )}

        <div className="mb-4">
          <label className="block text-xs font-medium text-slate-500 mb-1">
            {isConfirm ? "Notes (optional)" : "Query / Clarification needed"}
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder={isConfirm ? "Any notes for the entity…" : "Describe what needs clarification…"}
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
          />
        </div>

        {error && (
          <div className="text-red-700 text-xs bg-red-50 rounded-lg px-3 py-2 mb-3 flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {error}
          </div>
        )}

        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 py-2 border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50">
            Cancel
          </button>
          <button
            onClick={submit}
            disabled={loading || (!isConfirm && !notes.trim())}
            className={`flex-1 py-2 rounded-lg text-white text-sm font-semibold disabled:opacity-60 transition-colors
              ${isConfirm ? "bg-green-600 hover:bg-green-700" : "bg-amber-500 hover:bg-amber-600"}`}
          >
            {loading ? "Saving…" : isConfirm ? "Confirm" : "Send Query"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Upload Modal (Tina uploads on entity's behalf) ── */

function UploadModal({
  requestId, uploadType, entityName, onClose, onDone,
}: {
  requestId: string;
  uploadType: "cash_request" | "justification";
  entityName: string;
  onClose: () => void;
  onDone: () => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const endpoint = uploadType === "cash_request"
    ? `/api/cash-requests/${requestId}/submit`
    : `/api/cash-requests/${requestId}/submit-justification`;
  const label = uploadType === "cash_request" ? "Cash Request" : "Expense Justification";

  async function submit() {
    if (!file) return;
    setLoading(true);
    setError("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch(endpoint, { method: "POST", body: fd });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error ?? "Upload failed");
      onDone();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm">
        <h3 className="font-bold text-slate-800 mb-1">Upload {label}</h3>
        <p className="text-sm text-slate-500 mb-4">{entityName}</p>

        <label className="block border-2 border-dashed border-slate-200 rounded-xl p-5 text-center cursor-pointer hover:border-blue-300 hover:bg-slate-50 transition-all mb-4">
          <input type="file" accept=".xlsx,.xls,.csv,.pdf" className="hidden"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
          {file ? (
            <div className="flex flex-col items-center gap-1">
              <FileSpreadsheet className="w-7 h-7 text-green-600" />
              <p className="text-sm font-medium text-slate-800">{file.name}</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-1">
              <Upload className="w-7 h-7 text-slate-400" />
              <p className="text-sm text-slate-500">Click to select file</p>
            </div>
          )}
        </label>

        {error && (
          <div className="text-red-700 text-xs bg-red-50 rounded-lg px-3 py-2 mb-3 flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {error}
          </div>
        )}

        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 py-2 border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50">Cancel</button>
          <button onClick={submit} disabled={!file || loading}
            className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold disabled:opacity-60 transition-colors">
            {loading ? "Uploading…" : "Upload"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Entity Row ── */

function EntityRow({ req, onAction }: {
  req: CashRequest;
  onAction: (requestId: string, docType: "cash_request" | "justification", action: "confirm" | "query" | "upload") => void;
}) {
  const [open, setOpen] = useState(false);
  const entity = Array.isArray(req.entities) ? req.entities[0] : req.entities;

  const reqLines = (req.cash_request_line_items ?? []).filter((l) => l.item_type === "request");
  const expLines = (req.cash_request_line_items ?? []).filter((l) => l.item_type === "expense");
  const hasRequest = ["submitted", "approved", "queried"].includes(req.status);
  const hasJustification = ["submitted", "confirmed", "queried"].includes(req.justification_status);

  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden mb-2">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-2 px-4 py-3 text-left hover:bg-slate-50 transition-colors"
      >
        {open ? <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" /> : <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />}

        <span className="text-sm font-semibold text-slate-800 w-28 shrink-0">{entity?.name ?? req.entity_id}</span>
        <span className="text-xs text-slate-400 w-10 shrink-0">{entity?.code}</span>

        {/* Cash Request status column */}
        <div className="flex-1 flex items-center gap-2">
          <span className="text-xs text-slate-400 hidden sm:inline">Request:</span>
          <CRStatusChip status={req.status} confirmedAt={req.cr_confirmed_at} />
          {hasRequest && <span className="text-xs text-slate-500">{fmt(req.amount_requested)}</span>}
        </div>

        {/* Justification status column */}
        <div className="flex-1 flex items-center gap-2">
          <span className="text-xs text-slate-400 hidden sm:inline">Justif.:</span>
          <JustStatusChip status={req.justification_status} />
          {hasJustification && req.expense_actual_amount != null && (
            <span className="text-xs text-slate-500">{fmt(req.expense_actual_amount)}</span>
          )}
        </div>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="border-t border-slate-100 px-4 pb-4 pt-3">
              <div className="grid md:grid-cols-2 gap-4">

                {/* ── Cash Request column ── */}
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-bold text-blue-800">Cash Request</h4>
                    <div className="flex gap-1.5">
                      {!hasRequest && (
                        <button onClick={() => onAction(req.id, "cash_request", "upload")}
                          className="flex items-center gap-1 px-2 py-1 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700">
                          <Upload className="w-3 h-3" /> Upload
                        </button>
                      )}
                      {hasRequest && !req.cr_confirmed_at && (
                        <>
                          <button onClick={() => onAction(req.id, "cash_request", "confirm")}
                            className="flex items-center gap-1 px-2 py-1 bg-green-600 text-white text-xs rounded-lg hover:bg-green-700">
                            <Check className="w-3 h-3" /> Confirm
                          </button>
                          <button onClick={() => onAction(req.id, "cash_request", "query")}
                            className="flex items-center gap-1 px-2 py-1 bg-amber-500 text-white text-xs rounded-lg hover:bg-amber-600">
                            <MessageSquare className="w-3 h-3" /> Query
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="text-xs text-blue-700 space-y-1 mb-3">
                    <div className="flex justify-between">
                      <span>Received</span>
                      <span className="font-medium">{fmtDate(req.submission_received_at)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Requested</span>
                      <span className="font-medium">{fmt(req.amount_requested)}</span>
                    </div>
                    {req.amount_approved != null && (
                      <div className="flex justify-between">
                        <span>Approved</span>
                        <span className="font-semibold text-blue-900">{fmt(req.amount_approved)}</span>
                      </div>
                    )}
                    {req.cr_confirmed_at && (
                      <div className="flex justify-between text-emerald-700">
                        <span>Confirmed</span>
                        <span>{fmtDate(req.cr_confirmed_at)}</span>
                      </div>
                    )}
                    {req.notes && req.status === "queried" && (
                      <div className="mt-2 bg-amber-50 border border-amber-200 rounded p-2 text-amber-800">
                        <span className="font-medium">Query: </span>{req.notes}
                      </div>
                    )}
                  </div>

                  {reqLines.length > 0 && (
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="text-blue-600 border-b border-blue-200">
                          <th className="text-left py-1">Description</th>
                          <th className="text-right py-1">XAF</th>
                        </tr>
                      </thead>
                      <tbody>
                        {reqLines.map((l, i) => (
                          <tr key={i} className="border-b border-blue-100/50">
                            <td className="py-1 text-slate-700">{l.description}</td>
                            <td className="py-1 text-right text-slate-600">{l.amount_requested.toLocaleString("fr-FR")}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}

                  {!hasRequest && (
                    <p className="text-xs text-blue-400 italic text-center py-2">Waiting for submission</p>
                  )}
                </div>

                {/* ── Justification column ── */}
                <div className="bg-green-50 border border-green-100 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-bold text-green-800">Expense Justification</h4>
                    <div className="flex gap-1.5">
                      {!hasJustification && (
                        <button onClick={() => onAction(req.id, "justification", "upload")}
                          className="flex items-center gap-1 px-2 py-1 bg-green-600 text-white text-xs rounded-lg hover:bg-green-700">
                          <Upload className="w-3 h-3" /> Upload
                        </button>
                      )}
                      {hasJustification && req.justification_status !== "confirmed" && (
                        <>
                          <button onClick={() => onAction(req.id, "justification", "confirm")}
                            className="flex items-center gap-1 px-2 py-1 bg-green-600 text-white text-xs rounded-lg hover:bg-green-700">
                            <Check className="w-3 h-3" /> Confirm
                          </button>
                          <button onClick={() => onAction(req.id, "justification", "query")}
                            className="flex items-center gap-1 px-2 py-1 bg-amber-500 text-white text-xs rounded-lg hover:bg-amber-600">
                            <MessageSquare className="w-3 h-3" /> Query
                          </button>
                        </>
                      )}
                      {req.justification_path && (
                        <a href={`/api/storage?path=${encodeURIComponent(req.justification_path)}`}
                          target="_blank"
                          className="flex items-center gap-1 px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded-lg hover:bg-slate-200">
                          <Eye className="w-3 h-3" /> View
                        </a>
                      )}
                    </div>
                  </div>

                  <div className="text-xs text-green-700 space-y-1 mb-3">
                    <div className="flex justify-between">
                      <span>Received</span>
                      <span className="font-medium">{fmtDate(req.justification_received_at)}</span>
                    </div>
                    {req.opening_balance != null && (
                      <div className="flex justify-between">
                        <span>Opening Balance</span>
                        <span className="font-medium">{fmt(req.opening_balance)}</span>
                      </div>
                    )}
                    {req.expense_actual_amount != null && (
                      <div className="flex justify-between">
                        <span>Total Expenses</span>
                        <span className="font-semibold text-green-900">{fmt(req.expense_actual_amount)}</span>
                      </div>
                    )}
                    {req.justification_confirmed_at && (
                      <div className="flex justify-between text-emerald-700">
                        <span>Confirmed</span>
                        <span>{fmtDate(req.justification_confirmed_at)}</span>
                      </div>
                    )}
                    {req.justification_notes && req.justification_status === "queried" && (
                      <div className="mt-2 bg-amber-50 border border-amber-200 rounded p-2 text-amber-800">
                        <span className="font-medium">Query: </span>{req.justification_notes}
                      </div>
                    )}
                  </div>

                  {expLines.length > 0 && (
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="text-green-700 border-b border-green-200">
                          <th className="text-left py-1">Expense Item</th>
                          <th className="text-right py-1">XAF</th>
                        </tr>
                      </thead>
                      <tbody>
                        {expLines.map((l, i) => (
                          <tr key={i} className="border-b border-green-100/50">
                            <td className="py-1 text-slate-700">{l.description}</td>
                            <td className="py-1 text-right text-slate-600">{l.amount_requested.toLocaleString("fr-FR")}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}

                  {!hasJustification && (
                    <p className="text-xs text-green-400 italic text-center py-2">Waiting for justification</p>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── Cycle Card ── */

function CycleCard({ cycle, onRefresh }: { cycle: Cycle; onRefresh: () => void }) {
  const [expanded, setExpanded] = useState(cycle.status !== "approved");
  const [loading, setLoading] = useState<string | null>(null);
  const [modal, setModal] = useState<{
    requestId: string;
    docType: "cash_request" | "justification";
    action: "confirm" | "query" | "upload";
    entityName: string;
  } | null>(null);

  const requests = cycle.cash_requests ?? [];
  const submitted = requests.filter((r) => ["submitted", "approved", "queried"].includes(r.status));
  const withJustif = requests.filter((r) => ["submitted", "confirmed", "queried"].includes(r.justification_status));
  const confirmedCR = requests.filter((r) => r.cr_confirmed_at).length;
  const confirmedJust = requests.filter((r) => r.justification_status === "confirmed").length;
  const grandTotal = submitted.reduce((s, r) => s + (r.amount_requested ?? 0), 0);
  const grandExpenses = withJustif.reduce((s, r) => s + (r.expense_actual_amount ?? 0), 0);

  function openActionModal(requestId: string, docType: "cash_request" | "justification", action: "confirm" | "query" | "upload") {
    const req = requests.find((r) => r.id === requestId);
    const entity = Array.isArray(req?.entities) ? req?.entities[0] : req?.entities;
    setModal({ requestId, docType, action, entityName: entity?.name ?? requestId });
  }

  async function apiAction(endpoint: string, payload?: object) {
    setLoading(endpoint);
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload ?? {}),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Error");
      if (data.sent) alert(`Emails sent: ${data.sent.join(", ")}${data.failed?.length ? `\nFailed: ${data.failed.map((f: {entity: string}) => f.entity).join(", ")}` : ""}`);
      else alert(data.message ?? "Done");
      onRefresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error");
    } finally {
      setLoading(null);
    }
  }

  async function handleCompile(type: "cash_request" | "justification") {
    const endpoint = type === "cash_request"
      ? `/api/cash-requests/cycles/${cycle.id}/compile`
      : `/api/cash-requests/cycles/${cycle.id}/compile-justifications`;
    setLoading(type);
    try {
      const res = await fetch(endpoint, { method: "POST" });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error ?? "Failed"); }
      const blob = await res.blob();
      const prefix = type === "cash_request" ? "cash-request" : "justification-summary";
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${prefix}-${cycle.label}.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
      onRefresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error");
    } finally {
      setLoading(null);
    }
  }

  const pendingCount = requests.filter((r) => !["submitted", "approved"].includes(r.status)).length;

  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden mb-4">
      {/* Header */}
      <button onClick={() => setExpanded((o) => !o)}
        className="w-full flex items-center gap-4 px-6 py-4 hover:bg-slate-50 transition-colors text-left">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-1">
            <h3 className="text-base font-bold text-slate-800">{cycle.label}</h3>
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${CYCLE_STATUS_COLORS[cycle.status] ?? "bg-slate-100 text-slate-600"}`}>
              {CYCLE_STATUS_LABEL[cycle.status] ?? cycle.status}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
            <span>Requests: {submitted.length}/{requests.length} received · {confirmedCR}/{requests.length} confirmed</span>
            {grandTotal > 0 && <span className="text-blue-700 font-medium">{fmt(grandTotal)}</span>}
            <span>Justif.: {withJustif.length}/{requests.length} received · {confirmedJust}/{requests.length} confirmed</span>
            {grandExpenses > 0 && <span className="text-green-700 font-medium">{fmt(grandExpenses)}</span>}
            {cycle.deadline_date && <span>Deadline: {fmtDate(cycle.deadline_date)}</span>}
          </div>
        </div>
        {expanded ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="border-t border-slate-100 px-6 py-4">

              {/* Progress bars */}
              <div className="grid grid-cols-2 gap-4 mb-5">
                <div>
                  <div className="flex justify-between text-xs text-slate-500 mb-1">
                    <span>Cash Requests</span>
                    <span>{submitted.length}/{requests.length} received · {confirmedCR} confirmed</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-2 rounded-full transition-all" style={{
                      width: `${requests.length ? (confirmedCR / requests.length) * 100 : 0}%`,
                      background: "linear-gradient(to right, #3B82F6, #1F6DB3)"
                    }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs text-slate-500 mb-1">
                    <span>Justifications</span>
                    <span>{withJustif.length}/{requests.length} received · {confirmedJust} confirmed</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-2 rounded-full transition-all" style={{
                      width: `${requests.length ? (confirmedJust / requests.length) * 100 : 0}%`,
                      background: "linear-gradient(to right, #22C55E, #16A34A)"
                    }} />
                  </div>
                </div>
              </div>

              {/* Entity rows */}
              <div className="mb-4">
                {requests.map((r) => (
                  <EntityRow key={r.id} req={r} onAction={openActionModal} />
                ))}
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-2 pt-3 border-t border-slate-100">
                {cycle.status === "draft" && (
                  <button onClick={() => apiAction(`/api/cash-requests/cycles/${cycle.id}/send-requests`)}
                    disabled={!!loading}
                    className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg disabled:opacity-60 transition-colors">
                    <Send className="w-3.5 h-3.5" />
                    {loading === `/api/cash-requests/cycles/${cycle.id}/send-requests` ? "Sending…" : "Send Requests (24th)"}
                  </button>
                )}

                {cycle.status === "requests_sent" && pendingCount > 0 && (
                  <button onClick={() => apiAction(`/api/cash-requests/cycles/${cycle.id}/send-reminder`)}
                    disabled={!!loading}
                    className="flex items-center gap-1.5 px-3 py-2 bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium rounded-lg disabled:opacity-60 transition-colors">
                    <Bell className="w-3.5 h-3.5" /> Remind {pendingCount}
                  </button>
                )}

                {submitted.length > 0 && (
                  <button onClick={() => handleCompile("cash_request")}
                    disabled={!!loading}
                    className="flex items-center gap-1.5 px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg disabled:opacity-60 transition-colors">
                    <FileSpreadsheet className="w-3.5 h-3.5" />
                    {loading === "cash_request" ? "Compiling…" : "Compile Requests"}
                  </button>
                )}

                {withJustif.length > 0 && (
                  <button onClick={() => handleCompile("justification")}
                    disabled={!!loading}
                    className="flex items-center gap-1.5 px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg disabled:opacity-60 transition-colors">
                    <FileSpreadsheet className="w-3.5 h-3.5" />
                    {loading === "justification" ? "Compiling…" : "Compile Justifications"}
                  </button>
                )}

                {cycle.compiled_file_path && (
                  <button onClick={() => apiAction(`/api/cash-requests/cycles/${cycle.id}/send-to-cfo`, { approver_role: "cfo" })}
                    disabled={!!loading}
                    className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg disabled:opacity-60 transition-colors">
                    <Send className="w-3.5 h-3.5" /> Send to CFO
                  </button>
                )}

                {cycle.justification_compiled_file_path && (
                  <a href={`/api/storage?path=${encodeURIComponent(cycle.justification_compiled_file_path)}`}
                    target="_blank"
                    className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium rounded-lg transition-colors">
                    <Download className="w-3.5 h-3.5" /> Download Justification Report
                  </a>
                )}

                {cycle.status === "cfo_review" && (
                  <div className="flex items-center gap-2 text-sm text-amber-700 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
                    <Clock className="w-4 h-4" /> Awaiting CFO — sent {fmtDate(cycle.cfo_sent_at)}
                  </div>
                )}

                {cycle.status === "approved" && (
                  <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 border border-green-100 rounded-lg px-3 py-2">
                    <CheckCircle className="w-4 h-4" /> Approved {fmtDate(cycle.cfo_approved_at)}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modals */}
      {modal && modal.action !== "upload" && (
        <ActionModal
          requestId={modal.requestId}
          docType={modal.docType}
          action={modal.action as "confirm" | "query"}
          entityName={modal.entityName}
          onClose={() => setModal(null)}
          onDone={onRefresh}
        />
      )}
      {modal && modal.action === "upload" && (
        <UploadModal
          requestId={modal.requestId}
          uploadType={modal.docType}
          entityName={modal.entityName}
          onClose={() => setModal(null)}
          onDone={onRefresh}
        />
      )}
    </div>
  );
}

/* ── New Cycle Modal ── */

function NewCycleModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [expensePeriod, setExpensePeriod] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

  async function handleCreate() {
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/cash-requests/cycles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ month, year }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error ?? "Failed");

      // Set expense period label if provided
      if (expensePeriod && d.cycle_id) {
        await fetch(`/api/cash-requests/cycles/${d.cycle_id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ expense_period_label: expensePeriod }),
        });
      }

      onCreated(); onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm">
        <h2 className="text-lg font-bold text-slate-800 mb-4">New Cash Request Cycle</h2>
        <div className="flex gap-3 mb-3">
          <div className="flex-1">
            <label className="block text-xs font-medium text-slate-500 mb-1">Request Month</label>
            <select value={month} onChange={(e) => setMonth(Number(e.target.value))}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              {MONTHS.map((m, i) => <option key={i} value={i+1}>{m}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Year</label>
            <input type="number" value={year} onChange={(e) => setYear(Number(e.target.value))}
              className="w-24 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>
        <div className="mb-4">
          <label className="block text-xs font-medium text-slate-500 mb-1">Expense Justification Period (previous month)</label>
          <input type="text" value={expensePeriod} onChange={(e) => setExpensePeriod(e.target.value)}
            placeholder="e.g. May 2026"
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          <p className="text-xs text-slate-400 mt-1">Entities submit justifications for this period alongside their request.</p>
        </div>
        {error && (
          <div className="flex items-center gap-2 text-red-700 text-xs bg-red-50 rounded-lg px-3 py-2 mb-3">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {error}
          </div>
        )}
        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 py-2 border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50">Cancel</button>
          <button onClick={handleCreate} disabled={loading}
            className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold disabled:opacity-60 transition-colors">
            {loading ? "Creating…" : "Create Cycle"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Main Shell ── */

export default function CashRequestsShell({ initialCycles }: { initialCycles: Cycle[] }) {
  const [cycles, setCycles] = useState<Cycle[]>(initialCycles);
  const [showModal, setShowModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  async function refresh() {
    setRefreshing(true);
    try {
      const res = await fetch("/api/cash-requests/cycles");
      if (res.ok) setCycles(await res.json());
    } finally {
      setRefreshing(false);
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Cash Requests</h1>
          <p className="text-slate-500 text-sm mt-1">
            Monthly collection — requests on the 24th, justifications &amp; expense sheets alongside
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={refresh} disabled={refreshing}
            className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-500 transition-colors">
            <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
          </button>
          <button onClick={() => setShowModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors">
            <Plus className="w-4 h-4" /> New Cycle
          </button>
        </div>
      </div>

      {cycles.length === 0 && (
        <div className="text-center py-16 bg-white border border-dashed border-slate-200 rounded-2xl">
          <FileSpreadsheet className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-600 font-medium">No cash request cycles yet</p>
          <button onClick={() => setShowModal(true)}
            className="mt-4 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors">
            Create First Cycle
          </button>
        </div>
      )}

      {cycles.map((cycle) => (
        <CycleCard key={cycle.id} cycle={cycle} onRefresh={refresh} />
      ))}

      {showModal && (
        <NewCycleModal onClose={() => setShowModal(false)} onCreated={refresh} />
      )}
    </div>
  );
}
