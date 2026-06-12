import Link from "next/link";
import { HeroFlowVisual } from "@/components/visuals/HeroFlowVisual";
import { FadeIn } from "@/components/ui/FadeIn";

export function Hero() {
  return (
    <section className="relative flex min-h-screen items-center overflow-hidden bg-navy px-5 pb-20 pt-28 md:px-10">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(201,168,76,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(201,168,76,0.04)_1px,transparent_1px)] bg-[size:60px_60px]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,#0A1628_80%)]" />

      <div className="relative z-10 mx-auto grid w-full max-w-[1200px] items-center gap-12 lg:grid-cols-2 lg:gap-16">
        <FadeIn className="text-center lg:text-left">
          <h1 className="mb-6 font-display text-[clamp(32px,5.5vw,56px)] font-extrabold leading-[1.12] tracking-tight text-white">
            Your team is doing work<br />
            a <span className="text-gold">system should handle.</span>
          </h1>

          <p className="mb-10 max-w-[540px] text-[clamp(18px,2.2vw,21px)] leading-relaxed text-silver-dark-bg lg:mx-0 mx-auto">
            We find your three costliest manual processes and automate them. Fixed price. Fixed timeline.
          </p>

          <div className="flex flex-wrap justify-center gap-4 lg:justify-start">
            <Link href="/audit" className="inline-flex items-center gap-2 rounded bg-gold px-8 py-4 font-display text-[15px] font-bold tracking-wide text-navy transition-all hover:-translate-y-px hover:bg-gold-light">
              Take the Free Audit →
            </Link>
            <Link href="#how-it-works" className="inline-flex items-center gap-2 rounded border border-white/20 px-8 py-4 font-display text-[15px] font-semibold tracking-wide text-white transition-colors hover:border-white/40 hover:bg-white/5">
              See How It Works
            </Link>
          </div>

          <p className="mt-4 text-center text-sm text-silver-dark-bg/60 lg:text-left">
            No tech knowledge needed. No new software to learn.
          </p>

          <div className="mt-10 flex flex-wrap justify-center gap-8 border-t border-white/7 pt-8 lg:justify-start">
            {[
              { num: "15-20", label: "Hrs/week recovered" },
              { num: "60", label: "Days to first results" },
              { num: "$0", label: "New hires needed" },
              { num: "4", label: "Clients per month" },
            ].map((s) => (
              <div key={s.label} className="text-center lg:text-left">
                <span className="mb-1 block font-mono text-2xl font-medium leading-none text-gold">{s.num}</span>
                <span className="text-sm tracking-wide text-silver-dark-bg">{s.label}</span>
              </div>
            ))}
          </div>
        </FadeIn>

        <FadeIn delay={0.15} className="hidden lg:block">
          <HeroFlowVisual />
        </FadeIn>
      </div>

      <FadeIn delay={0.2} className="relative z-10 mx-auto mt-12 w-full max-w-[480px] lg:hidden">
        <HeroFlowVisual />
      </FadeIn>
    </section>
  );
}
