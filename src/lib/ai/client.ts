import "server-only";
import Anthropic from "@anthropic-ai/sdk";

/** One client for every model call. Reads ANTHROPIC_API_KEY from the environment on each request. */
export const anthropic = new Anthropic();

export function hasApiKey() {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

/** Model for the photo assessment and the routine, set by env. Defaults to the cheapest vision model. */
export const ASSESSMENT_MODEL = process.env.ANTHROPIC_MODEL ?? "claude-haiku-4-5";

/** Product search and the diet stay on Haiku: web search results add ~30k input tokens per request. */
export const FAST_MODEL = "claude-haiku-4-5";

type Effort = "low" | "medium" | "high";

/**
 * Haiku accepts neither `effort` nor classifier fallbacks, so these options are only added for
 * larger models. `request` goes into the top-level params, `output` into `output_config`.
 */
export function largeModelOptions(model: string, effort: Effort) {
  if (model.startsWith("claude-haiku")) return { request: {}, output: {} };
  return {
    request: { betas: ["server-side-fallback-2026-07-01"], fallbacks: "default" as const },
    output: { effort },
  };
}

/** What a structured model call ended with, without the HTTP status the route picks for it. */
export type AiOutcome<T> =
  | { status: "ok"; data: T }
  | { status: "refused"; category: string | null }
  | { status: "empty" };

type ParsedResponse<T> = {
  stop_reason: string | null;
  stop_details: { category?: string | null } | null;
  parsed_output: T | null;
};

export function outcomeOf<T>(res: ParsedResponse<T>): AiOutcome<T> {
  if (res.stop_reason === "refusal") return { status: "refused", category: res.stop_details?.category ?? null };
  if (!res.parsed_output) return { status: "empty" };
  return { status: "ok", data: res.parsed_output };
}

/**
 * Smaller models occasionally return a value outside an enum; the Zod helper then throws a plain
 * AnthropicError (not an APIError). One retry is usually enough.
 */
export async function withParseRetry<T>(request: () => Promise<T>, attempts = 2): Promise<T> {
  let lastError: unknown;
  for (let i = 0; i < attempts; i++) {
    try {
      return await request();
    } catch (err) {
      const isParseError = err instanceof Anthropic.AnthropicError && !(err instanceof Anthropic.APIError);
      if (!isParseError) throw err;
      lastError = err;
    }
  }
  throw lastError;
}
