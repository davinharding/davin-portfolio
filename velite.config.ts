import { defineConfig, defineCollection, s } from "velite";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypePrettyCode, { type Options as PrettyCodeOptions } from "rehype-pretty-code";

const prettyCodeOptions: PrettyCodeOptions = {
  theme: "github-dark-dimmed",
  keepBackground: true,
  defaultLang: "plaintext",
};

/**
 * Blog posts collection.
 *
 * Content lives as Markdown/MDX in `src/content/blog/`. That folder is the
 * canonical, human-authored record of Davin's writing voice — see BLOG.md.
 * Velite validates the frontmatter against this schema at build time and emits
 * typed data + a precompiled HTML `content` field into `.velite/`.
 */
const posts = defineCollection({
  name: "Post",
  pattern: "blog/**/*.{md,mdx}",
  schema: s
    .object({
      title: s.string().max(120),
      // Used for cards, meta descriptions, OG/Twitter, and RSS summaries.
      description: s.string().max(320),
      date: s.isodate(),
      updated: s.isodate().optional(),
      // Optional hero image, resolved relative to the post file. Velite copies
      // it into the static output and provides width/height + a blur placeholder.
      cover: s.image().optional(),
      coverAlt: s.string().optional(),
      tags: s.array(s.string()).default([]),
      // Matches the project pattern: drafts resolve by direct URL but are kept
      // out of public listings, the sitemap, and the RSS feed.
      draft: s.boolean().default(false),
      // Seed/demo posts that ship with the feature. They render so the design
      // is reviewable, but they are NOT part of the writing-voice corpus and
      // are meant to be deleted once real posts exist.
      sample: s.boolean().default(false),
      // Pins a post as the hero on the landing section and the blog index.
      // When no post is pinned, the most recent post is featured automatically.
      featured: s.boolean().default(false),
      // Optional manual slug override; defaults to the filename.
      slug: s.string().optional(),
      metadata: s.metadata(),
      content: s.markdown(),
    })
    .transform((data, { meta }) => {
      const slug = data.slug ?? meta.stem ?? "";
      return { ...data, slug, url: `/blog/${slug}` };
    }),
});

export default defineConfig({
  root: "src/content",
  output: {
    data: ".velite",
    assets: "public/blog-assets",
    base: "/blog-assets/",
    name: "[name]-[hash:8].[ext]",
    clean: true,
  },
  collections: { posts },
  markdown: {
    remarkPlugins: [remarkGfm],
    rehypePlugins: [
      rehypeSlug,
      [rehypePrettyCode, prettyCodeOptions],
      [
        rehypeAutolinkHeadings,
        {
          behavior: "wrap",
          properties: { className: ["heading-anchor"] },
        },
      ],
    ],
  },
});
