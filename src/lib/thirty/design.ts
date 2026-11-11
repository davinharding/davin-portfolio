// Server-only. Blueprint drafting with the blueprint model, streamed so agent
// names can be shown as they are written. Sees only the structured profile.
import type Anthropic from "@anthropic-ai/sdk";
import { AnthropicError, APIError } from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import type { Message, MessageParam } from "@anthropic-ai/sdk/resources/messages/messages";
import { LIMITS, type Effort } from "./config";
import { ModelOutputError, toUsageRecord, type UsageRecord } from "./anthropic";
import { catalogForPrompt } from "./projectCatalog";
import { DESIGN_SYSTEM, designRetryMessage, designUserMessage } from "./prompts";
import { ModelBlueprintSchema, type ModelBlueprint, type Profile } from "./schema";

/**
 * Finds complete agent names in partial JSON. An agent's `name` is followed by
 * its `role`, which tools never have, so tool names are not picked up.
 */
export function findAgentNames(partialJson: string): string[] {
  const names: string[] = [];
  const re = /"name"\s*:\s*"((?:[^"\\]|\\.)*)"\s*,\s*"role"/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(partialJson))) {
    try {
      const name = (JSON.parse(`"${m[1]}"`) as string).trim();
      if (name && !names.includes(name)) names.push(name);
    } catch {
      // A malformed escape mid-stream; the final parse is the authority.
    }
  }
  return names;
}

export type PreviousAttempt = { text: string | null; failures: string[] };

export type DesignInput = {
  client: Anthropic;
  model: string;
  effort: Effort;
  profile: Profile;
  signal: AbortSignal;
  previous?: PreviousAttempt;
  onAgentName?: (name: string) => void;
};

export type DesignResult = { blueprint: ModelBlueprint; usage: UsageRecord; text: string };

function buildMessages(profile: Profile, previous?: PreviousAttempt): MessageParam[] {
  const first = designUserMessage(JSON.stringify(profile, null, 2), catalogForPrompt());
  if (!previous) return [{ role: "user", content: first }];
  const feedback = designRetryMessage(previous.failures);
  if (previous.text) {
    return [
      { role: "user", content: first },
      { role: "assistant", content: previous.text },
      { role: "user", content: feedback },
    ];
  }
  return [{ role: "user", content: `${first}\n\n${feedback}` }];
}

export async function draftBlueprint(input: DesignInput): Promise<DesignResult> {
  const stage = AbortSignal.timeout(LIMITS.designStageMs);
  const signal = AbortSignal.any([input.signal, stage]);

  const stream = input.client.messages.stream(
    {
      model: input.model,
      max_tokens: 8000,
      system: DESIGN_SYSTEM,
      messages: buildMessages(input.profile, input.previous),
      output_config: { format: zodOutputFormat(ModelBlueprintSchema), effort: input.effort },
    },
    { signal, maxRetries: 0 }
  );

  let text = "";
  let snapshot: Message | undefined;
  const seen = new Set<string>();
  stream.on("streamEvent", (_event, snap) => {
    snapshot = snap;
  });
  stream.on("text", (delta) => {
    text += delta;
    if (!input.onAgentName) return;
    try {
      for (const name of findAgentNames(text)) {
        if (seen.has(name)) continue;
        seen.add(name);
        input.onAgentName(name);
      }
    } catch {
      // Progress display must never fail the run.
    }
  });

  let message: Awaited<ReturnType<typeof stream.finalMessage>>;
  try {
    message = await stream.finalMessage();
  } catch (err) {
    // The SDK parses structured output inside finalMessage and throws a plain
    // AnthropicError when the text does not match. Read the stop reason from
    // the last snapshot to tell a refusal from a truncated or malformed draft.
    if (err instanceof AnthropicError && !(err instanceof APIError) && snapshot) {
      const usage = toUsageRecord(input.model, snapshot.usage);
      if (snapshot.stop_reason === "refusal") throw new ModelOutputError("refusal", usage);
      if (snapshot.stop_reason === "max_tokens") throw new ModelOutputError("max_tokens", usage);
      throw new ModelOutputError("parse", usage);
    }
    throw err;
  }

  const usage = toUsageRecord(input.model, message.usage);
  if (message.stop_reason === "refusal") throw new ModelOutputError("refusal", usage);
  if (message.stop_reason === "max_tokens") throw new ModelOutputError("max_tokens", usage);
  const blueprint = message.parsed_output;
  if (!blueprint) throw new ModelOutputError("empty", usage);
  return { blueprint, usage, text };
}
