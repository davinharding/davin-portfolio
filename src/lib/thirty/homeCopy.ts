import type { Metadata } from "next";

export const HEADLINE = "Your next hire is an AI agent. Davin builds it";
const TITLE = "Your next hire is an AI agent. Davin Harding builds it.";
const DESCRIPTION =
  "Enter your company's website and get a blueprint of the AI agents I'd build for you. It takes about 30 seconds.";

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
