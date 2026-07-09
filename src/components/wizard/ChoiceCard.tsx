"use client";

import { motion } from "framer-motion";
import type { WizardTheme } from "./theme";

const selectedRing: Record<WizardTheme, string> = {
  gold: "border-gold bg-gold/10 ring-1 ring-gold/40",
  cyan: "border-cyan-400 bg-cyan-400/10 ring-1 ring-cyan-400/40",
};

const checkBg: Record<WizardTheme, string> = {
  gold: "bg-gold text-navy",
  cyan: "bg-cyan-400 text-slate-950",
};

type Props = {
  label: string;
  sub?: string;
  desc?: string;
  icon?: string;
  selected: boolean;
  onClick: () => void;
  theme?: WizardTheme;
};

export function ChoiceCard({
  label,
  sub,
  desc,
  icon,
  selected,
  onClick,
  theme = "gold",
}: Props) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      className={`relative w-full min-h-[3.25rem] text-left rounded-xl border px-4 py-3.5 sm:p-5 transition-all duration-200 cursor-pointer focus:outline-none focus-visible:ring-2 touch-manipulation ${
        selected ? selectedRing[theme] : "border-white/10 bg-white/5 hover:border-white/25 hover:bg-white/8"
      } ${theme === "cyan" ? "focus-visible:ring-cyan-400/50" : "focus-visible:ring-gold/50"}`}
    >
      {selected && (
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className={`absolute top-3 right-3 w-5 h-5 rounded-full flex items-center justify-center ${checkBg[theme]}`}
        >
          <svg className="w-3 h-3" fill="none" viewBox="0 0 12 12">
            <path
              d="M2 6l3 3 5-5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </motion.span>
      )}
      {icon ? <div className="text-2xl mb-2">{icon}</div> : null}
      <div className="font-semibold text-white text-sm sm:text-base leading-snug pr-7 break-words">
        {label}
      </div>
      {sub ? <div className="text-xs text-white/50 mt-1 font-mono">{sub}</div> : null}
      {desc ? <div className="text-sm text-white/60 mt-1.5 leading-relaxed">{desc}</div> : null}
    </motion.button>
  );
}
