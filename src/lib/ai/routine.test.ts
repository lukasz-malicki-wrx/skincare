import assert from "node:assert/strict";
import { test } from "node:test";
import { isRoutineAssessment, routineContext } from "./routine.ts";

test("REQ-AI-01 isRoutineAssessment needs a summary string and a findings array", () => {
  const cases = [
    [undefined, false],
    [{}, false],
    [{ summary: "ok" }, false],
    [{ findings: [] }, false],
    [{ summary: 1, findings: [] }, false],
    [{ summary: "ok", findings: [] }, true],
  ] as const;
  for (const [value, expected] of cases) assert.equal(isRoutineAssessment(value), expected, JSON.stringify(value));
});

test("routineContext lists the confirmed profile and falls back when fields are missing", () => {
  const assessment = { summary: "Oily T-zone", findings: [] };
  const full = routineContext(assessment, { skinType: "oily", allergies: ["fragrance", 3], budgetPln: 120 }, "en");
  assert.match(full, /Confirmed skin type: oily\./);
  assert.match(full, /Ingredients to avoid: fragrance\./);
  assert.match(full, /Monthly budget for all products: 120 PLN\./);

  const empty = routineContext(assessment, undefined, "en");
  assert.match(empty, /Confirmed skin type: not given\./);
  assert.match(empty, /Ingredients to avoid: none\./);
  assert.match(empty, /No budget given\./);
});
