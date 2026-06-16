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
    <article className="bg-white px-5 pb-24 pt-36 md:px-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="mx-auto max-w-[720px]">
        <FadeIn>
          <Link href="/blog" className="font-mono text-sm uppercase tracking-wide text-gold hover:underline">
            ← Back to Blog
          </Link>

          <span className="mt-6 block font-mono text-xs font-medium uppercase tracking-wide text-gold">
            {post.industry}
          </span>
          <h1 className="mt-2 font-display text-[clamp(32px,4.5vw,44px)] font-extrabold leading-[1.15] tracking-tight text-navy">
            {post.title}
          </h1>
          <time className="mt-4 block font-mono text-sm text-silver">
            {new Date(post.date).toLocaleDateString("en-GB", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </time>

          <div className="prose-navari prose prose-xl mt-10 max-w-none">
            <MDXRemote source={post.content} />
          </div>

          <div className="mt-16 rounded-lg border border-gold-border/20 bg-slate-bg p-8 text-center">
            <h2 className="font-display text-xl font-bold text-navy">
              Recognise your operation in this?
            </h2>
            <p className="mt-2 text-base text-silver">
              Book a free 30-minute operations review. You will leave knowing your
              highest-cost manual process — whether we work together or not.
            </p>
            <Link
              href={SITE.calendly}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex rounded bg-gold px-8 py-4 font-display text-[15px] font-bold tracking-wide text-navy transition-colors hover:bg-gold-light"
            >
              Book a Free Operations Review →
            </Link>
          </div>
        </FadeIn>
      </div>
    </article>
  );
}
