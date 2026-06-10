import { FadeIn } from "@/components/ui/FadeIn";
import { SectionLabel } from "@/components/ui/SectionLabel";

const results = [
  { metric: "18 hrs", industry: "Real Estate Agency", desc: "Weekly staff hours recovered by automating listing syndication across three platforms from a single source update." },
  { metric: "$2,100", industry: "Online Education Business", desc: "Monthly labour cost eliminated by automating student onboarding, progress tracking, and certificate delivery." },
  { metric: "94%", industry: "Professional Services Firm", desc: "Reduction in manual client intake errors after building an automated qualification, routing, and scheduling system." },
];

export function Results() {
  return (
    <section id="results" className="bg-navy px-5 py-24 md:px-10">
      <div className="mx-auto max-w-[1100px]">
        <FadeIn>
          <SectionLabel>What Changes</SectionLabel>
          <h2 className="font-display text-[clamp(28px,4vw,44px)] font-extrabold leading-tight tracking-tight text-white">
            What businesses recover<br />when the processes are fixed.
          </h2>
        </FadeIn>

        <div className="mt-14 grid gap-6 [grid-template-columns:repeat(auto-fit,minmax(280px,1fr))]">
          {results.map((r, i) => (
            <FadeIn key={r.industry} delay={i * 0.08} className="rounded-lg border border-white/8 bg-white/4 p-7 transition-colors hover:border-gold-border">
              <div className="mb-2 font-mono text-[42px] font-medium leading-none text-gold">{r.metric}</div>
              <div className="mb-4 font-mono text-[10px] uppercase tracking-widest text-silver">{r.industry}</div>
              <p className="text-[15px] leading-relaxed text-white/75">{r.desc}</p>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
