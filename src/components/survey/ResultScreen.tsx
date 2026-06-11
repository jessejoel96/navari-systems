"use client";

import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import type { AuditAnalysis, LeakItem } from "@/lib/audit/types";

interface Props {
  name: string;
  email: string;
  industry: string;
  revenue: string;
  analysis: AuditAnalysis;
  emailSent?: boolean;
}

function useCountUp(target: number, duration = 1200, delay = 0) {
  const [val, setVal] = useState(0);
  const started = useRef(false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (started.current) return;
      started.current = true;
      const steps = 50;
      const inc = target / steps;
      let current = 0;
      const timer = setInterval(() => {
        current += inc;
        if (current >= target) {
          setVal(target);
          clearInterval(timer);
        } else {
          setVal(Math.floor(current));
        }
      }, duration / steps);
    }, delay);
    return () => clearTimeout(timeout);
  }, [target, duration, delay]);

  return val;
}

function fmt(n: number) {
  return n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
}

function FeasibilityBar({ feasibility }: { feasibility: LeakItem["automationFeasibility"] }) {
  const widths = { High: "w-4/5", Medium: "w-1/2", Low: "w-1/4" };
  const colours = { High: "bg-green-400", Medium: "bg-yellow-400", Low: "bg-slate-400" };
  const labels = { High: "High", Medium: "Medium", Low: "Lower" };

  return (
    <div className="flex items-center gap-3 mt-2">
      <div className="flex-1 h-1 rounded-full bg-white/5 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: "100%" }}
          transition={{ duration: 1, delay: 0.6 }}
          className={`h-full ${colours[feasibility]} ${widths[feasibility]}`}
          style={{ maxWidth: widths[feasibility] === "w-4/5" ? "80%" : widths[feasibility] === "w-1/2" ? "50%" : "25%" }}
        />
      </div>
      <span className={`text-xs font-mono ${colours[feasibility].replace("bg-", "text-")}`}>
        {labels[feasibility]} Feasibility
      </span>
    </div>
  );
}

function LeakCard({ leak, index }: { leak: LeakItem; index: number }) {
  const hours = useCountUp(leak.weeklyHours, 1000, index * 150 + 400);
  const weekly = useCountUp(leak.weeklyRevenueCost, 1100, index * 150 + 400);
  const annual = useCountUp(leak.annualCost, 1200, index * 150 + 400);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 + index * 0.12 }}
      className="border-b border-white/6 py-5 last:border-0"
    >
      <div className="flex items-start gap-4">
        <span className="font-mono text-gold/60 text-sm shrink-0 mt-0.5">
          0{leak.rank}
        </span>
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-white mb-1">{leak.process}</div>
          <div className="text-sm text-white/55 mb-3 leading-relaxed">{leak.solution}</div>
          <div className="flex flex-wrap gap-x-5 gap-y-1">
            <span className="font-mono text-gold text-sm">~{hours} hrs/wk</span>
            <span className="font-mono text-gold text-sm">{fmt(weekly)}/wk</span>
            <span className="font-mono text-gold/70 text-sm">{fmt(annual)}/yr</span>
          </div>
          <FeasibilityBar feasibility={leak.automationFeasibility} />
        </div>
      </div>
    </motion.div>
  );
}

