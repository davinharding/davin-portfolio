import type Anthropic from "@anthropic-ai/sdk";
import type { MessageParam } from "@anthropic-ai/sdk/resources/messages/messages";
import { LIMITS, type Effort } from "./config";
import { jsonSchemaFormat, readStructuredOutput, type UsageRecord } from "./anthropic";
import { catalogForPrompt } from "./projectCatalog";
import { DESIGN_SYSTEM, designRetryMessage, designUserMessage } from "./prompts";
import { ModelBlueprintSchema, type ModelBlueprint, type Profile } from "./schema";

export function findAgentNames(partialJson: string): string[] {
  const names: string[] = [];
  const re = /"name"\s*:\s*"((?:[^"\\]|\\.)*)"\s*,\s*"role"/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(partialJson))) {
    try {
      const name = (JSON.parse(`"${m[1]}"`) as string).trim();
      if (name && !names.includes(name)) names.push(name);
    } catch {}
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
      output_config: { format: jsonSchemaFormat(ModelBlueprintSchema), effort: input.effort },
    },
    { signal, maxRetries: 0 }
  );

  let text = "";
  const seen = new Set<string>();
  stream.on("text", (delta) => {
    text += delta;
    if (!input.onAgentName) return;
    try {
      for (const name of findAgentNames(text)) {
        if (seen.has(name)) continue;
        seen.add(name);
        input.onAgentName(name);
      }
    } catch {}
  });

  const message = await stream.finalMessage();
  const { value: blueprint, usage, text: output } = readStructuredOutput(input.model, message, ModelBlueprintSchema);
  return { blueprint, usage, text: output };
}
