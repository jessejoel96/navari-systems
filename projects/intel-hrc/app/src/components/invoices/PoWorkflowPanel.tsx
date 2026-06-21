"use client";

import { useState, useEffect } from "react";
import { Loader2, CheckCircle2, Link2, FilePlus } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { poRequiredForInvoice, PO_WORKFLOW_STEPS } from "@/lib/invoices/po-workflow";

type PO = {
  id: string;
  po_number: string;
  amount: number;
  proforma_number: string | null;
  status: string;
  description: string | null;
};

export function PoWorkflowPanel({
  invoice,
  onUpdated,
}: {
  invoice: Record<string, any>;
  onUpdated: () => void;
}) {
  const [pos, setPos] = useState<PO[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedPo, setSelectedPo] = useState("");
  const [showCreatePo, setShowCreatePo] = useState(false);
  const [poForm, setPoForm] = useState({
    po_number: "",
    proforma_number: invoice.proforma_number ?? "",
    amount: String(invoice.gross_amount ?? ""),
    description: invoice.description ?? "",
  });
  const [error, setError] = useState<string | null>(null);

  const poRequired = poRequiredForInvoice(invoice);

  useEffect(() => {
    if (!poRequired || !invoice.entity_id) return;
    fetch(`/api/purchase-orders?entity_id=${invoice.entity_id}&status=po_created`)
      .then((r) => r.json())
      .then(setPos)
      .catch(() => setPos([]));
  }, [invoice.entity_id, poRequired]);

  if (!poRequired) {
    return (
      <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-5">
        <h2 className="text-sm font-semibold text-blue-800">Purchase Order</h2>
        <p className="mt-2 text-sm text-blue-700">
          Recurring invoice — PO matching is not required.
        </p>
      </div>
    );
  }

  async function createPo() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/purchase-orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entity_id: invoice.entity_id,
          supplier_id: invoice.supplier_id,
          po_number: poForm.po_number,
          proforma_number: poForm.proforma_number || null,
          amount: parseInt(poForm.amount, 10),
          description: poForm.description,
          status: "po_created",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSelectedPo(data.id);
      setPos((p) => [data, ...p]);
      setShowCreatePo(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
    } finally {
      setLoading(false);
    }
  }

  async function matchPo(force = false) {
    if (!selectedPo) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/invoices/${invoice.id}/po-match`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ purchase_order_id: selectedPo, force }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.can_force && confirm(`Amount mismatch (invoice ${data.invoice_amount} vs PO ${data.po_amount}). Force match?`)) {
          return matchPo(true);
        }
        throw new Error(data.error);
      }
      onUpdated();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-xl border border-amber-100 bg-amber-50/30 p-5 space-y-4">
      <div>
        <h2 className="text-sm font-semibold text-gray-800">Pre-invoice PO Workflow</h2>
        <p className="text-xs text-gray-500 mt-1">
          Proforma → PO created → sent to supplier → invoice received → match PO
        </p>
      </div>

      <ol className="grid grid-cols-1 sm:grid-cols-5 gap-2 text-[11px]">
        {PO_WORKFLOW_STEPS.map((s) => (
          <li key={s.step} className="rounded-lg border border-amber-100 bg-white px-2 py-2 text-center text-gray-600">
            <span className="font-bold text-amber-700">{s.step}.</span> {s.label}
          </li>
        ))}
      </ol>

      {invoice.po_matched ? (
        <div className="flex items-center gap-2 text-sm text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-lg px-3 py-2">
          <CheckCircle2 className="h-4 w-4" />
          Matched to PO {invoice.po_number}
        </div>
      ) : (
        <>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setShowCreatePo((v) => !v)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50"
            >
              <FilePlus className="h-3.5 w-3.5" /> Create PO from proforma
            </button>
          </div>

          {showCreatePo && (
            <div className="grid grid-cols-2 gap-3 rounded-lg border border-gray-200 bg-white p-4">
              <label className="text-xs text-gray-500 col-span-2 sm:col-span-1">
                Proforma #
                <input className="mt-1 w-full rounded border px-2 py-1.5 text-sm" value={poForm.proforma_number}
                  onChange={(e) => setPoForm((p) => ({ ...p, proforma_number: e.target.value }))} />
              </label>
              <label className="text-xs text-gray-500 col-span-2 sm:col-span-1">
                PO #
                <input className="mt-1 w-full rounded border px-2 py-1.5 text-sm" value={poForm.po_number}
                  onChange={(e) => setPoForm((p) => ({ ...p, po_number: e.target.value }))} />
              </label>
              <label className="text-xs text-gray-500">
                PO Amount (XAF)
                <input type="number" className="mt-1 w-full rounded border px-2 py-1.5 text-sm" value={poForm.amount}
                  onChange={(e) => setPoForm((p) => ({ ...p, amount: e.target.value }))} />
              </label>
              <div className="flex items-end">
                <button type="button" onClick={createPo} disabled={loading || !poForm.po_number}
                  className="rounded-lg bg-brand-blue px-3 py-2 text-xs font-medium text-white disabled:opacity-50">
                  Save PO
                </button>
              </div>
            </div>
          )}

          <div className="flex flex-wrap items-end gap-2">
            <label className="text-xs text-gray-500 flex-1 min-w-[200px]">
              Link to existing PO
              <select className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                value={selectedPo} onChange={(e) => setSelectedPo(e.target.value)}>
                <option value="">— Select PO —</option>
                {pos.map((po) => (
                  <option key={po.id} value={po.id}>
                    {po.po_number} · {formatCurrency(po.amount)}
                    {po.proforma_number ? ` · Proforma ${po.proforma_number}` : ""}
                  </option>
                ))}
              </select>
            </label>
            <button type="button" onClick={() => matchPo()} disabled={loading || !selectedPo}
              className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-medium text-white disabled:opacity-50">
              {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Link2 className="h-3.5 w-3.5" />}
              Match invoice to PO
            </button>
          </div>
        </>
      )}

      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
