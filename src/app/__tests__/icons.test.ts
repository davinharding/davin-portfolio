import { readFileSync } from "node:fs";
import sharp from "sharp";
import { describe, expect, it } from "vitest";
import {
  APPLE_ICON,
  APPLE_ICON_SIZE,
  FAVICON,
  FAVICON_SIZES,
  ICON_SVG,
  fullBleed,
  readIcoFrames,
  renderIcon,
} from "../../../scripts/generate-icons.mjs";

const MAX_MEAN_CHANNEL_DIFF = 3;

async function meanChannelDiff(a: Buffer, b: Buffer) {
  const [pa, pb] = await Promise.all([a, b].map((png) => sharp(png).ensureAlpha().raw().toBuffer()));
  expect(pa.length).toBe(pb.length);
  let total = 0;
  for (let i = 0; i < pa.length; i++) total += Math.abs(pa[i] - pb[i]);
  return total / pa.length;
}

const svg = readFileSync(ICON_SVG, "utf8");

describe("favicon.ico", () => {
  const frames = () => readIcoFrames(readFileSync(FAVICON));

  it("is a real ICO holding the tab sizes", async () => {
    expect(frames().map((f) => f.size)).toEqual(FAVICON_SIZES);
    for (const { size, png } of frames()) {
      const meta = await sharp(png).metadata();
      expect([meta.width, meta.height]).toEqual([size, size]);
    }
  });

  it.each(FAVICON_SIZES)("matches icon.svg at %ipx (run `npm run icons` after changing the SVG)", async (size) => {
    const frame = frames().find((f) => f.size === size)!;
    expect(await meanChannelDiff(frame.png, await renderIcon(svg, size))).toBeLessThan(MAX_MEAN_CHANNEL_DIFF);
  });
});

describe("apple-icon.png", () => {
  it("matches a full-bleed icon.svg (run `npm run icons` after changing the SVG)", async () => {
    const committed = readFileSync(APPLE_ICON);
    const meta = await sharp(committed).metadata();
    expect([meta.width, meta.height]).toEqual([APPLE_ICON_SIZE, APPLE_ICON_SIZE]);
    expect(await meanChannelDiff(committed, await renderIcon(fullBleed(svg), APPLE_ICON_SIZE))).toBeLessThan(
      MAX_MEAN_CHANNEL_DIFF,
    );
  });
});
