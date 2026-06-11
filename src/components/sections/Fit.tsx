import { FadeIn } from "@/components/ui/FadeIn";
import { SectionLabel } from "@/components/ui/SectionLabel";

export function Fit() {
  return (
    <section id="fit" className="border-y border-gold-border/20 bg-slate-bg px-5 py-24 md:px-10">
      <div className="mx-auto max-w-[820px]">
        <FadeIn>
          <SectionLabel>Who This Is For</SectionLabel>
          <h2 className="font-display text-[clamp(32px,4.5vw,48px)] font-extrabold leading-[1.15] tracking-tight text-navy">
            Built for owners who are growing<br />but still running on manual work.
          </h2>

          <p className="mt-8 text-lg leading-relaxed text-body-text">
            For owners doing $15k+/month with a proven offer — but buried in manual work and disconnected tools. You want systems fixed, not another hire to manage the mess.
          </p>
        </FadeIn>
      </div>
    </section>
  );
}
