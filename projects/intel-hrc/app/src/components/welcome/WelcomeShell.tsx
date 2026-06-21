"use client";

import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
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

const EASE_DRAMATIC = [0.08, 0.82, 0.17, 1] as const;
const EASE_SMOOTH = [0.16, 1, 0.3, 1] as const;
const EASE_SNAPPY = [0.25, 1, 0.5, 1] as const;

/** Page-load walkthrough timeline (seconds) — dramatic → fast */
const TITLE_STAGGER = 0.052;
const TITLE_LETTER_DURATION = 0.42;
const SUBTEXT_STAGGER = 0.018;
const SUBTEXT_LETTER_DURATION = 0.28;

const HERO_TITLE_LINES = [
  {
    segments: [
      { text: "Welcome, ", className: "text-white" },
      { text: "Tina", className: "text-blue-200" },
      { text: ".", className: "text-white" },
    ],
  },
  {
    segments: [
      { text: "Your AP workflows,", className: "text-emerald-300" },
      { text: " automated.", className: "text-white" },
    ],
  },
] as const;

const HERO_SUBTEXT =
  "Invoice intake through payment and intercompany — across all 7 Intel HRC entities, with less manual entry and clearer approvals.";

function countTypewriterChars(
  lines: readonly { segments: readonly { text: string }[] }[]
) {
  return lines.reduce(
    (total, line) =>
      total + line.segments.reduce((lineTotal, segment) => lineTotal + segment.text.length, 0),
    0
  );
}

const TITLE_CHAR_COUNT = countTypewriterChars(HERO_TITLE_LINES);
const SUBTEXT_CHAR_COUNT = HERO_SUBTEXT.length;
const TITLE_END = TITLE_CHAR_COUNT * TITLE_STAGGER + TITLE_LETTER_DURATION;
const SUBTEXT_END = TITLE_END + 0.35 + SUBTEXT_CHAR_COUNT * SUBTEXT_STAGGER + SUBTEXT_LETTER_DURATION;

const T = {
  title: 0,
  subtext: TITLE_END + 0.35,
  logo: 0.7,
  stat1: SUBTEXT_END + 0.2,
  stat2: SUBTEXT_END + 0.55,
  workflowsHeader: SUBTEXT_END + 0.95,
  workflowBase: SUBTEXT_END + 1.25,
  workflowStagger: 0.18,
  cta: SUBTEXT_END + 2.35,
  department: SUBTEXT_END + 2.65,
};

type TypewriterLine = {
  segments: readonly { text: string; className?: string }[];
};

function buildTypewriterVariants(
  reduced: boolean,
  options: {
    stagger: number;
    delayChildren: number;
    letterDuration: number;
    dramatic?: boolean;
  }
) {
  const instant = { duration: 0.01 } as const;

  if (reduced) {
    return {
      container: {
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: instant },
      },
      letter: {
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: instant },
      },
    };
  }

  return {
    container: {
      hidden: {},
      show: {
        transition: {
          staggerChildren: options.stagger,
          delayChildren: options.delayChildren,
        },
      },
    },
    letter: {
      hidden: options.dramatic
        ? { opacity: 0, scale: 1.45, filter: "blur(10px)", y: -10, x: -4 }
        : { opacity: 0, y: 10, filter: "blur(3px)" },
      show: {
        opacity: 1,
        scale: 1,
        filter: "blur(0px)",
        y: 0,
        x: 0,
        transition: {
          duration: options.letterDuration,
          ease: options.dramatic ? EASE_DRAMATIC : EASE_SMOOTH,
        },
      },
    },
  };
}

function TypewriterText({
  lines,
  plainText,
  className,
  reduced,
  stagger,
  delayChildren,
  letterDuration,
  dramatic = false,
  as = "span",
}: {
  lines?: readonly TypewriterLine[];
  plainText?: string;
  className?: string;
  reduced: boolean;
  stagger: number;
  delayChildren: number;
  letterDuration: number;
  dramatic?: boolean;
  as?: "h1" | "p" | "span";
}) {
  const variants = buildTypewriterVariants(reduced, {
    stagger,
    delayChildren,
    letterDuration,
    dramatic,
  });

  const content = lines ? (
    lines.map((line, lineIndex) => (
      <span key={`line-${lineIndex}`} className={lineIndex > 0 ? "mt-1 block" : "block"}>
        {line.segments.map((segment, segmentIndex) =>
          segment.text.split("").map((char, charIndex) => (
            <motion.span
              key={`${lineIndex}-${segmentIndex}-${charIndex}`}
              variants={variants.letter}
              className={cn("inline-block origin-left", segment.className)}
              aria-hidden
            >
              {char === " " ? "\u00A0" : char}
            </motion.span>
          ))
        )}
      </span>
    ))
  ) : (
    plainText?.split("").map((char, index) => (
      <motion.span
        key={`char-${index}`}
        variants={variants.letter}
        className="inline-block origin-left"
        aria-hidden
      >
        {char === " " ? "\u00A0" : char}
      </motion.span>
    ))
  );

  const sharedProps = {
    initial: "hidden" as const,
    animate: "show" as const,
    variants: variants.container,
    className,
  };

  if (as === "h1") {
    return (
      <motion.h1 {...sharedProps} aria-label="Welcome, Tina. Your AP workflows, automated.">
        {content}
      </motion.h1>
    );
  }

  if (as === "p") {
    return (
      <motion.p {...sharedProps} aria-label={plainText}>
        {content}
      </motion.p>
    );
  }

  return <motion.span {...sharedProps}>{content}</motion.span>;
}

