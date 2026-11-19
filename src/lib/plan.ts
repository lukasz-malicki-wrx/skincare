import { candidatesFor, categoryForStep, findCatalogProduct, type CatalogProduct } from "@/lib/catalog";
import { routineSteps, type RoutineStepRef } from "@/lib/products";
import type { SkinAnalysis } from "@/lib/skin-analysis";
import type { SkinProfile } from "@/lib/skin-profile";
import type { PlanSwaps } from "@/components/use-plan-state";

/** What a plan card shows. The plan is built from our catalogue only, so it never waits on a model. */
export type PlanProduct = {
  name: string;
  brand: string;
  shop: string;
  url: string;
  pricePln: number | null;
  why: string;
  ingredients: string[];
  howTo: string;
  watchOut: string | null;
};

export type PlanStep = {
  ref: RoutineStepRef;
  product: PlanProduct | null;
  /** Catalogue items the swap button cycles through, cheapest first. */
  candidates: CatalogProduct[];
  swapped: boolean;
};

function fromCatalog(p: CatalogProduct): PlanProduct {
  return {
    name: p.name,
    brand: p.brand,
    shop: p.shop,
    url: p.url,
    pricePln: p.price_pln,
    why: p.why,
    ingredients: p.key_ingredients,
    howTo: p.how_to,
    watchOut: p.watch_out,
  };
}

/**
 * One card per routine step: the user's swap if any, otherwise the cheapest catalogue item on
 * that shelf that suits the skin type and avoids flagged ingredients.
 */
export function buildPlan(analysis: SkinAnalysis, profile: SkinProfile, swaps: PlanSwaps): PlanStep[] {
  const skinType = profile.skinType ?? (analysis.skin_type === "unknown" ? null : analysis.skin_type);
  const avoid = [...profile.allergies, ...analysis.avoid_ingredients];

  return routineSteps(analysis).map((ref) => {
    const candidates = candidatesFor(categoryForStep(ref), skinType, avoid);
    const swapped = findCatalogProduct(swaps[ref.key]);
    const chosen = swapped ?? candidates[0] ?? null;
    return { ref, product: chosen ? fromCatalog(chosen) : null, candidates, swapped: swapped !== null };
  });
}

/** Next catalogue item after the current one, cycling; null when nothing different exists. */
export function nextCandidate(step: PlanStep): CatalogProduct | null {
  if (step.candidates.length === 0) return null;
  const currentUrl = step.product?.url;
  const index = step.candidates.findIndex((c) => c.url === currentUrl);
  const next = step.candidates[(index + 1) % step.candidates.length];
  return next.url === currentUrl ? null : next;
}

/** Monthly cost: each distinct product once, unknown prices ignored. */
export function planTotal(steps: PlanStep[]): number {
  const seen = new Set<string>();
  let total = 0;
  for (const s of steps) {
    if (!s.product || s.product.pricePln === null || seen.has(s.product.url)) continue;
    seen.add(s.product.url);
    total += s.product.pricePln;
  }
  return Math.round(total * 100) / 100;
}
