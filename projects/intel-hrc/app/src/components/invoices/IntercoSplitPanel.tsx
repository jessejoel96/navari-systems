"use client";

import { useState, useEffect } from "react";
import { Loader2, Save, Percent } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

type IntercoCode = {
  id: string;
  code: string;
  gl_account: string;
  entities: { id: string; name: string; code: string } | null;
};

type Row = {
  interco_code_id: string;
  entity_id: string;
  code: string;
  entityName: string;
  allocation_ratio: number;
};

export function IntercoSplitPanel({
  invoiceId,
  grossAmount,
  intercoCodes,
  onSaved,
}: {
  invoiceId: string;
  grossAmount: number;
  intercoCodes: IntercoCode[];
  onSaved: () => void;
}) {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/invoices/${invoiceId}/interco`)
      .then((r) => r.json())
      .then((data: Array<{
        interco_code_id: string;
        entity_id: string;
        allocation_ratio: number;
        interco_codes: { code: string } | null;
        entities: { name: string; code: string } | null;
      }>) => {
        if (Array.isArray(data) && data.length > 0) {
          setRows(data.map((a) => ({
            interco_code_id: a.interco_code_id,
            entity_id: a.entity_id,
            code: a.interco_codes?.code ?? "—",
            entityName: a.entities?.name ?? "—",
            allocation_ratio: Number(a.allocation_ratio) || 0,
          })));
        }
      })
      .catch(() => {});
  }, [invoiceId]);

  function addRow(code: IntercoCode) {
    if (rows.some((r) => r.interco_code_id === code.id)) return;
    const entity = Array.isArray(code.entities) ? code.entities[0] : code.entities;
    setRows((prev) => [
      ...prev,
      {
        interco_code_id: code.id,
        entity_id: entity?.id ?? code.id,
        code: code.code,
        entityName: entity?.name ?? code.code,
        allocation_ratio: 0,
      },
    ]);
  }

  function updateRatio(id: string, value: number) {
    setRows((prev) => prev.map((r) => (r.interco_code_id === id ? { ...r, allocation_ratio: value } : r)));
  }

  const totalRatio = rows.reduce((s, r) => s + r.allocation_ratio, 0);

  async function save() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/invoices/${invoiceId}/interco`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          allocations: rows.map((r) => ({
            entity_id: r.entity_id,
            interco_code_id: r.interco_code_id,
            allocation_ratio: r.allocation_ratio,
          })),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      onSaved();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-xl border border-violet-100 bg-violet-50/30 p-5 space-y-4">
      <div>
        <h2 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
          <Percent className="h-4 w-4 text-violet-600" />
          Intercompany Split (manual ratios)
        </h2>
        <p className="text-xs text-gray-500 mt-1">
          Set allocation % per entity for this invoice. Ratios must total 100%.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {intercoCodes.map((ic) => {
          const ent = Array.isArray(ic.entities) ? ic.entities[0] : ic.entities;
          return (
            <button
              key={ic.id}
              type="button"
              onClick={() => addRow(ic)}
              className="rounded-full border border-violet-200 bg-white px-3 py-1 text-xs font-medium text-violet-700 hover:bg-violet-50"
            >
              + {ic.code} ({ent?.code})
            </button>
          );
        })}
      </div>

      {rows.length > 0 && (
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-gray-500 border-b">
              <th className="py-2">INC</th>
              <th className="py-2">Entity</th>
              <th className="py-2 text-right">Ratio %</th>
              <th className="py-2 text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.interco_code_id} className="border-b border-violet-50">
                <td className="py-2 font-mono text-violet-700">{r.code}</td>
                <td className="py-2">{r.entityName}</td>
                <td className="py-2 text-right">
                  <input
                    type="number"
                    min={0}
                    max={100}
                    step={0.01}
                    value={r.allocation_ratio}
                    onChange={(e) => updateRatio(r.interco_code_id, parseFloat(e.target.value) || 0)}
                    className="w-20 rounded border px-2 py-1 text-right text-sm"
                  />
                </td>
                <td className="py-2 text-right text-gray-700">
                  {formatCurrency(Math.round((grossAmount * r.allocation_ratio) / 100))}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={2} className="pt-2 text-xs font-medium text-gray-600">Total</td>
              <td className={`pt-2 text-right text-xs font-bold ${Math.abs(totalRatio - 100) < 0.01 ? "text-emerald-600" : "text-red-600"}`}>
                {totalRatio.toFixed(2)}%
              </td>
              <td className="pt-2 text-right text-xs font-medium">{formatCurrency(grossAmount)}</td>
            </tr>
          </tfoot>
        </table>
      )}

      <button type="button" onClick={save} disabled={loading || rows.length === 0}
        className="inline-flex items-center gap-1.5 rounded-lg bg-violet-600 px-4 py-2 text-xs font-medium text-white disabled:opacity-50">
        {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
        Save split
      </button>

      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
