import type { Row } from "@libsql/client";
import { getDb } from "@/lib/db";

/** The whole payment layer of the MVP: one row per user, set by the mocked checkout. */
export type SubscriptionStatus = "none" | "trial" | "active" | "cancelled";

export type Subscription = {
  status: SubscriptionStatus;
  /** End of the trial, also the first charge date. ISO string or null before any trial. */
  trialEndsAt: string | null;
};

export const MONTHLY_PRICE_PLN = 29;
export const TRIAL_DAYS = 7;
const DAY_MS = 24 * 60 * 60 * 1000;

const NONE: Subscription = { status: "none", trialEndsAt: null };

export function subscriptionFromValues(status: unknown, trialEndsAt: unknown): Subscription {
  return {
    status: isStatus(status) ? status : "none",
    trialEndsAt: typeof trialEndsAt === "string" ? trialEndsAt : null,
  };
}

function fromRow(row: Row | undefined): Subscription {
  if (!row) return NONE;
  return subscriptionFromValues(row.status, row.trial_ends_at);
}

function isStatus(value: unknown): value is SubscriptionStatus {
  return value === "none" || value === "trial" || value === "active" || value === "cancelled";
}

export async function getSubscription(userId: number): Promise<Subscription> {
  const db = await getDb();
  const result = await db.execute({
    sql: "SELECT status, trial_ends_at FROM subscriptions WHERE user_id = ?",
    args: [userId],
  });
  return fromRow(result.rows[0]);
}

async function save(userId: number, sub: Subscription) {
  const db = await getDb();
  await db.execute({
    sql: `INSERT INTO subscriptions (user_id, status, trial_ends_at, updated_at)
          VALUES (?, ?, ?, datetime('now'))
          ON CONFLICT(user_id) DO UPDATE SET status = excluded.status,
            trial_ends_at = excluded.trial_ends_at, updated_at = excluded.updated_at`,
    args: [userId, sub.status, sub.trialEndsAt],
  });
}

/** Mocked checkout succeeded: a paid month starts now. Renewal is a month after this date. */
export async function startTrial(userId: number, now = new Date()) {
  await save(userId, {
    status: "active",
    trialEndsAt: now.toISOString(),
  });
}

/** Cancelling keeps access until the paid-for date (trial end, or the next renewal when active). */
export async function cancelSubscription(userId: number) {
  const current = await getSubscription(userId);
  await save(userId, { status: "cancelled", trialEndsAt: accessUntil(current) });
}

export function accessUntil(sub: Subscription): string | null {
  if (sub.status === "active") return nextRenewal(sub)?.toISOString() ?? sub.trialEndsAt;
  return sub.trialEndsAt;
}

/** Demo button: pretend 7 days passed, so the trial rolls into a paid subscription. */
export async function advanceSevenDays(userId: number, now = new Date()) {
  const current = await getSubscription(userId);
  const end = current.trialEndsAt ? new Date(current.trialEndsAt) : now;
  const shifted = new Date(end.getTime() - TRIAL_DAYS * DAY_MS);
  const rolledOver = current.status === "trial" && shifted <= now;
  await save(userId, {
    status: rolledOver ? "active" : current.status,
    trialEndsAt: shifted.toISOString(),
  });
}

export async function deleteSubscription(userId: number) {
  const db = await getDb();
  await db.execute({ sql: "DELETE FROM subscriptions WHERE user_id = ?", args: [userId] });
}

/** Locked screens (plan, diet) read only this. */
export function hasAccess(sub: Subscription, now = new Date()): boolean {
  if (sub.status === "trial" || sub.status === "active") return true;
  if (sub.status === "cancelled" && sub.trialEndsAt) return new Date(sub.trialEndsAt) > now;
  return false;
}

/** Next renewal for an active subscription: a month after the paid period started. */
export function nextRenewal(sub: Subscription): Date | null {
  if (sub.status !== "active" || !sub.trialEndsAt) return null;
  const d = new Date(sub.trialEndsAt);
  d.setUTCMonth(d.getUTCMonth() + 1);
  return d;
}
