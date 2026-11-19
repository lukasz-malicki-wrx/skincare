import assert from "node:assert/strict";
import { test } from "node:test";
import { chosenLocale, modelLanguageInstruction } from "./model-language.ts";

test("REQ-I18N-01 modelLanguageInstruction names only the app language", () => {
  assert.match(modelLanguageInstruction("pl"), /in Polish only/);
  assert.match(modelLanguageInstruction("en"), /in English only/);
  assert.doesNotMatch(modelLanguageInstruction("en"), /Polish/);
});

test("chosenLocale prefers a locale sent with the request", () => {
  assert.equal(chosenLocale("en", "pl"), "en");
  assert.equal(chosenLocale("pl", "en"), "pl");
  assert.equal(chosenLocale("de", "en"), "en");
  assert.equal(chosenLocale(undefined, "pl"), "pl");
});
