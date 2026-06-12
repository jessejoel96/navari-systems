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
          <div className="inline-flex items-center gap-2 rounded-sm border border-gold-border px-4 py-2 font-mono text-xs font-medium uppercase tracking-[0.12em] text-gold mb-7">
            <span className="h-px w-5 bg-gold" />
            Free · ~4 min · No credit card
          </div>

          <h2 className="font-display text-[clamp(32px,4.5vw,48px)] font-extrabold leading-[1.15] tracking-tight text-white">
            Find out exactly where your<br />business is losing time and money.
          </h2>
          <p className="mx-auto mt-4 max-w-[520px] text-lg leading-relaxed text-silver-dark-bg">
            Four minutes. We map your top three problem areas, put a dollar value on each, and show you what a fix looks like. No sales call required.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              href="/audit"
              className="inline-flex items-center gap-2 rounded bg-gold px-9 py-4 font-display text-[15px] font-bold tracking-wide text-navy transition-all hover:-translate-y-px hover:bg-gold-light"
            >
              Take the Free Audit →
            </Link>
            <Link
              href={SITE.calendly}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded border border-white/20 px-8 py-4 font-display text-[15px] font-semibold tracking-wide text-white transition-colors hover:border-white/40 hover:bg-white/5"
            >
              Book a 30-Min Review Call
            </Link>
          </div>

          <div className="mx-auto mt-6 flex max-w-md flex-wrap justify-center gap-5 font-mono text-sm text-silver-dark-bg/60">
            <span>✓ Results in 4 minutes</span>
            <span>✓ Dollar estimates included</span>
            <span>✓ No sales call</span>
          </div>

          <p className="mt-5 font-mono text-xs text-silver-dark-bg/40">
            We take 4 new clients per month. We do the work ourselves.
          </p>

          <div className="mt-16 border-t border-white/8 pt-12">
            <p className="mb-6 font-mono text-sm uppercase tracking-wide text-silver-dark-bg/50">Prefer to write? Send a message</p>
            <ContactForm />
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
