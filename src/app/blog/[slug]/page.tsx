import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight, ArrowUpRight } from "lucide-react";

import HeaderFooter from "@/components/HeaderFooter";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  formatPostDate,
  formatReadingTime,
  getPostBySlug,
  getPublishedPosts,
  postPath,
  type Post,
} from "@/lib/blog";

const SITE_URL = "https://www.davin.io";

type RouteParams = { slug: string };
type RouteParamsPromise = Promise<RouteParams>;

// Pre-render every published post at build time. Drafts are excluded here but
// still resolve on demand by direct URL (dynamicParams defaults to true) so
// they can be previewed before publishing — mirroring the portfolio routes.
export function generateStaticParams(): RouteParams[] {
  return getPublishedPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: RouteParamsPromise;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return { title: "Post Not Found" };

  const path = postPath(post.slug);
  const ogImage = post.cover?.src;

  return {
    title: post.title,
    description: post.description,
    alternates: { canonical: path },
    keywords: post.tags,
    ...(post.draft && {
      robots: { index: false, follow: false, nocache: true },
    }),
    openGraph: {
      type: "article",
      title: post.title,
      description: post.description,
      url: path,
      publishedTime: new Date(post.date).toISOString(),
      ...(post.updated && {
        modifiedTime: new Date(post.updated).toISOString(),
      }),
      authors: ["Davin Harding"],
      tags: post.tags,
      ...(ogImage && { images: [{ url: ogImage, alt: post.title }] }),
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
      ...(ogImage && { images: [ogImage] }),
    },
  };
}

const BlogPost = async ({ params }: { params: RouteParamsPromise }) => {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const { newer, older } = getAdjacentPosts(post);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    datePublished: new Date(post.date).toISOString(),
    dateModified: new Date(post.updated ?? post.date).toISOString(),
    ...(post.cover && { image: `${SITE_URL}${post.cover.src}` }),
    keywords: post.tags.join(", "),
    url: `${SITE_URL}${postPath(post.slug)}`,
    mainEntityOfPage: `${SITE_URL}${postPath(post.slug)}`,
    author: {
      "@type": "Person",
      name: "Davin Harding",
      url: SITE_URL,
    },
    publisher: {
      "@type": "Person",
      name: "Davin Harding",
      url: SITE_URL,
    },
  };

  return (
    <HeaderFooter page="article" mobile>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="bg-background min-h-screen">
        <article className="container-narrow pb-16 pt-24">
          <div className="mx-auto max-w-2xl">
            <Link
              href="/blog"
              className="mb-8 inline-flex items-center text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="mr-2 h-4 w-4" aria-hidden="true" />
              All writing
            </Link>

            <header className="mb-8">
              {post.tags.length > 0 && (
                <div className="mb-4 flex flex-wrap gap-1.5">
                  {post.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}

              <h1 className="text-3xl font-semibold leading-tight tracking-tight text-foreground md:text-4xl lg:text-5xl">
                {post.title}
              </h1>

              <div className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
                <span>Davin Harding</span>
                <span aria-hidden="true">·</span>
                <time dateTime={post.date}>{formatPostDate(post.date)}</time>
                <span aria-hidden="true">·</span>
                <span>{formatReadingTime(post.metadata.readingTime)}</span>
                {post.updated && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span>Updated {formatPostDate(post.updated)}</span>
                  </>
                )}
              </div>
            </header>

            {post.cover && (
              <div className="relative mb-10 aspect-[16/9] w-full overflow-hidden rounded-xl border">
                <Image
                  src={post.cover.src}
                  alt={post.coverAlt ?? ""}
                  fill
                  placeholder="blur"
                  blurDataURL={post.cover.blurDataURL}
                  priority
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 672px"
                />
              </div>
            )}

            <div
              className="article-prose prose prose-lg"
              // Content is precompiled to sanitized HTML by Velite at build time
              // from trusted, first-party Markdown in the repo.
              // eslint-disable-next-line react/no-danger
              dangerouslySetInnerHTML={{ __html: post.content }}
            />

            <Separator className="my-12" />

            <footer>
              <p className="text-sm text-muted-foreground">
                Written by <span className="text-foreground">Davin Harding</span>.
                Thanks for reading.
              </p>

              {(newer || older) && (
                <nav
                  aria-label="More posts"
                  className="mt-8 grid gap-4 sm:grid-cols-2"
                >
                  {older ? (
                    <PostNavLink
                      post={older}
                      direction="prev"
                      label="Older post"
                    />
                  ) : (
                    <span />
                  )}
                  {newer && (
                    <PostNavLink
                      post={newer}
                      direction="next"
                      label="Newer post"
                    />
                  )}
                </nav>
              )}
            </footer>
          </div>
        </article>
      </div>
    </HeaderFooter>
  );
};

function getAdjacentPosts(post: Post): {
  newer?: Post;
  older?: Post;
} {
  const published = getPublishedPosts();
  const index = published.findIndex((p) => p.slug === post.slug);
  if (index === -1) return {};
  // `published` is sorted newest first.
  return {
    newer: index > 0 ? published[index - 1] : undefined,
    older: index < published.length - 1 ? published[index + 1] : undefined,
  };
}

type PostNavLinkProps = {
  post: Post;
  direction: "prev" | "next";
  label: string;
};

const PostNavLink: React.FC<PostNavLinkProps> = ({ post, direction, label }) => (
  <Link
    href={postPath(post.slug)}
    prefetch
    className={`group flex flex-col rounded-xl border p-4 transition-colors hover:border-primary/50 ${
      direction === "next" ? "sm:items-end sm:text-right" : ""
    }`}
  >
    <span className="flex items-center text-xs uppercase tracking-[0.15em] text-muted-foreground">
      {direction === "prev" && (
        <ArrowLeft className="mr-1 h-3 w-3" aria-hidden="true" />
      )}
      {label}
      {direction === "next" && (
        <ArrowRight className="ml-1 h-3 w-3" aria-hidden="true" />
      )}
    </span>
    <span className="mt-1 line-clamp-2 font-medium text-foreground transition-colors group-hover:text-primary">
      {post.title}
    </span>
    <span className="mt-1 inline-flex items-center text-xs text-muted-foreground">
      {formatReadingTime(post.metadata.readingTime)}
      <ArrowUpRight className="ml-1 h-3 w-3" aria-hidden="true" />
    </span>
  </Link>
);

export default BlogPost;
