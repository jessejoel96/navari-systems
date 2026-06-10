import Link from "next/link";
import { ContactForm } from "@/components/forms/ContactForm";
import { FadeIn } from "@/components/ui/FadeIn";
import { SITE } from "@/lib/constants";

export function Cta() {
  return (
    <section id="book-call" className="relative overflow-hidden bg-navy px-5 py-24 text-center md:px-10">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(201,168,76,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(201,168,76,0.03)_1px,transparent_1px)] bg-[size:48px_48px]" />

      <div className="relative z-10 mx-auto max-w-[1100px]">
        <FadeIn>
          <h2 className="font-display text-[clamp(28px,4vw,44px)] font-extrabold leading-tight tracking-tight text-white">
            See where your business<br />is bleeding in 30 minutes.
          </h2>
          <p className="mx-auto mt-4 max-w-[520px] text-[17px] font-light text-silver">
            Book a free discovery call. You&apos;ll leave with a specific observation
            about your highest-cost process — whether we work together or not.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              href={SITE.calendly}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded bg-gold px-8 py-3.5 font-display text-[13px] font-bold tracking-wider text-navy transition-all hover:-translate-y-px hover:bg-gold-light"
            >
              Book a Discovery Call →
            </Link>
          </div>

          <p className="mt-10 font-mono text-[10px] uppercase tracking-wider text-silver">Or send a message</p>
          <ContactForm />
        </FadeIn>
      </div>
    </section>
  );
}
