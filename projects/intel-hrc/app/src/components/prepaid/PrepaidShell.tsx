"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Plus, Download, RefreshCw, CheckCircle, Clock,
  ChevronDown, ChevronRight, Calendar, FileText, Mail, ShieldCheck,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { AppPageHeader } from "@/components/layout/AppPageHeader";

type Entity = { id: string; name: string; code: string };
type Supplier = { id: string; name: string; aux_code: string };

type ScheduleLine = {
  id: string;
  period_month: number;
  period_year: number;
  amount: number;
  label: string;
  status: string;
  scheduled_date: string;
};

type Contract = {
  id: string;
  label: string;
  description: string | null;
  prepaid_category: "rent" | "company" | "client";
  prepaid_account: string;
  release_account: string;
  total_amount: number;
  has_vat: boolean;
  vat_amount: number;
  coverage_start: string;
  coverage_end: string;
  step1_status: string;
  status: string;
  monthly_post_day: number;
  entities: { name: string; code: string } | null;
  suppliers: { name: string; aux_code: string } | null;
  prepaid_schedule_lines: ScheduleLine[];
};

const CATEGORY_LABEL: Record<string, string> = {
  rent: "Rent (47601)",
  company: "Company (47603)",
  client: "Client (47602)",
};

const CATEGORY_COLOR: Record<string, string> = {
  rent: "bg-purple-100 text-purple-700",
  company: "bg-blue-100 text-blue-700",
  client: "bg-amber-100 text-amber-700",
};

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

function fmt(n: number) {
  return n.toLocaleString("fr-FR") + " XAF";
}

function lineStatusColor(s: string) {
  if (s === "sage_imported") return "text-emerald-600";
  if (s === "exported") return "text-blue-600";
  return "text-slate-400";
}

