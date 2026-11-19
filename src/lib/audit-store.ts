import "server-only";
import type { InStatement } from "@libsql/client";
import { auditEventFromRow, type AuditEvent } from "@/lib/audit";
import { getDb } from "@/lib/db";

/**
 * The insert for one event. Callers that change data put it in the same `db.batch(..., "write")`
 * as the change, so a change is never stored without its audit entry or the other way round.
 */
export function auditInsert(event: AuditEvent): InStatement {
  return {
    sql: "INSERT INTO audit_events (occurred_at, user_id, action, details) VALUES (?, ?, ?, ?)",
    args: [event.occurredAt, event.userId, event.action, JSON.stringify(event.details)],
  };
}

/** For events that change no other data (sign-in, sign-out). */
export async function recordAuditEvent(event: AuditEvent) {
  const db = await getDb();
  await db.execute(auditInsert(event));
}

/** A user's own trail, oldest first, for the data export. */
export async function listAuditEvents(userId: number): Promise<AuditEvent[]> {
  const db = await getDb();
  const result = await db.execute({
    sql: "SELECT occurred_at, user_id, action, details FROM audit_events WHERE user_id = ? ORDER BY id",
    args: [userId],
  });
  return result.rows.map((row) =>
    auditEventFromRow({ occurred_at: row.occurred_at, user_id: row.user_id, action: row.action, details: row.details }),
  );
}
