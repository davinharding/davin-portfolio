"use client";

import { useMemo, useState } from "react";
import { FeaturedPost } from "@/components/blog/FeaturedPost";
import { PostCard } from "@/components/blog/PostCard";
import { cn } from "@/lib/utils";
import type { Post, TagCount } from "@/lib/blog";

type BlogListProps = {
  posts: Post[];
  tags: TagCount[];
};

const ALL = "All";

const BlogList: React.FC<BlogListProps> = ({ posts, tags }) => {
  const [activeTag, setActiveTag] = useState<string>(ALL);

  const isFiltering = activeTag !== ALL;

  const visiblePosts = useMemo(
    () =>
      isFiltering
        ? posts.filter((post) => post.tags.includes(activeTag))
        : posts,
    [posts, activeTag, isFiltering]
  );

  // In the unfiltered view we lead with a large featured post and show the
  // remainder as a grid. When a tag is active we drop the featured treatment
  // and show every match in the grid so nothing is hidden.
  const featured = isFiltering ? undefined : visiblePosts[0];
  const gridPosts = featured ? visiblePosts.slice(1) : visiblePosts;

  return (
    <div>
      <div
        className="mb-10 flex flex-wrap gap-2"
        role="group"
        aria-label="Filter posts by tag"
      >
        <FilterChip
          label={ALL}
          active={activeTag === ALL}
          onClick={() => setActiveTag(ALL)}
        />
        {tags.map(({ tag, count }) => (
          <FilterChip
            key={tag}
            label={tag}
            count={count}
            active={activeTag === tag}
            onClick={() => setActiveTag(tag)}
          />
        ))}
      </div>

      {featured && (
        <div className="mb-6">
          <FeaturedPost post={featured} eyebrow="Latest" />
        </div>
      )}

      {gridPosts.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {gridPosts.map((post, index) => (
            <PostCard key={post.slug} post={post} priority={index < 3} />
          ))}
        </div>
      ) : (
        !featured && (
          <p className="text-muted-foreground">
            No posts tagged “{activeTag}” yet.
          </p>
        )
      )}
    </div>
  );
};

type FilterChipProps = {
  label: string;
  count?: number;
  active: boolean;
  onClick: () => void;
};

const FilterChip: React.FC<FilterChipProps> = ({
  label,
  count,
  active,
  onClick,
}) => (
  <button
    type="button"
    onClick={onClick}
    aria-pressed={active}
    className={cn(
      "inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
      active
        ? "border-primary bg-primary text-primary-foreground"
        : "border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
    )}
  >
    {label}
    {typeof count === "number" && (
      <span className={cn("text-xs", active ? "opacity-80" : "opacity-60")}>
        {count}
      </span>
    )}
  </button>
);

export default BlogList;
