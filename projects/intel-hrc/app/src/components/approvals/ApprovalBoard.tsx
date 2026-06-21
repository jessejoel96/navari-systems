"use client";

import { motion } from "framer-motion";
import {
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  FileText,
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";

interface ApprovalBoardProps {
  approvals: any[];
}

const columns = [
  { key: "pending", label: "Pending", icon: Clock, color: "text-amber-500" },
  { key: "approved", label: "Approved", icon: CheckCircle2, color: "text-emerald-500" },
  { key: "rejected", label: "Rejected", icon: XCircle, color: "text-red-500" },
  { key: "correction_requested", label: "Correction", icon: AlertTriangle, color: "text-orange-500" },
];

export function ApprovalBoard({ approvals }: ApprovalBoardProps) {
  if (approvals.length === 0) {
    return (
      <div className="flex flex-col items-center rounded-xl border border-gray-100 bg-white py-20 text-center">
        <CheckCircle2 className="h-12 w-12 text-gray-200" />
        <p className="mt-4 text-sm font-medium text-gray-500">
          No approval requests yet
        </p>
        <p className="mt-1 text-xs text-gray-400">
          Send an invoice for CFO approval to see it here
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-4 gap-4">
      {columns.map((col) => {
        const items = approvals.filter((a) => a.decision === col.key);
        return (
          <div key={col.key} className="space-y-3">
            <div className="flex items-center gap-2">
              <col.icon className={`h-4 w-4 ${col.color}`} />
              <h3 className="text-sm font-medium text-gray-700">{col.label}</h3>
              <span className="ml-auto rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500">
                {items.length}
              </span>
            </div>
            <div className="space-y-2">
              {items.map((a: any, i: number) => (
                <motion.div
                  key={a.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="rounded-lg border border-gray-100 bg-white p-4 transition-shadow hover:shadow-sm"
                >
                  <div className="flex items-start gap-3">
                    <FileText className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-gray-800">
                        {a.invoices?.description || a.invoices?.invoice_number || "Invoice"}
                      </p>
                      <p className="mt-0.5 text-xs text-gray-400">
                        {a.invoices?.entities?.code ?? "—"} · {formatDate(a.requested_at)}
                      </p>
                      {a.approver_role && (
                        <span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                          a.approver_role === "ceo" ? "bg-purple-50 text-purple-700" : "bg-blue-50 text-blue-700"
                        }`}>
                          {a.approver_role.toUpperCase()}
                        </span>
                      )}
                      <p className="mt-2 text-sm font-medium text-gray-700">
                        {formatCurrency(a.invoices?.gross_amount ?? 0)}
                      </p>
                      {a.reminder_count > 0 && (
                        <p className="mt-1 text-[10px] text-amber-500">
                          {a.reminder_count} reminder{a.reminder_count > 1 ? "s" : ""} sent
                        </p>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
              {items.length === 0 && (
                <p className="py-8 text-center text-xs text-gray-300">None</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
