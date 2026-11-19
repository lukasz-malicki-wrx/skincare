import assert from "node:assert/strict";
import { test } from "node:test";
import { accessUntil, hasAccess, nextRenewal } from "./subscription.ts";

const NOW = new Date("2026-10-03T12:00:00Z");
const FUTURE = "2026-10-10T12:00:00Z";
const PAST = "2026-09-20T12:00:00Z";

test("REQ-SUB-02 hasAccess: trial and active always have access", () => {
  assert.equal(hasAccess({ status: "trial", trialEndsAt: FUTURE }, NOW), true);
  assert.equal(hasAccess({ status: "active", trialEndsAt: PAST }, NOW), true);
});

test("REQ-SUB-02 hasAccess: cancelled keeps access until the trial end date", () => {
  assert.equal(hasAccess({ status: "cancelled", trialEndsAt: FUTURE }, NOW), true);
  assert.equal(hasAccess({ status: "cancelled", trialEndsAt: PAST }, NOW), false);
  assert.equal(hasAccess({ status: "none", trialEndsAt: null }, NOW), false);
});

test("REQ-SUB-02 nextRenewal is a month after the trial end, only when active", () => {
  assert.equal(nextRenewal({ status: "active", trialEndsAt: "2026-10-09T10:00:00Z" })?.toISOString(), "2026-11-09T10:00:00.000Z");
  assert.equal(nextRenewal({ status: "trial", trialEndsAt: FUTURE }), null);
});

test("REQ-SUB-02 accessUntil: active keeps access to the next renewal, trial to its end", () => {
  assert.equal(accessUntil({ status: "active", trialEndsAt: "2026-10-03T10:00:00Z" }), "2026-11-03T10:00:00.000Z");
  assert.equal(accessUntil({ status: "trial", trialEndsAt: FUTURE }), FUTURE);
});