function buildTimeline(reduced: boolean) {
  const instant = { duration: 0.01 } as const;

  if (reduced) {
    return {
      logo: { hidden: { opacity: 0 }, show: { opacity: 1, transition: instant } },
      stat: (_index: number) => ({
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: instant },
      }),
      section: { hidden: { opacity: 0 }, show: { opacity: 1, transition: instant } },
      workflow: (_index: number) => ({
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: instant },
      }),
      fadeUp: (_delay: number) => ({
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: instant },
      }),
    };
  }

  return {
    logo: {
      hidden: { opacity: 0, x: 40, scale: 0.9 },
      show: {
        opacity: 1,
        x: 0,
        scale: 1,
        transition: { duration: 1.0, delay: T.logo, ease: EASE_SMOOTH },
      },
    },
    // STAT CARDS: moderate pop, shorter than hero
    stat: (index: number) => ({
      hidden: { opacity: 0, scale: 0.85, y: 24 },
      show: {
        opacity: 1,
        scale: 1,
        y: 0,
        transition: {
          duration: 0.55,
          delay: index === 0 ? T.stat1 : T.stat2,
          ease: EASE_SMOOTH,
        },
      },
    }),
    // SECTION HEADER: quick fade-up
    section: {
      hidden: { opacity: 0, y: 12 },
      show: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.4, delay: T.workflowsHeader, ease: EASE_SNAPPY },
      },
    },
    // WORKFLOW CARDS: snappy, subtle scale — gets faster per card
    workflow: (index: number) => ({
      hidden: {
        opacity: 0,
        scale: index === 0 ? 1.06 : 1.03,
        y: index === 0 ? 30 : 18,
      },
      show: {
        opacity: 1,
        scale: 1,
        y: 0,
        transition: {
          duration: Math.max(0.35, 0.5 - index * 0.03),
          delay: T.workflowBase + index * T.workflowStagger,
          ease: EASE_SNAPPY,
        },
      },
    }),
    // CTA & DEPARTMENT: fastest, minimal movement
    fadeUp: (delay: number) => ({
      hidden: { opacity: 0, y: 14 },
      show: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.35, delay, ease: EASE_SNAPPY },
      },
    }),
  };
}

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
  index,
  workflowVariant,
  onToolkit,
}: {
  workflow: WorkflowGuide;
  view: ViewMode;
  index: number;
  workflowVariant: ReturnType<typeof buildTimeline>["workflow"];
  onToolkit: () => void;
}) {
  const cardMotion = {
    initial: "hidden",
    animate: "show",
    variants: workflowVariant(index),
    layout: true,
  };

  if (view === "list") {
    return (
      <motion.div
        {...cardMotion}
        className={cn(
          "group flex items-center gap-5 rounded-2xl border bg-white p-5 transition-shadow hover:shadow-lg",
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
      {...cardMotion}
      style={{ originX: index === 0 ? 0.5 : 0.5, originY: 0.5 }}
      className={cn(
        "group relative flex flex-col rounded-2xl border bg-white p-6 transition-shadow hover:-translate-y-1 hover:shadow-xl",
        workflow.borderColor,
        index === 0 && "lg:col-span-1"
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
  const reducedMotion = useReducedMotion();
  const anim = buildTimeline(!!reducedMotion);

  return (
    <>
      <div className="min-h-screen overflow-x-hidden">
        {/* Hero section — deep brand gradient */}
        <header className="relative bg-gradient-to-br from-[#063B63] via-[#1F6DB3]/90 to-[#39B54A]/30 px-6 pb-14 pt-12 lg:px-12">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(31,109,179,0.3),transparent)]" />
          <div className="pointer-events-none absolute -right-32 -top-32 h-[500px] w-[500px] rounded-full bg-brand-green/10 blur-[120px]" />
          <div className="pointer-events-none absolute -left-24 bottom-0 h-80 w-80 rounded-full bg-brand-blue/10 blur-[100px]" />
          <div className="relative mx-auto max-w-6xl">

          <div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-2xl flex-1">
              <TypewriterText
                as="h1"
                lines={HERO_TITLE_LINES}
                reduced={!!reducedMotion}
                stagger={TITLE_STAGGER}
                delayChildren={T.title}
                letterDuration={TITLE_LETTER_DURATION}
                dramatic
                className="origin-left text-3xl font-bold leading-tight lg:text-5xl"
              />

              <TypewriterText
                as="p"
                plainText={HERO_SUBTEXT}
                reduced={!!reducedMotion}
                stagger={SUBTEXT_STAGGER}
                delayChildren={T.subtext}
                letterDuration={SUBTEXT_LETTER_DURATION}
                className="mt-5 text-base leading-relaxed text-blue-100/90 lg:text-lg"
              />

              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                <motion.div
                  initial="hidden"
                  animate="show"
                  variants={anim.stat(0)}
                  className="rounded-2xl border border-white/15 bg-white/10 p-5 shadow-lg backdrop-blur-md"
                >
                  <p className="text-xs font-semibold uppercase tracking-wide text-blue-200">
                    For you, Tina
                  </p>
                  <p className="mt-2 text-3xl font-bold text-white">
                    {TINA_MONTHLY_HOURS_SAVED}h
                  </p>
                  <p className="mt-1 text-sm text-blue-100/80">
                    estimated time back each month on manual AP tasks
                  </p>
                </motion.div>
                <motion.div
                  initial="hidden"
                  animate="show"
                  variants={anim.stat(1)}
                  className="rounded-2xl border border-white/15 bg-white/10 p-5 shadow-lg backdrop-blur-md"
                >
                  <p className="text-xs font-semibold uppercase tracking-wide text-emerald-300">
                    For Intel HRC finance ops
                  </p>
                  <p className="mt-2 text-3xl font-bold text-white">{TINA_MONTHLY_SAVINGS}</p>
                  <p className="mt-1 text-sm text-blue-100/80">
                    estimated monthly labour cost avoided in your AP workflow
                  </p>
                </motion.div>
              </div>
            </div>

            <motion.div
              initial="hidden"
              animate="show"
              variants={anim.logo}
              className="flex shrink-0 justify-end lg:pt-2"
            >
              <BrandLogo imageClassName="h-36 w-auto max-w-[min(100%,520px)] drop-shadow-2xl" />
            </motion.div>
          </div>
          </div>
        </header>

        {/* Workflows section — light gradient */}
        <section className="relative bg-gradient-to-b from-[#F7F9FB] via-white to-[#EAF8EE]/40 px-6 pb-20 pt-12 lg:px-12">
          <div className="pointer-events-none absolute right-0 top-0 h-64 w-64 rounded-full bg-brand-green/5 blur-[80px]" />
          <div className="relative mx-auto max-w-6xl">
          <motion.div
            initial="hidden"
            animate="show"
            variants={anim.section}
            className="mb-6 flex items-end justify-between gap-4"
          >
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
          </motion.div>

          <div
            className={cn(
              viewMode === "grid"
                ? "grid gap-5 md:grid-cols-2 lg:grid-cols-3"
                : "space-y-3"
            )}
          >
            <AnimatePresence mode="popLayout">
              {WORKFLOW_GUIDES.map((w, i) => (
                <WorkflowCard
                  key={w.id}
                  workflow={w}
                  view={viewMode}
                  index={i}
                  workflowVariant={anim.workflow}
                  onToolkit={() => setSelected(w)}
                />
              ))}
            </AnimatePresence>
          </div>

          <motion.div
            initial="hidden"
            animate="show"
            variants={anim.fadeUp(T.cta)}
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
            initial="hidden"
            animate="show"
            variants={anim.fadeUp(T.department)}
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
              {DEPARTMENT_ROLE_EXTENSIONS.map((item, i) => (
                <motion.li
                  key={item.role}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: T.department + 0.15 + i * 0.08,
                    duration: 0.35,
                    ease: EASE_SNAPPY,
                  }}
                  className="rounded-xl border border-gray-100 bg-gray-50/80 px-4 py-3"
                >
                  <p className="text-xs font-semibold text-gray-800">{item.role}</p>
                  <p className="mt-1 text-xs leading-relaxed text-gray-500">{item.benefit}</p>
                </motion.li>
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
          </div>
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
