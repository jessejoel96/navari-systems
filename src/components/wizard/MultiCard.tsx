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
  icon?: string;
  selected: boolean;
  onClick: () => void;
  theme?: WizardTheme;
};

export function MultiCard({ label, icon, selected, onClick, theme = "gold" }: Props) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileTap={{ scale: 0.96 }}
      className={`relative w-full min-h-[3rem] text-left rounded-xl border px-3 py-3 sm:p-4 transition-all duration-150 cursor-pointer focus:outline-none focus-visible:ring-2 touch-manipulation ${
        selected ? selectedRing[theme] : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/8"
      } ${theme === "cyan" ? "focus-visible:ring-cyan-400/50" : "focus-visible:ring-gold/50"}`}
    >
      {selected && (
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className={`absolute top-2 right-2 w-4 h-4 rounded flex items-center justify-center ${checkBg[theme]}`}
        >
          <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 12 12">
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
      {icon ? <div className="text-xl mb-1">{icon}</div> : null}
      <div className="text-xs sm:text-sm font-semibold text-white leading-snug pr-5 break-words">
        {label}
      </div>
    </motion.button>
  );
}
