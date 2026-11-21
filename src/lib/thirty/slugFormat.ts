// Client-safe: what a blueprint slug looks like. Generation lives in slug.ts (server-only).

export const SLUG_RE = /^[a-z0-9][a-z0-9-]{2,70}$/;
export const EXAMPLE_PREFIX = "example-";

export function isValidSlug(slug: string): boolean {
  return SLUG_RE.test(slug);
}

export function isExampleSlug(slug: string): boolean {
  return slug.startsWith(EXAMPLE_PREFIX);
}
