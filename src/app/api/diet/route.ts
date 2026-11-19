import Anthropic from "@anthropic-ai/sdk";
import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";
import { fill } from "@/i18n/format";
import { chosenLocale, modelLanguageInstruction } from "@/i18n/model-language";
import { requestLocale } from "@/i18n/request-locale";
import { translations, type Locale } from "@/i18n/translations";
import { applyRestrictions, dietPlanSchema, type DietRequest } from "@/lib/diet";

export const maxDuration = 30;

function systemPrompt(locale: Locale) {
  const example = locale === "pl" ? "sardynki" : "sardines";
  return `You are a nutrition assistant inside a skincare app. Given the skin type, visible concerns and dietary restrictions, list foods to eat more of and foods to limit, each with one short sentence on the link to skin. General wellness advice, not medical treatment.

Rules:
- Never list a food that conflicts with a restriction (vegan: no animal products; nut allergy: no nuts; fish allergy: no fish or seafood; lactose-free: no dairy; gluten-free: no wheat, barley or rye).
- Concrete foods, not nutrients ("${example}", not "omega-3").
- ${modelLanguageInstruction(locale)}`;
}

const client = new Anthropic();
const MODEL = "claude-haiku-4-5";

export async function POST(req: Request) {
  const cookieLocale = await requestLocale();
  if (!process.env.ANTHROPIC_API_KEY) {
    return Response.json({ error: translations[cookieLocale].api.missingKey }, { status: 500 });
  }

  let body: Partial<DietRequest>;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: translations[cookieLocale].api.invalidBody }, { status: 400 });
  }

  const locale = chosenLocale(body.locale, cookieLocale);
  const t = translations[locale].api;

  const request: DietRequest = {
    skinType: typeof body.skinType === "string" ? body.skinType : "unknown",
    concerns: Array.isArray(body.concerns) ? body.concerns.filter(isString).slice(0, 8) : [],
    restrictions: Array.isArray(body.restrictions) ? body.restrictions.filter(isString).slice(0, 8) : [],
  };

  try {
    const res = await client.beta.messages.parse({
      model: MODEL,
      max_tokens: 2000,
      output_config: { format: betaZodOutputFormat(dietPlanSchema(locale)) },
      system: [{ type: "text", text: systemPrompt(locale), cache_control: { type: "ephemeral" } }],
      messages: [
        {
          role: "user",
          content: `Skin type: ${request.skinType}. Concerns: ${request.concerns.join(", ") || "none"}. Restrictions: ${request.restrictions.join(", ") || "none"}. ${modelLanguageInstruction(locale)}`,
        },
      ],
    });

    if (res.stop_reason === "refusal" || !res.parsed_output) {
      return Response.json({ error: t.dietFailed }, { status: 502 });
    }

    return Response.json({ plan: applyRestrictions(res.parsed_output, request.restrictions) });
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

function isString(value: unknown): value is string {
  return typeof value === "string";
}
