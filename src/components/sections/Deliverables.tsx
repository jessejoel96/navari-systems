import { FadeIn } from "@/components/ui/FadeIn";
import { SectionLabel } from "@/components/ui/SectionLabel";

const items = [
  {
    num: "01",
    title: "Operational Process Map",
    desc: "Visual workflow diagram of your current processes — who does what, when, and what it costs per week.",
  },
  {
    num: "02",
    title: "The Three Leaks Report",
    desc: "The highest-cost manual processes identified, costed, and rated by automation feasibility.",
  },
  {
    num: "03",
    title: "Automation Architecture Document",
    desc: "The full system design — triggers, inputs, actions, outputs, exceptions — approved before a single line is built.",
  },
  {
    num: "04",
    title: "Navari Operations Manual",
    desc: "Plain-language documentation of everything that was built, how to monitor it, and what to do if something breaks.",
  },
  {
    num: "05",
    title: "Performance Baseline Report",
    desc: "Delivered 14 days post-launch. Hours saved, errors eliminated, tasks automated, projected annual value.",
  },
];

export function Deliverables() {
  return (
    <section id="deliverables" className="bg-slate-bg px-5 py-24 md:px-10">
      <div className="mx-auto max-w-[1100px]">
        <FadeIn>
          <SectionLabel>What You Receive</SectionLabel>
          <h2 className="font-display text-[clamp(28px,4vw,44px)] font-extrabold leading-tight tracking-tight text-navy">
            Every Build delivers<br />five documented assets.
          </h2>
        </FadeIn>

        <div className="mt-14 grid items-center gap-16 md:grid-cols-2">
          <div className="flex flex-col">
            {items.map((item, i) => (
              <FadeIn key={item.num} delay={i * 0.06} className="flex gap-5 border-b border-gold-border/20 py-6 last:border-b-0">
                <span className="shrink-0 pt-0.5 font-mono text-[11px] text-gold">{item.num}</span>
                <div>
                  <h4 className="mb-1.5 font-display text-[15px] font-bold text-navy">{item.title}</h4>
                  <p className="text-[13px] leading-relaxed text-silver">{item.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>

          <FadeIn delay={0.2}>
            <div className="overflow-hidden rounded-lg border border-gold-border/20 bg-white shadow-xl">
              <div className="flex items-center justify-between bg-navy px-6 py-4">
                <span className="font-display text-xs font-bold tracking-wider text-white">THE THREE LEAKS REPORT</span>
                <span className="font-mono text-[9px] tracking-widest text-gold">NAVARI SYSTEMS</span>
              </div>
              <div className="p-6">
                <div className="flex justify-between border-b border-gold-border/20 py-3 text-[13px]">
                  <span>Process</span>
                  <span>Weekly Cost</span>
                </div>
                <div className="flex justify-between border-b border-gold-border/20 py-3 text-[13px]">
                  <span>Listing sync (manual)</span>
                  <span className="font-mono text-xs text-[#E85D4A]">$840/wk</span>
                </div>
                <div className="flex justify-between border-b border-gold-border/20 py-3 text-[13px]">
                  <span>Lead follow-up routing</span>
                  <span className="font-mono text-xs text-[#E85D4A]">$560/wk</span>
                </div>
                <div className="flex justify-between border-b border-gold-border/20 py-3 text-[13px]">
                  <span>Document processing</span>
                  <span className="font-mono text-xs text-[#E8A74A]">$320/wk</span>
                </div>
                <div className="-mx-6 -mb-6 mt-0 flex justify-between rounded-b-md bg-emerald-500/6 px-6 py-3">
                  <span className="font-semibold text-navy">Total recoverable</span>
                  <span className="font-mono text-[15px] font-semibold text-[#4AC98A]">$1,720/wk</span>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}
