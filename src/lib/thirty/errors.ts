// Client-safe: imported by the launcher, the /sorry pages, and the API route.

export const ERROR_CODES = [
  "bad_request",
  "invalid_url",
  "blocked_host",
  "platform_url",
  "self_url",
  "too_fast",
  "rate_limited",
  "capacity",
  "live_disabled",
  "unavailable",
  "unreachable",
  "not_a_company",
  "not_enough_info",
  "unsafe",
  "declined",
  "quality",
  "upstream",
  "timeout",
  "internal",
] as const;

export type ErrorCode = (typeof ERROR_CODES)[number];

/** What the UI offers after an error. */
export type NextStep = "retry" | "fix_input" | "retry_after" | "examples" | "book_call";

type ErrorInfo = {
  status: number;
  /** `{host}` is replaced with the host, or "that address" when unknown. */
  message: string;
  next: readonly NextStep[];
};

export const ERRORS: Record<ErrorCode, ErrorInfo> = {
  bad_request: {
    status: 400,
    message: "That request did not look right. Reload the page and try again.",
    next: ["retry"],
  },
  invalid_url: {
    status: 400,
    message: "That does not look like a website address. Try something like yourcompany.com.",
    next: ["fix_input"],
  },
  blocked_host: {
    status: 400,
    message: "That address is not a public website.",
    next: ["fix_input"],
  },
  platform_url: {
    status: 400,
    message: "That is a page on someone else's platform. Enter the company's own website.",
    next: ["fix_input"],
  },
  self_url: {
    status: 400,
    message: "That is this site. Try your company's.",
    next: ["fix_input"],
  },
  too_fast: {
    status: 429,
    message: "Slow down a moment, then try again.",
    next: ["retry_after"],
  },
  rate_limited: {
    status: 429,
    message: "You have used today's three live runs. They reset at midnight UTC.",
    next: ["examples", "book_call"],
  },
  capacity: {
    status: 503,
    message:
      "Live runs are paused for now; I cap what this page can spend. The examples show the same thing.",
    next: ["examples", "book_call"],
  },
  live_disabled: {
    status: 503,
    message: "Live runs are switched off at the moment. The examples show the same thing.",
    next: ["examples", "book_call"],
  },
  unavailable: {
    status: 503,
    message: "Something on my side is down. Try again in a few minutes.",
    next: ["retry", "examples"],
  },
  unreachable: {
    status: 422,
    message: "I could not find a website at {host}. Check the spelling.",
    next: ["fix_input"],
  },
  not_a_company: {
    status: 422,
    message:
      "{host} does not look like a company website, so there is nothing to design agents for.",
    next: ["fix_input", "examples"],
  },
  not_enough_info: {
    status: 422,
    message:
      "I could not read enough about {host} to say anything specific, and I would rather not guess.",
    next: ["book_call", "examples"],
  },
  unsafe: {
    status: 422,
    message: "I can't draft a blueprint for that site.",
    next: ["examples"],
  },
  declined: {
    status: 422,
    message: "The model declined to work on that site.",
    next: ["examples"],
  },
  quality: {
    status: 502,
    message:
      "The draft was not specific enough to show you. Try again, or book a call and I will do it by hand.",
    next: ["retry", "book_call"],
  },
  upstream: {
    status: 502,
    message: "The model provider is having trouble. Try again in a minute.",
    next: ["retry", "examples"],
  },
  timeout: {
    status: 504,
    message: "That took too long and I stopped it. Try again.",
    next: ["retry"],
  },
  internal: {
    status: 500,
    message: "Something broke on my side. Try again.",
    next: ["retry"],
  },
};

/** Thrown inside a run to end it with a specific visitor-facing code. */
export class RunError extends Error {
  constructor(
    readonly code: ErrorCode,
    detail?: string
  ) {
    super(detail ?? code);
    this.name = "RunError";
  }
}

export function isErrorCode(value: unknown): value is ErrorCode {
  return typeof value === "string" && (ERROR_CODES as readonly string[]).includes(value);
}

export function errorStatus(code: ErrorCode): number {
  return ERRORS[code].status;
}

export function errorMessage(code: ErrorCode, host?: string | null): string {
  const message = ERRORS[code].message;
  if (!message.includes("{host}")) return message;
  if (host) return message.replace("{host}", host);
  // Sentence-initial placeholder needs a capital letter.
  return message.startsWith("{host}")
    ? message.replace("{host}", "That address")
    : message.replace("{host}", "that address");
}

/** URL segment for /sorry/<param>. Hyphenated so the URL reads naturally. */
export function sorryParam(code: ErrorCode): string {
  return code.replace(/_/g, "-");
}

export function codeFromSorryParam(param: string): ErrorCode | null {
  const code = param.replace(/-/g, "_");
  return isErrorCode(code) ? code : null;
}
