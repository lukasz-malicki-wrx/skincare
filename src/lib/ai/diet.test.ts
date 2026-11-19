import assert from "node:assert/strict";
import { test } from "node:test";
import { toDietRequest } from "./diet.ts";

test("REQ-AI-01 toDietRequest keeps strings only and caps each list at 8", () => {
  const many = Array.from({ length: 10 }, (_, i) => `item-${i}`);
  const cases = [
    [{}, { skinType: "unknown", concerns: [], restrictions: [] }],
    [
      { skinType: "oily", concerns: ["acne", 5, null] as unknown as string[], restrictions: many },
      { skinType: "oily", concerns: ["acne"], restrictions: many.slice(0, 8) },
    ],
  ] as const;
  for (const [body, expected] of cases) assert.deepEqual(toDietRequest(body), expected);
});
