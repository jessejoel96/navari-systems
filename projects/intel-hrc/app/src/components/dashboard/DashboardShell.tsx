"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  FileText,
  Clock,
  Download,
  CreditCard,
  AlertTriangle,
  Plus,
  ArrowRight,
  CheckCircle2,
  ListTodo,
  Bell,
  CalendarDays,
  AlertOctagon,
} from "lucide-react";
import { formatCurrency, getStatusColor, getStatusLabel, formatDate, cn } from "@/lib/utils";
import { AppPageHeader } from "@/components/layout/AppPageHeader";

type DashboardData = {
  totalInvoices: number;
  needsReview: number;
  pendingApproval: number;
  readyForExport: number;
  readyForPayment: number;
  overdue: number;
  completedThisWeek: number;
  sageExportedThisWeek: number;
  recentInvoices: any[];
  entities: any[];
  activeCycle: {
    id: string;
    label: string;
    status: string;
    deadline_date: string | null;
  } | null;
};

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};

const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

function nextWednesday(): Date {
  const now = new Date();
  const day = now.getDay();
  const daysUntil = day <= 3 ? 3 - day : 10 - day;
  const wed = new Date(now);
  wed.setDate(now.getDate() + daysUntil);
  wed.setHours(12, 0, 0, 0);
  return wed;
}

function nextFriday(): Date {
  const now = new Date();
  const day = now.getDay();
  const daysUntil = day <= 5 ? 5 - day : 12 - day;
  const fri = new Date(now);
  fri.setDate(now.getDate() + daysUntil);
  return fri;
}

function daysUntil(date: Date) {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const target = new Date(date);
  target.setHours(0, 0, 0, 0);
  return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

function formatShortDate(date: Date) {
  return date.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });
}

