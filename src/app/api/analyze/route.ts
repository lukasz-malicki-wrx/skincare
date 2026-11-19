import Anthropic from "@anthropic-ai/sdk";
import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";
import { fill } from "@/i18n/format";
import { chosenLocale, modelLanguageInstruction } from "@/i18n/model-language";
import { requestLocale } from "@/i18n/request-locale";
import { translations, type Locale } from "@/i18n/translations";
import { skinAssessmentSchema } from "@/lib/skin-analysis";

export const maxDuration = 60;

const MEDIA_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
type MediaType = (typeof MEDIA_TYPES)[number];

function systemPrompt(locale: Locale) {
  return `You are a cosmetologist's assistant in a skincare app. The user sends a photo of their face, neck or hands.

Rules:
- Describe how the skin looks: type, visible concerns and ingredients worth avoiding. Do not propose a routine; it is built in the next step from the profile the user confirms. Never give a medical diagnosis.
- If you see changes a dermatologist should assess (unusual moles, pus-filled lesions, widespread inflammation, ulcers), set see_a_doctor=true and briefly say why.
- If the photo is blurry, too dark, too far away or does not show skin, set photo_quality.ok=false and say what to fix. Do not guess results from a bad photo.
- Respect the user profile (allergies, ingredients to skip) when provided.
- ${modelLanguageInstruction(locale)}`;
}

const client = new Anthropic();

/**
 * Model wybierany przez env, domyślnie Haiku 4.5 (najtańszy z vision, ok. 25x taniej niż Opus).
 * Haiku nie przyjmuje `effort`, a fallbacki klasyfikatora mają sens tylko na Opus/Sonnet 5.x,
 * więc te opcje dokładamy wyłącznie dla większych modeli.
 */
const MODEL = process.env.ANTHROPIC_MODEL ?? "claude-haiku-4-5";
const IS_HAIKU = MODEL.startsWith("claude-haiku");

export async function POST(req: Request) {
  const cookieLocale = await requestLocale();
  if (!process.env.ANTHROPIC_API_KEY) {
    return Response.json({ error: translations[cookieLocale].api.missingKey }, { status: 500 });
  }

  let body: { imageBase64?: string; mediaType?: string; profile?: unknown; locale?: unknown };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: translations[cookieLocale].api.invalidBody }, { status: 400 });
  }

  const locale = chosenLocale(body.locale, cookieLocale);
  const t = translations[locale].api;
  const { imageBase64, mediaType, profile } = body;
  if (!imageBase64 || !MEDIA_TYPES.includes(mediaType as MediaType)) {
    return Response.json({ error: t.imageRequired }, { status: 400 });
  }

  const profileText = profile
    ? `User profile: ${JSON.stringify(profile)}.`
    : "No user profile.";

  const request = () =>
    client.beta.messages.parse({
      model: MODEL,
      max_tokens: 8000,
      ...(IS_HAIKU ? {} : { betas: ["server-side-fallback-2026-07-01"], fallbacks: "default" }),
      output_config: {
        ...(IS_HAIKU ? {} : { effort: "high" }),
        format: betaZodOutputFormat(skinAssessmentSchema(locale)),
      },
      system: [{ type: "text", text: systemPrompt(locale), cache_control: { type: "ephemeral" } }],
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: { type: "base64", media_type: mediaType as MediaType, data: imageBase64 },
            },
            {
              type: "text",
              text: `${profileText} Assess the skin in the photo. ${modelLanguageInstruction(locale)}`,
            },
          ],
        },
      ],
    });

  try {
    const res = await withParseRetry(request);

    if (res.stop_reason === "refusal") {
      return Response.json(
        { error: t.refused, category: res.stop_details?.category ?? null },
        { status: 422 },
      );
    }

    if (!res.parsed_output) {
      return Response.json({ error: t.parseFailed }, { status: 502 });
    }

    return Response.json(res.parsed_output);
  } catch (err) {
    if (err instanceof Anthropic.RateLimitError) {
      return Response.json({ error: t.rateLimit }, { status: 429 });
    }
    if (err instanceof Anthropic.APIError) {
      return Response.json({ error: fill(t.apiError, { message: err.message }) }, { status: err.status ?? 502 });
    }
    if (err instanceof Anthropic.AnthropicError) {
      return Response.json({ error: t.badFormat }, { status: 502 });
    }
    throw err;
  }
}

/**
 * Mniejsze modele (Haiku) czasem zwracają wartość spoza enuma i helper Zod rzuca
 * bazowym AnthropicError (nie APIError). Jeden ponowny strzał zwykle wystarcza.
 */
async function withParseRetry<T>(request: () => Promise<T>, attempts = 2): Promise<T> {
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
