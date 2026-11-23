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

export type NextStep = "retry" | "fix_input" | "retry_after" | "examples" | "book_call";

type ErrorInfo = {
  status: number;
  message: string;
  next: readonly NextStep[];
};

export const ERRORS: Record<ErrorCode, ErrorInfo> = {
  bad_request: {
    status: 400,
    message: "Something was off with that request. Reload the page and try again.",
    next: ["retry"],
  },
  invalid_url: {
    status: 400,
    message: "That doesn't look like a website address. Try something like yourcompany.com.",
    next: ["fix_input"],
  },
  blocked_host: {
    status: 400,
    message: "That address isn't a public website.",
    next: ["fix_input"],
  },
  platform_url: {
    status: 400,
    message: "That's a page on someone else's platform. Enter the company's own website.",
    next: ["fix_input"],
  },
  self_url: {
    status: 400,
    message: "That's this site. Try your company's.",
    next: ["fix_input"],
  },
  too_fast: {
    status: 429,
    message: "Too many tries in a row.",
    next: ["retry_after"],
  },
  rate_limited: {
    status: 429,
    message: "You've used today's three live runs. They reset at midnight UTC.",
    next: ["examples", "book_call"],
  },
  capacity: {
    status: 503,
    message:
      "This page hit its spending cap, so live runs are paused. The examples show what you'd get.",
    next: ["examples", "book_call"],
  },
  live_disabled: {
    status: 503,
    message: "Live runs are switched off right now. The examples show what you'd get.",
    next: ["examples", "book_call"],
  },
  unavailable: {
    status: 503,
    message: "Something on my side is down. Try again in a few minutes.",
    next: ["retry", "examples"],
  },
  unreachable: {
    status: 422,
    message: "I couldn't find a website at {host}. Check the spelling.",
    next: ["fix_input"],
  },
  not_a_company: {
    status: 422,
    message:
      "{host} doesn't look like a company website, so there's nothing to design agents for.",
    next: ["fix_input", "examples"],
  },
  not_enough_info: {
    status: 422,
    message:
      "I couldn't find enough about {host} to say anything specific, and I'd rather not guess.",
    next: ["book_call", "examples"],
  },
  unsafe: {
    status: 422,
    message: "I can't draft a blueprint for that site.",
    next: ["examples"],
  },
  declined: {
    status: 422,
    message: "The AI model refused to work on that site.",
    next: ["examples"],
  },
  quality: {
    status: 502,
    message:
      "The draft wasn't specific enough to show you. Try again, or book a call and I'll do it by hand.",
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
  return message.startsWith("{host}")
    ? message.replace("{host}", "That address")
    : message.replace("{host}", "that address");
}

export function sorryParam(code: ErrorCode): string {
  return code.replace(/_/g, "-");
}

export function codeFromSorryParam(param: string): ErrorCode | null {
  const code = param.replace(/-/g, "_");
  return isErrorCode(code) ? code : null;
}
