"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export function BeforeAfterToggle() {
  const [mode, setMode] = useState<"before" | "after">("before");

  return (
    <div className="overflow-hidden rounded-xl border border-gold-border/25 bg-slate-bg shadow-lg">
      <div className="flex border-b border-gold-border/20">
        {(["before", "after"] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setMode(m)}
            className={cn(
              "flex-1 px-4 py-3.5 font-display text-sm font-bold transition-colors",
              mode === m
                ? m === "before"
                  ? "bg-white text-navy"
                  : "bg-navy text-gold"
                : "text-silver hover:text-navy"
            )}
          >
            {m === "before" ? "How it runs today" : "After Navari builds it"}
          </button>
        ))}
      </div>

      <div className="relative min-h-[280px] bg-white p-6 md:p-8">
        <AnimatePresence mode="wait">
          {mode === "before" ? (
            <motion.div
              key="before"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
            >
              <WorkflowDiagram variant="before" />
              <p className="mt-5 text-center text-sm text-silver">
                Staff manually moving data between tools. <span className="font-semibold text-[#E85D4A]">~18 hrs/week lost</span>
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="after"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
            >
              <WorkflowDiagram variant="after" />
              <p className="mt-5 text-center text-sm text-silver">
                One trigger updates everything automatically. <span className="font-semibold text-[#4AC98A]">Staff focus on clients.</span>
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function WorkflowDiagram({ variant }: { variant: "before" | "after" }) {
  const isBefore = variant === "before";

  return (
    <svg viewBox="0 0 500 180" className="mx-auto h-auto w-full max-w-[500px]" aria-hidden>
      {isBefore ? (
        <>
          <Box x={20} y={20} label="New lead" color="#8a9bb0" />
          <Box x={20} y={70} label="CRM entry" color="#8a9bb0" />
          <Box x={20} y={120} label="Follow-up email" color="#8a9bb0" />
          <Box x={200} y={45} label="Spreadsheet" color="#8a9bb0" />
          <Box x={200} y={105} label="Calendar" color="#8a9bb0" />
          <Box x={380} y={70} label="Client notified?" color="#E85D4A" dashed />

          <MessyLine d="M110 36 Q155 20 200 61" />
          <MessyLine d="M110 86 Q155 70 200 61" />
          <MessyLine d="M110 86 Q155 110 200 121" />
          <MessyLine d="M110 136 Q155 150 200 121" />
          <MessyLine d="M290 61 Q335 50 380 86" />
          <MessyLine d="M290 121 Q335 130 380 86" />

          <text x={250} y={165} textAnchor="middle" fill="#E85D4A" fontSize="11" fontFamily="monospace">
            6 manual steps · 3 people involved · errors common
          </text>
        </>
      ) : (
        <>
          <Box x={40} y={70} label="New lead" color="#c9a84c" />
          <Box x={200} y={70} label="Navari System" color="#c9a84c" highlight />
          <Box x={360} y={30} label="CRM updated" color="#4AC98A" />
          <Box x={360} y={70} label="Email sent" color="#4AC98A" />
          <Box x={360} y={110} label="Team notified" color="#4AC98A" />

          <CleanLine x1={130} y1={86} x2={200} y2={86} />
          <CleanLine x1={300} y1={86} x2={360} y2={46} />
          <CleanLine x1={300} y1={86} x2={360} y2={86} />
          <CleanLine x1={300} y1={86} x2={360} y2={126} />

          <text x={250} y={165} textAnchor="middle" fill="#4AC98A" fontSize="11" fontFamily="monospace">
            1 trigger · 0 manual steps · runs 24/7
          </text>
        </>
      )}
    </svg>
  );
}

function Box({ x, y, label, color, highlight, dashed }: {
  x: number; y: number; label: string; color: string; highlight?: boolean; dashed?: boolean;
}) {
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={90}
        height={32}
        rx={4}
        fill={highlight ? "rgba(201,168,76,0.15)" : "rgba(138,155,176,0.08)"}
        stroke={color}
        strokeWidth={highlight ? 2 : 1}
        strokeDasharray={dashed ? "4 3" : undefined}
      />
      <text x={x + 45} y={y + 20} textAnchor="middle" fill={color} fontSize="10" fontFamily="monospace">
        {label}
      </text>
    </g>
  );
}

function MessyLine({ d }: { d: string }) {
  return (
    <path
      d={d}
      fill="none"
      stroke="rgba(232,93,74,0.5)"
      strokeWidth="1.5"
      strokeDasharray="5 4"
    />
  );
}

function CleanLine({ x1, y1, x2, y2 }: { x1: number; y1: number; x2: number; y2: number }) {
  return (
    <path
      d={`M${x1} ${y1} L${x2} ${y2}`}
      fill="none"
      stroke="#c9a84c"
      strokeWidth="2"
    />
  );
}
