import { BeforeAfterToggle } from "@/components/visuals/BeforeAfterToggle";
import { AlertIcon, ClockIcon, GrowthIcon, LinkIcon } from "@/components/visuals/ProblemIcons";
import { FadeIn } from "@/components/ui/FadeIn";
import { SectionLabel } from "@/components/ui/SectionLabel";

const symptoms = [
  {
    Icon: ClockIcon,
    title: "Staff Doing Robot Work",
    desc: "Copy-paste, data entry, and chasing updates — work a system should handle.",
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
        <div className="grid items-start gap-12 lg:grid-cols-2 lg:gap-16">
          <FadeIn>
            <SectionLabel>The Problem</SectionLabel>
            <h2 className="mb-5 font-display text-[clamp(32px,4.5vw,48px)] font-extrabold leading-[1.15] tracking-tight text-navy">
              Your business is paying a full-time<br />salary in hidden manual work.
            </h2>
            <p className="mb-8 max-w-[480px] text-lg leading-relaxed text-body-text">
              Most owners are not failing from lack of effort. Nobody has mapped where time and money leak each week.
            </p>
            <p className="font-mono text-sm text-gold">
              Toggle: today vs. after a build →
            </p>
          </FadeIn>

          <FadeIn delay={0.1}>
            <BeforeAfterToggle />
          </FadeIn>
        </div>

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
      </div>
    </section>
  );
}
