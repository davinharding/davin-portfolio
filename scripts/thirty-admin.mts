// Admin commands against the production store (Redis env vars required).
//   npm run thirty:admin -- get <slug>
//   npm run thirty:admin -- delete <slug>
//   npm run thirty:admin -- stats
import { monthSpendMicros } from "../src/lib/thirty/budget";
import { getConfig, hasRedisEnv } from "../src/lib/thirty/config";
import { utcDay, utcMonth } from "../src/lib/thirty/limits";
import { parseStoredBlueprint } from "../src/lib/thirty/schema";
import { isExampleSlug, isValidSlug } from "../src/lib/thirty/slug";
import { GuardedStore, keys, UpstashStore } from "../src/lib/thirty/store";

function usage(): never {
  console.error("Usage: npm run thirty:admin -- <get <slug> | delete <slug> | stats>");
  process.exit(1);
}

if (!hasRedisEnv()) {
  console.error("Set KV_REST_API_URL and KV_REST_API_TOKEN (or UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN).");
  process.exit(1);
}

const store = new GuardedStore(UpstashStore.fromEnv(), 10_000);
const [command, arg] = process.argv.slice(2);

function requireSlug(slug: string | undefined): string {
  if (!slug || !isValidSlug(slug)) usage();
  if (isExampleSlug(slug)) {
    console.error("Example blueprints live in src/data/blueprints and are not stored in Redis.");
    process.exit(1);
  }
  return slug;
}

switch (command) {
  case "get": {
    const slug = requireSlug(arg);
    const raw = await store.get(keys.blueprint(slug));
    if (!raw) {
      console.error(`No blueprint ${slug}.`);
      process.exit(1);
    }
    console.log(JSON.stringify(parseStoredBlueprint(JSON.parse(raw)), null, 2));
    break;
  }
  case "delete": {
    const slug = requireSlug(arg);
    const raw = await store.get(keys.blueprint(slug));
    if (!raw) {
      console.error(`No blueprint ${slug}.`);
      process.exit(1);
    }
    const host = (JSON.parse(raw) as { source?: { host?: string } }).source?.host;
    await store.del(keys.blueprint(slug));
    if (host && (await store.get(keys.domain(host))) === slug) {
      await store.del(keys.domain(host));
      console.log(`Removed dom:${host}.`);
    }
    console.log(`Deleted ${slug}.`);
    console.log("The cached page can linger for up to 5 minutes (revalidate = 300) before it returns 404.");
    break;
  }
  case "stats": {
    const now = new Date();
    const spent = await monthSpendMicros(store, now);
    const runs = Number((await store.get(keys.day(utcDay(now)))) ?? 0);
    const cfg = getConfig();
    console.log(`Month ${utcMonth(now)}: $${(spent / 1e6).toFixed(4)} of $${cfg.monthlyBudgetUsd} (includes open reservations)`);
    console.log(`Today ${utcDay(now)}: ${runs} of ${cfg.dailyRuns} fresh runs`);
    break;
  }
  default:
    usage();
}
