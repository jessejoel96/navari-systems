"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  Clock,
  DollarSign,
  ArrowRight,
  FileText,
  Play,
  X,
  Info,
  LayoutGrid,
  List,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { BrandLogo } from "@/components/layout/BrandLogo";
import { DASHBOARD_HREF } from "@/lib/navigation";
import {
  WORKFLOW_GUIDES,
  WORKFLOW_GROUP_LABELS,
  TINA_MONTHLY_HOURS_SAVED,
  TINA_MONTHLY_SAVINGS,
  DEPARTMENT_ROLE_EXTENSIONS,
  type WorkflowGuide,
} from "@/lib/workflows";

type ViewMode = "grid" | "list";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" as const } },
};

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

function ToolkitOverlay({
  workflow,
  onClose,
}: {
  workflow: WorkflowGuide;
  onClose: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className={cn("sticky top-0 px-8 py-6", workflow.bgColor)}>
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="rounded-2xl bg-white/80 p-3">
                <workflow.icon className={cn("h-7 w-7", workflow.color)} />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                  {WORKFLOW_GROUP_LABELS[workflow.groupId]}
                </p>
                <h2 className="text-xl font-bold text-gray-900">{workflow.title}</h2>
                <p className="text-sm text-gray-600">{workflow.subtitle}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full p-2 text-gray-500 hover:bg-white/60"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="space-y-6 px-8 py-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-red-100 bg-red-50/50 p-4">
              <p className="mb-2 text-xs font-semibold uppercase text-red-500">Problem</p>
              <p className="text-sm leading-relaxed text-gray-700">{workflow.problem}</p>
            </div>
            <div className="rounded-xl border border-green-100 bg-green-50/50 p-4">
              <p className="mb-2 text-xs font-semibold uppercase text-green-600">Solution</p>
              <p className="text-sm leading-relaxed text-gray-700">{workflow.solution}</p>
            </div>
          </div>

          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
              How it works
            </p>
            <ol className="space-y-2">
              {workflow.steps.map((step, i) => (
                <li key={step} className="flex gap-3 text-sm text-gray-700">
                  <span
                    className={cn(
                      "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white",
                      workflow.color.replace("text-", "bg-")
                    )}
                  >
                    {i + 1}
                  </span>
                  <span className="pt-0.5">{step}</span>
                </li>
              ))}
            </ol>
          </div>

          <div className="flex gap-6 rounded-xl border border-gray-100 p-4">
            <div>
              <p className="text-lg font-bold text-gray-900">{workflow.hoursSaved}h</p>
              <p className="text-xs text-gray-500">saved for Tina / month</p>
            </div>
            <div>
              <p className="text-lg font-bold text-gray-900">{workflow.moneySaved}</p>
              <p className="text-xs text-gray-500">labour cost avoided / month</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {workflow.tags.map((tag) => (
              <span
                key={tag}
                className={cn(
                  "rounded-full px-3 py-1 text-xs font-medium",
                  workflow.bgColor,
                  workflow.color
                )}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function WorkflowCard({
  workflow,
  view,
  onToolkit,
}: {
  workflow: WorkflowGuide;
  view: ViewMode;
  onToolkit: () => void;
}) {
  if (view === "list") {
    return (
      <motion.div
        layout
        variants={fadeUp}
        className={cn(
          "group flex items-center gap-5 rounded-2xl border bg-white p-5 transition-all hover:shadow-lg",
          workflow.borderColor
        )}
      >
        <div className={cn("rounded-xl p-3", workflow.bgColor)}>
          <workflow.icon className={cn("h-6 w-6", workflow.color)} />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-sm font-bold text-gray-900">{workflow.title}</h3>
          <p className="truncate text-xs text-gray-500">{workflow.subtitle}</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm font-bold text-brand-blue">{workflow.hoursSaved}h/mo</p>
            <p className="text-[10px] text-gray-400">for you</p>
          </div>
          <div className="hidden gap-1.5 sm:flex">
            {workflow.tags.slice(0, 2).map((tag) => (
              <span
                key={tag}
                className={cn(
                  "rounded-full px-2 py-0.5 text-[10px] font-medium",
                  workflow.bgColor,
                  workflow.color
                )}
              >
                {tag}
              </span>
            ))}
          </div>
          <button
            type="button"
            onClick={onToolkit}
            className="flex items-center gap-1.5 rounded-lg bg-brand-blue px-3 py-2 text-xs font-semibold text-white shadow-sm hover:bg-brand-blue-deep"
          >
            <Info className="h-3.5 w-3.5" /> How it works
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      layout
      variants={fadeUp}
      className={cn(
        "group relative flex flex-col rounded-2xl border bg-white p-6 transition-all hover:-translate-y-1 hover:shadow-xl",
        workflow.borderColor
      )}
    >
      <div className="mb-4 flex items-start gap-4">
        <div className={cn("rounded-xl p-3", workflow.bgColor)}>
          <workflow.icon className={cn("h-6 w-6", workflow.color)} />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-base font-bold text-gray-900">{workflow.title}</h3>
          <p className="mt-0.5 text-xs text-gray-500">{workflow.subtitle}</p>
        </div>
      </div>

      <p className="mb-4 flex-1 text-sm leading-relaxed text-gray-600">{workflow.problem}</p>

      <div className="mb-4 flex items-center gap-4 border-y border-gray-100 py-3">
        <div className="flex flex-1 items-center gap-2">
          <Clock className="h-4 w-4 text-brand-blue" />
          <div>
            <span className="text-sm font-bold text-gray-900">{workflow.hoursSaved}h</span>
            <span className="ml-1 text-[10px] text-gray-400">/ month for you</span>
          </div>
        </div>
        <div className="flex flex-1 items-center gap-2">
          <DollarSign className="h-4 w-4 text-brand-green" />
          <span className="text-xs font-bold text-gray-900">{workflow.moneySaved}</span>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap gap-1.5">
        {workflow.tags.map((tag) => (
          <span
            key={tag}
            className={cn(
              "rounded-full px-2.5 py-0.5 text-[10px] font-medium",
              workflow.bgColor,
              workflow.color
            )}
          >
            {tag}
          </span>
        ))}
      </div>

      <button
        type="button"
        onClick={onToolkit}
        className="flex items-center justify-center gap-2 rounded-xl bg-brand-blue py-3 text-sm font-semibold text-white shadow-sm hover:bg-brand-blue-deep"
      >
        <Play className="h-4 w-4" /> Process Toolkit
      </button>
    </motion.div>
  );
}

export function WelcomeShell() {
  const [selected, setSelected] = useState<WorkflowGuide | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-[#F7F9FB] via-white to-[#EAF4FB]">
        <motion.header
          variants={stagger}
          initial="hidden"
          animate="show"
          className="relative mx-auto max-w-6xl overflow-hidden px-6 pb-12 pt-10 lg:px-12"
        >
          <div className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-brand-blue/5 blur-3xl" />

          <div className="relative flex flex-col gap-10 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-2xl flex-1">
              <motion.h1
                variants={fadeUp}
                className="text-3xl font-bold leading-tight text-gray-900 lg:text-4xl"
              >
                Welcome, <span className="text-brand-blue">Tina</span>.
                <br />
                <span className="text-brand-green">Your AP workflows,</span> automated.
              </motion.h1>

              <motion.p
                variants={fadeUp}
                className="mt-4 text-base leading-relaxed text-gray-600 lg:text-lg"
              >
                Invoice intake through payment and intercompany — across all 7 Intel HRC entities,
                with less manual entry and clearer approvals.
              </motion.p>

              <motion.div variants={fadeUp} className="mt-8 grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-blue-100 bg-white p-5 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-wide text-brand-blue">
                    For you, Tina
                  </p>
                  <p className="mt-2 text-3xl font-bold text-gray-900">
                    {TINA_MONTHLY_HOURS_SAVED}h
                  </p>
                  <p className="mt-1 text-sm text-gray-600">
                    estimated time back each month on manual AP tasks
                  </p>
                </div>
                <div className="rounded-2xl border border-green-100 bg-white p-5 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-wide text-brand-green">
                    For Intel HRC finance ops
                  </p>
                  <p className="mt-2 text-3xl font-bold text-gray-900">{TINA_MONTHLY_SAVINGS}</p>
                  <p className="mt-1 text-sm text-gray-600">
                    estimated monthly labour cost avoided in your AP workflow
                  </p>
                </div>
              </motion.div>
            </div>

            <motion.div
              variants={fadeUp}
              className="flex shrink-0 justify-end lg:pt-2"
            >
              <BrandLogo imageClassName="h-36 w-auto max-w-[min(100%,520px)]" />
            </motion.div>
          </div>
        </motion.header>

        <section className="mx-auto max-w-6xl px-6 pb-20 lg:px-12">
          <div className="mb-6 flex items-end justify-between gap-4">
            <h2 className="text-lg font-semibold text-gray-900">Your workflows</h2>
            <div className="flex rounded-xl border border-gray-200 bg-white p-1 shadow-sm">
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                className={cn(
                  "rounded-lg p-2 transition-colors",
                  viewMode === "grid"
                    ? "bg-brand-blue text-white"
                    : "text-gray-400 hover:text-gray-600"
                )}
                aria-label="Grid view"
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode("list")}
                className={cn(
                  "rounded-lg p-2 transition-colors",
                  viewMode === "list"
                    ? "bg-brand-blue text-white"
                    : "text-gray-400 hover:text-gray-600"
                )}
                aria-label="List view"
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>

          <motion.div
            variants={stagger}
            initial="hidden"
            animate="show"
            className={cn(
              viewMode === "grid"
                ? "grid gap-5 md:grid-cols-2 lg:grid-cols-3"
                : "space-y-3"
            )}
          >
            <AnimatePresence mode="popLayout">
              {WORKFLOW_GUIDES.map((w) => (
                <WorkflowCard
                  key={w.id}
                  workflow={w}
                  view={viewMode}
                  onToolkit={() => setSelected(w)}
                />
              ))}
            </AnimatePresence>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-16 rounded-2xl bg-brand-blue-deep px-8 py-10 text-center text-white"
          >
            <h2 className="text-xl font-bold lg:text-2xl">Ready to see it in action?</h2>
            <p className="mx-auto mt-3 max-w-xl text-sm text-blue-100">
              Open your dashboard to see what you completed this week, what is still open,
              reminders, and any bottlenecks.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Link
                href={DASHBOARD_HREF}
                className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-bold text-brand-blue-deep shadow-lg transition-transform hover:scale-[1.02]"
              >
                <ArrowRight className="h-4 w-4" /> Go to dashboard
              </Link>
              <Link
                href="/invoices/new"
                className="inline-flex items-center gap-2 rounded-xl border border-white/30 px-6 py-3 text-sm font-medium text-white hover:bg-white/10"
              >
                <FileText className="h-4 w-4" /> Upload invoice
              </Link>
            </div>
          </motion.div>

          <motion.aside
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mt-14 rounded-2xl border border-gray-100 bg-white/70 px-6 py-8 backdrop-blur-sm"
          >
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              Across the department
            </p>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-gray-600">
              This demo focuses on Tina&apos;s AP workflows. The same platform can extend to
              other finance roles at Intel HRC — treasury runs, tax oversight, FP&amp;A close,
              and intercompany reporting — with shared Sage exports and audit trails.
            </p>
            <ul className="mt-6 grid gap-3 sm:grid-cols-2">
              {DEPARTMENT_ROLE_EXTENSIONS.map((item) => (
                <li
                  key={item.role}
                  className="rounded-xl border border-gray-100 bg-gray-50/80 px-4 py-3"
                >
                  <p className="text-xs font-semibold text-gray-800">{item.role}</p>
                  <p className="mt-1 text-xs leading-relaxed text-gray-500">{item.benefit}</p>
                </li>
              ))}
            </ul>
            <p className="mt-6 text-xs text-gray-400">
              Built by{" "}
              <a
                href="https://navari.systems"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 font-medium text-gray-500 underline-offset-2 transition-colors hover:text-brand-blue hover:underline"
              >
                Navari Systems
                <ExternalLink className="h-3 w-3" />
              </a>
              {" · "}
              Intel HRC AP Platform · Phase 0 demo
            </p>
          </motion.aside>
        </section>
      </div>

      <AnimatePresence>
        {selected ? (
          <ToolkitOverlay workflow={selected} onClose={() => setSelected(null)} />
        ) : null}
      </AnimatePresence>
    </>
  );
}
