"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const tabs = [
  { id: "leaks", label: "Three Leaks" },
  { id: "map", label: "Process Map" },
  { id: "system", label: "Live System" },
] as const;

type TabId = (typeof tabs)[number]["id"];

export function DeliverablePreview() {
  const [active, setActive] = useState<TabId>("leaks");

  return (
    <div className="overflow-hidden rounded-xl border border-gold-border/20 bg-white shadow-xl">
      <div className="flex items-center justify-between border-b border-gold-border/15 bg-navy px-5 py-3">
        <div className="flex gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActive(tab.id)}
              className={cn(
                "rounded px-3 py-1.5 font-mono text-xs transition-colors",
                active === tab.id
                  ? "bg-gold/20 text-gold"
                  : "text-silver-dark-bg hover:bg-white/10 hover:text-white"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <span className="font-mono text-[10px] tracking-wide text-gold">NAVARI SYSTEMS</span>
      </div>

      <div className="relative min-h-[320px] p-5">
        <AnimatePresence mode="wait">
          {active === "leaks" && (
            <motion.div key="leaks" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <LeaksReport />
            </motion.div>
          )}
          {active === "map" && (
            <motion.div key="map" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <ProcessMap />
            </motion.div>
          )}
          {active === "system" && (
            <motion.div key="system" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <LiveSystem />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function LeaksReport() {
  const rows = [
    { process: "Listing sync (manual)", cost: "$840/wk", severity: 95 },
    { process: "Lead follow-up routing", cost: "$560/wk", severity: 78 },
    { process: "Document processing", cost: "$320/wk", severity: 52 },
  ];

  return (
    <div>
      <p className="mb-4 font-display text-sm font-bold text-navy">The Three Leaks Report</p>
      {rows.map((r) => (
        <div key={r.process} className="mb-3 border-b border-gold-border/15 pb-3 last:mb-0">
          <div className="flex justify-between text-sm">
            <span className="text-body-text">{r.process}</span>
            <span className="font-mono text-[#E85D4A]">{r.cost}</span>
          </div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-bg">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-[#E85D4A] to-[#E8A74A]"
              initial={{ width: 0 }}
              animate={{ width: `${r.severity}%` }}
              transition={{ duration: 0.8, delay: 0.1 }}
            />
          </div>
        </div>
      ))}
      <div className="mt-4 flex justify-between rounded-md bg-emerald-500/8 px-4 py-3">
        <span className="font-semibold text-navy">Total recoverable</span>
        <span className="font-mono font-semibold text-[#4AC98A]">$1,720/wk</span>
      </div>
    </div>
  );
}

function ProcessMap() {
  return (
    <div>
      <p className="mb-4 font-display text-sm font-bold text-navy">Operational Process Map</p>
      <svg viewBox="0 0 340 200" className="w-full" aria-hidden>
        <rect x="10" y="20" width="80" height="28" rx="4" fill="#f4f6f9" stroke="#5a6d80" strokeWidth="1" />
        <text x="50" y="38" textAnchor="middle" fill="#1a2b3c" fontSize="9" fontFamily="monospace">Lead in</text>
        <rect x="130" y="20" width="80" height="28" rx="4" fill="#f4f6f9" stroke="#5a6d80" strokeWidth="1" />
        <text x="170" y="38" textAnchor="middle" fill="#1a2b3c" fontSize="9" fontFamily="monospace">CRM entry</text>
        <rect x="250" y="20" width="80" height="28" rx="4" fill="rgba(232,93,74,0.1)" stroke="#E85D4A" strokeWidth="1.5" strokeDasharray="4 3" />
        <text x="290" y="38" textAnchor="middle" fill="#E85D4A" fontSize="9" fontFamily="monospace">Manual sync</text>

        <line x1="90" y1="34" x2="130" y2="34" stroke="#5a6d80" strokeWidth="1" />
        <line x1="210" y1="34" x2="250" y2="34" stroke="#E85D4A" strokeWidth="1.5" strokeDasharray="4 3" />

        <rect x="10" y="80" width="80" height="28" rx="4" fill="#f4f6f9" stroke="#5a6d80" strokeWidth="1" />
        <text x="50" y="98" textAnchor="middle" fill="#1a2b3c" fontSize="9" fontFamily="monospace">Email draft</text>
        <rect x="130" y="80" width="80" height="28" rx="4" fill="rgba(232,93,74,0.1)" stroke="#E85D4A" strokeWidth="1.5" />
        <text x="170" y="98" textAnchor="middle" fill="#E85D4A" fontSize="9" fontFamily="monospace">Copy-paste</text>
        <rect x="250" y="80" width="80" height="28" rx="4" fill="#f4f6f9" stroke="#5a6d80" strokeWidth="1" />
        <text x="290" y="98" textAnchor="middle" fill="#1a2b3c" fontSize="9" fontFamily="monospace">Send</text>

        <line x1="90" y1="94" x2="130" y2="94" stroke="#5a6d80" strokeWidth="1" />
        <line x1="210" y1="94" x2="250" y2="94" stroke="#5a6d80" strokeWidth="1" />

        <rect x="70" y="140" width="200" height="40" rx="6" fill="rgba(201,168,76,0.1)" stroke="#c9a84c" strokeWidth="1.5" />
        <text x="170" y="158" textAnchor="middle" fill="#c9a84c" fontSize="10" fontFamily="monospace" fontWeight="bold">RECOMMENDED: Automate sync + routing</text>
        <text x="170" y="172" textAnchor="middle" fill="#5a6d80" fontSize="9" fontFamily="monospace">Est. 18 hrs/week recovered</text>
      </svg>
    </div>
  );
}

function LiveSystem() {
  return (
    <div>
      <p className="mb-4 font-display text-sm font-bold text-navy">Deployed Automation — Live</p>
      <div className="space-y-3">
        {[
          { label: "Listing sync", status: "Running", runs: "847 runs this week" },
          { label: "Lead routing", status: "Running", runs: "124 leads processed" },
          { label: "Doc generation", status: "Running", runs: "0 errors in 14 days" },
        ].map((item) => (
          <div key={item.label} className="flex items-center justify-between rounded-lg border border-gold-border/20 bg-slate-bg px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-navy">{item.label}</p>
              <p className="font-mono text-xs text-silver">{item.runs}</p>
            </div>
            <span className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 font-mono text-[10px] text-emerald-600">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
              {item.status}
            </span>
          </div>
        ))}
      </div>
      <div className="mt-4 rounded-lg bg-navy px-4 py-3 text-center font-mono text-xs text-gold">
        Your team monitors this. Navari handed over the keys.
      </div>
    </div>
  );
}
