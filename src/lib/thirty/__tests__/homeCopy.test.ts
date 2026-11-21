import { describe, expect, it } from "vitest";
import { HOME_SOCIAL_IMAGE, homeMetadata } from "../homeCopy";

describe("homeMetadata", () => {
  it("gives the Open Graph card the homepage image at 1200x630 with alt text", () => {
    expect(homeMetadata.openGraph?.images).toEqual([
      { url: "/social/home/opengraph-image", width: 1200, height: 630, alt: HOME_SOCIAL_IMAGE.alt },
    ]);
    expect(HOME_SOCIAL_IMAGE.alt).toMatch(/AI agent/);
  });

  it("asks for the large Twitter card with the same image", () => {
    expect(homeMetadata.twitter).toMatchObject({
      card: "summary_large_image",
      images: [{ url: HOME_SOCIAL_IMAGE.url, alt: HOME_SOCIAL_IMAGE.alt }],
    });
  });

  it("points at a generated-image path the proxy skips", () => {
    expect(HOME_SOCIAL_IMAGE.url).toMatch(/opengraph-image$/);
    expect(HOME_SOCIAL_IMAGE.url.startsWith("/home/")).toBe(false);
  });
});
