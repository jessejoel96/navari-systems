import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import { FadeIn } from "@/components/ui/FadeIn";
import { SITE } from "@/lib/constants";
import { getAllPosts, getPostBySlug } from "@/lib/blog";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return {};

  return {
    title: post.title,
    description: post.description,
    openGraph: {
      title: post.title,
      description: post.description,
      type: "article",
      publishedTime: post.date,
      url: `${SITE.url}/blog/${slug}`,
    },
    alternates: { canonical: `${SITE.url}/blog/${slug}` },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    author: { "@type": "Person", name: SITE.founder },
    publisher: { "@type": "Organization", name: SITE.name, url: SITE.url },
    mainEntityOfPage: `${SITE.url}/blog/${slug}`,
  };

  return (
    <article className="bg-white px-5 pb-24 pt-28 md:px-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="mx-auto max-w-[720px]">
        <FadeIn>
          <Link href="/blog" className="font-mono text-[11px] uppercase tracking-wider text-gold hover:underline">
            ← Back to Blog
          </Link>

          <span className="mt-6 block font-mono text-[10px] uppercase tracking-widest text-gold">
            {post.industry}
          </span>
          <h1 className="mt-2 font-display text-[clamp(28px,4vw,40px)] font-extrabold leading-tight tracking-tight text-navy">
            {post.title}
          </h1>
          <time className="mt-4 block font-mono text-[11px] text-silver">
            {new Date(post.date).toLocaleDateString("en-GB", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </time>

          <div className="prose-navari prose prose-lg mt-10 max-w-none">
            <MDXRemote source={post.content} />
          </div>

          <div className="mt-16 rounded-lg border border-gold-border/20 bg-slate-bg p-8 text-center">
            <h2 className="font-display text-lg font-bold text-navy">
              Recognise your business in this?
            </h2>
            <p className="mt-2 text-sm text-silver">
              Book a discovery call and get a specific observation about your highest-cost process.
            </p>
            <Link
              href={SITE.calendly}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex rounded bg-gold px-8 py-3 font-display text-[13px] font-bold tracking-wider text-navy transition-colors hover:bg-gold-light"
            >
              Book a Discovery Call →
            </Link>
          </div>
        </FadeIn>
      </div>
    </article>
  );
}
