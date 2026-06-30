import Image from "next/image";
import Link from "next/link";
import { ArrowRight, PenLine } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  type Post,
  formatPostDate,
  formatReadingTime,
  postPath,
} from "@/lib/blog";

type FeaturedPostProps = {
  post: Post;
  /** Eyebrow label above the title, e.g. "Latest" or "Featured". */
  eyebrow?: string;
};

const FeaturedPost: React.FC<FeaturedPostProps> = ({
  post,
  eyebrow = "Latest",
}) => {
  const href = postPath(post.slug);

  return (
    <article className="group relative grid gap-6 overflow-hidden rounded-xl border bg-card shadow transition-all duration-200 hover:border-primary/50 md:grid-cols-2 md:gap-0">
      <Link
        href={href}
        prefetch
        aria-label={`Read “${post.title}”`}
        className="relative block aspect-[16/10] w-full overflow-hidden md:aspect-auto md:h-full focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
      >
        {post.cover ? (
          <Image
            src={post.cover.src}
            alt={post.coverAlt ?? ""}
            fill
            placeholder="blur"
            blurDataURL={post.cover.blurDataURL}
            priority
            className="object-cover transition-transform duration-300 group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
            sizes="(max-width: 768px) 100vw, 560px"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/15 via-secondary/30 to-secondary/60">
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,hsl(var(--primary)/0.22),transparent_70%)]"
            />
            <PenLine
              className="relative h-10 w-10 text-primary transition-transform duration-300 group-hover:scale-110 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
              aria-hidden="true"
            />
          </div>
        )}
      </Link>

      <div className="flex flex-col justify-center p-6 md:p-8 lg:p-10">
        <div className="mb-3 flex items-center gap-3">
          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            {eyebrow}
          </span>
          <span className="text-xs text-muted-foreground">
            <time dateTime={post.date}>{formatPostDate(post.date)}</time>
            <span aria-hidden="true"> · </span>
            {formatReadingTime(post.metadata.readingTime)}
          </span>
        </div>

        <h3 className="text-2xl font-semibold leading-tight tracking-tight text-foreground md:text-3xl">
          <Link
            href={href}
            prefetch
            className="transition-colors hover:text-primary focus:outline-none focus-visible:text-primary"
          >
            {post.title}
          </Link>
        </h3>

        <p className="mt-3 text-body line-clamp-3 md:line-clamp-4">
          {post.description}
        </p>

        {post.tags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {post.tags.slice(0, 4).map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}

        <span className="mt-6 inline-flex items-center text-sm font-medium text-primary">
          Read article
          <ArrowRight className="ml-1.5 h-4 w-4 transition-transform duration-200 group-hover:translate-x-1 motion-reduce:transition-none" aria-hidden="true" />
        </span>
      </div>
    </article>
  );
};

export { FeaturedPost };
