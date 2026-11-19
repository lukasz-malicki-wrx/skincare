import assert from "node:assert/strict";
import { test } from "node:test";
import { BUDGET_DEFAULT, EMPTY_PROFILE, clampBudget, parseProfile } from "./skin-profile.ts";

test("parseProfile returns the empty profile for missing or broken data", () => {
  assert.deepEqual(parseProfile(null), EMPTY_PROFILE);
  assert.deepEqual(parseProfile("{not json"), EMPTY_PROFILE);
});

test("parseProfile keeps valid fields and drops unknown skin types", () => {
  const p = parseProfile(JSON.stringify({ skinType: "weird", allergies: ["acids", 3], budgetPln: 999, diet: ["vegan"] }));
  assert.equal(p.skinType, null);
  assert.deepEqual(p.allergies, ["acids"]);
  assert.equal(p.budgetPln, 500);
  assert.deepEqual(p.diet, ["vegan"]);
});

test("clampBudget stays in range and falls back to the default", () => {
  assert.equal(clampBudget(10), 50);
  assert.equal(clampBudget(120.4), 120);
  assert.equal(clampBudget("x"), BUDGET_DEFAULT);
});
