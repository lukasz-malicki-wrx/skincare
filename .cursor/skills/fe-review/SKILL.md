---
name: fe-review
description: Review React frontend changes - defects first, then the structural problems that make components hard to change - piles of useState, parallel dialog flags, props drilling, business logic inside views, logic that should be a custom hook, code that re-implements an existing hook/component/util, anonymous functions passed as props that cause re-renders, whole-store state reads, new `any`, unsafe HTML and UI-only permission checks, hand-rolled API error handling, list/filter state that belongs in the URL, and components that keep growing. Use whenever someone asks to review, check or audit frontend/web/React code, a branch, a PR or a commit that touches the frontend app - "zrób review FE", "przejrzyj zmiany we froncie", "review this component", "czy ten widok jest OK", "check my PR before I push" - even if they do not say "architecture". Diff-scoped by default. Not for end-to-end test specs or backend code.
---

# Frontend review

Large screens rarely become hard to change in one commit. They grow one `useState`, one prop and
one inline handler at a time: a flag per dialog, a dialog whose parent fetches and mutates for
it, the same error parsing copied into every handler, filters lost on refresh, hand-written logic
next to a hook that already did the job. None is a bug on the day it lands; each makes the next
change slower, and they compound - so the cheapest moment to point them out is the change that
introduces them.

Structure is the focus, but not at the expense of correctness: report defects the change
introduces or touches first. You don't need to hunt for bugs across the codebase.

**Write the report in the language of the request** (a Polish request gets a Polish report), even
though this skill and the code are in English.

## 0. Load the project profile

Read [references/project.md](references/project.md) first. It names the frontend app and its
paths, the shared hooks, components and utilities to point at, tooling facts that change severity
(React Compiler or not, state library version, what CI enforces) and the team's conventions.
Everything below is generic; the profile makes it concrete. If the profile is missing, infer the
same facts from the repository before reviewing.

## 1. Scope and depth

`<app>` is the frontend app path from the profile, `<base>` its main branch.

| Request                      | Command                                                                                                         |
| ---------------------------- | --------------------------------------------------------------------------------------------------------------- |
| current branch               | `git diff --merge-base <base> --stat -- <app>`, then the diff                                                   |
| a PR                         | `gh pr diff <number>`                                                                                           |
| a commit                     | `git show --stat <sha> -- <app>`, then `git show <sha> -- <app>`; old file versions via `git show <sha>:<path>` |
| a file or folder ("audit X") | read it whole; everything is in scope                                                                           |

Skip test, story and generated files for structural findings (a missing test for a defect is
still worth a line). Pick the depth from the size of the change - most of the review time goes
into reading and searching, so don't spend it where it can't pay off:

- **Small** (up to ~50 changed lines, 1-3 files): read the touched components, run the quick scan
  (step 4). Skip the inventory unless the diff adds a new hook/helper/component, skip existing
  debt, don't follow data into other packages.
- **Medium / large**: read every touched component in full - most problems are properties of the
  whole component (how many `useState`s, how many props). Run the inventory once (step 3).
  Collect existing debt (max ~5).
- **Follow the data** into shared contracts, API payloads or the server only when the diff
  changes a schema, a payload the component builds, or a permission check - then confirm create,
  update and read agree.

Read files in parallel where you can; don't re-read a file you already have.

## 2. Classify each finding by what the diff did

- **Defect** - behaviour is wrong under a realistic scenario: lost input, stale or invalid data
  sent or saved, a rule enforced on one path but not another, a state combination that breaks
  the UI, unsanitised HTML, sensitive data in URLs/storage/logs, a write permission enforced only
  by hiding UI. Top section, whatever category it came from; say how confident you are and what
  you did not verify.
- **Introduced** - the diff creates a structural problem. _Should fix_.
- **Adds to** - the problem existed and the diff grows it (the 11th `useState`, the 18th prop,
  another copy of the same `try/catch`). _Should fix_; the author is asked not to deepen the
  hole, not to fix the file - suggest extracting just the part the diff touches.
- **Pre-existing** - in a touched file, unchanged. _Existing debt_, briefly, never blocking.

## 3. Look for what already exists

