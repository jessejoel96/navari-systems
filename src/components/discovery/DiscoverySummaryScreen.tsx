"use client";

import { motion } from "framer-motion";
import type { DiscoverySummary } from "@/lib/discovery/types";

type Props = {
  summary: DiscoverySummary;
  name: string;
  onConfirm: () => void;
  onAddDetails: () => void;
};

export function DiscoverySummaryScreen({ summary, name, onConfirm, onAddDetails }: Props) {
  const first = name.split(" ")[0] ?? name;

  return (
    <div className="mx-auto max-w-2xl px-0.5 pt-2 sm:pt-4">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-6 sm:mb-8 space-y-2">
        <span className="inline-block font-mono text-xs uppercase tracking-[0.12em] text-gold/80">
          Your summary
        </span>
        <h2 className="font-display text-xl sm:text-3xl font-extrabold text-white leading-snug tracking-tight break-words [text-wrap:balance]">
          {summary.headline}
        </h2>
        <p className="pt-1 text-sm text-white/50">For {first}</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-6 sm:mb-8 space-y-5 sm:space-y-6 rounded-2xl border border-white/10 bg-white/5 p-4 sm:p-6 text-sm"
      >
        <Section title="Business" items={summary.businessBullets} />
        <Section title="Goals" items={summary.goalsBullets} />
        <Section title="Problems" items={summary.problemsBullets} />
        <Section title="Opportunities" items={summary.opportunities} checkmarks />
        <div className="grid grid-cols-1 gap-4 border-t border-white/10 pt-3 sm:grid-cols-2">
          <div className="space-y-1">
            <div className="text-xs uppercase tracking-wider text-gold/70">Timeline</div>
            <div className="font-semibold leading-snug text-white">{summary.estimatedTimeline}</div>
          </div>
          <div className="space-y-1">
            <div className="text-xs uppercase tracking-wider text-gold/70">Investment</div>
            <div className="font-semibold leading-snug text-white">{summary.estimatedInvestment}</div>
          </div>
        </div>
      </motion.div>

      <p className="mb-4 text-sm text-white/60 sm:mb-5">Does this look right?</p>
      <div className="flex w-full max-w-md flex-col items-stretch gap-3 sm:mx-0">
        <motion.button
          type="button"
          onClick={onConfirm}
          whileTap={{ scale: 0.98 }}
          className="w-full rounded bg-gold py-3.5 font-display text-[15px] font-bold tracking-wide text-navy transition-all hover:bg-gold-light touch-manipulation sm:flex-1 sm:py-4"
        >
          Looks good — book a call
        </motion.button>
        <motion.button
          type="button"
          onClick={onAddDetails}
          whileTap={{ scale: 0.98 }}
          className="w-full rounded border border-white/20 py-3.5 text-white/80 transition-colors hover:border-gold/40 touch-manipulation sm:flex-1 sm:py-4"
        >
          Something to change
        </motion.button>
      </div>
    </div>
  );
}

function Section({
  title,
  items,
  checkmarks,
}: {
  title: string;
  items: string[];
  checkmarks?: boolean;
}) {
  return (
    <div className="space-y-2">
      <h3 className="text-xs uppercase tracking-wider text-gold">{title}</h3>
      <ul className="space-y-2 leading-relaxed text-white/85">
        {items.map((item) => (
          <li key={item} className="flex gap-2.5">
            <span className="mt-0.5 shrink-0 text-gold/60">{checkmarks ? "✓" : "•"}</span>
            <span className="break-words">{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