export function DashboardShell({ data }: { data: DashboardData }) {
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const wedCutoff = nextWednesday();
  const friPayment = nextFriday();
  const daysToCutoff = daysUntil(wedCutoff);
  const daysToPayment = daysUntil(friPayment);

  const todoItems = [
    data.needsReview > 0 && {
      label: `${data.needsReview} invoice${data.needsReview !== 1 ? "s" : ""} need review`,
      href: "/invoices?status=review",
      urgent: false,
    },
    data.pendingApproval > 0 && {
      label: `${data.pendingApproval} awaiting CFO approval`,
      href: "/approvals",
      urgent: false,
    },
    data.readyForExport > 0 && {
      label: `${data.readyForExport} ready for Sage export`,
      href: "/sage-exports",
      urgent: daysToCutoff <= 2,
    },
    data.readyForPayment > 0 && {
      label: `${data.readyForPayment} in payment queue`,
      href: "/payments",
      urgent: daysToCutoff <= 1,
    },
    data.activeCycle && {
      label: `Cash cycle "${data.activeCycle.label}" — ${data.activeCycle.status.replace(/_/g, " ")}`,
      href: "/cash-requests",
      urgent: data.activeCycle.status === "requests_sent",
    },
  ].filter(Boolean) as { label: string; href: string; urgent: boolean }[];

  const reminders = [
    {
      title: "Payment cut-off",
      detail: `Wednesday ${formatShortDate(wedCutoff)} at 12:00 — ${daysToCutoff} day${daysToCutoff !== 1 ? "s" : ""} away`,
      href: "/payments",
    },
    {
      title: "Payment execution",
      detail: `Friday ${formatShortDate(friPayment)} weekly run — ${daysToPayment} day${daysToPayment !== 1 ? "s" : ""} away`,
      href: "/payments",
    },
    {
      title: "Cash requests",
      detail: "Regional offices submit on the 24th of each month",
      href: "/cash-requests",
    },
  ];

  const bottlenecks = [
    data.overdue > 0 && {
      title: "Overdue CFO approvals",
      detail: `${data.overdue} pending more than 7 days`,
      href: "/approvals?filter=overdue",
      severity: "high" as const,
    },
    data.needsReview > 3 && {
      title: "Review backlog",
      detail: `${data.needsReview} invoices waiting in inbox`,
      href: "/invoices",
      severity: "medium" as const,
    },
    daysToCutoff <= 1 && data.readyForExport > 0 && {
      title: "Sage export before cut-off",
      detail: `${data.readyForExport} approved invoices not yet exported`,
      href: "/sage-exports",
      severity: "high" as const,
    },
  ].filter(Boolean) as {
    title: string;
    detail: string;
    href: string;
    severity: "high" | "medium";
  }[];

  const completedItems = [
    data.completedThisWeek > 0 && `${data.completedThisWeek} invoice step${data.completedThisWeek !== 1 ? "s" : ""} completed`,
    data.sageExportedThisWeek > 0 && `${data.sageExportedThisWeek} Sage export${data.sageExportedThisWeek !== 1 ? "s" : ""} done`,
  ].filter(Boolean) as string[];

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-8">
      <motion.div variants={item}>
        <AppPageHeader
          title={`${greeting}, Tina`}
          description="Your week at a glance — what's done, what's next, and what needs attention."
        >
          <Link
            href="/invoices/new"
            className="flex items-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-medium text-brand-blue-deep shadow-sm transition-colors hover:bg-blue-50"
          >
            <Plus className="h-4 w-4" />
            Upload Invoice
          </Link>
        </AppPageHeader>
      </motion.div>

      <div className="grid gap-4 lg:grid-cols-3">
        <motion.div variants={item} className="rounded-xl border border-green-100 bg-green-50/50 p-5">
          <div className="mb-3 flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-brand-green" />
            <h2 className="text-sm font-semibold text-gray-900">Completed this week</h2>
          </div>
          {completedItems.length === 0 ? (
            <p className="text-sm text-gray-500">No completed steps yet this week. Upload or approve an invoice to get started.</p>
          ) : (
            <ul className="space-y-2">
              {completedItems.map((line) => (
                <li key={line} className="flex items-center gap-2 text-sm text-gray-700">
                  <span className="h-1.5 w-1.5 rounded-full bg-brand-green" />
                  {line}
                </li>
              ))}
            </ul>
          )}
        </motion.div>

        <motion.div variants={item} className="rounded-xl border border-blue-100 bg-white p-5">
          <div className="mb-3 flex items-center gap-2">
            <ListTodo className="h-5 w-5 text-brand-blue" />
            <h2 className="text-sm font-semibold text-gray-900">Still to do</h2>
          </div>
          {todoItems.length === 0 ? (
            <p className="text-sm text-gray-500">You&apos;re caught up — nothing urgent in the queue.</p>
          ) : (
            <ul className="space-y-2">
              {todoItems.map((t) => (
                <li key={t.label}>
                  <Link
                    href={t.href}
                    className="flex items-center justify-between rounded-lg px-2 py-1.5 text-sm text-gray-700 transition-colors hover:bg-brand-blue-light hover:text-brand-blue"
                  >
                    <span>{t.label}</span>
                    {t.urgent ? (
                      <span className="text-[10px] font-medium text-amber-600">Soon</span>
                    ) : null}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </motion.div>

        <motion.div variants={item} className="rounded-xl border border-amber-100 bg-amber-50/40 p-5">
          <div className="mb-3 flex items-center gap-2">
            <Bell className="h-5 w-5 text-amber-600" />
            <h2 className="text-sm font-semibold text-gray-900">Reminders</h2>
          </div>
          <ul className="space-y-3">
            {reminders.map((r) => (
              <li key={r.title}>
                <Link href={r.href} className="block rounded-lg transition-colors hover:bg-white/60">
                  <p className="text-xs font-semibold text-gray-800">{r.title}</p>
                  <p className="text-xs text-gray-600">{r.detail}</p>
                </Link>
              </li>
            ))}
          </ul>
        </motion.div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <motion.div variants={item} className="rounded-xl border border-violet-100 bg-violet-50/30 p-5">
          <div className="mb-3 flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-violet-600" />
            <h2 className="text-sm font-semibold text-gray-900">Coming up</h2>
          </div>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex justify-between gap-4 rounded-lg bg-white/60 px-3 py-2">
              <span>Wednesday payment cut-off</span>
              <span className="font-medium text-violet-700">{formatShortDate(wedCutoff)}</span>
            </li>
            <li className="flex justify-between gap-4 rounded-lg bg-white/60 px-3 py-2">
              <span>Friday payment run</span>
              <span className="font-medium text-violet-700">{formatShortDate(friPayment)}</span>
            </li>
            <li className="flex justify-between gap-4 rounded-lg bg-white/60 px-3 py-2">
              <span>Cash request dispatch</span>
              <span className="font-medium text-violet-700">24th of month</span>
            </li>
            {data.activeCycle?.deadline_date ? (
              <li className="flex justify-between gap-4 rounded-lg bg-white/60 px-3 py-2">
                <span>Cycle deadline — {data.activeCycle.label}</span>
                <span className="font-medium text-violet-700">
                  {formatDate(data.activeCycle.deadline_date)}
                </span>
              </li>
            ) : null}
          </ul>
        </motion.div>

        <motion.div variants={item} className="rounded-xl border border-red-100 bg-red-50/30 p-5">
          <div className="mb-3 flex items-center gap-2">
            <AlertOctagon className="h-5 w-5 text-red-600" />
            <h2 className="text-sm font-semibold text-gray-900">Bottlenecks & errors</h2>
          </div>
          {bottlenecks.length === 0 ? (
            <p className="text-sm text-gray-500">No blockers detected right now.</p>
          ) : (
            <ul className="space-y-2">
              {bottlenecks.map((b) => (
                <li key={b.title}>
                  <Link
                    href={b.href}
                    className="flex items-start gap-3 rounded-lg bg-white/70 px-3 py-2 transition-colors hover:bg-white"
                  >
                    <AlertTriangle
                      className={cn(
                        "mt-0.5 h-4 w-4 shrink-0",
                        b.severity === "high" ? "text-red-600" : "text-amber-600"
                      )}
                    />
                    <div>
                      <p className="text-sm font-medium text-gray-800">{b.title}</p>
                      <p className="text-xs text-gray-600">{b.detail}</p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </motion.div>
      </div>

      {data.overdue > 0 && (
        <motion.div
          variants={item}
          className="flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-5 py-4"
        >
          <AlertTriangle className="h-5 w-5 shrink-0 text-amber-600" />
          <div className="flex-1">
            <p className="text-sm font-medium text-amber-800">
              {data.overdue} approval{data.overdue !== 1 ? "s" : ""} overdue
            </p>
            <p className="text-xs text-amber-600">Pending CFO response for more than 7 days</p>
          </div>
          <Link
            href="/approvals?filter=overdue"
            className="text-xs font-medium text-amber-700 underline underline-offset-2 hover:text-amber-900"
          >
            View
          </Link>
        </motion.div>
      )}

      <div className="grid grid-cols-4 gap-4">
        {[
          { key: "needsReview", label: "Needs Review", icon: FileText, color: "text-blue-600", bg: "bg-blue-50" },
          { key: "pendingApproval", label: "Awaiting CFO", icon: Clock, color: "text-amber-600", bg: "bg-amber-50" },
          { key: "readyForExport", label: "Ready for Sage", icon: Download, color: "text-emerald-600", bg: "bg-emerald-50" },
          { key: "readyForPayment", label: "Payment Queue", icon: CreditCard, color: "text-violet-600", bg: "bg-violet-50" },
        ].map((card) => (
          <motion.div
            key={card.key}
            variants={item}
            className="rounded-xl border border-gray-100 bg-white p-5 transition-shadow hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <div className={`rounded-lg ${card.bg} p-2.5`}>
                <card.icon className={`h-5 w-5 ${card.color}`} />
              </div>
              <span className="text-2xl font-semibold text-gray-900">
                {data[card.key as keyof DashboardData] as number}
              </span>
            </div>
            <p className="mt-3 text-sm text-gray-500">{card.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-6">
        <motion.div variants={item} className="col-span-2 rounded-xl border border-gray-100 bg-white">
          <div className="flex items-center justify-between border-b border-gray-50 px-5 py-4">
            <h2 className="text-sm font-semibold text-gray-800">Recent Invoices</h2>
            <Link
              href="/invoices"
              className="flex items-center gap-1 text-xs font-medium text-brand-blue hover:underline"
            >
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          {data.recentInvoices.length === 0 ? (
            <div className="flex flex-col items-center py-16 text-center">
              <FileText className="h-10 w-10 text-gray-200" />
              <p className="mt-3 text-sm text-gray-400">No invoices yet.</p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-50">
              {data.recentInvoices.map((inv: any) => (
                <li key={inv.id}>
                  <Link
                    href={`/invoices/${inv.id}`}
                    className="flex items-center gap-4 px-5 py-3.5 transition-colors hover:bg-gray-50"
                  >
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-blue-light">
                      <FileText className="h-4 w-4 text-brand-blue" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-gray-800">
                        {inv.description || inv.invoice_number || "Untitled invoice"}
                      </p>
                      <p className="text-xs text-gray-400">
                        {inv.entities?.code ?? "—"} ·{" "}
                        {inv.invoice_date ? formatDate(inv.invoice_date) : "No date"}
                      </p>
                    </div>
                    <p className="text-sm font-medium text-gray-700">
                      {formatCurrency(inv.gross_amount)}
                    </p>
                    <span
                      className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${getStatusColor(
                        inv.status
                      )}`}
                    >
                      {getStatusLabel(inv.status)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </motion.div>

        <motion.div variants={item} className="rounded-xl border border-gray-100 bg-white">
          <div className="border-b border-gray-50 px-5 py-4">
            <h2 className="text-sm font-semibold text-gray-800">Entities</h2>
          </div>
          <ul className="divide-y divide-gray-50">
            {data.entities.map((ent: any) => (
              <li key={ent.id} className="flex items-center gap-3 px-5 py-3 text-sm">
                <span className="flex h-7 w-7 items-center justify-center rounded-md bg-brand-green-light text-xs font-semibold text-brand-green">
                  {ent.code.slice(0, 2)}
                </span>
                <span className="text-gray-700">{ent.name}</span>
              </li>
            ))}
          </ul>
        </motion.div>
      </div>
    </motion.div>
  );
}
