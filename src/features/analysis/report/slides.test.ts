import assert from "node:assert/strict";
import { test } from "node:test";
import { pendingAnalysis, type SkinAnalysis } from "../../../lib/skin-analysis.ts";
import { slidesFor } from "./slides.ts";

const step = { step: "Cleanser", ingredient: "gel", why: "Clean." };
const base = pendingAnalysis({
  photo_quality: { ok: true, issue: null },
  body_part: "face",
  skin_type: "dry",
  summary: "Dry.",
  findings: [],
  see_a_doctor: false,
  see_a_doctor_reason: null,
  avoid_ingredients: [],
});
const withRoutine = (morning: number, evening: number): SkinAnalysis => ({
  ...base,
  routine: { morning: Array(morning).fill(step), evening: Array(evening).fill(step) },
});

test("slidesFor shows only the skin slide in the skin part", () => {
  assert.deepEqual(slidesFor(withRoutine(2, 2), "skin"), ["skin"]);
});

test("slidesFor skips an empty routine period in the plan part", () => {
  const cases: Array<[number, number, string[]]> = [
    [2, 3, ["morning", "evening", "next"]],
    [0, 3, ["evening", "next"]],
    [2, 0, ["morning", "next"]],
    [0, 0, ["next"]],
  ];
  for (const [m, e, expected] of cases) assert.deepEqual(slidesFor(withRoutine(m, e), "plan"), expected);
});
