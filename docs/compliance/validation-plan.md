# Validation plan

Risk-based, following GAMP 5 (second edition) and the FDA Computer Software Assurance approach:
effort goes where a failure would harm data integrity, security or the user; low-risk features
rely on automated checks without scripted manual testing.

## Roles

| Role | Responsibility |
| --- | --- |
| System owner | Approves this plan, the requirements and each release |
| Developer | Implements changes with tests, keeps the traceability current |
| Reviewer | Independent code review of every pull request (not the author) |
| Quality (*Organisational*) | Approves the validation summary before regulated use |

## Qualification stages

| Stage | What is shown | How | Evidence |
| --- | --- | --- | --- |
| IQ — installation | The deployed build is exactly the reviewed commit with its locked dependencies | Deploy from a tagged commit on `main`; `pnpm install --frozen-lockfile`; exact versions in `package.json`; `pnpm build` | CI log for the tag, deployment record (*Organisational*) |
| OQ — operation | Each requirement works as specified | `pnpm check` (types, lint, unit and integration tests, traceability) and `pnpm test:e2e` (end-to-end and WCAG 2.1 AA) in CI for every change | CI run, e2e report artefact (kept 90 days), [traceability-matrix.md](traceability-matrix.md) |
| PQ — performance | The system fits its intended use with real users | User acceptance on a preview deployment against the High-risk requirements, plus manual accessibility checks (screen reader, 200 % zoom, reflow) | Signed UAT record (*Organisational*) |

## Acceptance criteria for a release

1. Every CI step passes on the release commit, with no skipped or retried tests.
2. Every requirement marked `Test` has passing evidence; every `Review` requirement touched by
   the change is confirmed in the pull request checklist.
3. No open deviation of risk H.
4. The changelog entry and version tag exist.

## Deviations

A failing check, a test changed to pass, or a requirement that cannot be met is a deviation. It is
recorded as an issue labelled `deviation` with impact, root cause and resolution, and linked from
the pull request that closes it.

## Periodic review

Yearly, or when a supplier (hosting, database, model) changes materially: re-run the full
verification, review the requirements and the risk classes, and update the supplier assessments
(*Organisational*).
