import assert from "node:assert/strict";
import { test } from "node:test";
import { categoryForStep } from "./catalog.ts";

const cases: Array<[string, string, "morning" | "evening", string]> = [
  ["cleanser", "gentle gel", "morning", "cleanser"],
  ["moisturizer with SPF", "SPF 50", "morning", "spf"],
  ["serum", "niacinamide 5%", "morning", "serum"],
  ["exfoliating toner", "salicylic acid 2%", "evening", "toner"],
  ["night cream", "ceramides", "evening", "night"],
  ["cream", "ceramides", "evening", "night"],
  ["cream", "ceramides", "morning", "moisturizer"],
  ["something", "unknown", "morning", "moisturizer"],
  ["oczyszczanie", "delikatny żel", "morning", "cleanser"],
  ["krem z filtrem", "SPF 50", "morning", "spf"],
  ["serum", "niacynamid 5%", "morning", "serum"],
  ["tonik złuszczający", "kwas salicylowy", "evening", "toner"],
  ["krem na noc", "ceramidy", "evening", "night"],
  ["krem", "ceramidy", "morning", "moisturizer"],
];

test("categoryForStep maps routine wording to a catalogue shelf", () => {
  for (const [step, ingredient, period, expected] of cases) {
    assert.equal(categoryForStep({ step, ingredient, period }), expected, `${step} / ${ingredient}`);
  }
});
