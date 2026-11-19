import assert from "node:assert/strict";
import { test } from "node:test";
import { countLabel, fill, formatDate, formatPln } from "./format.ts";

const steps = { one: "{count} step", few: "{count} steps", many: "{count} steps" };
const kroki = { one: "{count} krok", few: "{count} kroki", many: "{count} kroków" };

test("fill replaces named placeholders", () => {
  assert.equal(fill("Error {status}", { status: 502 }), "Error 502");
});

test("REQ-I18N-01 countLabel uses one, few and many", () => {
  assert.equal(countLabel(1, steps), "1 step");
  assert.equal(countLabel(2, steps), "2 steps");
  assert.equal(countLabel(1, kroki), "1 krok");
  assert.equal(countLabel(3, kroki), "3 kroki");
  assert.equal(countLabel(5, kroki), "5 kroków");
  assert.equal(countLabel(12, kroki), "12 kroków");
  assert.equal(countLabel(22, kroki), "22 kroki");
});

test("REQ-I18N-01 formatPln keeps the Polish notation with 2 or 0 decimals", () => {
  const cases: Array<[number, 0 | 2 | undefined, string]> = [
    [17.49, undefined, "17,49 zł"],
    [17.5, 2, "17,50 zł"],
    [0, 2, "0,00 zł"],
    [84.4, 0, "84 zł"],
    [84.6, 0, "85 zł"],
  ];
  for (const [value, decimals, expected] of cases) assert.equal(formatPln(value, decimals), expected);
});

test("REQ-I18N-01 formatDate follows the app language and style", () => {
  const iso = "2026-11-19T10:00:00Z";
  const cases: Array<[Parameters<typeof formatDate>, string]> = [
    [[iso, "pl"], "19.11.2026"],
    [[iso, "en"], "19/11/2026"],
    [[iso, "pl", "dayMonth"], "19 listopada"],
    [[iso, "en", "dayMonth"], "19 November"],
    [[null, "en"], ""],
  ];
  for (const [args, expected] of cases) assert.equal(formatDate(...args), expected);
});
