import assert from "node:assert/strict";
import { test } from "node:test";
import { isValidEmail, normalizeEmail } from "./email.ts";

test("isValidEmail accepts any well-formed address", () => {
  const cases: Array<[string, boolean]> = [
    ["anna@example.com", true],
    ["  Anna.Nowak@Mail.PL ", true],
    ["a@b.co", true],
    ["", false],
    ["anna", false],
    ["anna@", false],
    ["@example.com", false],
    ["anna@example", false],
    ["an na@example.com", false],
    ["anna@@example.com", false],
  ];
  for (const [email, expected] of cases) assert.equal(isValidEmail(email), expected, email);
});

test("normalizeEmail trims and lowercases", () => {
  assert.equal(normalizeEmail("  Anna@Example.COM "), "anna@example.com");
});
