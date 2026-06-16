import Image from "next/image";
import Link from "next/link";
import { FadeIn } from "@/components/ui/FadeIn";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { SITE } from "@/lib/constants";

const credentials = [
  "CIM LEVEL 6",
  "MAKE.COM",
  "N8N",
  "API SYSTEMS",
  "7 YRS CROSS INDUSTRY",
  "SALES",
  "TELEMARKETING",
  "ADMIN OPERATIONS",
  "RECRUITMENT",
  "REAL ESTATE",
  "SAAS",
  "EDUCATION",
];

export function Founder() {
  return (
    <section id="founder" className="relative overflow-hidden bg-navy px-5 py-24 md:px-10">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,rgba(201,168,76,0.12),transparent_32%),radial-gradient(circle_at_80%_80%,rgba(255,255,255,0.05),transparent_28%)]" />

      <div className="relative z-10 mx-auto grid max-w-[1100px] items-center gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
        <FadeIn>
          <div>
            <div className="overflow-hidden rounded-2xl border border-gold/25 bg-white/5 shadow-2xl">
              <Image
                src="/founder/jesse-joel-nzumafor.png"
                alt="Jesse-Joel S. Nzumafor, founder of Navari Systems"
                width={682}
                height={1024}
                className="aspect-[4/5] w-full object-cover object-top"
                priority={false}
              />
            </div>

            <div className="mt-8 flex flex-wrap gap-2.5">
              {credentials.map((credential) => (
                <span
                  key={credential}
                  className="rounded-sm border border-gold-border bg-gold/8 px-3 py-1.5 font-mono text-[11px] font-medium uppercase tracking-wide text-gold"
                >
                  {credential}
                </span>
              ))}
            </div>

            <p className="mt-8 font-display text-xl font-semibold italic leading-relaxed text-gold">
              &ldquo;The person on the discovery call is the person who builds your system.&rdquo;
            </p>
          </div>
        </FadeIn>

        <FadeIn delay={0.1}>
          <SectionLabel>THE PERSON BEHIND THE SYSTEM</SectionLabel>
          <h2 className="font-display text-[clamp(30px,4.3vw,46px)] font-extrabold leading-[1.15] tracking-tight text-white">
            Jesse-Joel S. Nzumafor
          </h2>
          <p className="mt-4 font-display text-xl font-semibold leading-relaxed text-gold">
            The person who maps your operations, builds the fix, and hands it over.
          </p>

          <div className="mt-7 space-y-5 text-base leading-relaxed text-silver-dark-bg md:text-lg">
            <p>
              Seven years across SaaS product delivery, real estate investment platforms, digital marketing, online education, sales and telemarketing, administrative assistant work, and recruitment taught me one thing: most businesses are not inefficient because their people are bad at their jobs. They are inefficient because nobody has ever mapped where the time actually goes.
            </p>
            <p>
              I have been inside the operations of businesses in six industries, handling outreach, admin coordination, hiring workflows, CRM automations, workflow systems, and operational infrastructure. Each engagement starts from the same question: what is this team doing manually that a system should be handling? That cross industry pattern recognition is what I bring to every Navari engagement.
            </p>
            <p>
              When you work with Navari Systems, you work with me directly. I map your operations, design the automation architecture, build and test the system, and walk your team through it at handover. No account managers. No junior contractors. The person on the discovery call is the person who does the work.
            </p>
          </div>

          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href={SITE.calendly}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded bg-gold px-8 py-4 font-display text-[15px] font-bold tracking-wide text-navy transition-all hover:-translate-y-px hover:bg-gold-light"
            >
              Book a 30-Min Call →
            </Link>
            <Link
              href={SITE.founderSite}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded border border-white/20 px-8 py-4 font-display text-[15px] font-semibold tracking-wide text-white transition-colors hover:border-white/40 hover:bg-white/5"
            >
              Read the full background ↗
            </Link>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
