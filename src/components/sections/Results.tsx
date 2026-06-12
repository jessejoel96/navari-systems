import Image from "next/image";
import { BenefitsCarousel } from "@/components/visuals/BenefitsCarousel";
import { MetricCards } from "@/components/visuals/MetricCards";
import { FadeIn } from "@/components/ui/FadeIn";
import { SectionLabel } from "@/components/ui/SectionLabel";

export function Results() {
  return (
    <section id="results" className="bg-navy px-5 py-24 md:px-10">
      <div className="mx-auto max-w-[1100px]">
        <FadeIn>
          <SectionLabel>Results</SectionLabel>
          <h2 className="font-display text-[clamp(32px,4.5vw,48px)] font-extrabold leading-[1.15] tracking-tight text-white">
            What owners get back<br />when manual work stops.
          </h2>
        </FadeIn>

        <div className="mt-8 grid items-stretch gap-8 lg:grid-cols-[1fr_280px] lg:gap-12">
          {/* Left: subtitle + image */}
          <div className="flex flex-col">
            <p className="max-w-[560px] text-lg leading-relaxed text-silver-dark-bg">
              Real numbers from deployed systems, and what they mean for your business.
            </p>

            <FadeIn delay={0.06} className="mt-6 flex-1 lg:mt-8">
              <div className="h-full overflow-hidden rounded-xl border border-white/10 shadow-lg">
                <Image
                  src="/diagnostic/operational-sovereignty.png"
                  alt="Business owner reviewing automated systems showing 18 hours saved per week"
                  width={1200}
                  height={675}
                  className="h-full w-full object-cover object-center"
                />
              </div>
            </FadeIn>
          </div>

          {/* Right: metric cards aligned subtitle-top to image-bottom */}
          <FadeIn delay={0.1} className="flex flex-col">
            <MetricCards layout="vertical" className="h-full min-h-[280px] lg:min-h-0" />
          </FadeIn>
        </div>

        {/* Benefits carousel */}
        <FadeIn delay={0.1} className="mt-14 border-t border-white/8 pt-10">
          <p className="mb-6 font-mono text-xs uppercase tracking-wider text-gold">
            What those numbers mean in practice
          </p>
          <BenefitsCarousel />
        </FadeIn>
      </div>
    </section>
  );
}
