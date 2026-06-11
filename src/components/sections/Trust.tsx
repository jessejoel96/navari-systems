import Image from "next/image";
import { FadeIn } from "@/components/ui/FadeIn";
import { SITE } from "@/lib/constants";

export function Trust() {
  return (
    <section className="bg-white px-5 py-24 md:px-10">
      <div className="mx-auto grid max-w-[1100px] items-center gap-12 lg:grid-cols-2 lg:gap-16">
        <FadeIn>
          <blockquote className="relative font-display text-[clamp(22px,3.2vw,30px)] font-semibold leading-[1.4] tracking-tight text-navy">
            <span className="absolute -top-4 -left-2 font-serif text-[64px] leading-none text-gold">&ldquo;</span>
            <span className="relative">
              Most owners do not have an effort problem. They have a systems problem — the right work done manually, in the wrong order, every week.
            </span>
          </blockquote>
          <p className="mt-6 font-mono text-sm uppercase tracking-wide text-silver">
            {SITE.founder} · Systems Architect, Navari Systems
          </p>
        </FadeIn>

        <FadeIn delay={0.15} className="relative">
          <div className="relative overflow-hidden rounded-xl border border-gold-border/20 shadow-xl">
            <Image
              src="https://images.unsplash.com/photo-1553877522-43269d4ea984?w=800&q=80"
              alt="Business team reviewing operational workflow on a whiteboard"
              width={800}
              height={520}
              className="h-[320px] w-full object-cover md:h-[400px]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-navy/80 via-navy/20 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <p className="font-mono text-xs uppercase tracking-wider text-gold">The diagnosis comes first</p>
              <p className="mt-1 font-display text-lg font-bold text-white">
                Find the leak. Build the fix. Hand it over.
              </p>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
