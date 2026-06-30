import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { FeaturedPost } from "@/components/blog/FeaturedPost";
import { PostCard } from "@/components/blog/PostCard";
import { getFeaturedPost, getPublishedPosts } from "@/lib/blog";

/**
 * Editorial "Writing" block for the landing page. Leads with the latest (or
 * pinned) post, followed by a few recent pieces. Renders nothing until there is
 * published writing, so the home page never shows an empty shell.
 */
const WritingSection: React.FC = () => {
  const featured = getFeaturedPost();
  if (!featured) return null;

  const recent = getPublishedPosts()
    .filter((post) => post.slug !== featured.slug)
    .slice(0, 3);

  return (
    <section
      className="section-spacing"
      id="writing"
      aria-labelledby="writing-heading"
    >
      <div className="container-narrow">
        <div className="mb-12 flex items-end justify-between gap-4">
          <div>
            <h2
              id="writing-heading"
              className="text-2xl md:text-3xl font-semibold tracking-tight text-foreground"
            >
              Writing
            </h2>
            <p className="mt-2 text-sm md:text-base text-muted-foreground">
              Long-form notes, written by hand.
            </p>
          </div>
          <Link
            href="/blog"
            prefetch
            className="group hidden shrink-0 items-center text-sm font-medium text-primary sm:inline-flex"
          >
            View all
            <ArrowRight
              className="ml-1.5 h-4 w-4 transition-transform duration-200 group-hover:translate-x-1 motion-reduce:transition-none"
              aria-hidden="true"
            />
          </Link>
        </div>

        <FeaturedPost post={featured} eyebrow="Latest" />

        {recent.length > 0 && (
          <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {recent.map((post) => (
              <PostCard key={post.slug} post={post} />
            ))}
          </div>
        )}

        <div className="mt-8 sm:hidden">
          <Link
            href="/blog"
            prefetch
            className="group inline-flex items-center text-sm font-medium text-primary"
          >
            View all writing
            <ArrowRight
              className="ml-1.5 h-4 w-4 transition-transform duration-200 group-hover:translate-x-1 motion-reduce:transition-none"
              aria-hidden="true"
            />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default WritingSection;
