import { ResultMeter } from "@/components/visuals/ResultMeter";
import { FadeIn } from "@/components/ui/FadeIn";
import { SectionLabel } from "@/components/ui/SectionLabel";

const results = [
  {
    metric: "18 hrs",
    industry: "Real Estate Agency",
    desc: "Weekly hours back after automating listing updates from one source.",
    fill: 90,
    color: "#c9a84c",
  },
  {
    metric: "$2,100",
    industry: "Online Education Business",
    desc: "Monthly labour cost cut by automating onboarding and certificates.",
    fill: 85,
    color: "#4AC98A",
  },
  {
    metric: "94%",
    industry: "Professional Services Firm",
    desc: "Fewer intake errors after automating qualification and routing.",
    fill: 94,
    color: "#c9a84c",
  },
];

export function Results() {
  return (
    <section id="results" className="bg-navy px-5 py-24 md:px-10">
      <div className="mx-auto max-w-[1100px]">
        <FadeIn>
          <SectionLabel>Results</SectionLabel>
          <h2 className="font-display text-[clamp(32px,4.5vw,48px)] font-extrabold leading-[1.15] tracking-tight text-white">
            What business owners recover<br />when the manual work stops.
          </h2>
          <p className="mt-5 max-w-[640px] text-lg leading-relaxed text-silver-dark-bg">
            Real outcomes from deployed systems: hours back, money saved, errors eliminated.
          </p>
        </FadeIn>

        <div className="mt-14 grid gap-6 [grid-template-columns:repeat(auto-fit,minmax(280px,1fr))]">
          {results.map((r, i) => (
            <FadeIn key={r.industry} delay={i * 0.08} className="rounded-lg border border-white/8 bg-white/4 p-7 transition-colors hover:border-gold-border">
              <ResultMeter metric={r.metric} label={r.industry} fill={r.fill} color={r.color} />
              <p className="text-lg leading-relaxed text-white/90">{r.desc}</p>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
