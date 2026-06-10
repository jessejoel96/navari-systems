import { FadeIn } from "@/components/ui/FadeIn";
import { SITE } from "@/lib/constants";

export function Trust() {
  return (
    <section className="bg-white px-5 py-24 text-center md:px-10">
      <div className="mx-auto max-w-[1100px]">
        <FadeIn>
          <blockquote className="relative mx-auto max-w-[700px] px-8 font-display text-[clamp(20px,3vw,28px)] font-semibold leading-snug tracking-tight text-navy">
            <span className="absolute -top-2 left-0 font-serif text-[64px] leading-none text-gold">&ldquo;</span>
            Most businesses don&apos;t have an effort problem. They have a sequence problem —
            they&apos;re doing the right work in the wrong order, manually, every single day.
          </blockquote>
          <p className="mt-6 font-mono text-[11px] uppercase tracking-[0.14em] text-silver">
            {SITE.founder} · Founder, Navari Systems
          </p>
        </FadeIn>
      </div>
    </section>
  );
}
