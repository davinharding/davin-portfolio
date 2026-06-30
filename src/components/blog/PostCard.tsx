import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, PenLine } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  type Post,
  formatPostDate,
  formatReadingTime,
  postPath,
} from "@/lib/blog";

type PostCardProps = {
  post: Post;
  /** First row of cards is above the fold; load their covers eagerly. */
  priority?: boolean;
};

const PostCard: React.FC<PostCardProps> = ({ post, priority = false }) => {
  const href = postPath(post.slug);

  return (
    <Card className="group flex flex-col h-full overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:border-primary/50">
      <Link
        href={href}
        prefetch
        aria-label={`Read “${post.title}”`}
        className="relative block w-full aspect-[16/9] overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
      >
        {post.cover ? (
          <Image
            src={post.cover.src}
            alt={post.coverAlt ?? ""}
            fill
            placeholder="blur"
            blurDataURL={post.cover.blurDataURL}
            priority={priority}
            loading={priority ? undefined : "lazy"}
            className="object-cover transition-transform duration-300 group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 360px"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/15 via-secondary/30 to-secondary/50">
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-[radial-gradient(circle_at_center,hsl(var(--primary)/0.18),transparent_70%)]"
            />
            <PenLine
              className="relative h-7 w-7 text-primary transition-transform duration-300 group-hover:scale-110 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
              aria-hidden="true"
            />
          </div>
        )}
      </Link>

      <CardHeader className="pb-2">
        <div className="mb-1 flex items-center gap-2 text-xs text-muted-foreground">
          <time dateTime={post.date}>{formatPostDate(post.date)}</time>
          <span aria-hidden="true">·</span>
          <span>{formatReadingTime(post.metadata.readingTime)}</span>
        </div>
        <CardTitle className="text-lg leading-snug">
          <Link
            href={href}
            prefetch
            className="transition-colors hover:text-primary focus:outline-none focus-visible:text-primary"
          >
            {post.title}
          </Link>
        </CardTitle>
        <CardDescription className="line-clamp-3">
          {post.description}
        </CardDescription>
      </CardHeader>

      <CardContent className="mt-auto flex items-center justify-between pt-0">
        <div className="flex flex-wrap gap-1.5">
          {post.tags.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
        <span
          aria-hidden="true"
          className="text-muted-foreground transition-colors group-hover:text-primary"
        >
          <ArrowUpRight className="h-4 w-4" />
        </span>
      </CardContent>
    </Card>
  );
};

export { PostCard };
