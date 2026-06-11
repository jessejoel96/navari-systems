import type { Metadata } from "next";
import Link from "next/link";
import LiteYouTubeEmbed from "react-lite-youtube-embed";
import "react-lite-youtube-embed/dist/LiteYouTubeEmbed.css";
import { NewsletterForm } from "@/components/forms/NewsletterForm";
import { FadeIn } from "@/components/ui/FadeIn";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { SITE } from "@/lib/constants";
import { CURATED_VIDEOS } from "@/lib/videos";

export const metadata: Metadata = {
  title: "Insights",
  description:
    "Business teardowns, build walkthroughs, and automation mistake breakdowns from Navari Systems.",
};

export default function InsightsPage() {
  return (
    <div className="bg-slate-bg px-5 pb-24 pt-28 md:px-10">
      <div className="mx-auto max-w-[1100px]">
        <FadeIn>
          <SectionLabel>Video Hub</SectionLabel>
          <h1 className="mb-4 font-display text-[clamp(32px,4.5vw,48px)] font-extrabold leading-[1.15] tracking-tight text-navy">
            Navari Insights
          </h1>
          <p className="mb-12 max-w-[680px] text-lg leading-relaxed text-body-text">
            Curated operational teardowns and deployment walkthroughs — the same bottleneck
            patterns we diagnose in client engagements, documented on camera.
          </p>
        </FadeIn>

        {CURATED_VIDEOS.length === 0 ? (
          <FadeIn className="rounded-lg border border-gold-border/20 bg-white p-12 text-center">
            <p className="font-display text-xl font-bold text-navy">First teardown coming soon</p>
            <p className="mx-auto mt-3 max-w-md text-base text-silver">
              Subscribe below to get notified when the first business teardown drops on YouTube.
            </p>
            <NewsletterForm className="mx-auto mt-8 max-w-md" />
            <a
              href={SITE.youtube}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-block font-mono text-sm uppercase tracking-wide text-gold hover:underline"
            >
              Follow on YouTube →
            </a>
          </FadeIn>
        ) : (
          <div className="grid gap-8 md:grid-cols-2">
            {CURATED_VIDEOS.map((video, i) => (
              <FadeIn key={video.id} delay={i * 0.08} className="overflow-hidden rounded-lg border border-gold-border/20 bg-white">
                <LiteYouTubeEmbed id={video.id} title={video.title} />
                <div className="p-6">
                  <h2 className="font-display text-xl font-bold text-navy">{video.title}</h2>
                  {video.description && (
                    <p className="mt-2 text-base leading-relaxed text-silver">{video.description}</p>
                  )}
                  <Link
                    href={SITE.calendly}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 inline-block font-mono text-sm uppercase tracking-wide text-gold hover:underline"
                  >
                    Recognise your business? Book a free review →
                  </Link>
                </div>
              </FadeIn>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
