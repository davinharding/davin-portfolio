import { randomBytes } from "node:crypto";

import { EXAMPLE_PREFIX } from "./slugFormat";

export { EXAMPLE_PREFIX, isExampleSlug, isValidSlug, SLUG_RE } from "./slugFormat";

const BASE32 = "abcdefghijklmnopqrstuvwxyz234567";

function base32(bytes: Uint8Array, length: number): string {
  let out = "";
  for (let i = 0; i < length; i++) out += BASE32[bytes[i] % 32];
  return out;
}

export function makeSlug(host: string, random: (n: number) => Uint8Array = randomBytes): string {
  let stem = host
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40)
    .replace(/-+$/, "");
  if (!stem) stem = "site";
  if (`${stem}-`.startsWith(EXAMPLE_PREFIX)) stem = `x-${stem}`.slice(0, 40).replace(/-+$/, "");
  return `${stem}-${base32(random(8), 8)}`;
}
