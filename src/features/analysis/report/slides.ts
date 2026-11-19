import type { SkinAnalysis } from "@/lib/skin-analysis";

/**
 * The onboarding shows the analysis in two screens, in this order:
 * - "skin": the skin report right after the photo (type, concerns). No routine, no products.
 * - "plan": the care plan after the user confirmed budget and preferences. The routine is built
 *   here from the assessment plus that form, then one product per step is searched.
 */
export type ReportPart = "skin" | "plan";

export type SlideKey = "skin" | "morning" | "evening" | "next";

/** The slides a report part shows, skipping a routine period that has no steps. */
export function slidesFor(result: SkinAnalysis, part: ReportPart): SlideKey[] {
  if (part === "skin") return ["skin"];
  const keys: SlideKey[] = [];
  if (result.routine.morning.length > 0) keys.push("morning");
  if (result.routine.evening.length > 0) keys.push("evening");
  keys.push("next");
  return keys;
}

/** Severity as a filled share of the bar: one, two or three thirds. */
export const SEVERITY_LEVEL = { low: 1, medium: 2, high: 3 } as const;
export const SEVERITY_LEVELS = 3;
