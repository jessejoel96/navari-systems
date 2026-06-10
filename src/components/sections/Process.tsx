import { FadeIn } from "@/components/ui/FadeIn";
import { SectionLabel } from "@/components/ui/SectionLabel";

const steps = [
  { num: "01", title: "Discover", desc: "Identify the highest-cost manual processes in your business" },
  { num: "02", title: "Diagnose", desc: "Calculate exact time and money cost of each process" },
  { num: "03", title: "Design", desc: "Build the automation architecture before touching any tool" },
  { num: "04", title: "Deploy", desc: "Build, test, and launch the live automation system" },
  { num: "05", title: "Document", desc: "Complete operations manual — what was built and how it runs" },
  { num: "06", title: "Deliver", desc: "Handoff, 14-day support, and performance baseline report" },
];

export function Process() {
  return (
    <section id="how-it-works" className="relative overflow-hidden bg-navy px-5 py-24 md:px-10">
      <div className="mx-auto max-w-[1100px]">
        <FadeIn>
          <SectionLabel>The Process</SectionLabel>
          <h2 className="font-display text-[clamp(28px,4vw,44px)] font-extrabold leading-tight tracking-tight text-white">
            Six steps from broken process<br />to functioning system.
          </h2>
        </FadeIn>

        <div className="relative mt-14 grid gap-8 md:gap-0 md:[grid-template-columns:repeat(auto-fit,minmax(160px,1fr))]">
          <div className="pointer-events-none absolute left-[10%] right-[10%] top-7 hidden h-px bg-gradient-to-r from-transparent via-gold-border to-transparent md:block" />
          <div className="pointer-events-none absolute bottom-4 left-7 top-4 w-px bg-gradient-to-b from-gold-border via-gold-border to-transparent md:hidden" />
          {steps.map((s, i) => (
            <FadeIn key={s.num} delay={i * 0.06} className="relative px-4 text-center md:text-center">
              <div className="relative z-10 mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full border border-gold-border bg-gold/8 transition-colors hover:border-gold hover:bg-gold/18 md:mx-auto">
                <span className="font-mono text-[13px] font-medium text-gold">{s.num}</span>
              </div>
              <h4 className="mb-2 font-display text-[13px] font-bold uppercase tracking-wider text-white">{s.title}</h4>
              <p className="text-[13px] leading-snug text-silver">{s.desc}</p>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
