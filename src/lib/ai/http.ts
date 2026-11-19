import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { fill } from "@/i18n/format";
import { chosenLocale } from "@/i18n/model-language";
import { requestLocale } from "@/i18n/request-locale";
import { translations, type Locale, type Messages } from "@/i18n/translations";
import { hasApiKey } from "@/lib/ai/client";

export type ApiMessages = Messages["api"];

export type AiRequest<Body> = { body: Body; locale: Locale; t: ApiMessages };

export function errorResponse(error: string, status: number) {
  return Response.json({ error }, { status });
}

/**
 * The shared start of every model route: the API key is set, the body is JSON, and the reply
 * language is the one the body asks for, falling back to the locale cookie. Returns a ready
 * error response when any of that fails. The body is not validated here; each route checks the
 * fields it uses.
 */
export async function readAiRequest<Body extends { locale?: unknown }>(
  req: Request,
): Promise<AiRequest<Body> | Response> {
  const cookieLocale = await requestLocale();
  const fallback = translations[cookieLocale].api;
  if (!hasApiKey()) return errorResponse(fallback.missingKey, 500);

  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return errorResponse(fallback.invalidBody, 400);
  }

  const locale = chosenLocale(body.locale, cookieLocale);
  return { body, locale, t: translations[locale].api };
}

/** Maps SDK errors to the JSON errors the app shows. Anything else is a bug and is rethrown. */
export function aiErrorResponse(err: unknown, t: ApiMessages): Response {
  if (err instanceof Anthropic.RateLimitError) return errorResponse(t.rateLimit, 429);
  if (err instanceof Anthropic.APIError) return errorResponse(fill(t.apiError, { message: err.message }), err.status ?? 502);
  if (err instanceof Anthropic.AnthropicError) return errorResponse(t.badFormat, 502);
  throw err;
}
