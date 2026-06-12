import Image from "next/image";
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
            From manual work to a system<br />your team actually owns.
          </h2>
          <p className="mt-5 max-w-[520px] text-lg leading-relaxed text-silver-dark-bg">
            Audit, build, hand over. Fixed scope. No endless calls or slide decks.
          </p>
        </FadeIn>

        <FadeIn delay={0.08} className="mx-auto mt-10 max-w-[960px]">
          <div className="overflow-hidden rounded-xl border border-white/10 bg-white shadow-lg">
            <Image
              src="/diagnostic/chaos-vs-precision.png"
              alt="Before and after: disconnected manual operations compared to a connected Navari system"
              width={1200}
              height={675}
              className="h-auto w-full object-contain"
              priority
            />
          </div>
        </FadeIn>

        <ProcessTimeline />
      </div>
    </section>
  );
}
