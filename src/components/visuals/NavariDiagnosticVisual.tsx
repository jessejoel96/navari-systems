"use client";

import Image from "next/image";
import { motion } from "framer-motion";

export function NavariDiagnosticVisual() {
  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.4 }}
      className="flex flex-col overflow-hidden rounded-xl border border-[#E85D4A]/25 bg-[#f4f6f9] shadow-sm md:flex-row"
    >
      <div className="flex flex-1 flex-col justify-between p-6 md:p-8">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded bg-[#E85D4A]/10 px-2.5 py-1 font-mono text-[10px] font-medium uppercase tracking-widest text-[#C0392B]">
              The Chaos
            </span>
            <span className="font-mono text-[10px] uppercase tracking-widest text-[#E85D4A]/70">
              (Current State)
            </span>
          </div>
          <h3 className="mt-3 font-display text-lg font-bold leading-snug text-navy">
            Manual Routing & Data Entry
          </h3>
          <p className="mt-3 max-w-[480px] text-sm leading-relaxed text-silver">
            Your team moves information between tools by hand, every day. Data moves slowly, errors creep in, and hours that should go to growth go to upkeep.
          </p>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: "Copying data", icon: "⟳" },
            { label: "Chasing updates", icon: "↻" },
            { label: "Manual follow-ups", icon: "✉" },
            { label: "Bridging tools", icon: "⚡" },
          ].map((item) => (
            <div key={item.label} className="rounded-lg border border-[#E85D4A]/15 bg-white px-3 py-2.5 text-center">
              <span className="block text-lg leading-none text-[#E85D4A]/70">{item.icon}</span>
              <span className="mt-1 block font-mono text-[10px] text-navy/70">{item.label}</span>
            </div>
          ))}
        </div>

        <p className="mt-5 inline-block rounded border border-[#E85D4A]/20 bg-[#E85D4A]/8 px-3 py-1.5 font-mono text-[11px] font-medium text-[#C0392B]">
          Est. cost: 15-20 hrs/week
        </p>
      </div>

      <div className="flex min-h-[220px] items-center justify-center overflow-hidden bg-white/80 md:w-[360px] md:min-h-0">
        <Image
          src="/diagnostic/chaos.png"
          alt="Diagram of manual routing chaos: overwhelmed team surrounded by disconnected Gmail, Excel, WhatsApp, and CRM tools"
          width={800}
          height={800}
          className="h-auto w-full object-contain"
        />
      </div>
    </motion.article>
  );
}
