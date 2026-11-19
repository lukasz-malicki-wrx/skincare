# System description and GxP impact assessment

| Field | Value |
| --- | --- |
| System | SkinCode (repository `skincare`) |
| Version | See `package.json` and the release tag |
| System owner | Repository owner (see `.github/CODEOWNERS`) |
| GAMP 5 category | 5 — custom application |
| Document status | Draft for review; approval is *Organisational* |

## Intended use

A progressive web app that turns one photo of the user's skin into a cosmetic skin report, a
morning and evening care routine, a product list within a monthly budget and a diet list.
Output is **cosmetic guidance, not a diagnosis**; when the model sees changes that need a
dermatologist, the app says so (`see_a_doctor`).

The app is **not** a medical device and does not support any manufacturing, clinical,
laboratory, pharmacovigilance or other GxP-regulated process.

## GxP impact assessment

| Question | Answer |
| --- | --- |
| Does the system create, modify or store records required by a GxP predicate rule? | No |
| Does it support a decision about product quality, patient safety or data integrity of a regulated process? | No |
| Is it used to submit data to a regulator? | No |
| Conclusion | Not GxP-relevant in its intended use. Developed to GxP engineering practice (GAMP 5 category 5, risk-based) so it can be qualified if the intended use changes. |

A change of intended use (for example, use in a clinical study) triggers a new assessment under
[change-control.md](change-control.md).

## Architecture

```
Browser (PWA, Next.js client components)
  ├─ camera / photo  ──► POST /api/analyze  ──► Anthropic Claude (vision, structured output)
  ├─ profile form    ──► POST /api/routine  ──► Anthropic Claude
  ├─ report          ──► POST /api/products ──► Anthropic Claude + web search (Polish shops)
  ├─ diet tab        ──► POST /api/diet     ──► Anthropic Claude
  └─ localStorage: photo, report, profile, plan swaps, diet, reminders (device only)

Next.js server (Vercel)
  ├─ server actions: sign-up / sign-in / sign-out, subscription (mocked checkout), account deletion
  └─ Turso (libSQL): users, sessions, subscriptions, audit_events (append-only)
```

## Data classification

| Data | Where | Classification | Notes |
| --- | --- | --- | --- |
| Skin photo | Browser only; sent to the model for one request | Personal, sensitive | Not stored on the server; the user can delete it |
| Report, profile, plan, diet | Browser only | Personal | Exportable and deletable by the user |
| Name, e-mail, password hash | Server (Turso) | Personal | Password hashed with scrypt and a per-user salt |
| Session id | Server + HttpOnly cookie | Secret | 256-bit random |
| Subscription state | Server | Business | Changes are audit-trailed |
| Audit events | Server | Integrity record | Append-only; user id only, no personal data |

## Suppliers

| Supplier | Service | Qualification |
| --- | --- | --- |
| Vercel | Hosting, build | *Organisational* — supplier assessment |
| Turso | Database | *Organisational* — supplier assessment, backup and point-in-time recovery settings |
| Anthropic | Model API | *Organisational* — supplier assessment, data-processing terms |
| npm packages | Libraries | Pinned exact versions and lockfile; licences limited to permissive (see README) |
