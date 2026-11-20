// Server-only.
import { randomBytes } from "node:crypto";

export const SLUG_RE = /^[a-z0-9][a-z0-9-]{2,70}$/;
export const EXAMPLE_PREFIX = "example-";

const BASE32 = "abcdefghijklmnopqrstuvwxyz234567";

function base32(bytes: Uint8Array, length: number): string {
  let out = "";
  for (let i = 0; i < length; i++) out += BASE32[bytes[i] % 32];
  return out;
}

export function isValidSlug(slug: string): boolean {
  return SLUG_RE.test(slug);
}

export function isExampleSlug(slug: string): boolean {
  return slug.startsWith(EXAMPLE_PREFIX);
}

/** `<host with dots as hyphens, max 40>-<8 random base32 chars>`. */
export function makeSlug(host: string, random: (n: number) => Uint8Array = randomBytes): string {
  let stem = host
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40)
    .replace(/-+$/, "");
  if (!stem) stem = "site";
  // The example- prefix is reserved for committed examples.
  if (`${stem}-`.startsWith(EXAMPLE_PREFIX)) stem = `x-${stem}`.slice(0, 40).replace(/-+$/, "");
  return `${stem}-${base32(random(8), 8)}`;
}
