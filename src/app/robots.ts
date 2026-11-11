import type { MetadataRoute } from "next";

const SITE_URL = "https://www.davin.io";

export default function robots(): MetadataRoute.Robots {
  return {
    // /b/ stays crawlable so visitor pages can be read and dropped via their noindex tag.
    rules: [{ userAgent: "*", allow: "/", disallow: "/api/" }],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
