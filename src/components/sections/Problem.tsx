import { NavariDiagnosticVisual } from "@/components/visuals/NavariDiagnosticVisual";
import { AlertIcon, ClockIcon, GrowthIcon, LinkIcon } from "@/components/visuals/ProblemIcons";
import { FadeIn } from "@/components/ui/FadeIn";
import { SectionLabel } from "@/components/ui/SectionLabel";

const symptoms = [
  {
    Icon: ClockIcon,
    title: "Staff Doing Robot Work",
    desc: "Copy-paste, data entry, and chasing updates. Work a system should handle.",
  },
  {
    Icon: LinkIcon,
    title: "Tools That Don't Talk",
    desc: "CRM, inbox, and spreadsheets do not connect. Someone bridges them by hand every day.",
  },
  {
    Icon: AlertIcon,
    title: "Quality Depends on Who Did It",
    desc: "Processes live in people's heads. Outcomes vary by person, not by design.",
  },
  {
    Icon: GrowthIcon,
    title: "Growth Means More Hiring",
    desc: "Every new client adds manual coordination. You hire coordinators instead of building systems.",
  },
];

export function Problem() {
  return (
    <section id="problem" className="bg-white px-5 py-24 md:px-10">
      <div className="mx-auto max-w-[1100px]">
        <FadeIn>
          <SectionLabel>The Problem</SectionLabel>
          <h2 className="mb-5 max-w-[640px] font-display text-[clamp(32px,4.5vw,48px)] font-extrabold leading-[1.15] tracking-tight text-navy">
            Your business is paying a full-time<br />salary in hidden manual work.
          </h2>
          <p className="mb-10 max-w-[520px] text-lg leading-relaxed text-body-text">
            Most owners are not failing from lack of effort. Nobody has mapped where time and money go each week.
          </p>
        </FadeIn>

        <FadeIn delay={0.08}>
          <NavariDiagnosticVisual />
        </FadeIn>

        <div className="mt-16 grid gap-px overflow-hidden rounded-lg border border-gold-border/20 bg-gold-border/20 [grid-template-columns:repeat(auto-fit,minmax(240px,1fr))]">
          {symptoms.map((p, i) => (
            <FadeIn key={p.title} delay={i * 0.08} className="group relative bg-white p-7">
              <span className="absolute inset-y-0 left-0 w-[3px] bg-gold opacity-0 transition-opacity group-hover:opacity-100" />
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-md bg-gold/10 text-gold">
                <p.Icon className="h-5 w-5" />
              </div>
              <h3 className="mb-2 font-display text-lg font-bold text-navy">{p.title}</h3>
              <p className="text-base leading-relaxed text-silver">{p.desc}</p>
            </FadeIn>
          ))}
        </div>

        <FadeIn delay={0.2} className="mt-10 rounded-lg border border-[#E85D4A]/20 bg-[#E85D4A]/4 px-7 py-6">
          <p className="text-base leading-relaxed text-navy">
            <span className="font-bold">The average business owner loses 15-20 hours a week to work like this.</span>{" "}
            At $50/hr, that is over{" "}
            <span className="font-bold text-[#E85D4A]">$40,000 a year</span> the business never gets back. Nobody is counting it.
          </p>
        </FadeIn>
      </div>
    </section>
  );
}
