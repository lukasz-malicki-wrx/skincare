## Change

<!-- What changes and why. Link the issue. -->

## Requirements

<!-- IDs from docs/compliance/requirements.md that this change adds, changes or touches. -->

- [ ] Requirements and the traceability matrix are updated (or no requirement changes)
- [ ] New or changed behaviour has tests whose titles start with the requirement ID

## Risk

- [ ] Low — no effect on data integrity, security or model output
- [ ] Medium — a core function changes
- [ ] High — data integrity, security, audit trail or model output changes (two reviewers)

## Review checklist

- [ ] Server-only code keeps `import "server-only"` (REQ-SEC-01)
- [ ] No secrets or personal data in URLs, logs or audit details (REQ-SEC-03)
- [ ] Data changes write their audit entry in the same transaction (REQ-DI-02)
- [ ] UI changes keep WCAG 2.1 AA: keyboard, focus, labels, contrast (REQ-A11Y-*)
- [ ] Model output stays cosmetic guidance with the dermatologist referral (REQ-AI-04)
- [ ] CHANGELOG.md has an entry under "Unreleased"
