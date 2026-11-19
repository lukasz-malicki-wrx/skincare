<!-- COMMENT hash: x5 -->
<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Project map

SkinCode: a Next.js 16 PWA that turns one skin photo into a report, a care routine with products
within a budget, and a diet list. Single app, no monorepo. Package manager: pnpm.

```
src/
  app/                 routes only: pages, layouts, route handlers, server actions
    (landing)/         marketing page at /
    (pwa)/app/         the app: sign-in/up, onboarding (start/*), tabs ((shell)/today, plan, profile)
    api/*/route.ts     thin model routes: read the request, call src/lib/ai, map the outcome
    actions/           server actions (auth, account, subscription)
  features/<name>/     screens and hooks of one feature: analysis (camera/, report/), plan,
                       skin-profile, account, auth, paywall, today, landing (styled by landing.css)
  components/          UI shared by several features (nav, loading, screen, brand mark)
  hooks/               client hooks shared by several features (localStorage store, last analysis)
  lib/                 pure domain logic and schemas, with *.test.ts next to them
  lib/ai/              every Anthropic call: client, prompts, request helpers for routes
  i18n/                PL/EN dictionaries, locale cookie, LocaleProvider
  config/              routes, navigation, brand tokens
  data/catalog.json    product catalogue (scripts/build-catalog.mjs)
```

Where new code goes:

- One component per file, named after it (`StepCard` in `step-card.tsx`), so each piece can be
  read, imported and tested on its own. Only tight families share a file: `Button`/`ButtonLink`,
  `Tabs`/`TabPanel`, `Spinner`/`InlineLoading`, icon sets. Pure helpers a component needs go to a
  `.ts` module next to it with a test (`report/slides.ts`, `paywall/stage-tone.ts`). A feature
  with many files gets subfolders (`analysis/camera`, `analysis/report`). Avoid import cycles:
  shared constants and lazy loaders get their own module (`plan/plan-options.ts`,
  `plan/lazy-product-dialog.ts`).

- A component or hook used by one feature lives in `src/features/<feature>/`. Move it to
  `src/components` or `src/hooks` only when a second feature needs it.
- `src/lib` never imports from `features`, `components`, `hooks` or `app`. Types a hook and a
  pure module share belong in `lib` (see `PlanSwaps` in `src/lib/plan.ts`).
- A model call never sits in a route handler. Prompts, the SDK call and result validation go to
  `src/lib/ai/<topic>.ts`; the route uses `readAiRequest`, `errorResponse` and
  `aiErrorResponse` from `src/lib/ai/http.ts`. Use the shared `anthropic` client, the model
  constants and `largeModelOptions` from `src/lib/ai/client.ts`.
- Code that must never reach the browser (database, sessions, passwords, `node:crypto`, cookies,
  the Anthropic client) starts with `import "server-only";`. Keep rules the client also needs in a
  separate pure module, as `src/lib/subscription.ts` (rules) and `src/lib/subscription-store.ts`
  (database) do. Tests stub `server-only` through `scripts/test-resolver.mjs`.
- Dates and prices go through `formatDate` and `formatPln` in `src/i18n/format.ts`.
- Use `@/` imports. URLs come from `src/config/routes.ts`, never string literals. Paths are in
  English; the old Polish `/aplikacja/*` paths are permanent redirects in `next.config.ts`.

# Writing code here

The review checklist is `.claude/skills/fe-review/SKILL.md`; this file is its project profile.

## State and data

- There is no query library and no global store. User data that is not on the account
  (analysis, profile, plan swaps, diet, reminders) lives in `localStorage` through
  `useLocalJson` / `readLocalJson` / `writeLocalJson` / `removeLocalJson` from
  `src/hooks/use-local-json.ts`, with a `parseXxx` function from `src/lib` that turns bad data
  into a safe default. The report has its own helpers in `src/hooks/use-stored-analysis.ts`
  (`useStoredAnalysis`, `saveStoredAnalysis`). Never call
  `localStorage.setItem` directly: only these helpers wake the other readers in the tab. Keys are
  `pielegnacja:*` constants exported from `src/lib`.
