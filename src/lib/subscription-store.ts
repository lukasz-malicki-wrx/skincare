import "server-only";
import type { Row } from "@libsql/client";
import { auditEvent } from "@/lib/audit";
import { auditInsert } from "@/lib/audit-store";
import { getDb } from "@/lib/db";
import { TRIAL_DAYS, accessUntil, subscriptionFromValues, type Subscription } from "@/lib/subscription";

/** Reads and writes of the subscriptions table. The rules live in subscription.ts, shared with the client. */

const DAY_MS = 24 * 60 * 60 * 1000;

const NONE: Subscription = { status: "none", trialEndsAt: null };

function fromRow(row: Row | undefined): Subscription {
  if (!row) return NONE;
  return subscriptionFromValues(row.status, row.trial_ends_at);
}

export async function getSubscription(userId: number): Promise<Subscription> {
  const db = await getDb();
  const result = await db.execute({
    sql: "SELECT status, trial_ends_at FROM subscriptions WHERE user_id = ?",
    args: [userId],
  });
  return fromRow(result.rows[0]);
}

/**
 * Stores the new state and its audit entry in one transaction. The entry keeps both the previous
 * and the new values, so the change history can be reconstructed.
 */
async function save(userId: number, previous: Subscription, next: Subscription, reason: string) {
  const db = await getDb();
  const event = auditEvent("subscription.changed", userId, {
    reason,
    fromStatus: previous.status,
    toStatus: next.status,
    fromTrialEndsAt: previous.trialEndsAt,
    toTrialEndsAt: next.trialEndsAt,
  });
  await db.batch(
    [
      {
        sql: `INSERT INTO subscriptions (user_id, status, trial_ends_at, updated_at)
              VALUES (?, ?, ?, ?)
              ON CONFLICT(user_id) DO UPDATE SET status = excluded.status,
                trial_ends_at = excluded.trial_ends_at, updated_at = excluded.updated_at`,
        args: [userId, next.status, next.trialEndsAt, event.occurredAt],
      },
      auditInsert(event),
    ],
    "write",
  );
}

/** Mocked checkout succeeded: a paid month starts now. Renewal is a month after this date. */
export async function startTrial(userId: number, now = new Date()) {
  const current = await getSubscription(userId);
  await save(userId, current, { status: "active", trialEndsAt: now.toISOString() }, "checkout");
}

/** Cancelling keeps access until the paid-for date (trial end, or the next renewal when active). */
export async function cancelSubscription(userId: number) {
  const current = await getSubscription(userId);
  await save(userId, current, { status: "cancelled", trialEndsAt: accessUntil(current) }, "user_cancelled");
}

/** Demo button: pretend 7 days passed, so the trial rolls into a paid subscription. */
export async function advanceSevenDays(userId: number, now = new Date()) {
  const current = await getSubscription(userId);
  const end = current.trialEndsAt ? new Date(current.trialEndsAt) : now;
  const shifted = new Date(end.getTime() - TRIAL_DAYS * DAY_MS);
  const rolledOver = current.status === "trial" && shifted <= now;
  await save(
    userId,
    current,
    { status: rolledOver ? "active" : current.status, trialEndsAt: shifted.toISOString() },
    "demo_time_advance",
  );
}