function NewContractModal({
  entities,
  suppliers,
  onClose,
  onCreated,
}: {
  entities: Entity[];
  suppliers: Supplier[];
  onClose: () => void;
  onCreated: () => void;
}) {
  const year = new Date().getFullYear();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    entity_id: entities[0]?.id ?? "",
    supplier_id: "",
    label: "",
    description: "",
    prepaid_category: "company" as "rent" | "company" | "client",
    release_account: "",
    total_amount: "",
    has_vat: false,
    vat_amount: "",
    coverage_start: `${year}-01-01`,
    coverage_end: `${year}-12-31`,
    monthly_post_day: "22",
  });

  async function submit() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/prepaid/contracts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          total_amount: parseInt(form.total_amount, 10),
          vat_amount: form.has_vat ? parseInt(form.vat_amount || "0", 10) : 0,
          monthly_post_day: parseInt(form.monthly_post_day, 10),
          supplier_id: form.supplier_id || undefined,
          release_account: form.release_account || undefined,
        }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error ?? "Failed");
      onCreated();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    } finally {
      setLoading(false);
    }
  }

  const entitySuppliers = suppliers.filter((s) => !form.entity_id || true);

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-lg my-8">
        <h2 className="text-lg font-bold text-slate-800 mb-4">New Prepaid Contract</h2>

        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-slate-500">Entity</label>
            <select value={form.entity_id} onChange={(e) => setForm({ ...form, entity_id: e.target.value })}
              className="w-full mt-1 border border-slate-200 rounded-lg px-3 py-2 text-sm">
              {entities.map((e) => <option key={e.id} value={e.id}>{e.name} ({e.code})</option>)}
            </select>
          </div>

          <div>
            <label className="text-xs font-medium text-slate-500">Supplier (optional)</label>
            <select value={form.supplier_id} onChange={(e) => setForm({ ...form, supplier_id: e.target.value })}
              className="w-full mt-1 border border-slate-200 rounded-lg px-3 py-2 text-sm">
              <option value="">— Select supplier —</option>
              {entitySuppliers.map((s) => <option key={s.id} value={s.id}>{s.name} ({s.aux_code})</option>)}
            </select>
          </div>

          <div>
            <label className="text-xs font-medium text-slate-500">Label</label>
            <input value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })}
              placeholder="e.g. SUNLIFE INSURANCE CANADA - Insurance DNF"
              className="w-full mt-1 border border-slate-200 rounded-lg px-3 py-2 text-sm" />
          </div>

          <div>
            <label className="text-xs font-medium text-slate-500">Category</label>
            <select value={form.prepaid_category} onChange={(e) => setForm({ ...form, prepaid_category: e.target.value as typeof form.prepaid_category })}
              className="w-full mt-1 border border-slate-200 rounded-lg px-3 py-2 text-sm">
              <option value="rent">Rent → 47601 / Dr 622x monthly</option>
              <option value="company">Company cost → 47603 / Dr 6xx monthly</option>
              <option value="client">Client expense → 47602 / Dr 4711 monthly</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-medium text-slate-500">Release account override (optional)</label>
            <input value={form.release_account} onChange={(e) => setForm({ ...form, release_account: e.target.value })}
              placeholder="e.g. 6251100, 6222100, 4711"
              className="w-full mt-1 border border-slate-200 rounded-lg px-3 py-2 text-sm" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-slate-500">Total amount (XAF)</label>
              <input type="number" value={form.total_amount} onChange={(e) => setForm({ ...form, total_amount: e.target.value })}
                className="w-full mt-1 border border-slate-200 rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500">Post day (monthly)</label>
              <input type="number" min={1} max={28} value={form.monthly_post_day}
                onChange={(e) => setForm({ ...form, monthly_post_day: e.target.value })}
                className="w-full mt-1 border border-slate-200 rounded-lg px-3 py-2 text-sm" />
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm text-slate-600">
            <input type="checkbox" checked={form.has_vat} onChange={(e) => setForm({ ...form, has_vat: e.target.checked })} />
            Invoice has VAT (Step 1: Dr 476 + Dr 445 / Cr 401)
          </label>

          {form.has_vat && (
            <div>
              <label className="text-xs font-medium text-slate-500">VAT amount (XAF)</label>
              <input type="number" value={form.vat_amount} onChange={(e) => setForm({ ...form, vat_amount: e.target.value })}
                className="w-full mt-1 border border-slate-200 rounded-lg px-3 py-2 text-sm" />
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-slate-500">Coverage start</label>
              <input type="date" value={form.coverage_start} onChange={(e) => setForm({ ...form, coverage_start: e.target.value })}
                className="w-full mt-1 border border-slate-200 rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500">Coverage end</label>
              <input type="date" value={form.coverage_end} onChange={(e) => setForm({ ...form, coverage_end: e.target.value })}
                className="w-full mt-1 border border-slate-200 rounded-lg px-3 py-2 text-sm" />
            </div>
          </div>
        </div>

        {error && <p className="text-red-600 text-xs mt-3">{error}</p>}

        <div className="flex gap-2 mt-5">
          <button onClick={onClose} className="flex-1 py-2 border border-slate-200 rounded-lg text-sm text-slate-600">Cancel</button>
          <button onClick={submit} disabled={loading || !form.label || !form.total_amount}
            className="flex-1 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold disabled:opacity-50">
            {loading ? "Creating…" : "Create & Build Schedule"}
          </button>
        </div>
      </div>
    </div>
  );
}

