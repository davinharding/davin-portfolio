import type { Metadata } from "next";
import { PenLine } from "lucide-react";
import ContainerLayout from "@/components/ContainerLayout";
import { getAllTags, getPublishedPosts } from "@/lib/blog";
import BlogList from "./BlogList";

export const metadata: Metadata = {
  title: "Writing",
  description:
    "Long-form notes on engineering, AI, and building products — written by hand by Davin Harding.",
  alternates: { canonical: "/blog" },
  openGraph: {
    type: "website",
    title: "Writing | Davin Harding",
    description:
      "Long-form notes on engineering, AI, and building products — written by hand by Davin Harding.",
    url: "/blog",
  },
};

export default function BlogIndex() {
  const posts = getPublishedPosts();
  const tags = getAllTags();

  return (
    <ContainerLayout pageTitle="Writing">
      <p className="mb-12 max-w-2xl text-muted-foreground">
        Long-form notes on engineering, AI, and building products. Everything
        here is written by hand — no AI drafting — so it doubles as an honest
        record of how I think and write.
      </p>

      {posts.length > 0 ? (
        <BlogList posts={posts} tags={tags} />
      ) : (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-20 text-center">
          <PenLine className="mb-4 h-8 w-8 text-primary" aria-hidden="true" />
          <h2 className="text-lg font-semibold text-foreground">
            No articles yet
          </h2>
          <p className="mt-2 max-w-sm text-sm text-muted-foreground">
            The first piece is in the works. Check back soon.
          </p>
        </div>
      )}
    </ContainerLayout>
  );
}
