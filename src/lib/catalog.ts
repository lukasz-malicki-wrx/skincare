import catalogJson from "@/data/catalog.json" with { type: "json" };
import type { RoutineStepRef } from "@/lib/products";
import type { SkinType } from "@/lib/skin-profile";

/** Our own catalogue (scripts/build-catalog.mjs): real products from Polish shops with verified links. */
export type CatalogCategory = "cleanser" | "toner" | "serum" | "moisturizer" | "spf" | "night";

export type CatalogProduct = {
  id: string;
  category: CatalogCategory;
  name: string;
  brand: string;
  url: string;
  shop: string;
  price_pln: number | null;
  skin_types: SkinType[];
  key_ingredients: string[];
  how_to: string;
  watch_out: string | null;
  why: string;
};

export const catalog = catalogJson as CatalogProduct[];

export const CATEGORY_LABEL: Record<CatalogCategory, string> = {
  cleanser: "Cleanser",
  toner: "Toner or exfoliant",
  serum: "Serum",
  moisturizer: "Moisturizer",
  spf: "SPF",
  night: "Night cream",
};

/** Which catalogue shelf a routine step belongs to, from its wording. */
export function categoryForStep(step: Pick<RoutineStepRef, "step" | "ingredient" | "period">): CatalogCategory {
  const text = `${step.step} ${step.ingredient}`.toLowerCase();
  if (/spf|sunscreen|sun protection|filter|filtr|przeciwsłonecz/.test(text)) return "spf";
  if (/cleans|wash|gel|micellar|foam|oczyszcz|micelar|piank|żel/.test(text)) return "cleanser";
  if (/\bserum\b/.test(text)) return "serum";
  if (/toner|tonik|exfol|peel|bha|aha|salicyl|glycolic|glikol|lactic|złuszcz/.test(text)) return "toner";
  if (/serum|niacinamide|niacynamid|vitamin c|witamina c|retinol|retinal|hyaluronic|hialuron|azelaic|azelain/.test(text)) return "serum";
  if (/night|sleep|overnight|nocn|na noc/.test(text) || (step.period === "evening" && /cream|krem|moistur|lotion|balm|balsam/.test(text))) {
    return "night";
  }
  if (/moistur|cream|krem|lotion|hydrat|nawilż|balm|balsam|emollient|emolient/.test(text)) return "moisturizer";
  return step.period === "evening" ? "night" : "moisturizer";
}

/**
 * Instant swap candidates: same shelf, suited to the skin type, free of flagged ingredients,
 * cheapest first. No model call, so this answers in a frame.
 */
export function candidatesFor(
  category: CatalogCategory,
  skinType: SkinType | null,
  avoid: string[],
): CatalogProduct[] {
  const flagged = avoid.map((a) => a.toLowerCase());
  const suits = (p: CatalogProduct) => !skinType || p.skin_types.includes(skinType);
  const safe = (p: CatalogProduct) =>
    !p.key_ingredients.some((ing) => flagged.some((f) => f && ing.toLowerCase().includes(f)));
  const byPrice = (a: CatalogProduct, b: CatalogProduct) =>
    (a.price_pln ?? Number.MAX_SAFE_INTEGER) - (b.price_pln ?? Number.MAX_SAFE_INTEGER);

  const matching = catalog.filter((p) => p.category === category && suits(p) && safe(p)).sort(byPrice);
  if (matching.length > 0) return matching;
  return catalog.filter((p) => p.category === category && safe(p)).sort(byPrice);
}

export function findCatalogProduct(id: string | null | undefined): CatalogProduct | null {
  if (!id) return null;
  return catalog.find((p) => p.id === id) ?? null;
}
