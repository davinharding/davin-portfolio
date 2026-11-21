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

const readStoredBlueprint = unstable_cache(
  async (slug: string) => getStore()?.get(keys.blueprint(slug)) ?? null,
  ["thirty-blueprint"],
  { revalidate: 300 }
);

export const loadBlueprint = cache(async (slug: string): Promise<StoredBlueprint | null> => {
  if (!isValidSlug(slug)) return null;
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
