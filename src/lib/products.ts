import { z } from "zod";
import type { SkinAnalysis } from "@/lib/skin-analysis";

/** Bump when the search or validation changes, so cached results in localStorage get refreshed. */
export const PRODUCTS_VERSION = 2;

/** Routine has at most 3 + 3 steps, so at most 6 products per report. */
export const MAX_STEPS = 6;
/** Web searches per report; the model groups similar steps into one search. */
export const MAX_SEARCHES = 4;

type ReplyLocale = "pl" | "en";

function productSchema(locale: ReplyLocale) {
  const language = locale === "pl" ? "Polish" : "English";
  return z.object({
    name: z.string().describe("Full product name as the shop lists it, e.g. 'CeraVe Hydrating Cleanser 236 ml'"),
    brand: z.string(),
    url: z.string().describe("Product page URL in an online shop, exactly as found in the search results"),
    shop: z.string().describe("Shop name, e.g. 'Hebe', 'Rossmann', 'Notino'"),
    price_pln: z.number().nullable().describe("Price in PLN when visible, otherwise null"),
    why: z.string().describe(`One sentence in ${language} on why it fits this step and skin`),
  });
}

/** Output schema for one language. The `why` sentence follows the app language; shop names stay as listed. */
export function routineProductSearchSchema(locale: ReplyLocale) {
  return z.object({
    items: z
      .array(
        z.object({
          key: z.string().describe("The step key from the request, e.g. 'morning-0'"),
          product: productSchema(locale),
        }),
      )
      .max(MAX_STEPS),
  });
}

export const Product = productSchema("en");

export type Product = z.infer<typeof Product>;

export type RoutineProductSearch = z.infer<ReturnType<typeof routineProductSearchSchema>>;

export type RoutineStepRef = {
  key: string;
  period: "morning" | "evening";
  index: number;
  step: string;
  ingredient: string;
  why: string;
};

/** Step key -> product, or null when nothing usable was found. */
export type RoutineProducts = Record<string, Product | null>;

export type RoutineProductsRequest = {
  steps: RoutineStepRef[];
  skinType: SkinAnalysis["skin_type"];
  avoid: string[];
  profile?: unknown;
  /** Monthly budget for all routine products, in PLN. */
  budgetPln?: number;
  locale?: string;
};

export type RoutineProductsResponse = { products: RoutineProducts };

export function stepKey(period: RoutineStepRef["period"], index: number) {
  return `${period}-${index}`;
}

/** Flattens the morning and evening routine into keyed steps for the product search. */
export function routineSteps(analysis: SkinAnalysis): RoutineStepRef[] {
  const periods: RoutineStepRef["period"][] = ["morning", "evening"];
  return periods.flatMap((period) =>
    analysis.routine[period].map((s, index) => ({
      key: stepKey(period, index),
      period,
      index,
      step: s.step,
      ingredient: s.ingredient,
      why: s.why,
    })),
  );
}
