import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";
import { modelLanguageInstruction } from "@/i18n/model-language";
import type { Locale } from "@/i18n/translations";
import { anthropic, ASSESSMENT_MODEL, largeModelOptions, outcomeOf, type AiOutcome } from "@/lib/ai/client";
import { routinePlanSchema, type RoutinePlan } from "@/lib/skin-analysis";

/** What the client sends: the stage 1 assessment plus the profile the user confirmed. */
export type RoutineRequest = {
  assessment?: RoutineAssessment;
  profile?: {
    skinType?: unknown;
    allergies?: unknown;
    budgetPln?: unknown;
    diet?: unknown;
  };
  locale?: unknown;
};

type RoutineAssessment = {
  skin_type?: unknown;
  summary?: unknown;
  findings?: unknown;
  see_a_doctor?: unknown;
  body_part?: unknown;
};

/** The assessment must at least carry the summary and the findings the routine is built from. */
export function isRoutineAssessment(value: RoutineRequest["assessment"]): value is RoutineAssessment {
  return Boolean(value) && typeof value?.summary === "string" && Array.isArray(value.findings);
}

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

/** The user message: the assessment and the confirmed profile, one fact per line. */
export function routineContext(
  assessment: RoutineAssessment,
  profile: RoutineRequest["profile"],
  locale: Locale,
): string {
  const allergies = Array.isArray(profile?.allergies) ? profile.allergies.filter((a) => typeof a === "string") : [];
  const budget = typeof profile?.budgetPln === "number" ? profile.budgetPln : null;
  return [
    `Assessment from the photo: ${JSON.stringify(assessment)}.`,
    `Confirmed skin type: ${typeof profile?.skinType === "string" ? profile.skinType : "not given"}.`,
    `Ingredients to avoid: ${allergies.length ? allergies.join(", ") : "none"}.`,
    budget !== null ? `Monthly budget for all products: ${budget} PLN.` : "No budget given.",
    `Build the routine. ${modelLanguageInstruction(locale)}`,
  ].join("\n");
}

/** Stage 2: the routine built from the assessment plus the confirmed profile and budget. */
export async function buildRoutine(
  assessment: RoutineAssessment,
  profile: RoutineRequest["profile"],
  locale: Locale,
): Promise<AiOutcome<RoutinePlan>> {
  const options = largeModelOptions(ASSESSMENT_MODEL, "medium");
  const res = await anthropic.beta.messages.parse({
    model: ASSESSMENT_MODEL,
    max_tokens: 4000,
    ...options.request,
    output_config: { ...options.output, format: betaZodOutputFormat(routinePlanSchema(locale)) },
    system: [{ type: "text", text: systemPrompt(locale), cache_control: { type: "ephemeral" } }],
    messages: [{ role: "user", content: routineContext(assessment, profile, locale) }],
  });
  return outcomeOf(res);
}
