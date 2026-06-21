"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  Plus,
  Search,
} from "lucide-react";
import { formatCurrency, formatDate, getStatusColor, getStatusLabel } from "@/lib/utils";

interface InvoiceListProps {
  invoices: any[];
  entities: any[];
}

export function InvoiceList({ invoices, entities }: InvoiceListProps) {
  const [search, setSearch] = useState("");
  const [entityFilter, setEntityFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  // Defer filter inputs until after mount — avoids hydration mismatch when
  // browser extensions inject attributes (e.g. data-sharkid) into form fields.
  const [filtersReady, setFiltersReady] = useState(false);
  useEffect(() => setFiltersReady(true), []);

  const filtered = invoices.filter((inv) => {
    const matchSearch =
      !search ||
      inv.description?.toLowerCase().includes(search.toLowerCase()) ||
      inv.invoice_number?.toLowerCase().includes(search.toLowerCase()) ||
      inv.suppliers?.name?.toLowerCase().includes(search.toLowerCase());
    const matchEntity =
      entityFilter === "all" || inv.entity_id === entityFilter;
    const matchStatus =
      statusFilter === "all" || inv.status === statusFilter;
    return matchSearch && matchEntity && matchStatus;
  });

  const statuses = [...new Set(invoices.map((i) => i.status))];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Invoice Inbox</h1>
          <p className="mt-1 text-sm text-gray-500">
            {invoices.length} invoice{invoices.length !== 1 ? "s" : ""} total
          </p>
        </div>
        <Link
          href="/invoices/new"
          className="flex items-center gap-2 rounded-lg bg-brand-blue px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-brand-blue-deep"
        >
          <Plus className="h-4 w-4" />
          Upload Invoice
        </Link>
      </div>

      {/* Filters — client-only to avoid extension-injected attribute hydration mismatches */}
      {filtersReady ? (
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search invoices..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-800 outline-none transition-colors focus:border-brand-blue focus:ring-1 focus:ring-brand-blue/20"
            />
          </div>
          <select
            value={entityFilter}
            onChange={(e) => setEntityFilter(e.target.value)}
            className="rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-700 outline-none focus:border-brand-blue"
          >
            <option value="all">All Entities</option>
            {entities.map((ent: any) => (
              <option key={ent.id} value={ent.id}>
                {ent.name}
              </option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-700 outline-none focus:border-brand-blue"
          >
            <option value="all">All Statuses</option>
            {statuses.map((s) => (
              <option key={s} value={s}>
                {getStatusLabel(s)}
              </option>
            ))}
          </select>
        </div>
      ) : (
        <div className="flex items-center gap-3" aria-hidden>
          <div className="h-[42px] flex-1 rounded-lg border border-gray-200 bg-gray-50" />
          <div className="h-[42px] w-36 rounded-lg border border-gray-200 bg-gray-50" />
          <div className="h-[42px] w-36 rounded-lg border border-gray-200 bg-gray-50" />
        </div>
      )}

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-gray-100 bg-white">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center py-20 text-center">
            <FileText className="h-12 w-12 text-gray-200" />
            <p className="mt-4 text-sm font-medium text-gray-500">No invoices found</p>
            <p className="mt-1 text-xs text-gray-400">
              {invoices.length === 0
                ? "Upload your first invoice to get started"
                : "Try adjusting your filters"}
            </p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50 text-left">
                <th className="px-5 py-3 text-xs font-medium text-gray-500">Invoice</th>
                <th className="px-5 py-3 text-xs font-medium text-gray-500">Entity</th>
                <th className="px-5 py-3 text-xs font-medium text-gray-500">Supplier</th>
                <th className="px-5 py-3 text-xs font-medium text-gray-500">Date</th>
                <th className="px-5 py-3 text-right text-xs font-medium text-gray-500">Amount</th>
                <th className="px-5 py-3 text-xs font-medium text-gray-500">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              <AnimatePresence>
                {filtered.map((inv: any, i: number) => (
                  <motion.tr
                    key={inv.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className="group transition-colors hover:bg-gray-50"
                  >
                    <td className="px-5 py-3.5">
                      <Link
                        href={`/invoices/${inv.id}`}
                        className="font-medium text-gray-800 group-hover:text-brand-blue"
                      >
                        {inv.description || inv.invoice_number || "Untitled"}
                      </Link>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="inline-flex items-center gap-1.5 text-gray-600">
                        <span className="flex h-5 w-5 items-center justify-center rounded bg-brand-green-light text-[10px] font-semibold text-brand-green">
                          {inv.entities?.code?.slice(0, 2) ?? "—"}
                        </span>
                        {inv.entities?.code ?? "—"}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-gray-600">
                      {inv.suppliers?.name ?? "—"}
                    </td>
                    <td className="px-5 py-3.5 text-gray-500">
                      {inv.invoice_date ? formatDate(inv.invoice_date) : "—"}
                    </td>
                    <td className="px-5 py-3.5 text-right font-medium text-gray-800">
                      {formatCurrency(inv.gross_amount, inv.currency)}
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`inline-block rounded-full px-2.5 py-1 text-[11px] font-medium ${getStatusColor(
                          inv.status
                        )}`}
                      >
                        {getStatusLabel(inv.status)}
                      </span>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
