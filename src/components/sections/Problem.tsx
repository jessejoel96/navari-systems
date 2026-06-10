import { FadeIn } from "@/components/ui/FadeIn";
import { SectionLabel } from "@/components/ui/SectionLabel";

const problems = [
  { icon: "⏱", title: "Repetitive Manual Tasks", desc: "Staff spend hours on copy-paste work, manual data entry, and tasks a system could handle in seconds." },
  { icon: "🔗", title: "Disconnected Tools", desc: "Your CRM, email, spreadsheets, and project tools don't talk to each other. Someone bridges them by hand every day." },
  { icon: "⚠️", title: "Inconsistent Outputs", desc: "Manual processes introduce errors. Clients notice. Quality depends on who did the task, not how the system works." },
  { icon: "📉", title: "Growth That Costs More", desc: "Every new client or product means more manual work. Scaling means hiring instead of building systems that scale themselves." },
];

export function Problem() {
  return (
    <section id="problem" className="bg-white px-5 py-24 md:px-10">
      <div className="mx-auto max-w-[1100px]">
        <FadeIn>
          <SectionLabel>The Problem</SectionLabel>
          <h2 className="mb-5 font-display text-[clamp(28px,4vw,44px)] font-extrabold leading-tight tracking-tight text-navy">
            Your business is paying a full-time<br />salary in hidden manual labour.
          </h2>
          <p className="mb-12 max-w-[640px] text-[17px] font-light leading-relaxed text-body-text">
            Most small businesses run on processes that were set up quickly and never revisited.
            Each one leaks hours, money, and accuracy — quietly, every week.
            The problem isn&apos;t effort. It&apos;s that no one has mapped where the bleeding is.
          </p>
        </FadeIn>

        <div className="grid gap-px overflow-hidden rounded-lg border border-gold-border/20 bg-gold-border/20 [grid-template-columns:repeat(auto-fit,minmax(240px,1fr))]">
          {problems.map((p, i) => (
            <FadeIn key={p.title} delay={i * 0.08} className="group relative bg-white p-7">
              <span className="absolute inset-y-0 left-0 w-[3px] bg-gold opacity-0 transition-opacity group-hover:opacity-100" />
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-md bg-gold/10 text-lg">{p.icon}</div>
              <h3 className="mb-2 font-display text-[15px] font-bold text-navy">{p.title}</h3>
              <p className="text-sm leading-relaxed text-silver">{p.desc}</p>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
