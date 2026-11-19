"use server";

import { redirect } from "next/navigation";
import { routes } from "@/config/routes";
import { auditEvent, type AuditEvent } from "@/lib/audit";
import { auditInsert, listAuditEvents } from "@/lib/audit-store";
import { destroySession, requireSessionUser } from "@/lib/auth";
import { getDb } from "@/lib/db";

/**
 * Erases the account (subscription, sessions, user) in one transaction together with its audit
 * entry, then signs out. The audit trail itself is kept: it holds no personal data.
 */
export async function deleteAccountAction() {
  const user = await requireSessionUser();
  const db = await getDb();
  await db.batch(
    [
      { sql: "DELETE FROM subscriptions WHERE user_id = ?", args: [user.id] },
      { sql: "DELETE FROM sessions WHERE user_id = ?", args: [user.id] },
      { sql: "DELETE FROM users WHERE id = ?", args: [user.id] },
      auditInsert(auditEvent("account.deleted", user.id)),
    ],
    "write",
  );
  await destroySession();
  redirect(routes.home);
}

/** The signed-in user's own audit trail, for the personal data export. */
export async function exportAuditTrailAction(): Promise<AuditEvent[]> {
  const user = await requireSessionUser();
  return listAuditEvents(user.id);
}
