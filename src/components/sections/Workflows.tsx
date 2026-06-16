import { WorkflowSlider } from "@/components/visuals/WorkflowSlider";
import Link from "next/link";
import { FadeIn } from "@/components/ui/FadeIn";
import { SectionLabel } from "@/components/ui/SectionLabel";

export function Workflows() {
  return (
    <section id="workflows" className="bg-slate-bg px-5 py-24 md:px-10">
      <div className="mx-auto max-w-[1100px]">
        <FadeIn>
          <SectionLabel>Industry Workflows</SectionLabel>
          <h2 className="max-w-[720px] font-display text-[clamp(32px,4.5vw,48px)] font-extrabold leading-[1.15] tracking-tight text-navy">
            Pick your industry.<br />See the problem and the fix.
          </h2>
          <p className="mt-5 max-w-[560px] text-lg leading-relaxed text-body-text">
            Every sector names it differently. The work is the same: manual tasks that should run on their own.
          </p>
        </FadeIn>

        <FadeIn delay={0.08}>
          <WorkflowSlider />
        </FadeIn>

        <FadeIn delay={0.12}>
          <div className="mt-10 rounded-xl border border-gold-border/25 bg-white p-6 text-center shadow-sm md:p-7">
            <p className="font-display text-xl font-bold tracking-tight text-navy md:text-2xl">
              If your workflow is more complex than these examples,
              <br className="hidden sm:block" /> run the audit and we will map it properly.
            </p>
            <p className="mx-auto mt-3 max-w-[620px] text-sm leading-relaxed text-silver md:text-base">
              Tell us what is breaking in your operation and get a specific, fixed-scope plan for what to automate first.
            </p>
            <div className="mt-6">
              <Link
                href="/audit"
                className="inline-flex items-center gap-2 rounded bg-gold px-8 py-3.5 font-display text-[15px] font-bold tracking-wide text-navy transition-all hover:-translate-y-px hover:bg-gold-light"
              >
                Take the Free Audit →
              </Link>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
