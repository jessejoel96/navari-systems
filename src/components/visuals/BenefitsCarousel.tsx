"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const INTERVAL_MS = 5000;

const benefits = [
  {
    tag: "Core Outcome",
    title: "Your Business Runs Without You",
    desc: "Documented systems keep things moving when you step away. Growth does not depend on you being in every loop.",
    highlight: true,
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden>
        <path d="M11 2L13.5 7.5L20 8.5L15.5 12.8L16.7 19L11 16L5.3 19L6.5 12.8L2 8.5L8.5 7.5L11 2Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    tag: null,
    title: "Scale Without Hiring",
    desc: "More clients, same team. Systems absorb the extra volume without new headcount.",
    highlight: false,
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden>
        <path d="M4 16l5-5 4 4 5-6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        <rect x="2" y="2" width="18" height="18" rx="3" stroke="currentColor" strokeWidth="1.6" />
      </svg>
    ),
  },
  {
    tag: null,
    title: "Consistent Quality",
    desc: "Every client gets the same experience. Outcomes depend on the system, not on who handled it that day.",
    highlight: false,
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden>
        <circle cx="11" cy="11" r="9" stroke="currentColor" strokeWidth="1.6" />
        <path d="M7 11l3 3 5-5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    tag: null,
    title: "Time Back for Strategy",
    desc: "When routine tasks run themselves, your best hours go to decisions only you can make.",
    highlight: false,
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden>
        <circle cx="11" cy="11" r="9" stroke="currentColor" strokeWidth="1.6" />
        <path d="M11 6v5l3.5 2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    tag: null,
    title: "Real-Time Visibility",
    desc: "See what is working and where money is going before month-end surprises.",
    highlight: false,
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden>
        <path d="M2 11h4l3-7 4 14 3-7h4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    tag: null,
    title: "Staff Doing Real Work",
    desc: "When bridging and chasing stops, your team does the work they were hired for.",
    highlight: false,
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden>
        <circle cx="8" cy="7" r="3" stroke="currentColor" strokeWidth="1.6" />
        <circle cx="15" cy="7" r="3" stroke="currentColor" strokeWidth="1.6" />
        <path d="M2 19c0-3.3 2.7-6 6-6h6c3.3 0 6 2.7 6 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    ),
  },
];

export function BenefitsCarousel() {
  const [active, setActive] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;
    const id = setInterval(() => {
      setActive((p) => (p + 1) % benefits.length);
    }, INTERVAL_MS);
    return () => clearInterval(id);
  }, [isPaused, active]);

  const prev = () => setActive((p) => (p - 1 + benefits.length) % benefits.length);
  const next = () => setActive((p) => (p + 1) % benefits.length);

  const b = benefits[active];

  return (
    <div
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="relative overflow-hidden rounded-xl">
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0, x: 36 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -36 }}
            transition={{ duration: 0.32, ease: "easeInOut" }}
            className={cn(
              "min-h-[200px] rounded-xl border px-7 pb-7 pt-6 md:px-9 md:pb-8 md:pt-7",
              b.highlight
                ? "border-gold bg-gradient-to-br from-[#2a2208] to-[#1a1c2e]"
                : "border-white/10 bg-white/5"
            )}
          >
            <div className="mb-5 flex items-start gap-4">
              <div className={cn(
                "mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-lg",
                b.highlight ? "bg-gold/25 text-gold" : "bg-white/8 text-silver-dark-bg"
              )}>
                {b.icon}
              </div>
              {b.tag && (
                <span className="mt-1.5 rounded-sm border border-gold/50 bg-gold/15 px-2.5 py-1 font-mono text-[10px] font-medium uppercase tracking-widest text-gold">
                  {b.tag}
                </span>
              )}
            </div>

            <h3 className={cn(
              "mb-3 font-display font-bold leading-tight",
              b.highlight
                ? "text-[clamp(22px,3vw,32px)] text-gold"
                : "text-[clamp(20px,2.6vw,28px)] text-white"
            )}>
              {b.title}
            </h3>
            <p className="max-w-[600px] text-base leading-relaxed text-silver-dark-bg/90 md:text-[17px]">
              {b.desc}
            </p>
          </motion.div>
        </AnimatePresence>

        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-white/8">
          <motion.div
            key={active}
            className={cn("h-full", b.highlight ? "bg-gold" : "bg-white/30")}
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: INTERVAL_MS / 1000, ease: "linear" }}
          />
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between px-1">
        <div className="flex gap-2">
          {benefits.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`Go to benefit ${i + 1}`}
              className={cn(
                "h-1.5 rounded-full transition-all",
                i === active ? "w-7 bg-gold" : "w-1.5 bg-white/20 hover:bg-white/50"
              )}
            />
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="font-mono text-xs text-white/30">
            {active + 1}&thinsp;/&thinsp;{benefits.length}
          </span>
          <button
            type="button"
            onClick={prev}
            aria-label="Previous benefit"
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 text-white/50 transition-colors hover:border-white/30 hover:text-white"
          >
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden>
              <path d="M8.5 2L4 6.5L8.5 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <button
            type="button"
            onClick={next}
            aria-label="Next benefit"
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 text-white/50 transition-colors hover:border-white/30 hover:text-white"
          >
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden>
              <path d="M4.5 2L9 6.5L4.5 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
