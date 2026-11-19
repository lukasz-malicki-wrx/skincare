# Accessibility statement

**Target:** WCAG 2.1 level AA. **Status:** partially conformant: all automated checks pass; the
manual checks listed below are still to be done.

## How conformance is checked

- **Automated, on every change:** axe-core with the WCAG 2.1 A and AA rule sets on every screen
  of a production build (`e2e/accessibility.spec.ts`, `REQ-A11Y-01`), in CI.
- **Automated behaviour tests:** keyboard operation of tabs and focus visibility (`REQ-A11Y-02`),
  skip link and page language (`REQ-A11Y-03`), announced and associated form errors (`REQ-A11Y-04`).
- **By design and review:** colour tokens checked for contrast (text accent `#a65434`: 5.1:1 on
  the cream background, 5.3:1 under white text); native controls (`<dialog>`, radio, checkbox)
  instead of ARIA re-implementations; `prefers-reduced-motion` honoured; secondary text only
  through the AA-safe `muted` tone; no orientation lock in the PWA manifest (1.3.4).

## Still to be verified manually

| Check | Success criteria |
| --- | --- |
| Screen reader pass with VoiceOver (iOS) and TalkBack (Android) on the main flow | 1.3.1, 4.1.2, 4.1.3 |
| Text resize to 200 % and reflow at 320 CSS px | 1.4.4, 1.4.10 |
| Text spacing override | 1.4.12 |

## Known limitations

- The landing page and the paywall use fixed pixel type sizes from their design artboards; they
  scale with browser zoom but not with the operating system's text size setting.
- The camera view depends on the device camera; picking a photo from the library is always
  offered as an alternative.

## Feedback

Report an accessibility problem as a repository issue labelled `accessibility`.
