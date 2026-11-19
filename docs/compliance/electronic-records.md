# Electronic records assessment (21 CFR Part 11, EU GMP Annex 11)

In its intended use (see [system-description.md](system-description.md)) the system keeps no
records required by a predicate rule and applies no electronic signatures, so neither regulation
applies. The table records how each relevant control is met today, so the gap is known if the
intended use changes.

Status: **Met** — implemented and verified; **Partial** — partly implemented; **Org** — needs an
organisational procedure; **N/A** — not applicable in the current design.

| Control | Reference | Status | How |
| --- | --- | --- | --- |
| Validation | Part 11 §11.10(a), Annex 11 §4 | Partial | [validation-plan.md](validation-plan.md); OQ automated in CI. Formal approval: Org |
| Accurate and complete copies | §11.10(b) | Met | User data export as JSON, including the audit trail |
| Record protection and retention | §11.10(c), Annex 11 §7, §17 | Org | Database backups and retention period |
| Limited system access | §11.10(d), Annex 11 §12 | Met | Authenticated sessions; each user sees only their own data |
| Audit trail | §11.10(e), Annex 11 §9 | Met | Append-only, server-time, previous and new values (`REQ-DI-01`…`04`) |
| Operational system checks | §11.10(f) | Met | Onboarding enforces the step order; locked screens check access on the server |
| Authority checks | §11.10(g) | Partial | One user role; no administrative roles exist yet |
| Device checks | §11.10(h) | N/A | No instrument input |
| Training | §11.10(i), Annex 11 §2 | Org | Developer and reviewer training records |
| Written policies on signatures | §11.10(j) | N/A | No electronic signatures |
| Documentation control | §11.10(k), Annex 11 §10 | Met | Documents versioned in git; changes through pull requests ([change-control.md](change-control.md)) |
| Electronic signatures | §11.50–§11.300 | N/A | Not used |
| Password controls | §11.300 | Partial | Hashed with scrypt; minimum length 6. Expiry, lockout and complexity rules: not implemented |
| Supplier assessment | Annex 11 §3 | Org | Vercel, Turso, Anthropic |
| Risk management | Annex 11 §1 | Met | Risk class per requirement in [requirements.md](requirements.md) |
| Incident management | Annex 11 §13 | Org | See `SECURITY.md` for reporting; handling procedure: Org |
| Business continuity | Annex 11 §16 | Org | Hosting and database recovery plan |
