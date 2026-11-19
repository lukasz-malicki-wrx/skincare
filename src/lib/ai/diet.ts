import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";
import { modelLanguageInstruction } from "@/i18n/model-language";
import type { Locale } from "@/i18n/translations";
import { anthropic, FAST_MODEL, outcomeOf, type AiOutcome } from "@/lib/ai/client";
import { applyRestrictions, dietPlanSchema, type DietPlan, type DietRequest } from "@/lib/diet";

const MAX_LIST_ITEMS = 8;

function systemPrompt(locale: Locale) {
  const example = locale === "pl" ? "sardynki" : "sardines";
  return `You are a nutrition assistant inside a skincare app. Given the skin type, visible concerns and dietary restrictions, list foods to eat more of and foods to limit, each with one short sentence on the link to skin. General wellness advice, not medical treatment.

Rules:
- Never list a food that conflicts with a restriction (vegan: no animal products; nut allergy: no nuts; fish allergy: no fish or seafood; lactose-free: no dairy; gluten-free: no wheat, barley or rye).
- Concrete foods, not nutrients ("${example}", not "omega-3").
- ${modelLanguageInstruction(locale)}`;
}

function isString(value: unknown): value is string {
  return typeof value === "string";
}

/** Keeps only string values and caps the lists, whatever the client sent. */
export function toDietRequest(body: Partial<DietRequest>): DietRequest {
  return {
    skinType: typeof body.skinType === "string" ? body.skinType : "unknown",
    concerns: Array.isArray(body.concerns) ? body.concerns.filter(isString).slice(0, MAX_LIST_ITEMS) : [],
    restrictions: Array.isArray(body.restrictions) ? body.restrictions.filter(isString).slice(0, MAX_LIST_ITEMS) : [],
  };
}

/** Foods to eat more of and to limit. Items that break a restriction are dropped even if the model slips. */
export async function suggestDiet(request: DietRequest, locale: Locale): Promise<AiOutcome<DietPlan>> {
  const res = await anthropic.beta.messages.parse({
    model: FAST_MODEL,
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

  const outcome = outcomeOf(res);
  if (outcome.status !== "ok") return outcome;
  return { status: "ok", data: applyRestrictions(outcome.data, request.restrictions) };
}
