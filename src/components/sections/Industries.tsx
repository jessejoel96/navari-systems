import { FadeIn } from "@/components/ui/FadeIn";
import { SectionLabel } from "@/components/ui/SectionLabel";

const industries = [
  { icon: "🏡", title: "Real Estate", desc: "Listing sync, lead follow-up, document processing, maintenance routing" },
  { icon: "🎓", title: "Online Education", desc: "Student onboarding, content delivery, enrollment tracking, email sequences" },
  { icon: "⚖️", title: "Professional Services", desc: "Client intake, document generation, scheduling, invoice follow-up" },
  { icon: "🛒", title: "E-commerce", desc: "Order processing, inventory updates, customer service, returns handling" },
  { icon: "📊", title: "Marketing Agencies", desc: "Client reporting, campaign tracking, approval workflows, billing automation" },
];

export function Industries() {
  return (
    <section id="industries" className="bg-white px-5 py-24 md:px-10">
      <div className="mx-auto max-w-[1100px]">
        <FadeIn>
          <SectionLabel>Industries</SectionLabel>
          <h2 className="font-display text-[clamp(28px,4vw,44px)] font-extrabold leading-tight tracking-tight text-navy">
            Built for businesses that run<br />on manual processes they haven&apos;t fixed yet.
          </h2>
        </FadeIn>

        <div className="mt-12 grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(200px,1fr))]">
          {industries.map((ind, i) => (
            <FadeIn key={ind.title} delay={i * 0.06} className="rounded-md border border-gold-border/20 bg-slate-bg p-7 transition-colors hover:border-gold-border">
              <span className="mb-3 block text-2xl">{ind.icon}</span>
              <h4 className="mb-1.5 font-display text-sm font-bold text-navy">{ind.title}</h4>
              <p className="text-xs leading-relaxed text-silver">{ind.desc}</p>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
