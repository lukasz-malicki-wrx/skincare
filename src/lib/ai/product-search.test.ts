import assert from "node:assert/strict";
import { test } from "node:test";
import { isStepRef, productSearchPreamble } from "./product-search.ts";

const step = { key: "morning-0", period: "morning", index: 0, step: "Cleanser", ingredient: "gel", why: "Clean." };

test("REQ-AI-01 isStepRef accepts a full step and rejects anything missing or mistyped", () => {
  const cases: Array<[unknown, boolean]> = [
    [step, true],
    [null, false],
    ["morning-0", false],
    [{ ...step, period: "noon" }, false],
    [{ ...step, index: "0" }, false],
    [{ ...step, why: undefined }, false],
  ];
  for (const [value, expected] of cases) assert.equal(isStepRef(value), expected, JSON.stringify(value));
});

test("productSearchPreamble splits the budget per product and skips empty parts", () => {
  assert.equal(productSearchPreamble({}, 3), "Skin type: unknown.");
  assert.equal(
    productSearchPreamble({ skinType: "dry", avoid: ["alcohol"], budgetPln: 100 }, 3),
    [
      "Skin type: dry.",
      "Avoid ingredients: alcohol.",
      "Monthly budget for all 3 products: 100 PLN, about 33 PLN each. Prefer products at or under that price.",
    ].join("\n"),
  );
});
