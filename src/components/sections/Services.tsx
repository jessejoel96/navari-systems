import Link from "next/link";
import { FadeIn } from "@/components/ui/FadeIn";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { SITE } from "@/lib/constants";

const services = [
  {
    badge: "Entry Point",
    price: "$497",
    note: "One-time · Delivered in 5 days",
    title: "The Navari Audit",
    desc: "A complete operational inefficiency assessment. You receive a documented map of where your business is bleeding time and money — and exactly what to automate first.",
    features: [
      "Operational Process Map — visual workflow diagram",
      "The Three Leaks Report — costed inefficiencies",
      "Automation Opportunity Score per process",
      "Recommended tool stack for your situation",
      "Implementation Roadmap — phased build plan",
    ],
    cta: "Start with an Audit",
    featured: false,
  },
  {
    badge: "Core Service",
    price: "$800–$2,000",
    note: "Scope dependent · 10–21 days",
    title: "The Navari Build",
    desc: "A fully deployed, tested, and documented AI automation system that eliminates your highest-cost manual process. Not a prototype — a live system running in your business.",
    features: [
      "Single Process / Core Build / Full Operations",
      "Live deployed automation — not a prototype",
      "Complete Navari Operations Manual",
      "Full tool access and credentials handed to you",
      "14-day post-delivery support window",
    ],
    cta: "Book a Discovery Call",
    featured: true,
  },
  {
    badge: "Ongoing",
    price: "$500–$1,500",
    note: "Per month · Rolling",
    title: "Navari Retainer",
    desc: "Ongoing automation management, optimisation, and expansion. Your systems keep improving every month without requiring your attention to manage them.",
    features: [
      "Monthly automation performance review",
      "One new automation build or optimisation monthly",
      "Priority support — 4-hour response window",
      "Quarterly operations audit for new opportunities",
      "Available after first Build is complete",
    ],
    cta: "Ask About Retainers",
    featured: false,
  },
];

export function Services() {
  return (
    <section id="services" className="bg-slate-bg px-5 py-24 md:px-10">
      <div className="mx-auto max-w-[1100px]">
        <FadeIn>
          <SectionLabel>Services</SectionLabel>
          <h2 className="font-display text-[clamp(28px,4vw,44px)] font-extrabold leading-tight tracking-tight text-navy">
            Three ways to work<br />with Navari Systems.
          </h2>
        </FadeIn>

        <div className="mt-14 grid gap-6 [grid-template-columns:repeat(auto-fit,minmax(300px,1fr))]">
          {services.map((s, i) => (
            <FadeIn key={s.title} delay={i * 0.08} className={`relative overflow-hidden rounded-lg border p-9 transition-all hover:shadow-lg ${s.featured ? "border-gold bg-navy" : "border-gold-border/20 bg-white hover:border-gold-border"}`}>
              <span className="mb-5 inline-block rounded-sm border border-gold-border bg-gold/10 px-2.5 py-1 font-mono text-[9px] uppercase tracking-widest text-gold">{s.badge}</span>
              <div className="mb-1 font-display text-4xl font-extrabold leading-none tracking-tight text-gold">{s.price}</div>
              <div className="mb-5 font-mono text-xs text-silver">{s.note}</div>
              <h3 className={`mb-3 font-display text-xl font-bold ${s.featured ? "text-white" : "text-navy"}`}>{s.title}</h3>
              <p className={`mb-6 text-sm leading-relaxed ${s.featured ? "text-silver" : "text-body-text"}`}>{s.desc}</p>
              <ul className="mb-8 flex flex-col gap-2.5">
                {s.features.map((f) => (
                  <li key={f} className={`relative border-b pb-2.5 pl-4 text-[13px] before:absolute before:left-0 before:top-[7px] before:h-1.5 before:w-1.5 before:rounded-full before:bg-gold ${s.featured ? "border-white/8 text-white/70" : "border-gold-border/20 text-body-text"}`}>{f}</li>
                ))}
              </ul>
              <Link href={SITE.calendly} target="_blank" rel="noopener noreferrer" className={`block rounded px-6 py-3 text-center font-display text-[12px] font-bold uppercase tracking-widest transition-colors ${s.featured ? "bg-gold text-navy hover:bg-gold-light" : "border border-navy text-navy hover:bg-navy hover:text-white"}`}>
                {s.cta}
              </Link>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
