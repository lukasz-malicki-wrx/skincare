import assert from "node:assert/strict";
import { test } from "node:test";
import { z } from "zod";
import { applyRestrictions, dietInputsKey, dietPlanSchema, violatesRestriction } from "./diet.ts";
import { skinAnalysisSchema } from "./skin-analysis.ts";

test("REQ-AI-02 violatesRestriction blocks the obvious foods per restriction", () => {
  assert.equal(violatesRestriction("Salmon", ["vegan"]), true);
  assert.equal(violatesRestriction("Walnuts", ["nut allergy"]), true);
  assert.equal(violatesRestriction("Greek yogurt", ["lactose-free"]), true);
  assert.equal(violatesRestriction("Spinach", ["vegan", "nut allergy", "fish allergy"]), false);
  assert.equal(violatesRestriction("Salmon", []), false);
  assert.equal(violatesRestriction("Łosoś", ["vegan"]), true);
  assert.equal(violatesRestriction("Jogurt grecki", ["lactose-free"]), true);
  assert.equal(violatesRestriction("Szpinak", ["vegan"]), false);
});

test("dietInputsKey changes when the app language changes", () => {
  const base = { skinType: "oily", concerns: ["blackheads"], restrictions: [] };
  assert.notEqual(dietInputsKey({ ...base, locale: "en" }), dietInputsKey({ ...base, locale: "pl" }));
});

test("english output schemas do not show Polish examples", () => {
  const analysis = JSON.stringify(z.toJSONSchema(skinAnalysisSchema("en")));
  const diet = JSON.stringify(z.toJSONSchema(dietPlanSchema("en")));
  assert.match(analysis, /blackheads/);
  assert.doesNotMatch(analysis, /zaskórniki|czoło|oczyszczanie/);
  assert.match(diet, /salmon/);
  assert.doesNotMatch(diet, /łosoś/);
});

test("REQ-AI-02 applyRestrictions filters eat_more only", () => {
  const plan = {
    eat_more: [{ item: "Salmon", why: "omega-3" }, { item: "Spinach", why: "zinc" }],
    limit: [{ item: "Milk", why: "may trigger acne" }],
  };
  const out = applyRestrictions(plan, ["vegan"]);
  assert.deepEqual(out.eat_more.map((i) => i.item), ["Spinach"]);
  assert.equal(out.limit.length, 1);
});
