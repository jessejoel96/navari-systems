import { FadeIn } from "@/components/ui/FadeIn";
import { SectionLabel } from "@/components/ui/SectionLabel";

const fits = [
  "You have paying customers and a real business, but it runs on your memory and hustle, not a system.",
  "You already pay for tools (CRM, inbox, project manager, spreadsheets) but they do not talk to each other. Someone bridges them by hand every day.",
  "You looked into automation or AI but got lost, or hired someone who built something you cannot maintain.",
  "Every new client adds manual coordination. You feel like you need to hire before you can grow.",
  "If you took a week off, something important would fall through. The process lives in people's heads, not in a system.",
];

const notFits = [
  "You are pre-revenue. We need existing operations to map and fix.",
  "You want a website, app, or custom software build. That's not what we do.",
  "You want someone to run your tools for you long-term. We hand over and train your team, then step back.",
];

export function Fit() {
  return (
    <section id="fit" className="border-y border-gold-border/20 bg-slate-bg px-5 py-24 md:px-10">
      <div className="mx-auto max-w-[1100px]">
        <FadeIn>
          <SectionLabel>Who This Is For</SectionLabel>
          <h2 className="font-display text-[clamp(32px,4.5vw,48px)] font-extrabold leading-[1.15] tracking-tight text-navy">
            Does any of this sound<br />like your business right now?
          </h2>
        </FadeIn>

        <div className="mt-12 grid gap-10 lg:grid-cols-[1fr_360px]">
          <FadeIn delay={0.06}>
            <div className="flex flex-col gap-3">
              {fits.map((item, i) => (
                <div
                  key={i}
                  className="flex items-start gap-4 rounded-lg border border-gold/20 bg-white px-5 py-4 transition-colors hover:border-gold"
                >
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gold/15 text-gold">
                    <svg width="11" height="9" viewBox="0 0 11 9" fill="none" aria-hidden>
                      <path d="M1 4.5L4 7.5L10 1" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                  <p className="text-base leading-relaxed text-body-text">{item}</p>
                </div>
              ))}
            </div>

            <p className="mt-6 text-base font-semibold text-navy">
              If two or more of those are true, the Audit will pay for itself.
            </p>
          </FadeIn>

          <FadeIn delay={0.12}>
            <div className="rounded-lg border border-gold-border/20 bg-white p-6 lg:sticky lg:top-8">
              <p className="mb-4 font-mono text-xs uppercase tracking-wider text-silver">
                Not a fit if:
              </p>
              <div className="flex flex-col gap-3">
                {notFits.map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-silver/50" />
                    <p className="text-sm leading-relaxed text-silver">{item}</p>
                  </div>
                ))}
              </div>

              <div className="mt-6 border-t border-gold-border/20 pt-5">
                <p className="text-sm leading-relaxed text-body-text">
                  We work with{" "}
                  <span className="font-semibold text-navy">4 clients per month</span>. Small enough to do the work properly, not to sell and delegate.
                </p>
              </div>
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}
