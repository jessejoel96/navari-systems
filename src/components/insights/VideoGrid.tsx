"use client";

import LiteYouTubeEmbed from "react-lite-youtube-embed";
import "react-lite-youtube-embed/dist/LiteYouTubeEmbed.css";
import { FadeIn } from "@/components/ui/FadeIn";
import type { CuratedVideo } from "@/lib/videos";

export function VideoGrid({ videos }: { videos: CuratedVideo[] }) {
  return (
    <div className="grid gap-8 [grid-template-columns:repeat(auto-fit,minmax(320px,1fr))]">
      {videos.map((video, i) => (
        <FadeIn key={video.id} delay={i * 0.06}>
          <div className="overflow-hidden rounded-lg border border-gold-border/20 bg-white">
            <LiteYouTubeEmbed id={video.id} title={video.title} />
            <div className="p-5">
              <h2 className="font-display text-base font-bold text-navy">{video.title}</h2>
              {video.description && <p className="mt-2 text-sm text-silver">{video.description}</p>}
            </div>
          </div>
        </FadeIn>
      ))}
    </div>
  );
}
