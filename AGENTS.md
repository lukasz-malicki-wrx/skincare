<!-- COMMENT hash: x5 -->
<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Writing frontend code in apps/web

These rules apply whenever you add or change React code here. They exist because large screens
tend to grow one `useState`, one prop and one inline handler at a time until every change
becomes expensive.
The detailed signals, examples and reasoning are in `skills/fe-review/references/checklist.md`,
and this repository's utilities and tooling facts in `skills/fe-review/references/project.md`;
this file is the short version.

## Before writing a new hook, component or helper

Search for an existing one first and reuse it when the semantics match.
`skills/fe-review/scripts/shared-inventory.sh [word ...]` lists or searches every exported name
in the shared folders and `packages/api-contract` in one call. The usual places:

- hooks: `src/hooks`, `src/utils/hooks`, `src/providers/*/hooks`, feature `use*.ts` files,
  and the installed `usehooks-ts`;
- components: `src/components/{atoms,molecules,organisms}` (dialogs, confirmation via
  `useDialogStore`, loading/error/empty states, detail items, form fields);
- functions and schemas: `src/utils`, `src/lib`, `src/api/utils`, `packages/api-contract`
  (validators and zod schemas shared with the server), `lodash`, `date-fns`.

If the existing one is close but not right, extend it rather than fork it. If you deliberately
write your own, leave a `/** ... */` comment saying why the shared one does not fit.

## Custom hooks - extract when there is a reason

Extract a `useXxx` hook when a component holds a cohesive group of state, effects, refs and
handlers serving one concern (a keyboard listener with its toggle, a debounced input, polling,
a persisted preference, column visibility, a submit flow with preview and notice), when the same
hook combination appears in a second component, or when the logic needs a test without
rendering the whole screen.

Do not extract for the sake of it: one `useState` in a view is not a reason, and neither is a
wrapper that only renames a library hook. Put the hook next to the feature; move it to
`src/utils/hooks` only when a second feature needs it. Return a small named object, and add a
`renderHook` test when the hook carries a rule.

## Avoid props drilling

Do not pass a prop through a component that does not use it. Prefer, in this order:

1. The component that needs the data reads it itself: the same `useXxxQuery` hook (TanStack
   Query dedupes by key, so there is no second request), a zustand selector, or URL state.
2. View, tab, filters, sort, search and page live in the URL through `nuqs`
   (`useQueryStates` with validated parsers, `NuqsAdapter` is mounted in `routes/router.tsx`),
   not in `useState` passed down.
3. A thin `XxxContainer` next to a presentational component calls the hooks and renders it.
4. A dialog owns its queries and mutations; the parent passes `projectId`, `onClose` and the
   outcome it cares about - not data, loading flags and `onCreate/onUpdate/onDelete`.
5. Composition (`children` or a slot prop) when a layout component only positions content.
6. React context only for values that are genuinely page-global and read far away.

## Related rules

- Several overlays: one discriminated-union state (`{ type: 'edit'; nodeId } | ... | null`),
  not one boolean per dialog. Store ids, not entity snapshots.
- Don't store what you can derive; don't copy server data into `useState`. Use functional
  updates (`setItems((current) => [...current, item])`) and never mutate state or query data.
- Define components at module level, never inside another component's body (it remounts every
  render and loses state and focus). Keys are stable ids, not array indexes.
- Server data through the `api/<domain>` query hooks, not `fetch`/`apiRequest` in `useEffect`.
  Effects that subscribe return a cleanup.
- No anonymous functions as props to components: pass a named handler, wrapped in
  `useCallback` when it reaches a `memo` child, a dependency array, a context value or TanStack
  column definitions (there is no React Compiler here). Inline arrows on plain DOM elements are
  fine.
- Business rules, message building and mapping go to pure functions in the feature folder with
  a table-driven `*.test.ts` next to them, not inline in components or JSX.
- API errors: `isAxiosError`, `getApiErrorMessage` (`src/api/utils/get-api-error-message.ts`),
  `useApiErrorParser` for form fields - no hand-written casts of `error.response`.
- Zustand: select only what you use (`useStore((s) => s.field)`); several fields through
  `useShallow` from `zustand/react/shallow` - never `const { a, b } = useStore()`.
- No new `any`: use types from `@repo/api-contract`, `z.infer`, or `unknown` with narrowing.
  No `console.log` or commented-out code. Neither CI nor the pre-commit hook runs ESLint, so nothing else stops them.
- A one-statement `if` is a single line without braces: `if (dateFilter) filters.push(dateFilter);`.
  Use a block only when the body is more than one statement.
- Conditional class names through `cn()` (`src/lib/utils/cn.ts`); colours from Tailwind theme
  tokens or the CSS variables of the design the screen uses, not `#hex` values.
- HTML from data only through the `SafeHtml` atom or `DOMPurify.sanitize`. No tokens or personal
  data in URLs, `localStorage` or logs. Hiding a button is not access control - check that the
  route and the API enforce the same permission.
- A new pure module or rule-carrying hook gets a `*.test.ts` next to it.

## Before you finish

Review your own diff with the `fe-review` skill (`skills/fe-review/SKILL.md`) and fix what it
reports as a defect or as introduced by your change.
