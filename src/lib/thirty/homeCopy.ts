// The homepage's words and metadata, shared by every design so link previews and
// search results are identical whichever one a visitor or crawler is served.
import type { Metadata } from "next";

export const HEADLINE = "Your next hire is an AI agent. Davin builds it";
// Search results and link previews keep the full name.
const TITLE = "Your next hire is an AI agent. Davin Harding builds it.";
const DESCRIPTION =
  "Enter your company's website and watch my agents draft a blueprint of the AI agents I would build for you, in about 30 seconds.";

/**
 * The homepage's social preview, drawn by src/app/social/home/opengraph-image.tsx.
 * It lives outside `/` and `/home/<design>` so every design and the fallback page
 * share one URL that the proxy never touches, and no other page picks it up.
 */
export const HOME_SOCIAL_IMAGE = {
  url: "/social/home/opengraph-image",
  width: 1200,
  height: 630,
  alt: `${HEADLINE}. davin.io`,
} as const;

export const homeMetadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  alternates: { canonical: "/" },
  openGraph: { title: TITLE, description: DESCRIPTION, url: "/", images: [HOME_SOCIAL_IMAGE] },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: [{ url: HOME_SOCIAL_IMAGE.url, alt: HOME_SOCIAL_IMAGE.alt }],
  },
};
