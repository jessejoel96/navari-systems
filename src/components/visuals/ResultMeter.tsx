"use client";

import { motion } from "framer-motion";

type ResultMeterProps = {
  metric: string;
  label: string;
  fill: number;
  color?: string;
};

export function ResultMeter({ metric, label, fill, color = "#c9a84c" }: ResultMeterProps) {
  return (
    <div className="mb-4 last:mb-0">
      <div className="mb-1.5 flex items-baseline justify-between">
        <span className="font-mono text-3xl font-medium text-gold">{metric}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-white/10">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
          initial={{ width: 0 }}
          whileInView={{ width: `${fill}%` }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      </div>
      {label && (
        <p className="mt-1 font-mono text-[10px] uppercase tracking-wide text-silver-dark-bg">{label}</p>
      )}
    </div>
  );
}