For each new hook, helper, component or larger block in the diff (skip one-liners), check
whether the app already has it. One call gives the map (folders come from the profile's _Inventory settings_):

```bash
skills/fe-review/scripts/shared-inventory.sh             # shared exports + component group folders
skills/fe-review/scripts/shared-inventory.sh debounce money permission   # search by words
```

The search covers every exported name in the app source and in the extra folders the profile
lists (for example shared contracts). Before reporting a match, read it: same semantics and edge
cases, not just the same name. Also look the other way - a block the diff copies from elsewhere
in the diff or feature folder is a candidate for one shared hook, component or function.

## 4. Quick scan

Go through the touched code with this table. Only when a row matches, open that section of
[references/checklist.md](references/checklist.md) for the BAD/GOOD example, the reasoning and
the fix - and the profile for the project's utility to name. Don't read the whole checklist up
front. Numbers are prompts to look closer, not rules.

| #   | Category             | Look for                                                                                                                                                                                                               |
| --- | -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | State shape          | 5+ `useState`; a flag/id per dialog; setters always called together; derived or server data stored in state; `setX(x + 1)` in stable callbacks; mutating state or query data                                           |
| 2   | URL state            | view/tab/filters/sort/search/page in `useState`                                                                                                                                                                        |
| 3   | Props drilling       | props only passed through; parent fetching/mutating for a dialog; `xxxProps` objects repeating props; 10+ props                                                                                                        |
| 4   | Custom hook          | state + effects + refs + handlers serving one concern; same hook combo in two components. Not for one `useState`                                                                                                       |
| 5   | Reuse                | new code duplicating an inventory item or a shared schema; class names built by hand instead of the project's helper; hard-coded colours where tokens exist                                                            |
| 6   | Logic in views       | message building, mapping, calculations, business rules inline in components/JSX                                                                                                                                       |
| 7   | Error handling       | hand casts of unknown errors; repeated `try/catch → toast → rethrow`                                                                                                                                                   |
| 8   | Data layer / effects | queries or raw requests in pages; fetch in `useEffect`; async effects without cancellation; subscriptions without cleanup; hooks needing a missing provider                                                            |
| 9   | Size                 | one component doing data, dialogs, navigation, effects and layout                                                                                                                                                      |
| 10  | Render identity      | anonymous functions or fresh objects as props to components; whole-store reads; a component defined inside a component; `key={index}` on mutable lists                                                                 |
| 11  | JSX duplication      | the same long class string or wrapper repeated                                                                                                                                                                         |
| 12  | Types / leftovers    | new `any`, debug logging, commented-out code                                                                                                                                                                           |
| 13  | Security             | unsanitised `dangerouslySetInnerHTML`; `javascript:` URLs; sensitive data in URL/storage/logs; UI-only access control. Defects                                                                                         |
| 14  | Tests                | new pure module or rule-carrying hook without a unit test                                                                                                                                                              |
| 15  | Form normalization   | `Number(x)` or `''` checks in mappers instead of the form schema; `Number('')` turning a cleared optional field into `0`; `.optional()` outside `z.preprocess`; a cleared field sent as `undefined` on update. Defects |

## 5. Verify before you write

For each candidate finding, reread the lines you will cite. Drop anything you can't point to,
anything a comment in the code already justifies (step 6), and "improvements" that only move
code around. A short review with three real findings beats a long one with ten guesses.

## 6. What not to flag

- **Evidence.** No finding without `path:line` (or a quoted line) you actually read. No defect
  without a concrete scenario.
- **Documented trade-offs.** A comment explaining _why_ (a dialog mounted only while open, a
  query that keeps previous data, a ref for stable callbacks, a hook written by hand because the
  shared one misbehaved) records a decision someone paid for. Challenge it only with a concrete
  reason it no longer holds, and never suggest deleting the comment in a refactor.
- **Style the linter owns** (formatting, import order) and naming bikesheds.
- **Speculative abstraction.** Two similar lines are not duplication; a hook wrapping a single
  `useState` is not an improvement; don't propose a generic hook for a single use unless it
  makes the component clearly easier to read or test.
- **Context as the default cure for drilling.** Prefer components that read their own data and
  thin containers (checklist §3) unless the profile says otherwise. Suggest context only for
  values that truly are page-global and read by many distant components.

## 7. Report

Keep code identifiers, paths and rule names as they are. Do not rewrite code; point at the fix in
one or two lines and name the existing hook, component or util to use, with its path.

Use this structure:

```markdown
## FE review: <branch / PR / commit / path>

<1-2 sentences: what the change does and the overall verdict.>

### Defects

1. **<short title>** - `path/to/File.tsx:123`
   <Scenario that goes wrong, concretely.> <Confidence / what was not verified.>
   → <Fix in 1-2 lines.>

### Should fix

1. **<Category>: <short title>** - `path/to/File.tsx:123` (introduced | adds to)
   <What is wrong, concretely - counts, names.> <Why it matters here.>
   → <Fix in 1-2 lines, naming the existing hook/component/util and its path.>

### Suggestions

- `path:line` - <smaller improvement, one line each>

### Existing debt (not blocking)

- `path` - <one line each, max ~5>
```

Rank by impact within each section. Omit empty sections. If the diff is clean, say so in one
sentence rather than inventing findings - a short "nothing to flag" is a valid and valuable
result.
