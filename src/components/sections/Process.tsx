import { ProcessTimeline } from "@/components/visuals/ProcessTimeline";
import { FadeIn } from "@/components/ui/FadeIn";
import { SectionLabel } from "@/components/ui/SectionLabel";

export function Process() {
  return (
    <section id="how-it-works" className="relative overflow-hidden bg-navy px-5 py-24 md:px-10">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(201,168,76,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(201,168,76,0.03)_1px,transparent_1px)] bg-[size:48px_48px]" />
      <div className="relative mx-auto max-w-[1100px]">
        <FadeIn>
          <SectionLabel>How It Works</SectionLabel>
          <h2 className="font-display text-[clamp(32px,4.5vw,48px)] font-extrabold leading-[1.15] tracking-tight text-white">
            From manual chaos to a system<br />your team actually owns.
          </h2>
          <p className="mt-5 max-w-[520px] text-lg leading-relaxed text-silver-dark-bg">
            Audit, build, hand over. Fixed scope — no endless calls or slide decks. Click each step.
          </p>
        </FadeIn>

        <ProcessTimeline />
      </div>
    </section>
  );
}
