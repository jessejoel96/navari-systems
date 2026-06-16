"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  industryWorkflows,
  workflowArchitectures,
  type IndustryWorkflow,
  type WorkflowArchitecture,
} from "@/lib/workflows";
import { cn } from "@/lib/utils";

function TransitionArrow({
  className,
  onToggle,
  expanded,
}: {
  className?: string;
  onToggle: () => void;
  expanded: boolean;
}) {
  return (
    <div className={cn("flex shrink-0 items-center justify-center", className)}>
      <button
        type="button"
        onClick={onToggle}
        aria-label={expanded ? "Collapse how it works steps" : "Expand how it works steps"}
        aria-expanded={expanded}
        className="flex h-10 w-10 items-center justify-center rounded-full border border-gold/40 bg-gold/10 transition-colors hover:bg-gold/15"
      >
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" className="text-gold">
          <path
            d="M4 9h10M10 5l4 4-4 4"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    </div>
  );
}

function IndustrySlide({
  industry,
  architecture,
  showHowItWorksSteps,
  onToggleHowItWorksSteps,
}: {
  industry: IndustryWorkflow;
  architecture: WorkflowArchitecture | undefined;
  showHowItWorksSteps: boolean;
  onToggleHowItWorksSteps: () => void;
}) {
  return (
    <motion.div
      key={industry.id}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.35 }}
      className="grid gap-6 lg:grid-cols-[1fr_auto_1fr] lg:gap-4"
    >
      {/* Challenge */}
      <div className="flex flex-col rounded-xl border border-[#E85D4A]/20 bg-gradient-to-br from-[#E85D4A]/6 to-white p-5 md:p-6">
        <span className="mb-3 font-mono text-[10px] font-medium uppercase tracking-wider text-[#E85D4A]">
          What happens now
        </span>
        <h4 className="mb-4 font-display text-lg font-bold leading-snug text-navy md:text-xl">
          {industry.header}
        </h4>
        <p className="mb-5 text-sm leading-relaxed text-silver">{industry.subhead}</p>

        <ul className="mb-5 flex flex-1 flex-col gap-3">
          {industry.problems.map((problem) => (
            <li
              key={problem.name}
              className="rounded-lg border border-[#E85D4A]/10 bg-white/80 p-3.5"
            >
              <div className="mb-1 flex flex-wrap items-center gap-2">
                <span className="font-display text-sm font-bold text-navy">{problem.name}</span>
                <span className="font-mono text-[10px] text-[#E85D4A]">{problem.cost}</span>
              </div>
              <p className="text-sm leading-relaxed text-silver">{problem.desc}</p>
            </li>
          ))}
        </ul>

        <div className="mt-auto rounded-lg border border-[#E85D4A]/15 bg-[#E85D4A]/5 px-4 py-3">
          <span className="mb-1 block font-mono text-[10px] uppercase tracking-wider text-[#E85D4A]">
            The cost
          </span>
          <p className="text-sm font-medium leading-relaxed text-navy">{industry.financialImpact}</p>
        </div>
      </div>

      <TransitionArrow
        className="rotate-90 lg:rotate-0 lg:self-center"
        onToggle={onToggleHowItWorksSteps}
        expanded={showHowItWorksSteps}
      />

      {/* Solution */}
      <div className="flex flex-col rounded-xl border border-gold/30 bg-gradient-to-br from-gold/8 to-white p-5 md:p-6">
        <span className="mb-3 font-mono text-[10px] font-medium uppercase tracking-wider text-gold">
          What changes
        </span>
        <h4 className="mb-2 font-display text-lg font-bold leading-snug text-navy md:text-xl">
          {industry.solution.name}
        </h4>
        <p className="mb-5 text-sm leading-relaxed text-body-text md:text-base">
          {industry.solution.desc}
        </p>

        <ul className="mb-5 flex flex-1 flex-col gap-2.5">
          {industry.solution.outcomes.map((outcome) => (
            <li
              key={outcome}
              className="relative rounded-lg border border-gold/15 bg-white/80 py-2.5 pl-8 pr-3.5 text-sm font-medium text-navy"
            >
              <span className="absolute left-3 top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-gold" />
              {outcome}
            </li>
          ))}
        </ul>

        {architecture && (
          <div className="mt-auto rounded-lg bg-navy px-4 py-3">
            <div className="mb-1 flex items-center gap-2">
              <span className="font-mono text-[10px] uppercase tracking-wider text-gold">
                How it works
              </span>
              <span className="rounded bg-gold/20 px-1.5 py-0.5 font-mono text-[10px] text-gold">
                {architecture.letter}
              </span>
            </div>
            <p className="text-sm leading-relaxed text-silver-dark-bg">{architecture.outcome}</p>

            <AnimatePresence initial={false}>
              {showHowItWorksSteps && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="overflow-hidden"
                >
                  <div className="mt-3 grid gap-2 rounded-md border border-white/10 bg-white/5 p-3">
                    <div className="grid gap-1">
                      <span className="font-mono text-[10px] uppercase tracking-wider text-silver-dark-bg">
                        Trigger
                      </span>
                      <p className="text-sm leading-relaxed text-silver-dark-bg">{architecture.trigger}</p>
                    </div>
                    <div className="grid gap-1">
                      <span className="font-mono text-[10px] uppercase tracking-wider text-silver-dark-bg">
                        AI action
                      </span>
                      <p className="text-sm leading-relaxed text-silver-dark-bg">{architecture.aiAction}</p>
                    </div>
                    <div className="grid gap-1">
                      <span className="font-mono text-[10px] uppercase tracking-wider text-silver-dark-bg">
                        System action
                      </span>
                      <p className="text-sm leading-relaxed text-silver-dark-bg">
                        {architecture.systemAction}
                      </p>
                    </div>
                    <div className="grid gap-1">
                      <span className="font-mono text-[10px] uppercase tracking-wider text-silver-dark-bg">
                        Output
                      </span>
                      <p className="text-sm leading-relaxed text-silver-dark-bg">{architecture.outcome}</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </motion.div>
  );
}

export function WorkflowSlider() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [showHowItWorksSteps, setShowHowItWorksSteps] = useState(false);

  const industryTabButtonRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const scrollIndustryTabIntoView = useCallback((index: number) => {
    // Defer to next frame so layout is up to date before scrolling.
    requestAnimationFrame(() => {
      industryTabButtonRefs.current[index]?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      });
    });
  }, []);

  const industry = industryWorkflows[activeIndex];
  const linkedArch = workflowArchitectures.find(
    (a) => a.id === industry.solution.architectureId
  );

  const goTo = useCallback((index: number) => {
    const next = (index + industryWorkflows.length) % industryWorkflows.length;
    setActiveIndex(next);
    setShowHowItWorksSteps(false);
    scrollIndustryTabIntoView(next);
  }, [scrollIndustryTabIntoView]);

  useEffect(() => {
    scrollIndustryTabIntoView(activeIndex);
  }, [activeIndex, scrollIndustryTabIntoView]);

  return (
    <div className="mt-12">
      {/* Industry slider controls */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {industryWorkflows.map((ind, i) => (
            <button
              key={ind.id}
              type="button"
              onClick={() => goTo(i)}
              ref={(el) => {
                industryTabButtonRefs.current[i] = el;
              }}
              className={cn(
                "flex shrink-0 items-center gap-2.5 rounded-lg border px-4 py-3 transition-all",
                activeIndex === i
                  ? "border-gold bg-navy text-white shadow-md"
                  : "border-gold-border/20 bg-white text-navy hover:border-gold-border"
              )}
            >
              <span
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-md font-mono text-xs font-bold",
                  activeIndex === i ? "bg-gold text-navy" : "bg-slate-bg text-gold"
                )}
              >
                {ind.abbr}
              </span>
              <span className="whitespace-nowrap font-display text-sm font-bold">{ind.tabTitle}</span>
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <div className="flex gap-1.5">
            {industryWorkflows.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => goTo(i)}
                aria-label={`Go to ${industryWorkflows[i].tabTitle}`}
                className={cn(
                  "h-2 rounded-full transition-all",
                  activeIndex === i ? "w-6 bg-gold" : "w-2 bg-gold-border/40 hover:bg-gold/50"
                )}
              />
            ))}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => goTo(activeIndex - 1)}
              aria-label="Previous industry"
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-gold-border/30 bg-white text-navy transition-colors hover:border-gold hover:bg-gold/5"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
                <path d="M10 3L5 8L10 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => goTo(activeIndex + 1)}
              aria-label="Next industry"
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-gold-border/30 bg-white text-navy transition-colors hover:border-gold hover:bg-gold/5"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
                <path d="M6 3L11 8L6 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Main slide */}
      <div className="relative overflow-hidden rounded-xl border border-gold-border/25 bg-white p-5 shadow-sm md:p-8">
        <div className="mb-6 border-b border-gold-border/15 pb-5">
          <p className="mb-1 font-mono text-[11px] uppercase tracking-wider text-silver">
            {activeIndex + 1} of {industryWorkflows.length}
          </p>
          <p className="mb-2 inline-flex rounded-full bg-slate-bg px-3 py-1 font-mono text-[10px] font-semibold uppercase tracking-wider text-navy">
            {industry.personaTag}
          </p>
          <h3 className="font-display text-xl font-bold text-navy md:text-2xl">{industry.header}</h3>
          <p className="mt-1 text-sm text-silver">{industry.subhead}</p>
        </div>

        <AnimatePresence mode="wait">
          <IndustrySlide
            industry={industry}
            architecture={linkedArch}
            showHowItWorksSteps={showHowItWorksSteps}
            onToggleHowItWorksSteps={() => setShowHowItWorksSteps((v) => !v)}
          />
        </AnimatePresence>
      </div>
    </div>
  );
}
