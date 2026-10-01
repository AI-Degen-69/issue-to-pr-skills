# Agent Detail Page Captures Recipe

This directory holds the visual evidence for the "See it in action" sections on
the five agent detail pages under `site/agents/` (issue #23). Every capture is a
real run — no mockups, no hand-written fake findings. Each page's capture was
produced by running the persona's actual review process (as defined in
`agents/<agent-id>.md`) against the committed demo diff, rendering the run's
genuine output, and screenshotting the rendered page.

## Shared demo diff

- **File:** `site/assets/agents/demo-change.diff`
- **Provenance:** purpose-built for this issue — a tiny, self-contained
  change-set (4 short files) with planted flaws, one per persona lane. No
  third-party, private, or customer code appears anywhere in it.
- Flaws planted per file: `src/billing.ts` (console.log of card data, `any`
  types, `card.token!`, async-in-`forEach`), `src/report.py` (f-string SQL,
  bare `except:`, mutable default arg, missing hints), `src/UserList.tsx`
  (empty `useEffect` dep array, `key={index}`, clickable `div`, no fetch error
  path), `src/types.ts` (free-form `status: string`).

## Per-capture recipe (identical steps for all five)

| Agent | Run page (committed) | Capture | Size |
|---|---|---|---|
| code-reviewer | `code-reviewer/run.html` | `code-reviewer/review-findings.png` | 1080×1020, ~122 KB |
| python-reviewer | `python-reviewer/run.html` | `python-reviewer/review-findings.png` | 1080×1024, ~128 KB |
| typescript-reviewer | `typescript-reviewer/run.html` | `typescript-reviewer/review-findings.png` | 1080×963, ~124 KB |
| react-reviewer | `react-reviewer/run.html` | `react-reviewer/review-findings.png` | 1080×936, ~125 KB |
| type-design-analyzer | `type-design-analyzer/run.html` | `type-design-analyzer/review-findings.png` | 1080×535, ~56 KB |

Reproduction steps:

1. Serve this directory: `npx --yes serve site/assets/agents` (or any static
   server) and open `http://localhost:3000/<agent-id>/run.html`.
   `run.html` is the verbatim rendered output of that persona's review of
   `demo-change.diff`, produced by following the process in
   `agents/<agent-id>.md` (scope via the matching `git diff` path filter,
   checklist applied CRITICAL→LOW, pre-report gate, standard output format).
2. Screenshot the rendered page with Playwright:
   `playwright-cli open http://localhost:3000/<agent-id>/run.html && playwright-cli resize 1180 1000 && playwright-cli screenshot body --filename <agent-id>.png`
   (any equivalent tool works; the viewport is 1180 px wide, body element).
3. The PNG is committed as-is; no crop or recompression step was needed — all
   captures are under the 256 KB still budget and ≤ 1200 px wide.

## Provenance & drift

- The capture content is the personas' deterministic checklist applied to the
  committed `demo-change.diff`; `run.html` (committed next to each PNG) is the
  exact rendered run, so every capture can be re-derived or diffed.
- Captures were produced against the tree containing the demo diff as committed
  with this recipe (see the PR that carries this change for the exact commit).
- When `agents/<agent-id>.md` evolves its rubric, re-run the steps above and
  refresh both `run.html` and the PNG (manual follow-up; no automation).

## Portability & privacy audit

- No usernames, home/machine paths, tokens, private repo or customer names in
  any capture, run page, or the demo diff — checked file by file before commit.
- All paths shown inside the captures are project-relative demo paths
  (`src/billing.ts`, `src/report.py`, `src/UserList.tsx`, `src/types.ts`).
- Budgets: stills ≤ 256 KB ✔, width ≤ 1200 px ✔; no GIFs shipped, so no
  `prefers-reduced-motion` poster is required.
