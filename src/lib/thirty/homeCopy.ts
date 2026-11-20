// The homepage's words and metadata, shared by every design so link previews and
// search results are identical whichever one a visitor or crawler is served.
import type { Metadata } from "next";

export const HEADLINE = "Your next hire is an AI agent. Davin builds it";
// Search results and link previews keep the full name.
const TITLE = "Your next hire is an AI agent. Davin Harding builds it.";
const DESCRIPTION =
  "Enter your company's website and watch my agents draft a blueprint of the AI agents I would build for you, in about 30 seconds.";

export const homeMetadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  alternates: { canonical: "/" },
  openGraph: { title: TITLE, description: DESCRIPTION, url: "/" },
  twitter: { title: TITLE, description: DESCRIPTION },
};
