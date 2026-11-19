# Data integrity (ALCOA+)

## Records in scope

The server holds the only records the organisation is accountable for: the account, the
subscription state and the audit trail. Photos, reports, profiles, plans and diet lists stay in
the user's browser; they are the user's own working data, not organisational records.

## ALCOA+ controls

| Principle | Control in this system |
| --- | --- |
| Attributable | Every audit entry carries the user id of the authenticated session (`requireSessionUser`). A failed sign-in is attributed to the account when the e-mail exists, otherwise to no one. |
| Legible | Entries are structured JSON with a fixed action vocabulary (`AUDIT_ACTIONS` in `src/lib/audit.ts`), exportable by the user. |
| Contemporaneous | The server stamps `occurred_at` with its own clock, in UTC ISO 8601, when the action happens. The client clock is never used. |
| Original | Subscription entries hold both the previous and the new values and the reason, so history is reconstructable without the current row. |
| Accurate | Inputs are validated on the server (e-mail, password length, request bodies); model output is validated against Zod schemas before use. |
| Complete | A data change and its audit entry are written in one transaction (`db.batch(..., "write")`); one cannot exist without the other. |
| Consistent | One time source (server UTC), one schema per record type, append-only storage. |
| Enduring | The audit table has no foreign key to `users`, so entries outlive a deleted account. Backups and retention: *Organisational* (Turso point-in-time recovery). |
| Available | Users can export their own trail (Profile → Download my data). Administrative review access: *Organisational*. |

## Audit trail design

- Table `audit_events (id, occurred_at, user_id, action, details)` in `src/lib/db.ts`.
- SQLite triggers abort any `UPDATE` or `DELETE` on the table; verified by `REQ-DI-02`.
- `auditEvent()` rejects detail keys that look like personal data or secrets (`REQ-DI-03`).
- Events: `auth.sign_up`, `auth.sign_in`, `auth.sign_in_failed`, `auth.sign_out`,
  `subscription.changed`, `account.deleted`.

## Known limitations

- Deleting an account removes the personal data (GDPR Art. 17) but keeps the anonymous audit
  entries keyed by the former user id. This balance must be confirmed by the data protection
  officer (*Organisational*).
- The model id and prompt version used for a report are not recorded with it. If reports ever
  become records, store them server-side with the model id, prompt version and timestamps.
