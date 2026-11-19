import assert from "node:assert/strict";
import { test } from "node:test";
import { hashPassword, verifyPassword } from "./password.ts";

test("REQ-AUTH-03 passwords are stored as a salted scrypt hash, never in clear", () => {
  const stored = hashPassword("correct horse");
  assert.doesNotMatch(stored, /correct horse/);
  assert.notEqual(hashPassword("correct horse"), stored, "each hash has its own salt");
  assert.equal(verifyPassword("correct horse", stored), true);
  assert.equal(verifyPassword("wrong horse", stored), false);
  assert.equal(verifyPassword("correct horse", "malformed"), false);
});