- Account data (users, sessions, subscription) is in Turso through `src/lib/db.ts`,
  `src/lib/auth.ts` and `src/lib/subscription-store.ts`, read in server components and server
  actions.
- Model results come from `POST /api/*` through `postJson` in `src/lib/api-client.ts`, called
  from a feature hook with an `AbortController` aborted in the effect cleanup (see
  `src/features/analysis/report/use-routine-products.ts`). Keep the error itself in state and turn it
  into text while rendering with `requestErrorMessage(error, messages.errors)`; ignore
  `isAbortError`.
- View choices (tabs, filters) live in the URL through `useSearchParamOption`
  (`src/hooks/use-search-param-option.ts`), so refresh and back keep them.
- Don't store what you can derive; don't copy stored data into `useState`. Use functional
  updates and never mutate state.

## Components and hooks

- Before writing a hook, component or helper, search `src/hooks`, `src/components`,
  `src/features` and `src/lib` for one that already does it, and extend it rather than fork it.
- Extract a `useXxx` hook when a component holds a cohesive group of state, effects and handlers
  for one concern, or when the same combination appears twice. Not for a single `useState`.
- Don't pass a prop through a component that does not use it: let the component read its own
  data (`useStoredAnalysis`, `useLocalJson`, `useMessages`), or use composition.
- Several overlays on one screen: one discriminated-union state, not one boolean per dialog.
- Define components at module level, never inside another component. Keys are stable ids.
- No anonymous functions as props to components; inline arrows on DOM elements are fine.
  There is no React Compiler here, so list items that re-render often are `memo` components fed
  with `useCallback` handlers that take the item (`onSwap(step)`), and the list itself is
  memoised (see `src/features/plan/step-card.tsx`). Don't memo anything else.
- Lazy-load what most visits never need with `next/dynamic` and a literal `import()`: dialogs
  (mounted only while open), secondary tabs, heavy widgets. Give it a `loading` fallback, and
  preload on intent (`onPointerEnter`/`onFocus`) when the user is about to need it.
- Shared building blocks (check `src/components` before writing markup that looks like one):
  - `Button`, `ButtonLink` (Next.js `Link`) and `ExternalButtonLink` from `src/components/button.tsx`
    for every pill button, with `variant` and `size` props. `className` on them is for layout
    only (`flex-1`); a new look is a new variant, not extra classes. These are thin wrappers over
    DOM elements, so inline handlers on them are fine.
  - `ChoiceChip` (`src/components/choice-chip.tsx`) for pick-one or pick-many options: a real
    `radio`/`checkbox` in a `<fieldset>` with a `<legend>`, never `aria-pressed` buttons.
  - `Heading` (`level` for the outline, `variant` for the look) and `Text` (`as`, `variant`,
    `tone`, `weight`) from `src/components/heading.tsx` and `text.tsx` for every piece of copy
    on the type scale; `tone="muted"` is the secondary colour that meets AA, so no `text-ink/NN`
    by hand. `Alert` (`src/components/alert.tsx`) for error and warning boxes. The paywall
    artboard and the landing keep their own pixel sizes.
  - `TextLink` for in-app text links (`inline` is underlined, `standalone` sits on its own line),
    `Card`/`CardLink` for bordered panels (`tone`, `padding`), `Input` for text-like fields,
    `StepNumber`, `MessageScreen` for full-screen messages (errors, not found), and the outline
    icons in `src/components/icons.tsx` on top of `LineIcon`.
  - `ProgressBar` (`src/components/progress-bar.tsx`) for any filled bar; with a `label` it is a
    `progressbar` for assistive tech.
  - `cn` (`src/lib/cn.ts`) for conditional classes, `Tabs`/`TabPanel` (`src/components/tabs.tsx`)
    for any tab switch, `Spinner`/`InlineLoading` for loading states.
