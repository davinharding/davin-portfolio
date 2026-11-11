// Server-only. Loads a blueprint for the /b/[slug] page.
import { unstable_cache } from "next/cache";
import { cache } from "react";
import { getExample } from "./examples";
import { parseStoredBlueprint, type StoredBlueprint } from "./schema";
import { isExampleSlug, isValidSlug } from "./slug";
import { getStore, keys } from "./store";

export class BlueprintUnavailableError extends Error {
  constructor(cause: unknown) {
    super("Blueprints are temporarily unavailable", { cause });
    this.name = "BlueprintUnavailableError";
  }
}

/**
 * The Upstash client fetches with `cache: "no-store"`. /b/[slug] is an ISR
 * page, and Next never resolves a no-store fetch while it statically renders
 * one, so a bare read hangs until the store timeout. Inside unstable_cache
 * the fetch runs normally. Blueprints are immutable, so caching the raw
 * value is safe; errors are not cached.
 */
const readStoredBlueprint = unstable_cache(
  async (slug: string) => getStore()?.get(keys.blueprint(slug)) ?? null,
  ["thirty-blueprint"],
  { revalidate: 300 }
);

/**
 * Returns the blueprint, or null when it does not exist. Throws
 * BlueprintUnavailableError when the store fails or stored data is invalid,
 * which the route's error boundary turns into a retry page.
 */
export const loadBlueprint = cache(async (slug: string): Promise<StoredBlueprint | null> => {
  if (!isValidSlug(slug)) return null;
  // Examples are committed files and never looked up in Redis.
  if (isExampleSlug(slug)) return getExample(slug);
  if (!getStore()) return null;
  let raw: string | null;
  try {
    raw = await readStoredBlueprint(slug);
  } catch (err) {
    console.error("[thirty] blueprint read failed", slug, err);
    throw new BlueprintUnavailableError(err);
  }
  if (!raw) return null;
  try {
    return parseStoredBlueprint(JSON.parse(raw));
  } catch (err) {
    console.error("[thirty] stored blueprint failed validation", slug, err);
    throw new BlueprintUnavailableError(err);
  }
});
