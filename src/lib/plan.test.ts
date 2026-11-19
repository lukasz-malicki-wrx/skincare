import assert from "node:assert/strict";
import { test } from "node:test";
import { nextCandidate, planTotal, type PlanStep } from "./plan.ts";
import type { CatalogProduct } from "./catalog.ts";

const item = (id: string, price: number | null): CatalogProduct => ({
  id,
  category: "serum",
  name: id,
  brand: "b",
  url: `https://x.pl/${id}`,
  shop: "x",
  price_pln: price,
  skin_types: ["normal"],
  key_ingredients: [],
  how_to: "",
  watch_out: null,
  why: "",
});

const step = (productUrl: string | null, price: number | null, candidates: CatalogProduct[]): PlanStep => ({
  ref: { key: "morning-0", period: "morning", index: 0, step: "serum", ingredient: "x", why: "" },
  product: productUrl
    ? { name: "p", brand: "b", shop: "s", url: productUrl, pricePln: price, why: "", ingredients: [], howTo: "", watchOut: null}
    : null,
  candidates,
  swapped: false,
});

test("planTotal counts each distinct product once and skips unknown prices", () => {
  const steps = [step("https://x.pl/a", 20, []), step("https://x.pl/a", 20, []), step("https://x.pl/b", null, []), step("https://x.pl/c", 9.5, [])];
  assert.equal(planTotal(steps), 29.5);
});

test("nextCandidate cycles and returns null when there is nothing different", () => {
  const a = item("a", 10);
  const b = item("b", 20);
  assert.equal(nextCandidate(step("https://x.pl/a", 10, [a, b]))?.id, "b");
  assert.equal(nextCandidate(step("https://x.pl/b", 20, [a, b]))?.id, "a");
  assert.equal(nextCandidate(step("https://x.pl/a", 10, [a])), null);
  assert.equal(nextCandidate(step(null, null, [a, b]))?.id, "a");
});
