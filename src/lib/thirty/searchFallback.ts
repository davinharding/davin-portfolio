// Server-only. When the site will not load for a bot, one hosted web search
// call produces a plain-text brief that goes through the same research step.
import type Anthropic from "@anthropic-ai/sdk";
import type { ContentBlock, Message, MessageParam } from "@anthropic-ai/sdk/resources/messages/messages";
import { LIMITS } from "./config";
import { toUsageRecord, type UsageRecord } from "./anthropic";
import { searchPrompt } from "./prompts";

export type SearchResult =
  | { ok: true; brief: string; usage: UsageRecord[] }
  | { ok: false; reason: "no_company" | "too_short" | "tool_error" | "stage_timeout"; usage: UsageRecord[] };

export type SearchInput = {
  client: Anthropic;
  model: string;
  host: string;
  signal: AbortSignal;
  /** Stage limit; defaults to 20 seconds. */
  stageMs?: number;
};

function briefText(content: ContentBlock[]): string {
  return content
    .filter((b): b is Extract<ContentBlock, { type: "text" }> => b.type === "text")
    .map((b) => b.text)
    .join("")
    .trim();
}

/** True when the model searched and every search came back as an error block. */
function allSearchesFailed(content: ContentBlock[]): boolean {
  const results = content.filter(
    (b): b is Extract<ContentBlock, { type: "web_search_tool_result" }> =>
      b.type === "web_search_tool_result"
  );
  return (
    results.length > 0 &&
    results.every((r) => !Array.isArray(r.content) && r.content.type === "web_search_tool_result_error")
  );
}

export async function searchBrief(input: SearchInput): Promise<SearchResult> {
  const stage = AbortSignal.timeout(input.stageMs ?? LIMITS.searchStageMs);
  const signal = AbortSignal.any([input.signal, stage]);
  const usage: UsageRecord[] = [];
  try {
    return await runSearch(input, signal, usage);
  } catch (err) {
    // The search stage's own time limit counts as a failed fallback. The run's
    // overall deadline and provider errors propagate to the pipeline.
    if (stage.aborted && !input.signal.aborted) return { ok: false, reason: "stage_timeout", usage };
    throw err;
  }
}

async function runSearch(input: SearchInput, signal: AbortSignal, usage: UsageRecord[]): Promise<SearchResult> {
  const messages: MessageParam[] = [{ role: "user", content: searchPrompt(input.host) }];
  const tools = [{ type: "web_search_20260209" as const, name: "web_search" as const, max_uses: 3 }];

  let response: Message = await input.client.messages.create(
    { model: input.model, max_tokens: 2000, messages, tools },
    { signal, maxRetries: 0 }
  );
  usage.push(toUsageRecord(input.model, response.usage));
  const content: ContentBlock[] = [...response.content];

  if (response.stop_reason === "pause_turn") {
    // The server paused a long tool loop; resend with its turn appended, once.
    response = await input.client.messages.create(
      {
        model: input.model,
        max_tokens: 2000,
        messages: [...messages, { role: "assistant", content: response.content as MessageParam["content"] }],
        tools,
      },
      { signal, maxRetries: 0 }
    );
    usage.push(toUsageRecord(input.model, response.usage));
    content.push(...response.content);
  }

  if (allSearchesFailed(content)) return { ok: false, reason: "tool_error", usage };
  const brief = briefText(response.content) || briefText(content);
  if (/NO_COMPANY_FOUND/.test(brief) && brief.length < 200) return { ok: false, reason: "no_company", usage };
  if (brief.length < LIMITS.minBriefChars) return { ok: false, reason: "too_short", usage };
  return { ok: true, brief, usage };
}
