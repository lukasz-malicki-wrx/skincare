# Compliance documentation

This folder holds the computerised-system documentation for SkinCode, written for a regulated
(GxP) engineering environment and for WCAG 2.1 AA accessibility.

| Document | Purpose |
| --- | --- |
| [system-description.md](system-description.md) | Intended use, GxP impact assessment, architecture, data flows, suppliers |
| [requirements.md](requirements.md) | User and functional requirements with IDs, risk and acceptance criteria |
| [traceability-matrix.md](traceability-matrix.md) | Requirement → verification evidence |
| [validation-plan.md](validation-plan.md) | Risk-based validation approach (IQ / OQ / PQ) and release criteria |
| [data-integrity.md](data-integrity.md) | ALCOA+ controls and the audit trail design |
| [electronic-records.md](electronic-records.md) | 21 CFR Part 11 and EU GMP Annex 11 applicability assessment |
| [change-control.md](change-control.md) | How a change moves from request to release |
| [accessibility-statement.md](accessibility-statement.md) | WCAG 2.1 AA conformance claim, method and known limitations |

## Scope of these documents

The repository contains the **technical controls** and the **verification evidence** a regulated
organisation needs: requirements with IDs, automated tests traced to them, an append-only audit
trail, pinned dependencies, change control through pull requests and CI, and retained test
reports.

GxP compliance is a property of a system **in its organisation**, not of code alone. The items
marked *Organisational* in these documents (quality-system SOPs, supplier qualification, signed
validation approval, periodic review, user training, backup and disaster-recovery procedures)
must be provided by the operating organisation's quality management system before the system is
used for any regulated purpose.
