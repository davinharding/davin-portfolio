import type Anthropic from "@anthropic-ai/sdk";
import { LIMITS } from "./config";
import { jsonSchemaFormat, readStructuredOutput, type UsageRecord } from "./anthropic";
import type { PageContent } from "./extract";
import { RESEARCH_SYSTEM } from "./prompts";
import { ProfileSchema, type Profile } from "./schema";

function neutralize(s: string): string {
  return s.replace(/</g, "‹").replace(/>/g, "›");
}

function attrValue(s: string): string {
  return neutralize(s).replace(/"/g, "'").replace(/\s+/g, " ").slice(0, 300);
}

export function formatWebsiteContent(host: string, pages: PageContent[], brief?: string): string {
  const parts: string[] = [`<website_content host="${attrValue(host)}">`];
  for (const p of pages) {
    const meta = [
      p.description && `Meta description: ${p.description}`,
      p.siteName && `Site name: ${p.siteName}`,
      p.ogDescription && p.ogDescription !== p.description && `Social description: ${p.ogDescription}`,
      p.headings.length > 0 && `Headings: ${p.headings.slice(0, 25).join(" | ")}`,
    ]
      .filter(Boolean)
      .join("\n");
    parts.push(
      `<page url="${attrValue(p.url)}" title="${attrValue(p.title)}">\n${neutralize(meta)}\n\n${neutralize(p.text)}\n</page>`
    );
  }
  if (brief) {
    parts.push(`<page url="web-search-brief" title="Research brief from web search">\n${neutralize(brief)}\n</page>`);
  }
  parts.push("</website_content>");
  return parts.join("\n");
}

export type ResearchInput = {
  client: Anthropic;
  model: string;
  host: string;
  pages: PageContent[];
  brief?: string;
  signal: AbortSignal;
};

export type ResearchResult = { profile: Profile; usage: UsageRecord };

export async function extractProfile(input: ResearchInput): Promise<ResearchResult> {
  const content = formatWebsiteContent(input.host, input.pages, input.brief);
  const message = await input.client.messages.create(
    {
      model: input.model,
      max_tokens: 2000,
      system: RESEARCH_SYSTEM,
      messages: [
        {
          role: "user",
          content: `${content}\n\nExtract the company profile from the website content above.`,
        },
      ],
      output_config: { format: jsonSchemaFormat(ProfileSchema), effort: "low" },
    },
    { signal: input.signal, timeout: LIMITS.researchTimeoutMs, maxRetries: 1 }
  );
  const { value: profile, usage } = readStructuredOutput(input.model, message, ProfileSchema);
  return { profile, usage };
}
