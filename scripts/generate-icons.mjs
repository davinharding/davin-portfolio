import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

export const ICON_SVG = "src/app/icon.svg";
export const FAVICON = "src/app/favicon.ico";
export const APPLE_ICON = "src/app/apple-icon.png";
export const FAVICON_SIZES = [16, 32, 48];
export const APPLE_ICON_SIZE = 180;

const SVG_VIEWBOX = 40;
const SUPERSAMPLE = 4;

export function renderIcon(svg, size) {
  return sharp(Buffer.from(svg), { density: ((72 * size) / SVG_VIEWBOX) * SUPERSAMPLE })
    .resize(size, size)
    .png({ compressionLevel: 9 })
    .toBuffer();
}

export function fullBleed(svg) {
  return svg.replace(/(<rect\b[^>]*?)\s+rx="[^"]*"/, "$1");
}

export function packIco(frames) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(frames.length, 4);
  let offset = header.length + 16 * frames.length;
  const entries = frames.map(({ size, png }) => {
    const entry = Buffer.alloc(16);
    entry.writeUInt8(size % 256, 0);
    entry.writeUInt8(size % 256, 1);
    entry.writeUInt16LE(1, 4);
    entry.writeUInt16LE(32, 6);
    entry.writeUInt32LE(png.length, 8);
    entry.writeUInt32LE(offset, 12);
    offset += png.length;
    return entry;
  });
  return Buffer.concat([header, ...entries, ...frames.map((f) => f.png)]);
}

export function readIcoFrames(ico) {
  if (ico.readUInt16LE(0) !== 0 || ico.readUInt16LE(2) !== 1) throw new Error("not an ICO file");
  return Array.from({ length: ico.readUInt16LE(4) }, (_, i) => {
    const entry = 6 + 16 * i;
    const length = ico.readUInt32LE(entry + 8);
    const offset = ico.readUInt32LE(entry + 12);
    return { size: ico.readUInt8(entry) || 256, png: ico.subarray(offset, offset + length) };
  });
}

export async function generateIcons(svg) {
  const frames = await Promise.all(FAVICON_SIZES.map(async (size) => ({ size, png: await renderIcon(svg, size) })));
  return { favicon: packIco(frames), appleIcon: await renderIcon(fullBleed(svg), APPLE_ICON_SIZE) };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const { favicon, appleIcon } = await generateIcons(readFileSync(ICON_SVG, "utf8"));
  writeFileSync(FAVICON, favicon);
  writeFileSync(APPLE_ICON, appleIcon);
  console.log(`Wrote ${FAVICON} (${FAVICON_SIZES.join("/")}px) and ${APPLE_ICON} (${APPLE_ICON_SIZE}px) from ${ICON_SVG}`);
}
