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

Reproduction steps (per persona, identical pipeline):

1. **Diff setup.** Personas review the diff text itself, so the minimal setup
   is simply `site/assets/agents/demo-change.diff`. To reproduce the planted
   tree instead, apply it in a scratch git repo — the three `new file` hunks
   create `src/billing.ts`, `src/report.py`, and `src/UserList.tsx`
   themselves; only the `src/types.ts` hunk needs the pre-diff file present:

   ```bash
   git init scratch-repo && cd scratch-repo && mkdir src
   # src/types.ts BEFORE the diff (5 lines):
   #   export interface Account { id: string;
   #     status: string;   // "trial" | "active" | "suspended"
   #     suspendedAt?: Date | null; }
   git apply --check /path/to/demo-change.diff && git apply /path/to/demo-change.diff
   ```

2. **Persona invocation.** Launch a coding agent with the persona file
   `agents/<agent-id>.md` from this repo as its system prompt and instruct it
   to review exactly the files in `demo-change.diff` (no other scope). The
   persona's own process then drives the run: read the diff, read surrounding
   context, apply its review checklist CRITICAL→LOW, pass its pre-report
   gate, and emit its standard output format. For `type-design-analyzer` the
   instruction is to analyze the type changed by the diff (`Account.status`).

3. **Rendering to `run.html`.** The agent's emitted review (its standard
   output format: findings with severity/file/issue/fix, summary table,
   verdict) is rendered verbatim into `<agent-id>/run.html` — a static,
   dependency-free HTML page, no content added or reworded. `run.html` is the
   faithful, diffable record of that run; given the same persona rubric and
   diff, a re-run produces the same findings.

4. **Capture.** Serve this directory: `npx --yes serve site/assets/agents`
   (or any static server) and screenshot the rendered page:
   `playwright-cli open http://localhost:3000/<agent-id>/run.html && playwright-cli resize 1180 1000 && playwright-cli screenshot body --filename <agent-id>.png`
   (any equivalent tool works; the viewport is 1180 px wide, body element).

5. **Commit.** The PNG is committed as-is; no crop or recompression step was
   needed — all captures are under the 256 KB still budget and ≤ 1200 px wide.

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
