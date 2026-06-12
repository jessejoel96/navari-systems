"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const metrics = [
  {
    metric: "18 hrs",
    label: "per week",
    desc: "Recovered after automating listing updates across all platforms.",
    fill: 90,
    color: "#c9a84c",
  },
  {
    metric: "$2,100",
    label: "per month",
    desc: "Labour cost cut by automating onboarding and certificate delivery.",
    fill: 85,
    color: "#4AC98A",
  },
  {
    metric: "94%",
    label: "error reduction",
    desc: "Fewer intake mistakes after automating lead qualification and routing.",
    fill: 94,
    color: "#c9a84c",
  },
];

type MetricCardsProps = {
  layout?: "grid" | "vertical";
  className?: string;
};

export function MetricCards({ layout = "grid", className }: MetricCardsProps) {
  return (
    <div
      className={cn(
        layout === "vertical"
          ? "flex h-full flex-col justify-between gap-3"
          : "grid gap-5 [grid-template-columns:repeat(auto-fit,minmax(260px,1fr))]",
        className
      )}
    >
      {metrics.map((r, i) => (
        <motion.div
          key={r.metric}
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.08, duration: 0.4 }}
          className={cn(
            "rounded-lg border border-white/8 bg-white/4 transition-colors hover:border-gold/30",
            layout === "vertical" ? "flex flex-1 flex-col justify-center px-5 py-4" : "px-6 py-5"
          )}
        >
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-[clamp(30px,4vw,42px)] font-medium leading-none text-gold">
              {r.metric}
            </span>
            <span className="font-mono text-[11px] uppercase tracking-wide text-silver-dark-bg/45">
              {r.label}
            </span>
          </div>

          <div className="my-3 h-1.5 overflow-hidden rounded-full bg-white/8">
            <motion.div
              className="h-full rounded-full"
              style={{ backgroundColor: r.color }}
              initial={{ width: 0 }}
              whileInView={{ width: `${r.fill}%` }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 + 0.2, duration: 1, ease: "easeOut" }}
            />
          </div>

          <p className="text-sm leading-relaxed text-silver-dark-bg/80">{r.desc}</p>
        </motion.div>
      ))}
    </div>
  );
}
