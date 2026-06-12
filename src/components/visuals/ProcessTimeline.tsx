"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  const step = steps[active];

  return (
    <div className="mx-auto mt-12 max-w-[640px]">
      <div className="relative">
        <div className="pointer-events-none absolute left-0 right-0 top-1/2 hidden h-px -translate-y-1/2 bg-gradient-to-r from-transparent via-gold-border to-transparent md:block" />
        <div className="grid grid-cols-3 gap-2 md:grid-cols-6">
          {steps.map((s, i) => (
            <button
              key={s.num}
              type="button"
              onClick={() => setActive(i)}
              className={cn(
                "relative z-10 flex flex-col items-center rounded-lg px-1.5 py-2.5 transition-all",
                active === i
                  ? "bg-gold/15 ring-1 ring-gold/40"
                  : "hover:bg-white/5"
              )}
            >
              <span
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-full border font-mono text-[11px] font-medium transition-colors",
                  active === i
                    ? "border-gold bg-gold text-navy"
                    : "border-gold-border bg-gold/8 text-gold"
                )}
              >
                {s.num}
              </span>
              <span
                className={cn(
                  "mt-1.5 hidden font-display text-[10px] font-bold uppercase tracking-wide md:block",
                  active === i ? "text-white" : "text-silver-dark-bg"
                )}
              >
                {s.title}
              </span>
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step.num}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.25 }}
          className="mt-5 border-l-2 border-gold/50 pl-4"
        >
          <h3 className="font-display text-base font-bold text-white">{step.title}</h3>
          <p className="mt-1 max-w-[520px] text-sm leading-relaxed text-silver-dark-bg">
            {step.desc}
          </p>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
