# Changelog

All notable changes are listed here. Versions follow [Semantic Versioning](https://semver.org);
each release is a git tag `vX.Y.Z` deployed from `main` (see docs/compliance/change-control.md).

## [Unreleased]

### Added
- Append-only audit trail for sign-up, sign-in, sign-out, subscription changes and account
  deletion, written in the same transaction as the change and included in the data export.
- End-to-end and WCAG 2.1 AA tests (Playwright, axe-core) in CI, with the report kept as evidence.
- Requirements with IDs, generated traceability matrix and a CI check that every testable
  requirement has a test.
- Compliance documentation in `docs/compliance`, CODEOWNERS, pull request template, security policy.

### Changed
- English URLs under `/app`; former `/aplikacja/*` addresses redirect permanently.
- Accent colour darkened for text and buttons to meet WCAG AA contrast.
- Account deletion runs as one transaction.
- Dependencies pinned to exact versions.

### Fixed
- The report carousel can be focused and scrolled from the keyboard (WCAG 2.1.1).
- The installed app no longer locks the screen to portrait (WCAG 1.3.4).
