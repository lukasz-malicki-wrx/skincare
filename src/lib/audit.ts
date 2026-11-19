/**
 * Audit trail events (ALCOA+: attributable, contemporaneous, original, enduring). This module is
 * pure: it builds and reads events. Writing them is `audit-store.ts`, server-side only.
 */

export const AUDIT_ACTIONS = [
  "auth.sign_up",
  "auth.sign_in",
  "auth.sign_in_failed",
  "auth.sign_out",
  "subscription.changed",
  "account.deleted",
] as const;

export type AuditAction = (typeof AUDIT_ACTIONS)[number];

export type AuditDetails = Record<string, string | number | boolean | null>;

export type AuditEvent = {
  /** Server time, ISO 8601 in UTC. */
  occurredAt: string;
  /** The user the event is about; null when no account could be attributed. */
  userId: number | null;
  action: AuditAction;
  details: AuditDetails;
};

/** Personal data and secrets never go into the trail; the user id is the only identifier. */
const FORBIDDEN_DETAIL = /password|hash|token|session|cookie|email|name|phone|address/i;

export function auditEvent(
  action: AuditAction,
  userId: number | null,
  details: AuditDetails = {},
  now: Date = new Date(),
): AuditEvent {
  const forbidden = Object.keys(details).find((key) => FORBIDDEN_DETAIL.test(key));
  if (forbidden) throw new Error(`Audit details must not contain personal data or secrets: "${forbidden}"`);
  return { occurredAt: now.toISOString(), userId, action, details };
}

function isAction(value: unknown): value is AuditAction {
  return AUDIT_ACTIONS.includes(value as AuditAction);
}

/** An event read back from storage; a row that does not match the schema is reported, not hidden. */
export function auditEventFromRow(row: { occurred_at: unknown; user_id: unknown; action: unknown; details: unknown }): AuditEvent {
  if (typeof row.occurred_at !== "string" || !isAction(row.action) || typeof row.details !== "string") {
    throw new Error("Corrupt audit trail row");
  }
  return {
    occurredAt: row.occurred_at,
    userId: row.user_id === null ? null : Number(row.user_id),
    action: row.action,
    details: JSON.parse(row.details) as AuditDetails,
  };
}
