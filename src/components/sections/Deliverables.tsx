import { DeliverablePreview } from "@/components/visuals/DeliverablePreview";
import { FadeIn } from "@/components/ui/FadeIn";
import { SectionLabel } from "@/components/ui/SectionLabel";

const items = [
  {
    num: "01",
    title: "Process Map",
    desc: "How your business runs today: who does what, how long it takes, where errors happen.",
  },
  {
    num: "02",
    title: "The Three Leaks Report",
    desc: "Three costliest manual tasks, with hours, dollars, and what to fix first.",
  },
  {
    num: "03",
    title: "Build Blueprint",
    desc: "What the automation does, step by step. Approved before we build.",
  },
  {
    num: "04",
    title: "Operations Manual & SOPs",
    desc: "Plain-language SOPs so your team runs the system without calling us.",
  },
  {
    num: "05",
    title: "Results Report",
    desc: "14 days post-handover: hours saved, errors cut, projected annual value.",
  },
];

export function Deliverables() {
  return (
    <section id="deliverables" className="bg-slate-bg px-5 py-24 md:px-10">
      <div className="mx-auto max-w-[1100px]">
        <FadeIn>
          <SectionLabel>What You Receive</SectionLabel>
          <h2 className="font-display text-[clamp(32px,4.5vw,48px)] font-extrabold leading-[1.15] tracking-tight text-navy">
            Working systems and written instructions.<br />Not slide decks.
          </h2>
          <p className="mt-5 max-w-[520px] text-lg leading-relaxed text-body-text">
            Installed automation, written instructions, and a handover walkthrough. Not reports that sit in a drawer.
          </p>
        </FadeIn>

        <div className="mt-14 grid items-center gap-16 md:grid-cols-2">
          <div className="flex flex-col">
            {items.map((item, i) => (
              <FadeIn key={item.num} delay={i * 0.06} className="flex gap-5 border-b border-gold-border/20 py-6 last:border-b-0">
                <span className="shrink-0 pt-0.5 font-mono text-sm text-gold">{item.num}</span>
                <div>
                  <h4 className="mb-1.5 font-display text-lg font-bold text-navy">{item.title}</h4>
                  <p className="text-base leading-relaxed text-silver">{item.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>

          <FadeIn delay={0.2}>
            <DeliverablePreview />
            <p className="mt-3 text-center font-mono text-xs text-silver">
              Click tabs to preview each deliverable
            </p>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}
