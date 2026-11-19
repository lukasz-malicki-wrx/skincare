import Anthropic from "@anthropic-ai/sdk";
import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";
import { modelLanguageInstruction } from "@/i18n/model-language";
import type { Locale } from "@/i18n/translations";
import { anthropic, FAST_MODEL } from "@/lib/ai/client";
import { SHOP_DOMAINS, isProductPageAlive, looksLikeProductPage, normalizeUrl } from "@/lib/product-page";
import {
  MAX_SEARCHES,
  routineProductSearchSchema,
  type Product,
  type RoutineProductSearch,
  type RoutineProducts,
  type RoutineProductsRequest,
  type RoutineStepRef,
} from "@/lib/products";

/** Steps whose product was rejected get one more, narrower search round. */
const RETRY_SEARCHES = 2;

function systemPrompt(locale: Locale) {
  return `You find specific skincare products to buy online in Poland. The search is limited to Polish shops (Hebe, Rossmann, Notino, DOZ, Super-Pharm, Douglas, Sephora, Drogeria Natura, Allegro, Ceneo).

Rules:
- Write every search query in Polish: product type plus the key ingredient, e.g. "żel oczyszczający niacynamid cera mieszana".
- Return exactly one product for every step key in the request. No alternatives, no duplicates.
- The url must be a single product page copied exactly from the search results. Category pages, search listings, blog posts and sets or bundles do not count; if a step has no product page in the results, search again for it.
- The name must include the brand and the product name as the shop lists it.
- The product must match the step's purpose: a cleanser for a cleanser step, a night cream without SPF for an evening step, SPF only where the step asks for it.
- Prefer products available in Poland with a price in PLN.
- Respect the user's profile (allergies, ingredients to avoid) and the "avoid" list.
- Group similar steps into one search when you can; you have a limited number of searches.
- ${modelLanguageInstruction(locale)} Search queries stay in Polish either way.`;
}

export function isStepRef(value: unknown): value is RoutineStepRef {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.key === "string" &&
    (v.period === "morning" || v.period === "evening") &&
    typeof v.index === "number" &&
    typeof v.step === "string" &&
    typeof v.ingredient === "string" &&
    typeof v.why === "string"
  );
}

type SearchContext = Pick<Partial<RoutineProductsRequest>, "skinType" | "avoid" | "budgetPln" | "profile">;

/** Skin, avoid list, budget per product and profile: what every search round is told first. */
export function productSearchPreamble(context: SearchContext, stepCount: number): string {
  const { skinType, avoid, budgetPln, profile } = context;
  return [
    `Skin type: ${skinType ?? "unknown"}.`,
    avoid?.length ? `Avoid ingredients: ${avoid.join(", ")}.` : "",
    typeof budgetPln === "number"
      ? `Monthly budget for all ${stepCount} products: ${budgetPln} PLN, about ${Math.round(budgetPln / stepCount)} PLN each. Prefer products at or under that price.`
      : "",
    profile ? `User profile: ${JSON.stringify(profile)}.` : "",
  ]
    .filter(Boolean)
    .join("\n");
}

/**
 * One product per routine step, found with web search in Polish shops. Steps whose first pick
 * was rejected get one narrower retry; a step that still has nothing stays null.
 */
export async function findRoutineProducts(
  steps: RoutineStepRef[],
  context: SearchContext,
  locale: Locale,
): Promise<RoutineProducts> {
  const prompt = systemPrompt(locale);
  const preamble = productSearchPreamble(context, steps.length);
  const products = await searchRound(steps, preamble, MAX_SEARCHES, prompt, locale);

  const missing = steps.filter((s) => !products[s.key]);
  if (missing.length > 0) {
    const retry = await searchRound(
      missing,
      `${preamble}\nThe previous search returned category or listing pages for these steps. Search again with a more specific Polish query and return a single product page url.`,
      RETRY_SEARCHES,
      prompt,
      locale,
    );
    for (const s of missing) products[s.key] = retry[s.key];
  }

  return products;
}

/** One model call with web search for the given steps, validated against the real results. */
async function searchRound(
  steps: RoutineStepRef[],
  preamble: string,
  maxSearches: number,
  prompt: string,
  locale: Locale,
): Promise<RoutineProducts> {
  const context = [
    preamble,
    "Routine steps (one product each):",
    ...steps.map((s) => `- ${s.key}: ${s.period} ${s.step}, ${s.ingredient}. ${s.why}`),
  ].join("\n");

  const res = await anthropic.beta.messages.parse({
    model: FAST_MODEL,
    max_tokens: 6000,
    tools: [
      {
        type: "web_search_20250305",
        name: "web_search",
        max_uses: maxSearches,
        user_location: { type: "approximate", country: "PL" },
        allowed_domains: [...SHOP_DOMAINS],
      },
    ],
    output_config: { format: betaZodOutputFormat(routineProductSearchSchema(locale)) },
    system: [{ type: "text", text: prompt, cache_control: { type: "ephemeral" } }],
    messages: [{ role: "user", content: context }],
  });

  if (res.stop_reason === "refusal" || !res.parsed_output) {
    throw new Anthropic.AnthropicError("Product search returned no structured output.");
  }

  return toRoutineProducts(steps, res.parsed_output, searchResultUrls(res.content));
}

/** Product page URLs the web search actually returned, normalised for comparison. */
function searchResultUrls(content: Anthropic.Beta.BetaContentBlock[]): Set<string> {
  const urls = new Set<string>();
  for (const block of content) {
    if (block.type !== "web_search_tool_result" || !Array.isArray(block.content)) continue;
    for (const result of block.content) urls.add(normalizeUrl(result.url));
  }
  return urls;
}

/**
 * Every requested key gets an entry. A product is kept only when its url came from the search
 * results, looks like a single product page in one of the shops and does not 404.
 */
async function toRoutineProducts(
  steps: RoutineStepRef[],
  found: RoutineProductSearch,
  resultUrls: Set<string>,
): Promise<RoutineProducts> {
  const byKey = new Map<string, Product>(found.items.map((item) => [item.key, item.product]));
  const entries = await Promise.all(
    steps.map(async (s) => {
      const product = byKey.get(s.key);
      if (!product) return [s.key, null] as const;
      const trusted = resultUrls.has(normalizeUrl(product.url)) && looksLikeProductPage(product.url);
      if (!trusted) return [s.key, null] as const;
      const alive = await isProductPageAlive(product.url);
      return [s.key, alive ? product : null] as const;
    }),
  );
  return Object.fromEntries(entries);
}
