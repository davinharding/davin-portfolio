// Server-only. Zod schemas for the model-facing outputs and stored blueprints.
// The model-facing schemas carry no numeric or length constraints (structured
// outputs support a limited JSON Schema subset); quality.ts enforces limits.
import { z } from "zod";
import { PROJECT_KEYS } from "./projectCatalog";
import type { StepId } from "./events";

export const ProfileSchema = z.object({
  companyName: z.string(),
  oneLiner: z.string(),
  offerings: z.array(z.string()),
  customers: z.string(),
  businessModel: z.string(),
  operations: z.array(z.string()),
  signals: z.array(z.string()),
  language: z.string(),
  fit: z.enum(["company", "thin", "not_a_company", "parked"]),
  flags: z.object({
    adultOrIllegal: z.boolean(),
    injectionAttempt: z.boolean(),
  }),
});

export type Profile = z.infer<typeof ProfileSchema>;

const RelatedProject = z.enum([...PROJECT_KEYS, "none"]);

const ToolSchema = z.object({
  name: z.string(),
  access: z.enum(["read", "write"]),
  system: z.string(),
});

const AgentSchema = z.object({
  name: z.string(),
  role: z.string(),
  trigger: z.string(),
  does: z.array(z.string()),
  tools: z.array(ToolSchema),
  humanGate: z.object({ required: z.boolean(), detail: z.string() }),
  evidence: z.string(),
  impact: z.string(),
  relatedProject: RelatedProject,
});

export const ModelBlueprintSchema = z.object({
  headline: z.string(),
  agents: z.array(AgentSchema),
  firstBuild: z.object({
    agentName: z.string(),
    why: z.string(),
    scope: z.array(z.string()),
  }),
  nonObvious: z.string(),
  caveats: z.array(z.string()),
});

export type ModelBlueprint = z.infer<typeof ModelBlueprintSchema>;

/** Same shape as the model output; used to validate what we stored. */
export const NormalizedBlueprintSchema = ModelBlueprintSchema.extend({
  agents: z.array(AgentSchema).min(1).max(5),
});
export type NormalizedBlueprint = ModelBlueprint;
export type NormalizedAgent = NormalizedBlueprint["agents"][number];

const STEP_IDS = ["validate", "read", "research", "design", "check"] as const satisfies readonly StepId[];

export const CURRENT_VERSION = 1;

export const StoredBlueprintSchema = z.object({
  v: z.literal(1),
  slug: z.string().regex(/^[a-z0-9][a-z0-9-]{2,70}$/),
  createdAt: z.string(),
  kind: z.enum(["run", "example"]),
  source: z.object({
    host: z.string(),
    inputUrl: z.string(),
    finalUrl: z.string().nullable(),
    method: z.enum(["fetch", "search", "curated"]),
    pages: z.array(z.object({ url: z.string(), title: z.string() })),
  }),
  company: z.object({
    name: z.string(),
    oneLiner: z.string(),
    offerings: z.array(z.string()),
    customers: z.string(),
  }),
  blueprint: NormalizedBlueprintSchema,
  receipt: z
    .object({
      totalMs: z.number(),
      steps: z.array(z.object({ id: z.enum(STEP_IDS), label: z.string(), ms: z.number() })),
      models: z.object({
        research: z.string(),
        blueprint: z.string(),
        search: z.string().optional(),
      }),
      tokens: z.object({ input: z.number(), output: z.number() }),
      webSearches: z.number(),
      estCostUsd: z.number(),
    })
    .nullable(),
});

export type StoredBlueprint = z.infer<typeof StoredBlueprintSchema>;
export type Receipt = NonNullable<StoredBlueprint["receipt"]>;

/**
 * Upgrades an older stored blueprint to the current shape. v1 is current, so
 * this is the identity; future schema versions add cases here.
 */
export function migrate(raw: unknown): unknown {
  if (raw && typeof raw === "object" && "v" in raw) {
    const v = (raw as { v: unknown }).v;
    if (v === CURRENT_VERSION) return raw;
  }
  return raw;
}

export function parseStoredBlueprint(raw: unknown): StoredBlueprint {
  return StoredBlueprintSchema.parse(migrate(raw));
}
