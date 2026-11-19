import assert from "node:assert/strict";
import { test } from "node:test";
import { parseStoredAnalysis, pendingAnalysis, type StoredAnalysis } from "./skin-analysis.ts";

const result = pendingAnalysis({
  photo_quality: { ok: true, issue: null },
  body_part: "face",
  skin_type: "dry",
  summary: "Dry cheeks.",
  findings: [{ name: "dryness", area: "cheeks", severity: "low", confidence: 0.8 }],
  see_a_doctor: false,
  see_a_doctor_reason: null,
  avoid_ingredients: [],
});
const stored: StoredAnalysis = { createdAt: "2026-11-19T10:00:00Z", imageDataUrl: "data:image/jpeg;base64,AA", result, routineReady: false };

test("REQ-DI-05 parseStoredAnalysis round-trips a saved report", () => {
  assert.deepEqual(parseStoredAnalysis(JSON.stringify(stored)), stored);
});

test("REQ-DI-05 parseStoredAnalysis treats anything else as no report", () => {
  const cases: Array<string | null> = [
    null,
    "",
    "{not json",
    "42",
    JSON.stringify({ ...stored, createdAt: 1 }),
    JSON.stringify({ ...stored, imageDataUrl: undefined }),
    JSON.stringify({ ...stored, result: { ...result, skin_type: "scaly" } }),
  ];
  for (const raw of cases) assert.equal(parseStoredAnalysis(raw), null, String(raw));
});
