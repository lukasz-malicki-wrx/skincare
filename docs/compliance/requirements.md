# Requirements

Each requirement has an ID, a risk class and how it is verified. `Test` means an automated test
whose title starts with the ID (unit and integration in `src/**/*.test.ts`, end-to-end in
`e2e/*.spec.ts`); `scripts/check-traceability.mjs` fails CI when a `Test` requirement has none.
`Review` means verification by code review at each change, recorded in the pull request.

Risk: **H** — data integrity, security or a user harmed by wrong output; **M** — a core function
fails; **L** — inconvenience.

| ID | Requirement | Risk | Verification |
| --- | --- | --- | --- |
| REQ-AUTH-01 | A visitor can create an account and lands on the photo step. | M | Test |
| REQ-AUTH-02 | Wrong credentials are rejected with one message that does not reveal which part was wrong. | H | Test |
| REQ-AUTH-03 | Passwords are stored only as a salted scrypt hash and compared in constant time. | H | Test |
| REQ-AUTH-04 | Sign-up accepts only well-formed e-mail addresses. | L | Test |
| REQ-SEC-01 | Server-only code (database, sessions, passwords, model client) cannot be bundled into the browser (`import "server-only"`). | H | Review |
| REQ-SEC-02 | Session cookies are HttpOnly, SameSite=Lax and Secure in production; session ids are 256-bit random. | H | Review |
| REQ-SEC-03 | No secrets or personal data in URLs, logs or the audit trail. | H | Review |
| REQ-SUB-01 | The care plan stays locked until the (mocked) checkout succeeds. | M | Test |
| REQ-SUB-02 | Access rules: trial and active have access; cancelled keeps access until the paid-for date. | M | Test |
| REQ-PLAN-01 | The selected plan view and time of day are kept in the URL and survive a reload. | L | Test |
| REQ-PLAN-02 | A product can be swapped for another of the same kind, and the swap undone. | M | Test |
| REQ-PLAN-03 | Product details open in a modal dialog that Escape closes. | L | Test |
| REQ-PLAN-04 | Plan cost counts each product once; swap candidates cycle cheapest first. | M | Test |
| REQ-AI-01 | Every model response is validated against a schema; refusals, empty or malformed output are reported, never shown as a result. | H | Test |
| REQ-AI-02 | The diet list never shows a food that conflicts with the user's restrictions, even if the model suggests it. | H | Test |
| REQ-AI-03 | Product links are kept only when they are single product pages of allowed shops returned by the search. | M | Test |
| REQ-AI-04 | Output is presented as cosmetic guidance, not a diagnosis, and refers the user to a dermatologist when the model flags it. | H | Review |
| REQ-DI-01 | Sign-up, sign-in (success and failure), sign-out, subscription changes and account deletion are recorded in an audit trail available to the user. | H | Test |
| REQ-DI-02 | The audit trail is append-only, and each data change is written atomically with its audit entry. | H | Test |
| REQ-DI-03 | Audit entries identify the user by id only and contain no personal data or secrets. | H | Test |
| REQ-DI-04 | Audit entries carry server time in UTC ISO 8601 and are read back exactly as written. | H | Test |
| REQ-DI-05 | The user can export and delete their data; unreadable stored data is treated as absent, never shown partially. | H | Test |
| REQ-A11Y-01 | Every screen passes the automated WCAG 2.1 A/AA rules. | H | Test |
| REQ-A11Y-02 | Custom widgets are keyboard operable with a visible focus indicator. | H | Test |
| REQ-A11Y-03 | The landing page has a skip link and declares its language. | M | Test |
| REQ-A11Y-04 | Form errors are announced and programmatically tied to their fields. | H | Test |
| REQ-A11Y-05 | Motion is reduced when the user asks for it (`prefers-reduced-motion`). | M | Review |
| REQ-I18N-01 | The interface, model replies, prices and dates follow the chosen language (Polish or English). | L | Test |
| REQ-ERR-01 | An unknown address shows a not-found page with a way back. | L | Test |
| REQ-ERR-02 | Failed requests show a translated message instead of a raw error. | M | Test |
| REQ-ERR-03 | A screen that crashes shows a recoverable error screen; the root layout has its own fallback. | M | Review |
| REQ-MIG-01 | Former Polish addresses redirect permanently (308) to the English ones. | L | Test |
| REQ-PERF-01 | Rarely used parts (diet tab, product dialog) load on demand. | L | Test |
