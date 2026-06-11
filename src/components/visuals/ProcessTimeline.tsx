"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const steps = [
  { num: "01", title: "Discover", desc: "We map how your business runs today and find the three tasks wasting the most time and money." },
  { num: "02", title: "Diagnose", desc: "We put a dollar figure and hour count on each one. Documented, not guessed." },
  { num: "03", title: "Design", desc: "We plan the automation on paper and get your approval before building anything." },
  { num: "04", title: "Build", desc: "We build, test with your real data, and launch a working system in your business." },
  { num: "05", title: "Document", desc: "You receive written instructions and an operations manual your team can follow." },
  { num: "06", title: "Hand Over", desc: "Walkthrough, team training, 14-day check-in. Then you own it completely." },
];

export function ProcessTimeline() {
  const [active, setActive] = useState(0);

  return (
    <div className="mt-14">
      <motion.div
        key={active}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 rounded-xl border border-gold-border/30 bg-white/5 p-6 text-center backdrop-blur-sm md:p-8"
      >
        <span className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-gold bg-gold/15 font-mono text-sm font-medium text-gold">
          {steps[active].num}
        </span>
        <h3 className="mt-4 font-display text-xl font-bold text-white">
          {steps[active].title}
        </h3>
        <p className="mx-auto mt-2 max-w-md text-base leading-relaxed text-silver-dark-bg">
          {steps[active].desc}
        </p>
      </motion.div>

      <div className="relative">
        <div className="pointer-events-none absolute left-0 right-0 top-1/2 hidden h-px -translate-y-1/2 bg-gradient-to-r from-transparent via-gold-border to-transparent md:block" />
        <div className="grid grid-cols-3 gap-3 md:grid-cols-6 md:gap-2">
          {steps.map((s, i) => (
            <button
              key={s.num}
              type="button"
              onClick={() => setActive(i)}
              className={cn(
                "relative z-10 flex flex-col items-center rounded-lg px-2 py-3 transition-all",
                active === i
                  ? "bg-gold/15 ring-1 ring-gold/40"
                  : "hover:bg-white/5"
              )}
            >
              <span
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-full border font-mono text-xs font-medium transition-colors",
                  active === i
                    ? "border-gold bg-gold text-navy"
                    : "border-gold-border bg-gold/8 text-gold"
                )}
              >
                {s.num}
              </span>
              <span className={cn(
                "mt-2 hidden font-display text-[11px] font-bold uppercase tracking-wide md:block",
                active === i ? "text-white" : "text-silver-dark-bg"
              )}>
                {s.title}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