export function ResultScreen({ name, email, industry, revenue, analysis, emailSent = true }: Props) {
  const weeklyHours = useCountUp(analysis.totals.weeklyHours, 1200, 800);
  const weeklyRevenue = useCountUp(analysis.totals.weeklyRevenue, 1300, 850);
  const annualSavings = useCountUp(analysis.totals.annualSavings, 1400, 900);

  const firstName = name.split(" ")[0];

  const auditUrl = "https://buy.stripe.com/navari-audit";
  const buildUrl = "https://cal.com/navari/architect";

  return (
    <div className="max-w-2xl mx-auto">
      {/* Report header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex items-start justify-between mb-8 border-b border-white/8 pb-6"
      >
        <div>
          <div className="text-xs font-mono text-white/40 tracking-widest uppercase mb-1">
            Navari Systems
          </div>
          <div className="text-xl font-bold text-white">Operations Assessment</div>
          <div className="text-xs font-mono text-white/40 mt-1">
            Preliminary · Generated for {firstName}
          </div>
        </div>
        <div className="text-right">
          <div className="text-xs font-mono text-white/40">{industry}</div>
          <div className="text-xs font-mono text-white/40">{revenue}</div>
        </div>
      </motion.div>

      {/* Simulation disclaimer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="bg-amber-950/30 border border-amber-500/20 rounded-xl px-4 py-3 mb-8 flex items-start gap-3"
      >
        <span className="text-amber-400 text-sm mt-0.5 shrink-0">⚠</span>
        <p className="text-xs font-mono text-amber-300/70">
          <strong>Simulation &amp; Estimate</strong> — These figures are projections based on industry data and your inputs. Exact costs and timelines require the full Navari Audit.
        </p>
      </motion.div>

      {/* Leaks section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15 }}
        className="mb-2"
      >
          <div className="text-xs font-mono text-white/40 tracking-widest uppercase mb-1">
          Identified Leaks
        </div>
      </motion.div>

      <div className="bg-white/5 border border-white/10 rounded-2xl px-5 py-2 mb-8">
        {analysis.leaks.map((leak, i) => (
          <LeakCard key={leak.rank} leak={leak} index={i} />
        ))}
      </div>

      {/* Totals */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-gradient-to-br from-gold/10 to-gold/5 border border-gold/20 rounded-2xl p-6 mb-8"
      >
        <div className="text-xs font-mono text-gold/60 tracking-widest uppercase mb-4">
          Total Recoverable
        </div>
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-gold font-mono">
              {weeklyHours}<span className="text-lg text-gold/60 font-normal">h</span>
            </div>
            <div className="text-xs font-mono text-white/45 uppercase tracking-wide mt-1">Per Week</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-gold font-mono">
              {fmt(weeklyRevenue)}
            </div>
            <div className="text-xs font-mono text-white/45 uppercase tracking-wide mt-1">Weekly</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-gold font-mono">
              {fmt(annualSavings)}
            </div>
            <div className="text-xs font-mono text-white/45 uppercase tracking-wide mt-1">Annual</div>
          </div>
        </div>
        <div className="border-t border-gold/10 pt-3">
          <p className="text-sm text-white/80">{analysis.totals.capacityUpside}</p>
        </div>
      </motion.div>

      {/* Urgency note */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mb-8 text-sm text-slate/60 font-mono italic border-l-2 border-gold/30 pl-4"
      >
        {analysis.urgencyNote}
      </motion.div>

      {/* Recommendation */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.55 }}
        className="mb-8"
      >
        <div className="text-xs font-mono text-white/40 tracking-widest uppercase mb-2">
          Recommendation
        </div>
        <p className="text-white/85 text-base leading-relaxed">
          {analysis.recommendationReason}
        </p>
      </motion.div>

      {/* CTA block */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.65 }}
        className="border border-white/10 rounded-2xl overflow-hidden mb-8"
      >
        {/* Primary CTA */}
        <div className="p-6 border-b border-white/8">
          <div className="flex items-start gap-4">
            <div className="flex-1">
          <div className="font-bold text-white text-lg mb-1">
              The Navari Audit
                <span className="ml-2 text-sm font-mono text-gold/70">$497</span>
              </div>
              <p className="text-sm text-white/60 leading-relaxed mb-4">
                Full process mapping with exact costs, build sequence, tool stack, and delivery timeline. Most clients recoup this within the first month of deployment.
              </p>
              <ul className="text-xs font-mono text-white/50 space-y-1 mb-5">
                <li>→ Exact weekly cost of each manual process</li>
                <li>→ Prioritised automation sequence</li>
                <li>→ Tool and integration recommendations</li>
                <li>→ Build timeline and expected ROI</li>
              </ul>
              <a
                href={auditUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-gold text-navy font-bold px-7 py-3.5 rounded-xl text-sm hover:bg-gold/90 transition-colors"
              >
                Start the Audit — $497
                <svg className="w-4 h-4" fill="none" viewBox="0 0 16 16"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </a>
            </div>
          </div>
        </div>

        {/* Secondary CTA */}
        <div className="p-6 bg-white/2">
          <div className="font-semibold text-white mb-1">
            Already know what you need?
          </div>
          <p className="text-sm text-white/55 mb-4">
            Skip the audit and book directly with a systems architect. We scope the build together on the call.
          </p>
          <a
            href={buildUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 border border-white/20 text-white/80 px-6 py-3 rounded-xl text-sm hover:border-white/35 hover:bg-white/5 hover:text-white transition-all"
          >
            Book an Architect Call →
          </a>
        </div>
      </motion.div>

      {/* Email confirmation */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.75 }}
        className="text-center"
      >
        {emailSent ? (
          <p className="text-xs text-white/30 font-mono">
            A full copy of this assessment has been sent to{" "}
            <span className="text-white/50">{email}</span>
          </p>
        ) : (
          <p className="text-xs text-amber-400/80 font-mono">
            We could not deliver the email to {email}. Your results are shown above — screenshot or contact us if you need a copy.
          </p>
        )}
        <p className="text-xs text-white/20 font-mono mt-1">
          Navari Systems · navari.systems
        </p>
      </motion.div>
    </div>
  );
}