function ContractRow({ contract, onRefresh }: { contract: Contract; onRefresh: () => void }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState<string | null>(null);

  const entity = Array.isArray(contract.entities) ? contract.entities[0] : contract.entities;
  const supplier = Array.isArray(contract.suppliers) ? contract.suppliers[0] : contract.suppliers;
  const lines = contract.prepaid_schedule_lines ?? [];
  const imported = lines.filter((l) => l.status === "sage_imported").length;

  async function exportStep1() {
    setLoading("step1");
    try {
      const res = await fetch(`/api/prepaid/contracts/${contract.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "export_initial" }),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error); }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `prepaid-step1-${contract.label.slice(0, 30)}.txt`;
      a.click();
      URL.revokeObjectURL(url);
      onRefresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error");
    } finally {
      setLoading(null);
    }
  }

  async function confirmStep1() {
    await fetch(`/api/prepaid/contracts/${contract.id}/confirm-step1`, { method: "POST" });
    onRefresh();
  }

  async function confirmLine(lineId: string) {
    await fetch(`/api/prepaid/schedule/${lineId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "sage_imported" }),
    });
    onRefresh();
  }

  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden mb-3">
      <button onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-slate-50">
        {open ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-sm text-slate-800 truncate">{contract.label}</span>
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${CATEGORY_COLOR[contract.prepaid_category]}`}>
              {CATEGORY_LABEL[contract.prepaid_category]}
            </span>
            {contract.step1_status === "sage_imported" && (
              <span className="text-xs text-emerald-600 flex items-center gap-0.5"><CheckCircle className="w-3 h-3" /> Step 1 in Sage</span>
            )}
          </div>
          <div className="text-xs text-slate-500 mt-0.5">
            {entity?.code} · {fmt(contract.total_amount)} · {imported}/{lines.length} months posted
            {supplier && ` · ${supplier.name}`}
          </div>
        </div>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="border-t border-slate-100 px-4 py-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs mb-4">
                <div><span className="text-slate-400">Prepaid GL</span><p className="font-mono font-medium">{contract.prepaid_account}</p></div>
                <div><span className="text-slate-400">Release GL</span><p className="font-mono font-medium">{contract.release_account}</p></div>
                <div><span className="text-slate-400">Coverage</span><p>{contract.coverage_start} → {contract.coverage_end}</p></div>
                <div><span className="text-slate-400">Monthly post</span><p>Day {contract.monthly_post_day}</p></div>
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                <button onClick={exportStep1} disabled={!!loading}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-lg disabled:opacity-50">
                  <Download className="w-3.5 h-3.5" />
                  {loading === "step1" ? "Generating…" : "Step 1: Export Initial (.txt)"}
                </button>
                {contract.step1_status === "exported" && (
                  <button onClick={confirmStep1}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white text-xs font-medium rounded-lg">
                    <CheckCircle className="w-3.5 h-3.5" /> Confirm Step 1 in Sage
                  </button>
                )}
              </div>

              <p className="text-xs font-semibold text-slate-500 mb-2">Monthly schedule (Step 2 — OPD on 22nd)</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                {lines.sort((a, b) => a.period_month - b.period_month).map((line) => (
                  <div key={line.id}
                    className={`rounded-lg border p-2 text-xs ${line.status === "sage_imported" ? "border-emerald-200 bg-emerald-50" : "border-slate-200 bg-white"}`}>
                    <div className="font-medium text-slate-700">{MONTHS[line.period_month - 1]} {line.period_year}</div>
                    <div className="text-slate-600">{line.amount.toLocaleString("fr-FR")}</div>
                    <div className={`mt-1 ${lineStatusColor(line.status)}`}>{line.status}</div>
                    {line.status !== "sage_imported" && (
                      <button onClick={() => confirmLine(line.id)}
                        className="mt-1 text-[10px] text-blue-600 hover:underline">
                        Mark imported
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function PrepaidShell({
  initialContracts,
  entities,
  suppliers,
}: {
  initialContracts: Contract[];
  entities: Entity[];
  suppliers: Supplier[];
}) {
  const [contracts, setContracts] = useState(initialContracts);
  const [showModal, setShowModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [exportMonth, setExportMonth] = useState(new Date().getMonth() + 1);
  const [exportYear, setExportYear] = useState(new Date().getFullYear());
  const [exportEntity, setExportEntity] = useState("");
  const [exporting, setExporting] = useState(false);
  const [reviewStatus, setReviewStatus] = useState<string | null>(null);
  const [reviewLoading, setReviewLoading] = useState<string | null>(null);
  const [reviewMessage, setReviewMessage] = useState<string | null>(null);

  const loadReviewStatus = useCallback(async () => {
    const res = await fetch(`/api/prepaid/monthly-review?month=${exportMonth}&year=${exportYear}`);
    if (res.ok) {
      const data = await res.json();
      setReviewStatus(data?.status ?? null);
    }
  }, [exportMonth, exportYear]);

  useEffect(() => {
    loadReviewStatus();
  }, [loadReviewStatus]);

  async function compileCfoSummary() {
    setReviewLoading("compile");
    setReviewMessage(null);
    try {
      const res = await fetch("/api/prepaid/monthly-review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "compile", month: exportMonth, year: exportYear }),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error);
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `prepaid-cfo-summary-${exportMonth}-${exportYear}.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
      setReviewStatus("draft");
      setReviewMessage("Summary compiled — review before validating.");
    } catch (err) {
      setReviewMessage(err instanceof Error ? err.message : "Compile failed");
    } finally {
      setReviewLoading(null);
    }
  }

  async function validateCfoSummary() {
    setReviewLoading("validate");
    setReviewMessage(null);
    try {
      const res = await fetch("/api/prepaid/monthly-review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "validate",
          month: exportMonth,
          year: exportYear,
          validated_by: "Tina-Randa",
        }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error);
      setReviewStatus("validated");
      setReviewMessage("Validated — ready to send to CFO.");
    } catch (err) {
      setReviewMessage(err instanceof Error ? err.message : "Validation failed");
    } finally {
      setReviewLoading(null);
    }
  }

  async function sendCfoSummary() {
    if (!confirm("Send validated prepaid summary to CFO?")) return;
    setReviewLoading("send");
    setReviewMessage(null);
    try {
      const res = await fetch("/api/prepaid/monthly-review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "send_to_cfo", month: exportMonth, year: exportYear }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error);
      setReviewStatus("sent_to_cfo");
      setReviewMessage(`Sent to ${d.sent_to}`);
    } catch (err) {
      setReviewMessage(err instanceof Error ? err.message : "Send failed");
    } finally {
      setReviewLoading(null);
    }
  }

  const reviewBadge = (status: string | null) => {
    const cfg: Record<string, string> = {
      draft: "bg-amber-50 text-amber-700",
      validated: "bg-emerald-50 text-emerald-700",
      sent_to_cfo: "bg-blue-50 text-blue-700",
    };
    const label = status?.replace(/_/g, " ") ?? "not started";
    return (
      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-medium capitalize ${cfg[status ?? ""] ?? "bg-slate-100 text-slate-600"}`}>
        {label}
      </span>
    );
  };

  async function refresh() {
    setRefreshing(true);
    try {
      const res = await fetch(`/api/prepaid/contracts?year=${exportYear}`);
      if (res.ok) setContracts(await res.json());
    } finally {
      setRefreshing(false);
    }
  }

  async function exportMonthly() {
    setExporting(true);
    try {
      const res = await fetch("/api/prepaid/export-monthly", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          month: exportMonth,
          year: exportYear,
          entity_id: exportEntity || undefined,
        }),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error); }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `prepaid-opd-${MONTHS[exportMonth - 1]}-${exportYear}.txt`;
      a.click();
      URL.revokeObjectURL(url);
      refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error");
    } finally {
      setExporting(false);
    }
  }

  const activeCount = contracts.filter((c) => c.status === "active").length;
  const pendingStep1 = contracts.filter((c) => c.step1_status === "pending").length;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <AppPageHeader
        title="Prepaid Expenses"
        description="Step 1: Dr 476 / Cr 401 · Step 2: monthly OPD on the 22nd · AP ends at Sage import"
        className="mb-6"
      >
        <div className="flex gap-2">
          <button onClick={refresh} disabled={refreshing}
            className="rounded-lg border border-white/25 bg-white/10 p-2 text-white hover:bg-white/20">
            <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
          </button>
          <button onClick={() => setShowModal(true)}
            className="flex items-center gap-1.5 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-brand-blue-deep hover:bg-blue-50">
            <Plus className="w-4 h-4" /> New Prepaid
          </button>
        </div>
      </AppPageHeader>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <p className="text-xs text-slate-400">Active contracts</p>
          <p className="text-2xl font-bold text-slate-800">{activeCount}</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <p className="text-xs text-slate-400">Pending Step 1</p>
          <p className="text-2xl font-bold text-amber-600">{pendingStep1}</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <p className="text-xs text-slate-400">Categories</p>
          <p className="text-xs mt-1 text-slate-600">47601 Rent · 47603 Company · 47602 Client→4711</p>
        </div>
      </div>

      {/* Monthly batch export */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Calendar className="w-4 h-4 text-blue-600" />
          <h2 className="text-sm font-semibold text-slate-800">Step 2 — Monthly OPD Batch</h2>
        </div>
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <label className="text-xs text-slate-500">Month</label>
            <select value={exportMonth} onChange={(e) => setExportMonth(Number(e.target.value))}
              className="block mt-1 border border-slate-200 rounded-lg px-3 py-2 text-sm">
              {MONTHS.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-slate-500">Year</label>
            <input type="number" value={exportYear} onChange={(e) => setExportYear(Number(e.target.value))}
              className="block mt-1 w-24 border border-slate-200 rounded-lg px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="text-xs text-slate-500">Entity (optional)</label>
            <select value={exportEntity} onChange={(e) => setExportEntity(e.target.value)}
              className="block mt-1 border border-slate-200 rounded-lg px-3 py-2 text-sm">
              <option value="">All entities</option>
              {entities.map((e) => <option key={e.id} value={e.id}>{e.code}</option>)}
            </select>
          </div>
          <button onClick={exportMonthly} disabled={exporting}
            className="flex items-center gap-1.5 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold rounded-lg disabled:opacity-50">
            <FileText className="w-4 h-4" />
            {exporting ? "Generating…" : "Download OPD .txt"}
          </button>
        </div>
        <p className="text-xs text-slate-400 mt-2 flex items-center gap-1">
          <Clock className="w-3 h-3" /> Schedule lines post on the 22nd · Dr 6xx or 4711 / Cr 476xx
        </p>
      </div>

      {/* CFO monthly review */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 mb-6">
        <div className="flex items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-violet-600" />
            <h2 className="text-sm font-semibold text-slate-800">CFO Monthly Amortization Summary</h2>
          </div>
          {reviewBadge(reviewStatus)}
        </div>
        <p className="text-xs text-slate-500 mb-3">
          Compile Excel summary for {MONTHS[exportMonth - 1]} {exportYear}, validate amounts, then send to CFO.
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={compileCfoSummary}
            disabled={!!reviewLoading}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 text-white text-xs font-semibold rounded-lg disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            {reviewLoading === "compile" ? "Compiling…" : "1. Compile Summary"}
          </button>
          <button
            onClick={validateCfoSummary}
            disabled={!!reviewLoading || !reviewStatus}
            className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 text-white text-xs font-semibold rounded-lg disabled:opacity-50"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            {reviewLoading === "validate" ? "Validating…" : "2. Validate"}
          </button>
          <button
            onClick={sendCfoSummary}
            disabled={!!reviewLoading || reviewStatus !== "validated"}
            className="flex items-center gap-1.5 px-3 py-2 bg-violet-600 text-white text-xs font-semibold rounded-lg disabled:opacity-50"
          >
            <Mail className="w-3.5 h-3.5" />
            {reviewLoading === "send" ? "Sending…" : "3. Send to CFO"}
          </button>
        </div>
        {reviewMessage && (
          <p className="text-xs text-slate-600 mt-2">{reviewMessage}</p>
        )}
      </div>

      {/* Contract list */}
      {contracts.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-slate-200 rounded-2xl">
          <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-600 font-medium">No prepaid contracts yet</p>
          <p className="text-sm text-slate-400 mt-1">Create from an annual invoice (insurance, rent, incorporation fees)</p>
        </div>
      ) : (
        contracts.map((c) => <ContractRow key={c.id} contract={c} onRefresh={refresh} />)
      )}

      {showModal && (
        <NewContractModal
          entities={entities}
          suppliers={suppliers}
          onClose={() => setShowModal(false)}
          onCreated={refresh}
        />
      )}
    </div>
  );
}
