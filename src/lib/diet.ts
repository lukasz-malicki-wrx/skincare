import { z } from "zod";

export const DIET_KEY = "pielegnacja:diet";

type ReplyLocale = "pl" | "en";

export function dietPlanSchema(locale: ReplyLocale) {
  const language = locale === "pl" ? "Polish" : "English";
  const example = locale === "pl" ? "łosoś" : "salmon";
  const item = z.object({
    item: z.string().describe(`Food or drink in ${language}, e.g. '${example}'`),
    why: z.string().describe(`One sentence in ${language} on the link to skin`),
  });
  return z.object({
    eat_more: z.array(item).min(3).max(6),
    limit: z.array(item).min(3).max(6),
  });
}

export const DietPlan = dietPlanSchema("en");

export type DietPlan = z.infer<typeof DietPlan>;
export type DietItem = DietPlan["eat_more"][number];

export type DietRequest = { skinType: string; concerns: string[]; restrictions: string[]; locale?: string };

export type StoredDiet = { inputsKey: string; plan: DietPlan };

/**
 * Foods that must never appear for a restriction, even if the model slips.
 * Polish stems sit outside `\b` because that boundary only sees ASCII word characters.
 */
const BLOCKED: Record<string, RegExp> = {
  vegan: /\b(salmon|fish|sardine|mackerel|tuna|meat|beef|chicken|pork|egg|eggs|dairy|milk|cheese|yogurt|yoghurt|kefir|butter|honey|whey|bone broth)\b|łoso|ryb|sardyn|makrel|tuńczyk|mięs|wołow|kurczak|wieprz|jajk|nabiał|mlek|jogurt|kefir|masł|miód|serwatk|twar[oó]g/iu,
  vegetarian: /\b(salmon|fish|sardine|mackerel|tuna|meat|beef|chicken|pork|bone broth)\b|łoso|ryb|sardyn|makrel|tuńczyk|mięs|wołow|kurczak|wieprz/iu,
  "lactose-free": /\b(milk|cheese|yogurt|yoghurt|kefir|cream|butter|whey|dairy)\b|mlek|jogurt|kefir|śmietan|masł|serwatk|nabiał|twar[oó]g/iu,
  "gluten-free": /\b(wheat|bread|pasta|barley|rye|couscous|seitan|bulgur)\b|pszenic|chleb|makaron|jęczm|żyt|kuskus|seitan|bułk/iu,
  "nut allergy": /\b(nut|nuts|almond|almonds|walnut|walnuts|hazelnut|hazelnuts|cashew|cashews|pistachio|pistachios|pecan|pecans|peanut|peanuts)\b|orzech|migdał|nerkow|pistacj|fistaszk|orzeszk|laskow|pekan/iu,
  "fish allergy": /\b(fish|salmon|sardine|sardines|mackerel|tuna|cod|herring|anchovy|anchovies|seafood)\b|ryb|łoso|sardyn|makrel|tuńczyk|dorsz|śled|anchois|owoce morza|krewet/iu,
};

export function violatesRestriction(item: string, restrictions: string[]): boolean {
  return restrictions.some((r) => BLOCKED[r]?.test(item));
}

/** The list only ever shows items allowed by the restrictions; "limit" is left untouched. */
export function applyRestrictions(plan: DietPlan, restrictions: string[]): DietPlan {
  return { ...plan, eat_more: plan.eat_more.filter((i) => !violatesRestriction(i.item, restrictions)) };
}

export function dietInputsKey(req: DietRequest): string {
  return JSON.stringify([req.locale ?? "en", req.skinType, [...req.concerns].sort(), [...req.restrictions].sort()]);
}

export function parseStoredDiet(raw: string | null): StoredDiet | null {
  if (!raw) return null;
  try {
    const value = JSON.parse(raw) as StoredDiet;
    const plan = DietPlan.safeParse(value.plan);
    return plan.success && typeof value.inputsKey === "string" ? { inputsKey: value.inputsKey, plan: plan.data } : null;
  } catch {
    return null;
  }
}
