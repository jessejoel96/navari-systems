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
    <div className="max-w-2xl mx-auto px-0.5">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-6 sm:mb-8 space-y-2">
        <span className="inline-block text-xs font-mono text-cyan-400/80 tracking-widest uppercase">
          Your brief
        </span>
        <h2
          className="text-xl sm:text-3xl font-bold text-white leading-snug tracking-tight break-words"
          style={{ fontFamily: "var(--font-audiowide), var(--font-roboto), sans-serif" }}
        >
          {summary.headline}
        </h2>
        <p className="text-white/50 text-sm pt-1">Prepared for {first}</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white/5 border border-cyan-400/20 rounded-2xl p-4 sm:p-6 mb-6 sm:mb-8 space-y-5 sm:space-y-6 text-sm"
      >
        <Section title="Business" items={summary.businessBullets} />
        <Section title="Goals" items={summary.goalsBullets} />
        <Section title="Problems" items={summary.problemsBullets} />
        <Section title="Opportunities" items={summary.opportunities} checkmarks />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-white/10">
          <div className="space-y-1">
            <div className="text-cyan-400/70 text-xs uppercase tracking-wider">Timeline</div>
            <div className="text-white font-semibold leading-snug">{summary.estimatedTimeline}</div>
          </div>
          <div className="space-y-1">
            <div className="text-cyan-400/70 text-xs uppercase tracking-wider">Investment</div>
            <div className="text-white font-semibold leading-snug">{summary.estimatedInvestment}</div>
          </div>
        </div>
      </motion.div>

      <p className="text-sm text-white/60 mb-3 sm:mb-4">Did I understand correctly?</p>
      <div className="flex flex-col sm:flex-row gap-3">
        <motion.button
          type="button"
          onClick={onConfirm}
          whileTap={{ scale: 0.98 }}
          className="flex-1 bg-cyan-400 text-slate-950 font-bold py-3.5 sm:py-4 rounded-xl hover:bg-cyan-300 transition-colors touch-manipulation"
        >
          Yes — let&apos;s talk next steps
        </motion.button>
        <motion.button
          type="button"
          onClick={onAddDetails}
          whileTap={{ scale: 0.98 }}
          className="flex-1 border border-white/20 text-white/80 py-3.5 sm:py-4 rounded-xl hover:border-cyan-400/40 transition-colors touch-manipulation"
        >
          Add more details
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
      <h3 className="text-cyan-400 text-xs uppercase tracking-wider">{title}</h3>
      <ul className="space-y-2 text-white/85 leading-relaxed">
        {items.map((item) => (
          <li key={item} className="flex gap-2.5">
            <span className="text-cyan-400/60 shrink-0 mt-0.5">{checkmarks ? "✓" : "•"}</span>
            <span className="break-words">{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
