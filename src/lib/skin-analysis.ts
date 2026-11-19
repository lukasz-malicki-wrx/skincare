import { z } from "zod";
import type { RoutineProducts } from "@/lib/products";

type ReplyLocale = "pl" | "en";

const EXAMPLE = {
  en: { concern: "blackheads", area: "forehead", step: "cleanser" },
  pl: { concern: "zaskórniki", area: "czoło", step: "oczyszczanie" },
} as const;

function languageName(locale: ReplyLocale) {
  return locale === "pl" ? "Polish" : "English";
}

/**
 * Stage 1, right after the photo: what the skin looks like. No routine yet, because the user
 * first confirms the profile and sets a budget.
 * Output schema for one language. Examples in the other language pull the model the wrong way.
 */
export function skinAssessmentSchema(locale: ReplyLocale) {
  const language = languageName(locale);
  const example = EXAMPLE[locale];
  const finding = z.object({
    name: z.string().describe(`Name of the concern in ${language}, e.g. '${example.concern}'`),
    area: z.string().describe(`Area in ${language}, e.g. '${example.area}'`),
    severity: z.enum(["low", "medium", "high"]),
    confidence: z.number().min(0).max(1),
  });

  return z.object({
    photo_quality: z.object({
      ok: z.boolean(),
      issue: z.string().nullable().describe(`What to fix in the photo when ok=false, in ${language}`),
    }),
    body_part: z.enum(["face", "neck", "hands", "other"]),
    skin_type: z.enum(["normal", "dry", "oily", "combination", "sensitive", "unknown"]),
    summary: z.string().describe(`2-3 sentences on how the skin looks, in ${language}, no medical diagnosis`),
    findings: z.array(finding),
    see_a_doctor: z.boolean().describe("true when the changes need a dermatologist rather than cosmetics"),
    see_a_doctor_reason: z.string().nullable().describe(`Why a dermatologist should see this, in ${language}, or null`),
    avoid_ingredients: z.array(z.string()).describe(`Ingredients to skip, named in ${language}`),
  });
}

/** Stage 2, after the profile form: the routine built from the assessment plus the confirmed profile and budget. */
export function routinePlanSchema(locale: ReplyLocale) {
  const language = languageName(locale);
  const example = EXAMPLE[locale];
  const step = z.object({
    step: z.string().describe(`Step name in ${language}, e.g. '${example.step}'`),
    ingredient: z.string().describe(`Active ingredient or product type, in ${language}`),
    why: z.string().describe(`One sentence in ${language} on why`),
  });

  return z.object({
    routine: z.object({
      morning: z.array(step).max(3),
      evening: z.array(step).max(3),
    }),
    product_queries: z.array(z.string()).describe("Search phrases for products, no brand names"),
    followup_days: z.number().int().min(3).max(60),
  });
}

/** The full report: assessment plus routine. */
export function skinAnalysisSchema(locale: ReplyLocale) {
  return skinAssessmentSchema(locale).extend(routinePlanSchema(locale).shape);
}

export const SkinAnalysis = skinAnalysisSchema("en");

export type SkinAnalysis = z.infer<typeof SkinAnalysis>;
export type SkinAssessment = z.infer<ReturnType<typeof skinAssessmentSchema>>;
export type RoutinePlan = z.infer<ReturnType<typeof routinePlanSchema>>;
export type RoutineStepData = SkinAnalysis["routine"]["morning"][number];

export const STORAGE_KEY = "pielegnacja:last-analysis";

export type StoredAnalysis = {
  createdAt: string;
  imageDataUrl: string;
  result: SkinAnalysis;
  /**
   * false between the photo and the profile form: the assessment is stored, the routine is not
   * built yet. Missing on reports saved before the two-stage flow, which already have a routine.
   */
  routineReady?: boolean;
  /** One product per routine step, found with web search after the report opens. */
  routineProducts?: RoutineProducts;
  /** PRODUCTS_VERSION the cached products were made with; older caches are refreshed. */
  routineProductsVersion?: number;
};

/** The stage 1 part of a stored report, sent back to the model when the routine is built. */
export function assessmentOf(analysis: SkinAnalysis): SkinAssessment {
  return {
    photo_quality: analysis.photo_quality,
    body_part: analysis.body_part,
    skin_type: analysis.skin_type,
    summary: analysis.summary,
    findings: analysis.findings,
    see_a_doctor: analysis.see_a_doctor,
    see_a_doctor_reason: analysis.see_a_doctor_reason,
    avoid_ingredients: analysis.avoid_ingredients,
  };
}

const DEFAULT_FOLLOWUP_DAYS = 14;

/** Stage 1 result in the shape the rest of the app reads, with an empty routine. */
export function pendingAnalysis(assessment: SkinAssessment): SkinAnalysis {
  return {
    ...assessment,
    routine: { morning: [], evening: [] },
    product_queries: [],
    followup_days: DEFAULT_FOLLOWUP_DAYS,
  };
}

/**
 * Stage 2 merged in. What the user confirmed in the form wins over what the photo suggested:
 * skin type and the ingredients to avoid.
 */
export function withRoutine(
  analysis: SkinAnalysis,
  plan: RoutinePlan,
  confirmed: { skinType: SkinAnalysis["skin_type"] | null; allergies: string[] },
): SkinAnalysis {
  return {
    ...analysis,
    ...plan,
    skin_type: confirmed.skinType ?? analysis.skin_type,
    avoid_ingredients: confirmed.allergies,
  };
}
