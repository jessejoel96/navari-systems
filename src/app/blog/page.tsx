import type { Metadata } from "next";
import Link from "next/link";
import { NewsletterForm } from "@/components/forms/NewsletterForm";
import { FadeIn } from "@/components/ui/FadeIn";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { INDUSTRIES } from "@/lib/constants";
import { getPostsByIndustry } from "@/lib/blog";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Operational automation insights for real estate, education, professional services, and more.",
};

type Props = {
  searchParams: Promise<{ industry?: string }>;
};

export default async function BlogPage({ searchParams }: Props) {
  const { industry: rawIndustry } = await searchParams;
  const industry =
    rawIndustry && INDUSTRIES.includes(rawIndustry as (typeof INDUSTRIES)[number])
      ? rawIndustry
      : "All";

  const posts = getPostsByIndustry(industry);

  return (
    <div className="bg-slate-bg px-5 pb-24 pt-36 md:px-10">
      <div className="mx-auto max-w-[1100px]">
        <FadeIn>
          <SectionLabel>Insights &amp; Teardowns</SectionLabel>
          <h1 className="mb-4 font-display text-[clamp(32px,4.5vw,48px)] font-extrabold leading-[1.15] tracking-tight text-navy">
            The Navari Blog
          </h1>
          <p className="mb-10 max-w-[680px] text-lg leading-relaxed text-body-text">
            Operational teardowns and infrastructure walkthroughs for founders doing
            $15k/mo+ who know something is wrong but have not mapped where.
          </p>
        </FadeIn>

        <div className="mb-12 flex flex-wrap gap-2">
          {INDUSTRIES.map((ind) => (
            <Link
              key={ind}
              href={ind === "All" ? "/blog" : `/blog?industry=${encodeURIComponent(ind)}`}
              className={`rounded-full border px-4 py-2 font-mono text-sm uppercase tracking-wide transition-colors ${
                industry === ind
                  ? "border-gold bg-gold/10 text-gold"
                  : "border-gold-border/30 text-silver hover:border-gold-border hover:text-navy"
              }`}
            >
              {ind}
            </Link>
          ))}
        </div>

        {posts.length === 0 ? (
          <p className="text-silver">No posts in this category yet.</p>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {posts.map((post, i) => (
              <FadeIn key={post.slug} delay={i * 0.06}>
                <Link
                  href={`/blog/${post.slug}`}
                  className="block rounded-lg border border-gold-border/20 bg-white p-8 transition-all hover:border-gold-border hover:shadow-md"
                >
                  <span className="font-mono text-xs font-medium uppercase tracking-wide text-gold">
                    {post.industry}
                  </span>
                  <h2 className="mt-2 font-display text-2xl font-bold text-navy">{post.title}</h2>
                  <p className="mt-2 text-base leading-relaxed text-silver">{post.description}</p>
                  <time className="mt-4 block font-mono text-sm text-silver">
                    {new Date(post.date).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </time>
                </Link>
              </FadeIn>
            ))}
          </div>
        )}

        <FadeIn className="mt-16 rounded-lg border border-gold-border/20 bg-white p-8">
          <h2 className="font-display text-xl font-bold text-navy">Get the Navari Weekly</h2>
          <p className="mt-2 text-base text-silver">
            One operational insight per week. No fluff.
          </p>
          <NewsletterForm className="mt-4 max-w-md" />
        </FadeIn>
      </div>
    </div>
  );
}
