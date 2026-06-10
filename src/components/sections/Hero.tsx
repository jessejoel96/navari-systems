import Link from "next/link";
import { ConvergenceMark } from "@/components/ui/ConvergenceMark";
import { FadeIn } from "@/components/ui/FadeIn";

export function Hero() {
  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-navy px-5 pb-20 pt-28 md:px-10">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(201,168,76,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(201,168,76,0.04)_1px,transparent_1px)] bg-[size:60px_60px]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,#0A1628_80%)]" />

      <FadeIn className="relative z-10 mx-auto max-w-[900px] text-center">
        <div className="mb-7 inline-flex items-center gap-2 rounded-sm border border-gold-border px-3.5 py-1.5 font-mono text-[11px] uppercase tracking-[0.2em] text-gold">
          <span className="h-px w-5 bg-gold" />
          AI Automation &amp; Workflow Systems
        </div>

        <ConvergenceMark variant="hero" />

        <h1 className="mb-6 font-display text-[clamp(36px,6vw,68px)] font-extrabold leading-[1.08] tracking-tight text-white">
          Precision enters<br />
          where <span className="text-gold">chaos was.</span>
        </h1>

        <p className="mx-auto mb-10 max-w-[620px] text-[clamp(16px,2vw,19px)] font-light leading-relaxed text-silver">
          I find the three processes costing your business the most time and money,
          then build AI systems that eliminate them permanently — without adding headcount.
        </p>

        <div className="flex flex-wrap justify-center gap-4">
          <Link href="#book-call" className="inline-flex items-center gap-2 rounded bg-gold px-8 py-3.5 font-display text-[13px] font-bold tracking-wider text-navy transition-all hover:-translate-y-px hover:bg-gold-light">
            Book a Discovery Call →
          </Link>
          <Link href="#services" className="inline-flex items-center gap-2 rounded border border-white/15 px-8 py-3.5 font-display text-[13px] font-semibold tracking-wider text-white transition-colors hover:border-white/40 hover:bg-white/5">
            See What&apos;s Included
          </Link>
        </div>

        <div className="mt-16 flex flex-wrap justify-center gap-12 border-t border-white/7 pt-10">
          {[
            { num: "15–20", label: "Hours recovered weekly" },
            { num: "60", label: "Days to first results" },
            { num: "$0", label: "New hires required" },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <span className="mb-1.5 block font-mono text-[28px] font-medium leading-none text-gold">{s.num}</span>
              <span className="text-xs tracking-wide text-silver">{s.label}</span>
            </div>
          ))}
        </div>
      </FadeIn>
    </section>
  );
}
