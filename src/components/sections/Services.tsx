import Link from "next/link";
import { FadeIn } from "@/components/ui/FadeIn";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { SITE } from "@/lib/constants";

const services = [
  {
    badge: "Start Here",
    price: "$497",
    note: "Fixed price · Delivered in 5 days",
    title: "The Navari Audit",
    desc: "A written report, not a sales call. We map where you lose time and money, rank what to fix first, and show what automation looks like for your business.",
    features: [
      "Visual map of how your business runs today",
      "The Three Leaks Report, each one costed in hours and dollars",
      "Rating of how automatable each process is",
      "Recommended tools for your situation and budget",
      "A phased plan: what to build first, second, third",
    ],
    note2: "Audit fee credited toward your Build if you proceed.",
    cta: "Start with the Audit",
    featured: false,
  },
  {
    badge: "Core Service",
    price: "$800-$2,000",
    note: "Fixed price · 10-21 days",
    title: "The Navari Build",
    desc: "We build and install automation for your costliest manual process. It runs live in your business. Your team owns it.",
    features: [
      "One process, three connected processes, or full operations scope",
      "Working automation, installed and tested. Not a prototype.",
      "Written standard operating procedures (SOPs)",
      "Handover walkthrough so your team knows how to run it",
      "14-day post-launch check-in, then it is yours",
    ],
    note2: "Fixed scope. No retainer. You own everything we build.",
    cta: "Start with a Free Operations Review",
    featured: true,
  },
  {
    badge: "After Your Build",
    price: "$500-$1,500",
    note: "Per month · Optional",
    title: "Infrastructure Expansion",
    desc: "After a Build, one new automation or improvement per month. Your systems grow with the business without adding headcount.",
    features: [
      "Monthly review of what your systems are saving you",
      "One new automation or improvement per month",
      "Priority access for architecture questions",
      "Quarterly scan for new leaks as you grow",
      "Only available after a Navari Build is complete",
    ],
    note2: null,
    cta: "Discuss Expansion",
    featured: false,
  },
];

export function Services() {
  return (
    <section id="services" className="bg-slate-bg px-5 py-24 md:px-10">
      <div className="mx-auto max-w-[1100px]">
        <FadeIn>
          <SectionLabel>Pricing</SectionLabel>
          <h2 className="font-display text-[clamp(32px,4.5vw,48px)] font-extrabold leading-[1.15] tracking-tight text-navy">
            Fixed price. Fixed scope.<br />You own everything we build.
          </h2>
          <p className="mt-5 max-w-[560px] text-lg leading-relaxed text-body-text">
            Start with the $497 Audit. Most owners move to a Build once they see the numbers. No retainer. No lock-in.
          </p>
        </FadeIn>

        <div className="mt-14 grid gap-6 [grid-template-columns:repeat(auto-fit,minmax(300px,1fr))]">
          {services.map((s, i) => (
            <FadeIn key={s.title} delay={i * 0.08} className={`relative overflow-hidden rounded-lg border p-9 transition-all hover:shadow-lg ${s.featured ? "border-gold bg-navy" : "border-gold-border/20 bg-white hover:border-gold-border"}`}>
              <span className="mb-5 inline-block rounded-sm border border-gold-border bg-gold/10 px-3 py-1.5 font-mono text-xs font-medium uppercase tracking-wide text-gold">{s.badge}</span>
              <div className="mb-1 font-display text-4xl font-extrabold leading-none tracking-tight text-gold">{s.price}</div>
              <div className={`mb-5 font-mono text-sm ${s.featured ? "text-silver-dark-bg" : "text-silver"}`}>{s.note}</div>
              <h3 className={`mb-3 font-display text-2xl font-bold ${s.featured ? "text-white" : "text-navy"}`}>{s.title}</h3>
              <p className={`mb-6 text-base leading-relaxed ${s.featured ? "text-silver-dark-bg" : "text-body-text"}`}>{s.desc}</p>
              <ul className="mb-6 flex flex-col gap-2.5">
                {s.features.map((f) => (
                  <li key={f} className={`relative border-b pb-2.5 pl-4 text-base before:absolute before:left-0 before:top-[9px] before:h-1.5 before:w-1.5 before:rounded-full before:bg-gold ${s.featured ? "border-white/8 text-white/90" : "border-gold-border/20 text-body-text"}`}>{f}</li>
                ))}
              </ul>
              {s.note2 && (
                <p className={`mb-5 rounded px-3 py-2 text-xs font-medium leading-relaxed ${s.featured ? "bg-white/8 text-silver-dark-bg" : "bg-gold/8 text-navy"}`}>
                  ✓ {s.note2}
                </p>
              )}
              <Link href={SITE.calendly} target="_blank" rel="noopener noreferrer" className={`block rounded px-6 py-3.5 text-center font-display text-sm font-bold uppercase tracking-wide transition-colors ${s.featured ? "bg-gold text-navy hover:bg-gold-light" : "border border-navy text-navy hover:bg-navy hover:text-white"}`}>
                {s.cta}
              </Link>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
