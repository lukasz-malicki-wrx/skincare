# Change control

Every change, including documentation and configuration, follows the same path. Nothing is
committed directly to `main`.

1. **Request.** An issue describes the change, the requirements it touches (IDs from
   [requirements.md](requirements.md)) and its risk. A change of intended use also updates
   [system-description.md](system-description.md).
2. **Implement.** A branch with the code, the tests (titles start with the requirement ID) and the
   updated documents. New or changed requirements are added to `requirements.md` and the matrix
   is regenerated (`node scripts/check-traceability.mjs --matrix > docs/compliance/traceability-matrix.md`).
3. **Review.** A pull request using the template in `.github/pull_request_template.md`, reviewed and
   approved by a code owner who is not the author. The reviewer confirms every `Review`
   requirement the change touches.
4. **Verify.** CI must pass: types, lint, unit and integration tests, traceability, build,
   end-to-end and WCAG 2.1 AA tests. The e2e report is kept as evidence.
5. **Release.** Merge to `main`, add the changelog entry, tag the version (`vX.Y.Z`), deploy from
   the tag. The deployment record is *Organisational*.

## Required repository settings (*Organisational*)

- Branch protection on `main`: pull request required, one approving review from a code owner,
  CI required, no force pushes, no bypass for administrators.
- Signed commits or verified committer identity.
- Secrets (`ANTHROPIC_API_KEY`, `TURSO_*`) only in the hosting provider's encrypted settings;
  changes to them are recorded as a change request.

## Emergency changes

A fix that cannot wait for full review may be merged with one reviewer and passing CI; a
retrospective review and a deviation record follow within two working days.
