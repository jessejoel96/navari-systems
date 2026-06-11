"use client";

import { motion } from "framer-motion";

const sources = [
  { label: "CRM", y: 28 },
  { label: "Inbox", y: 100 },
  { label: "Sheets", y: 172 },
];

export function HeroFlowVisual() {
  return (
    <div className="relative mx-auto w-full max-w-[480px]">
      <div className="absolute -inset-4 rounded-2xl bg-gold/5 blur-2xl" />
      <div className="relative overflow-hidden rounded-xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-sm">
        <div className="mb-4 flex items-center justify-between font-mono text-[10px] uppercase tracking-wider text-silver-dark-bg">
          <span>Manual inputs</span>
          <span className="text-gold">Navari convergence</span>
          <span>One system</span>
        </div>

        <svg viewBox="0 0 400 200" className="h-auto w-full" aria-hidden>
          {sources.map((s, i) => (
            <g key={s.label}>
              <motion.rect
                x="8"
                y={s.y - 16}
                width="72"
                height="32"
                rx="4"
                fill="rgba(138,155,176,0.12)"
                stroke="rgba(138,155,176,0.4)"
                strokeWidth="1"
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + i * 0.15 }}
              />
              <text x="44" y={s.y + 4} textAnchor="middle" fill="#c5d0dc" fontSize="11" fontFamily="monospace">
                {s.label}
              </text>
              <motion.path
                d={`M80 ${s.y} Q160 ${s.y} 200 100`}
                fill="none"
                stroke={i === 1 ? "#c9a84c" : "rgba(138,155,176,0.5)"}
                strokeWidth={i === 1 ? 2 : 1.5}
                strokeDasharray="4 4"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ delay: 0.5 + i * 0.2, duration: 0.8 }}
              />
            </g>
          ))}

          <motion.circle
            cx="200"
            cy="100"
            r="14"
            fill="#c9a84c"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 1, type: "spring" }}
          />
          <motion.circle
            cx="200"
            cy="100"
            r="22"
            fill="none"
            stroke="#c9a84c"
            strokeWidth="1"
            opacity="0.4"
            animate={{ scale: [1, 1.3, 1], opacity: [0.4, 0, 0.4] }}
            transition={{ duration: 2.5, repeat: Infinity }}
          />

          <motion.path
            d="M214 100 H320"
            fill="none"
            stroke="#c9a84c"
            strokeWidth="2.5"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ delay: 1.2, duration: 0.6 }}
          />

          <motion.rect
            x="320"
            y="72"
            width="72"
            height="56"
            rx="6"
            fill="rgba(201,168,76,0.15)"
            stroke="#c9a84c"
            strokeWidth="1.5"
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.5 }}
          />
          <text x="356" y="96" textAnchor="middle" fill="#c9a84c" fontSize="10" fontFamily="monospace" fontWeight="bold">
            AUTOMATED
          </text>
          <text x="356" y="112" textAnchor="middle" fill="#c5d0dc" fontSize="9" fontFamily="monospace">
            SYSTEM
          </text>

          <motion.circle
            r="4"
            fill="#e8c96a"
            animate={{ cx: [80, 200, 320], cy: [100, 100, 100] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          />
        </svg>

        <div className="mt-4 grid grid-cols-3 gap-2 text-center font-mono text-[10px] text-silver-dark-bg">
          <div className="rounded border border-white/8 bg-white/5 px-2 py-1.5">
            <span className="block text-[#E85D4A]">3 tools</span>
            manual
          </div>
          <div className="rounded border border-gold/30 bg-gold/10 px-2 py-1.5 text-gold">
            <span className="block">1 engine</span>
            mapped
          </div>
          <div className="rounded border border-emerald-500/30 bg-emerald-500/10 px-2 py-1.5 text-emerald-400">
            <span className="block">0</span>
            copy-paste
          </div>
        </div>
      </div>
    </div>
  );
}
