import { Cta } from "@/components/sections/CTA";
import { Deliverables } from "@/components/sections/Deliverables";
import { Fit } from "@/components/sections/Fit";
import { Founder } from "@/components/sections/Founder";
import { Hero } from "@/components/sections/Hero";
import { Problem } from "@/components/sections/Problem";
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
      <Fit />
      <Workflows />
      <Founder />
      <Trust />
      <Deliverables />
      <Services />
      <Cta />
    </>
  );
}
