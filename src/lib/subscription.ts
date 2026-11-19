/** The whole payment layer of the MVP: one row per user, set by the mocked checkout. */
export type SubscriptionStatus = "none" | "trial" | "active" | "cancelled";

export type Subscription = {
  status: SubscriptionStatus;
  /** End of the trial, also the first charge date. ISO string or null before any trial. */
  trialEndsAt: string | null;
};

export const MONTHLY_PRICE_PLN = 29;
export const TRIAL_DAYS = 7;

export function subscriptionFromValues(status: unknown, trialEndsAt: unknown): Subscription {
  return {
    status: isStatus(status) ? status : "none",
    trialEndsAt: typeof trialEndsAt === "string" ? trialEndsAt : null,
  };
}

function isStatus(value: unknown): value is SubscriptionStatus {
  return value === "none" || value === "trial" || value === "active" || value === "cancelled";
}

export function accessUntil(sub: Subscription): string | null {
  if (sub.status === "active") return nextRenewal(sub)?.toISOString() ?? sub.trialEndsAt;
  return sub.trialEndsAt;
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
