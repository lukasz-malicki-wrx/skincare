import assert from "node:assert/strict";
import { test } from "node:test";
import { countLabel, fill } from "./format.ts";

const steps = { one: "{count} step", few: "{count} steps", many: "{count} steps" };
const kroki = { one: "{count} krok", few: "{count} kroki", many: "{count} kroków" };

test("fill replaces named placeholders", () => {
  assert.equal(fill("Error {status}", { status: 502 }), "Error 502");
});

test("countLabel uses one, few and many", () => {
  assert.equal(countLabel(1, steps), "1 step");
  assert.equal(countLabel(2, steps), "2 steps");
  assert.equal(countLabel(1, kroki), "1 krok");
  assert.equal(countLabel(3, kroki), "3 kroki");
  assert.equal(countLabel(5, kroki), "5 kroków");
  assert.equal(countLabel(12, kroki), "12 kroków");
  assert.equal(countLabel(22, kroki), "22 kroki");
});
