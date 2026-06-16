import Image from "next/image";
import { FadeIn } from "@/components/ui/FadeIn";
import { SITE } from "@/lib/constants";

const principles = [
  {
    label: "Diagnosis first",
    desc: "We map before we build. The Audit report is yours regardless of whether you proceed.",
  },
  {
    label: "Fixed scope, fixed price",
    desc: "No hourly billing, no surprise invoices. You know the price before we start.",
  },
  {
    label: "You own everything",
    desc: "Every automation, SOP, and workflow is documented and handed to your team. No lock-in.",
  },
  {
    label: "Built to be run without us",
    desc: "We train your team to operate the system. Then we step back.",
  },
];

export function Trust() {
  return (
    <section id="how-it-works" className="bg-white px-5 py-24 md:px-10">
      <div className="mx-auto max-w-[1100px]">
        <div className="grid items-start gap-10 lg:grid-cols-2 lg:gap-14">
          <FadeIn className="lg:pr-4">
            <blockquote className="relative pl-10 font-display text-[clamp(22px,3.2vw,30px)] font-semibold leading-[1.4] tracking-tight text-navy">
              <span
                className="pointer-events-none absolute top-0 left-0 font-serif text-[56px] leading-none text-gold"
                aria-hidden
              >
                &ldquo;
              </span>
              Most owners do not have an effort problem. They have a systems problem. The right work gets done manually, in the wrong order, every week.
            </blockquote>
            <p className="mt-8 pl-10 font-mono text-xs uppercase tracking-wide text-silver">
              {SITE.founder} · AI Automation Specialist &amp; Founder, Navari Systems
            </p>
          </FadeIn>

          <FadeIn delay={0.15} className="w-full">
            <div className="relative overflow-hidden rounded-xl border border-gold-border/20 shadow-xl">
              <Image
                src="https://images.unsplash.com/photo-1553877522-43269d4ea984?w=800&q=80"
                alt="Business team reviewing operational workflow on a whiteboard"
                width={800}
                height={520}
                className="aspect-[4/3] w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-navy/85 via-navy/25 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-6 md:p-8">
                <p className="font-mono text-xs uppercase tracking-wider text-gold">
                  The diagnosis comes first
                </p>
                <p className="mt-1.5 font-display text-lg font-bold leading-snug text-white md:text-xl">
                  Find the leak. Build the fix. Hand it over.
                </p>
              </div>
            </div>
          </FadeIn>
        </div>

        <FadeIn delay={0.1} className="mt-16 border-t border-gold-border/20 pt-12">
          <p className="mb-8 font-mono text-xs uppercase tracking-wider text-silver">
            How we work
          </p>
          <h3 className="max-w-[640px] font-display text-[clamp(26px,3.6vw,40px)] font-extrabold leading-[1.15] tracking-tight text-navy">
            From manual work to a system
            <br />
            your team actually owns.
          </h3>
          <p className="mt-4 max-w-[620px] text-base leading-relaxed text-silver md:text-lg">
            Audit, build, hand over. Fixed scope. No endless calls or slide decks.
          </p>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {principles.map((p, i) => (
              <div key={i} className="rounded-lg border border-gold-border/20 bg-slate-bg p-5">
                <div className="mb-3 flex h-7 w-7 items-center justify-center rounded-md bg-gold/15">
                  <span className="font-mono text-xs font-bold text-gold">0{i + 1}</span>
                </div>
                <h4 className="mb-1.5 font-display text-base font-bold text-navy">{p.label}</h4>
                <p className="text-sm leading-relaxed text-silver">{p.desc}</p>
              </div>
            ))}
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
