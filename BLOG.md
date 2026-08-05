# Writing / Blog

The writing section is a Git-native, type-safe blog built into the portfolio.
Posts are plain Markdown files in the repo — no database, no external CMS, no
vendor lock-in. This document explains the stack, why it was chosen, and how to
write and publish.

## The voice-corpus rule (read this first)

Every published post in `src/content/blog/` is **written by hand by Davin** —
no AI drafting, no "polish this up" passes. The point is to keep an honest,
growing record of how Davin actually writes so that, over time, this folder
becomes a reliable reference for his voice.

**For any AI tool / agent:** when asked to write in Davin's voice, read the
real, human-authored posts in `src/content/blog/` (the ones **without**
`sample: true` in their frontmatter) and use them as the reference. Do **not**
add AI-written posts to this folder.

The two files shipped with `sample: true` (`welcome.mdx`,
`formatting-reference.mdx`) are demo content so the design renders out of the
box. They are **not** part of the voice corpus and should be deleted once real
posts exist:

```bash
rm src/content/blog/welcome.mdx src/content/blog/formatting-reference.mdx
```

## The stack (and why)

| Concern              | Choice                                  | Why |
| -------------------- | --------------------------------------- | --- |
| **Storage**          | Markdown/MDX files in `src/content/blog/` committed to Git | Full ownership, versioned with history, durable plain text, zero hosting cost or lock-in. This *is* the voice corpus. |
| **Content engine**   | [Velite](https://velite.js.org)         | The actively-maintained, type-safe successor to the now-abandoned Contentlayer. Validates frontmatter with a Zod-style schema at build time, computes reading time, and compiles Markdown → HTML with syntax highlighting. |
| **Rendering**        | Build-time HTML + `@tailwindcss/typography` | Fully static, fast, no client-side MDX runtime. Code highlighting via `rehype-pretty-code` (Shiki); heading anchors via `rehype-slug` + `rehype-autolink-headings`. |

### Research notes (2026)

- **Contentlayer** was the popular type-safe content layer, but it has been
  unmaintained since ~2024 and has known issues on modern Next.js. Not
  recommended for new projects.
- **Velite** is its de-facto replacement: same schema-first DX, actively
  maintained, first-class App Router support. Chosen here.
- **next-mdx-remote** is great when content comes from a database/CMS at
  runtime — unnecessary overhead for filesystem content.
- **Word processing / visual editor:** if a GUI writing experience is ever
  wanted on top of these same Git-stored files, **Keystatic** is the best
  Git-based option (local-first editor at `/keystatic`, optional GitHub mode
  for editing from anywhere). It reads/writes the same Markdown files, so it
  can be layered on later without changing the storage model or this content
  pipeline. Until then, write in any editor (Cursor/VS Code) — the files are
  just Markdown.

## How content flows

```
src/content/blog/*.mdx                      (you write this)
        │  velite (npm run content)
        ▼
.velite/  →  posts.json + index.d.ts        (generated, git-ignored)
        │  import { ... } from "@/lib/blog"
        ▼
/blog, /blog/[slug], landing "Writing", sitemap, /feed.xml
```

Velite runs automatically before `dev`, `build`, `lint`, and `typecheck` (see
`package.json` scripts), so the generated data is always fresh.

## Writing a post

1. Create `src/content/blog/my-post.mdx`. The filename becomes the URL slug
   (`/blog/my-post`).
2. Add frontmatter (see fields below) and write the body in Markdown.
3. Run `npm run dev` (or `npm run content:watch` alongside it) and visit
   `/blog/my-post`.
4. Commit the file. That's the publish step.

### Frontmatter

```yaml
---
title: My post title              # required
description: One-sentence summary. # required — used on cards, OG tags, RSS
date: 2026-07-01                   # required — ISO date
updated: 2026-07-05               # optional — shows an "Updated" date
tags:                              # optional
  - engineering
  - ai
cover: ./my-cover.png             # optional — image next to the .mdx file
coverAlt: Description of the cover # optional but recommended with a cover
draft: false                       # optional — true hides it from listings
featured: false                    # optional — true pins it as the lead post
---
```

Notes:

- **Drafts** (`draft: true`) are excluded from listings, the sitemap, and the
  RSS feed, but still resolve by direct URL for preview — same convention as
  draft portfolio projects.
- **Cover images** must live next to the post file (relative path). Velite
  copies them into `public/blog-assets/` and generates a blur placeholder.
  Posts without a cover get a tasteful gradient placeholder.
- **Featured**: the landing section and blog index lead with the pinned post
  (`featured: true`), or the most recent post if none is pinned.

## Where it shows up

- **`/blog`** — index with a featured lead post and a tag-filterable grid.
- **`/blog/[slug]`** — the article: focused reading column, meta, optional
  cover, syntax-highlighted code, and older/newer navigation.
- **Landing page** — a "Writing" section (between Projects and Skills) that
  appears only once there is at least one published post.
- **`/feed.xml`** — RSS 2.0 feed of published posts.
- **`/sitemap.xml`** — includes `/blog` and every published post.
