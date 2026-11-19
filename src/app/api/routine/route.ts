import Anthropic from "@anthropic-ai/sdk";
import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";
import { fill } from "@/i18n/format";
import { chosenLocale, modelLanguageInstruction } from "@/i18n/model-language";
import { requestLocale } from "@/i18n/request-locale";
import { translations, type Locale } from "@/i18n/translations";
import { routinePlanSchema } from "@/lib/skin-analysis";

export const maxDuration = 60;

/** What the client sends: the stage 1 assessment plus the profile the user confirmed. */
type RoutineRequest = {
  assessment?: {
    skin_type?: unknown;
    summary?: unknown;
    findings?: unknown;
    see_a_doctor?: unknown;
    body_part?: unknown;
  };
  profile?: {
    skinType?: unknown;
    allergies?: unknown;
    budgetPln?: unknown;
    diet?: unknown;
  };
  locale?: unknown;
};

function systemPrompt(locale: Locale) {
  return `You are a cosmetologist's assistant in a skincare app. You get an assessment of the user's skin made from their photo, plus the profile the user confirmed: skin type, ingredients to avoid and a monthly budget for products. Build the care routine.

Rules:
- The confirmed profile wins over the assessment when they disagree (the user corrected what the photo suggested).
- Routine: at most 3 steps in the morning and 3 in the evening. Active ingredients or product types, not brands.
- Fit the budget: it covers every product in the routine for a month. With a small budget use fewer steps and common, affordable product types; never add a step the budget cannot carry.
- Never use an ingredient the user avoids.
- If the assessment says a dermatologist should see the skin, keep the routine gentle and minimal.
- Cosmetic care only, never a medical diagnosis.
- ${modelLanguageInstruction(locale)}`;
}

const client = new Anthropic();
const MODEL = process.env.ANTHROPIC_MODEL ?? "claude-haiku-4-5";
const IS_HAIKU = MODEL.startsWith("claude-haiku");

export async function POST(req: Request) {
  const cookieLocale = await requestLocale();
  if (!process.env.ANTHROPIC_API_KEY) {
    return Response.json({ error: translations[cookieLocale].api.missingKey }, { status: 500 });
  }

  let body: RoutineRequest;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: translations[cookieLocale].api.invalidBody }, { status: 400 });
  }

  const locale = chosenLocale(body.locale, cookieLocale);
  const t = translations[locale].api;
  const { assessment, profile } = body;
  if (!assessment || typeof assessment.summary !== "string" || !Array.isArray(assessment.findings)) {
    return Response.json({ error: t.invalidBody }, { status: 400 });
  }

  const allergies = Array.isArray(profile?.allergies) ? profile.allergies.filter((a) => typeof a === "string") : [];
  const budget = typeof profile?.budgetPln === "number" ? profile.budgetPln : null;
  const context = [
    `Assessment from the photo: ${JSON.stringify(assessment)}.`,
    `Confirmed skin type: ${typeof profile?.skinType === "string" ? profile.skinType : "not given"}.`,
    `Ingredients to avoid: ${allergies.length ? allergies.join(", ") : "none"}.`,
    budget !== null ? `Monthly budget for all products: ${budget} PLN.` : "No budget given.",
    `Build the routine. ${modelLanguageInstruction(locale)}`,
  ].join("\n");

  try {
    const res = await client.beta.messages.parse({
      model: MODEL,
      max_tokens: 4000,
      ...(IS_HAIKU ? {} : { betas: ["server-side-fallback-2026-07-01"], fallbacks: "default" }),
      output_config: {
        ...(IS_HAIKU ? {} : { effort: "medium" }),
        format: betaZodOutputFormat(routinePlanSchema(locale)),
      },
      system: [{ type: "text", text: systemPrompt(locale), cache_control: { type: "ephemeral" } }],
      messages: [{ role: "user", content: context }],
    });

    if (res.stop_reason === "refusal") {
      return Response.json({ error: t.refused }, { status: 422 });
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
