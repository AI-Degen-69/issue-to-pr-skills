# Pipeline Guide (Stations I–VI + Entry, Intake & Ad-hoc)

Project-agnostic development pipeline: one GitHub issue travels from raw idea to merged PR — with an optional ad-hoc visual showcase on request. Works in any repo, any language — each station adapts (stack auto-detection, diff-matched reviewers).

## Entry point

Classify the request once at session start — one router owns a request, max one handoff:

1. Continuation / unclear intent / dirty repo / open PR → `pipeline-triage` (read-only; routes onward).
2. New Issue work, clean repo → `i-pick-issue` (it runs the state gate itself).
3. Ad-hoc (question, small fix, exploration) → `using-agent-skills`.
4. Brand-new idea with nothing to pick → `create-issue` (intake branch), then back to `i-pick-issue`.

Never run two routers on the same request.

## The flow

- **I — Map & Pick** (`i-pick-issue`). Issue work only. Runs the triage gate, then maps the open-issue backlog grouped by domain with a recommended order and one highlighted pick — and halts for operator selection. With an issue number, goes straight to planning it.
- **Intake — Create Issue** (`create-issue`). When there is nothing to pick: research the repo first (real paths with line numbers), capture open questions *in the issue* with a default assumption, publish immediately labeled `ready-for-agent`, then return to I.
- **II — Plan** (`ii-plan-issue`). Claim the issue, auto-detect stack, size it (Tiny/Small/Standard/Large), lock `CONSTRAINTS.md` (zero regressions, anti-cheat, no new deps without approval), write `tasks/plan.md` as atomic vertical slices with verification per task. At most one evidence-based improvement proposal.
- **III — Build** (`iii-build-plan`). One task at a time, TDD, routed by domain tag, simplified, one local commit per task. Never push. Report ends with two paths: all good → IV; corrections → IIIB.
- **IIIB — Iterate** (`iiib-iterate-after-build`). Free-text corrections classified per item (bug / dead button / UI / slow / security), fixed minimally with the matching skill, verified, committed locally. Loops until the operator calls the build clean.
- **IV — Review & ship** (`iv-review-build-and-pr`). Proof-before-review gate first (live browser pass via `playwright-cli`, or tests; failure returns to IIIB). Then OCR delegation scan (deterministic file scope + rules), diff-matched specialist reviewers, and the Spec axis (missing / added-not-asked / implemented-wrong — kept separate from quality findings). Fix locally, re-verify green, push, open the PR, post `@coderabbitai review`, **wait for the trigger acknowledgement and classify it** (triggered / rate-limited with minutes / other reply / no ack, with jump links on any non-clean ack). Handoff carries the trigger status to V.
- **V — Babysit & merge** (`v-babysit-pr-and-merge`). Consumes IV's trigger status (no re-detection). One review round with a 5m-4m-3m-2m-1m countdown; on rate limit, reuse IV's review evidence + delta check before any fresh review. Triage every comment (ACCEPT/REJECT with inline replies), batch fixes into one commit, squash merge on green CI, return checkout to a synced base.
- **VI — Close pipeline** (`vi-close-pipeline`). Confirms the PR is merged, prunes only per-issue scratch whose issue is CLOSED **and** which has zero repo-wide references, updates `PROGRESS.md`, and writes the handoff. Showcases, research, and ADRs are untouchable. Dead *code* goes to `deprecation-and-migration`, not here.
- **Ad-hoc — Present** (`present-pr`). Not part of the automatic chain — run on request after a merge. One standalone HTML file (inline CSS + vanilla JS, no CDN): exactly one centerpiece visual picked for *this* story, customer-simple words, try-it-in-the-real-app guide. Never the same page twice in a row.

## Station reports

Every station closes with a short plain-language chat report in its own template (see each skill's Chat Output Contract): what was done, evidence it works, and the single next step. Reports open with the issue, never with machinery talk.

## Artifact homes

Three homes, never mixed:

1. `tasks/plan.md`, `tasks/todo.md`, `CONSTRAINTS.md` — per-issue planning (pruned by Station VI once merged and closed).
2. `docs/issues/<id>-presentation-<slug>.html` — per-issue visual showcase (`present-pr`, ad-hoc; permanent).
3. Temp scratch (`scratch/`, OS temp) — transient only, never canonical.

## Honesty rules (apply everywhere)

- A reviewer persona missing from disk is skipped and recorded — never simulated.
- A missing trigger acknowledgement is reported as missing — never assumed.
- No review runs on unproven code; no push runs on a red gate.
- Out-of-scope findings become future issue candidates (`NOTICED-BUT-NOT-TOUCHING`) — never silent side changes.
