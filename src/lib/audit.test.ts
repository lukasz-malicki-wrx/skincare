import assert from "node:assert/strict";
import { test } from "node:test";
import { auditEvent, auditEventFromRow } from "./audit.ts";

const NOW = new Date("2026-11-19T10:00:00.000Z");

test("REQ-DI-04 auditEvent stamps UTC server time and keeps the details", () => {
  assert.deepEqual(auditEvent("subscription.changed", 7, { from: "none", to: "active" }, NOW), {
    occurredAt: "2026-11-19T10:00:00.000Z",
    userId: 7,
    action: "subscription.changed",
    details: { from: "none", to: "active" },
  });
});

test("REQ-DI-03 auditEvent refuses personal data and secrets in the details", () => {
  for (const key of ["password", "passwordHash", "email", "sessionId", "token", "fullName"]) {
    assert.throws(() => auditEvent("auth.sign_in", 1, { [key]: "x" }, NOW), /must not contain/);
  }
});

test("REQ-DI-04 auditEventFromRow round-trips a stored row and rejects a corrupt one", () => {
  const row = { occurred_at: NOW.toISOString(), user_id: 3, action: "auth.sign_out", details: "{}" };
  assert.deepEqual(auditEventFromRow(row), { occurredAt: NOW.toISOString(), userId: 3, action: "auth.sign_out", details: {} });
  assert.throws(() => auditEventFromRow({ ...row, action: "auth.hack" }), /Corrupt/);
  assert.throws(() => auditEventFromRow({ ...row, occurred_at: 1 }), /Corrupt/);
});
