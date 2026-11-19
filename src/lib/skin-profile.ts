import type { SkinAnalysis } from "@/lib/skin-analysis";

/**
 * Screens 8 and 9 in one object. Lives in localStorage and is sent with every model request
 * (analysis, products, diet) as the "profile".
 */
export const PROFILE_KEY = "pielegnacja:profile";

export const SKIN_TYPES = ["normal", "dry", "oily", "combination", "sensitive"] as const;
export type SkinType = (typeof SKIN_TYPES)[number];

export const ALLERGY_OPTIONS = ["alcohol", "fragrance", "retinoids", "acids", "essential oils"] as const;
export const DIET_OPTIONS = [
  "vegetarian",
  "vegan",
  "lactose-free",
  "gluten-free",
  "nut allergy",
  "fish allergy",
] as const;

export const BUDGET_MIN = 50;
export const BUDGET_MAX = 500;
export const BUDGET_DEFAULT = 150;

export type SkinProfile = {
  skinType: SkinType | null;
  allergies: string[];
  budgetPln: number;
  diet: string[];
};

export const EMPTY_PROFILE: SkinProfile = {
  skinType: null,
  allergies: [],
  budgetPln: BUDGET_DEFAULT,
  diet: [],
};

export function parseProfile(raw: string | null): SkinProfile {
  if (!raw) return EMPTY_PROFILE;
  try {
    const value = JSON.parse(raw) as Partial<SkinProfile>;
    return {
      skinType: SKIN_TYPES.includes(value.skinType as SkinType) ? (value.skinType as SkinType) : null,
      allergies: Array.isArray(value.allergies) ? value.allergies.filter(isString) : [],
      budgetPln: clampBudget(value.budgetPln),
      diet: Array.isArray(value.diet) ? value.diet.filter(isString) : [],
    };
  } catch {
    return EMPTY_PROFILE;
  }
}

/** The profile the user saved, or null before they filled the form (the model then gets no profile). */
export function parseSavedProfile(raw: string | null): SkinProfile | null {
  return raw ? parseProfile(raw) : null;
}

/** The list with `value` added, or removed when it is already there. */
export function toggleValue(list: string[], value: string): string[] {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

export function clampBudget(value: unknown): number {
  if (typeof value !== "number" || !Number.isFinite(value)) return BUDGET_DEFAULT;
  return Math.min(BUDGET_MAX, Math.max(BUDGET_MIN, Math.round(value)));
}

/** Prefill from the analysis: skin type and ingredients the model told the user to avoid. */
export function profileFromAnalysis(profile: SkinProfile, analysis: SkinAnalysis | null): SkinProfile {
  if (!analysis) return profile;
  return {
    ...profile,
    skinType: profile.skinType ?? (analysis.skin_type === "unknown" ? null : analysis.skin_type),
    allergies: profile.allergies.length > 0 ? profile.allergies : analysis.avoid_ingredients,
  };
}

/** Which fields the AI filled in (screen 8 shows an "AI" tag next to them). */
export function aiFilledFields(profile: SkinProfile, analysis: SkinAnalysis | null) {
  if (!analysis) return { skinType: false, allergies: false };
  return {
    skinType: profile.skinType === null && analysis.skin_type !== "unknown",
    allergies: profile.allergies.length === 0 && analysis.avoid_ingredients.length > 0,
  };
}

function isString(value: unknown): value is string {
  return typeof value === "string";
}
