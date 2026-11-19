import assert from "node:assert/strict";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";

process.env.TURSO_DATABASE_URL = `file:${join(mkdtempSync(join(tmpdir(), "audit-")), "test.db")}`;
process.env.TURSO_AUTH_TOKEN = "test";

const { auditEvent } = await import("./audit.ts");
const { auditInsert, listAuditEvents, recordAuditEvent } = await import("./audit-store.ts");
const { getDb } = await import("./db.ts");

test("REQ-DI-02 the audit trail can be appended to but never changed or deleted", async () => {
  await recordAuditEvent(auditEvent("auth.sign_up", 42, {}, new Date("2026-11-19T10:00:00Z")));
  const db = await getDb();
  await db.execute(auditInsert(auditEvent("auth.sign_in", 42, {}, new Date("2026-11-19T10:05:00Z"))));

  await assert.rejects(db.execute("UPDATE audit_events SET action = 'auth.sign_out'"), /append-only/);
  await assert.rejects(db.execute("DELETE FROM audit_events"), /append-only/);

  const events = await listAuditEvents(42);
  assert.deepEqual(
    events.map((e) => [e.action, e.occurredAt]),
    [
      ["auth.sign_up", "2026-11-19T10:00:00.000Z"],
      ["auth.sign_in", "2026-11-19T10:05:00.000Z"],
    ],
  );
});

test("REQ-DI-02 a change and its audit entry are written together or not at all", async () => {
  const db = await getDb();
  const before = (await listAuditEvents(7)).length;
  await assert.rejects(
    db.batch(
      [auditInsert(auditEvent("account.deleted", 7)), { sql: "INSERT INTO no_such_table VALUES (1)", args: [] }],
      "write",
    ),
  );
  assert.equal((await listAuditEvents(7)).length, before);
});
