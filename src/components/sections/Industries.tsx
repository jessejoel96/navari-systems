import { FadeIn } from "@/components/ui/FadeIn";
import { SectionLabel } from "@/components/ui/SectionLabel";

const industries = [
  { abbr: "RE", title: "Real Estate", leak: "~18 hrs/wk", desc: "Listings, lead follow-up, documents. 15-20 hrs/week that should run automatically." },
  { abbr: "ED", title: "Online Education", leak: "~12 hrs/wk", desc: "Onboarding, enrolment tracking, certificates. Manual follow-up that loses students." },
  { abbr: "PS", title: "Professional Services", leak: "~10 hrs/wk", desc: "Intake, scheduling, document prep. Senior staff on work a system should filter." },
  { abbr: "EC", title: "E-commerce", leak: "~15 hrs/wk", desc: "Orders, inventory, returns. Growth blocked by coordination, not demand." },
  { abbr: "MA", title: "Marketing Agencies", leak: "~14 hrs/wk", desc: "Reporting, tracking, billing. Margin eaten by internal manual work." },
];

export function Industries() {
  return (
    <section id="industries" className="bg-white px-5 py-24 md:px-10">
      <div className="mx-auto max-w-[1100px]">
        <FadeIn>
          <SectionLabel>Industries</SectionLabel>
          <h2 className="font-display text-[clamp(32px,4.5vw,48px)] font-extrabold leading-[1.15] tracking-tight text-navy">
            Every industry has different tasks.<br />The pattern is the same.
          </h2>
          <p className="mt-5 max-w-[520px] text-lg leading-relaxed text-body-text">
            Manual work, disconnected tools, staff bridging gaps. We find the three biggest time drains in any sector.
          </p>
        </FadeIn>

        <div className="mt-12 grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(200px,1fr))]">
          {industries.map((ind, i) => (
            <FadeIn
              key={ind.title}
              delay={i * 0.06}
              className="group relative overflow-hidden rounded-lg border border-gold-border/20 bg-slate-bg p-7 transition-all hover:border-gold-border hover:shadow-md"
            >
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-gold/0 via-gold to-gold/0 opacity-0 transition-opacity group-hover:opacity-100" />
              <div className="mb-4 flex items-center justify-between">
                <span className="flex h-10 w-10 items-center justify-center rounded-md bg-navy font-mono text-xs font-bold text-gold">
                  {ind.abbr}
                </span>
                <span className="rounded-full bg-[#E85D4A]/10 px-2.5 py-1 font-mono text-[10px] text-[#E85D4A]">
                  {ind.leak}
                </span>
              </div>
              <h4 className="mb-1.5 font-display text-lg font-bold text-navy">{ind.title}</h4>
              <p className="text-base leading-relaxed text-silver">{ind.desc}</p>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
