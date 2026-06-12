import { Cta } from "@/components/sections/CTA";
import { Deliverables } from "@/components/sections/Deliverables";
import { Fit } from "@/components/sections/Fit";
import { Hero } from "@/components/sections/Hero";
import { Industries } from "@/components/sections/Industries";
import { Problem } from "@/components/sections/Problem";
import { Process } from "@/components/sections/Process";
import { Results } from "@/components/sections/Results";
import { Services } from "@/components/sections/Services";
import { Trust } from "@/components/sections/Trust";
import { Workflows } from "@/components/sections/Workflows";

export default function HomePage() {
  return (
    <>
      <Hero />
      <Problem />
      <Results />
      <Trust />
      <Fit />
      <Workflows />
      <Industries />
      <Process />
      <Deliverables />
      <Services />
      <Cta />
    </>
  );
}