- A component owns its variant-to-class map privately; never export a function or constant that
  returns class strings (`buttonStyles`-style helpers let callers skip the component). Related
  components build on each other instead (`Heading` renders `Text`).
- No inline `style` and no class strings kept in constants: look goes into a component prop, a
  Tailwind class (`focus-ring-within` and other `@utility` in `globals.css`) or, on the landing,
  `landing.css` (per-item delays and sizes via `:nth-child`). The one exception is a value known
  only at runtime, such as the fill width inside `ProgressBar`.
- Errors: each app segment has an `error.tsx` rendering `ErrorScreen`; `src/app/global-error.tsx`
  covers the root layout and `src/app/not-found.tsx` unknown URLs. Next 16 passes `retry`.
- Business rules, message building and mapping are pure functions in `src/lib` (or the feature
  folder) with a table-driven `*.test.ts`, not inline in JSX.

## Text, styles, safety

- Every user-facing string goes through `src/i18n/translations.ts` (English is the source of the
  keys, Polish must have the same keys). Client components read it with `useMessages()`, server
  code with `getTranslations()`. Model replies follow the app language through
  `modelLanguageInstruction`.
- Colours and type from the Tailwind theme tokens in `src/app/globals.css` (mirrored in
  `src/config/brand.ts`), not `#hex` values.
- Animations and transitions only through `motion-safe:` (`motion-safe:animate-spin`), never
  overridden later with `!important`. Status messages use `<output>` (`Text as="output"`), not
  `role="status"`. Decorative images are `aria-hidden`; never put `role="img"` on an element with
  content. Component props are `Readonly<...>`.
- GitHub Actions are pinned to full commit SHAs with the version in a comment.
- Accessibility is part of done: real buttons and links, `role="alert"` for errors,
  `role="status"` for loading text, labels on icon buttons, `aria-invalid`/`aria-describedby` on
  failed fields, keyboard support for custom widgets.
- No `dangerouslySetInnerHTML` for data. The landing is plain React components, not raw HTML.
- No tokens or personal data in URLs, `localStorage` keys or logs. Hiding a button is not access
  control: check the session in the page or action (`requireSessionUser`, `hasAccess`).
- No new `any`, no `console.log`, no commented-out code. A one-statement `if` is one line
  without braces.

## Regulated-environment rules

The project is maintained to GxP engineering practice and WCAG 2.1 AA (see `docs/compliance`).

- Every behaviour change maps to a requirement in `docs/compliance/requirements.md`. Tests that
  verify it start their title with the ID (`test("REQ-DI-02 ...")`). Regenerate the matrix with
  `node scripts/check-traceability.mjs --matrix > docs/compliance/traceability-matrix.md`.
- A server-side data change writes its audit entry in the same `db.batch(..., "write")` through
  `auditInsert(auditEvent(...))` from `src/lib/audit-store.ts`. Audit details never hold personal
  data or secrets; `auditEvent` throws if they do. Never update or delete audit rows.
- Server time in UTC (`new Date().toISOString()`) for anything recorded; never the client clock.
- Dependencies are pinned to exact versions (`.npmrc` has `save-exact=true`).
- Comments and documentation are in English. A comment explains why, a constraint or a
  requirement; it never restates what the code already says.
- Add a CHANGELOG entry under "Unreleased" for every user-visible or compliance-relevant change.

## Checks

- `pnpm test` runs `node:test` on `src/**/*.test.ts` (the `@/` alias is resolved by
  `scripts/test-resolver.mjs`). A new pure module or rule-carrying hook gets a test next to it.
- `pnpm check` runs typecheck, lint, unit and integration tests and the traceability check.
  `pnpm test:e2e` runs the Playwright end-to-end and WCAG 2.1 AA suite against a production build
  (`pnpm verify` does all of it). CI runs everything on every push to main and every pull request.
- Before finishing, review your diff with `.claude/skills/fe-review/SKILL.md` and fix what it reports as
  a defect or as introduced by your change.
