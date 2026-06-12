import { WorkflowSlider } from "@/components/visuals/WorkflowSlider";
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
      </div>
    </section>
  );
}
