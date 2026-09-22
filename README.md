# Issue-to-PR Skills

**An end-to-end delivery pipeline for AI coding agents: from raw idea to merged PR to visual showcase.**

Ten station skills carry one GitHub issue from intake through planning, building, review, merge, cleanup, and presentation — with 33 supporting skills and 18 specialist reviewer agents packed in, so the pipeline works out of the box.

```
[Station X]    x-workflow-issue        Discovery & Orchestrator (lists, prioritizes, drives II–VII)
      │
      ▼
[Station I]    i-create-issue          Raw idea → researched GitHub issue (ready-for-agent)
      │
      ▼
[Station II]   ii-plan-issue           Define & Plan (right-sizing, spec, constraints, tasks/plan.md)
      │
      ▼
[Station III]  iii-build-plan          Build (TDD per task, atomic commits, auto-resolvers)
      │
      ├── corrections on fresh build ──► [Station IIIB] iiib-iterate-after-build
      │        (human feedback fix loop, no push)
      ▼
[Station IV]   iv-review-build-and-pr  Review & Ship (proof gate, OCR scan, specialist
      │        reviewers + Spec axis, verification gate, push, PR + @coderabbitai trigger)
      │  trigger handoff: waits for the trigger ack, classifies it
      │  (triggered / rate-limited / other / no ack), passes status to V
      ▼
[Station V]    v-babysit-pr-and-merge  Babysit & Merge (1-round review tracking,
      │        reuse-first fallback on rate limit, squash merge, pull base)
      ▼
[Station VI]   vi-prune-artifacts      Prune (sweep stale per-issue plans & scratch)
      │
      ▼
[Station VII]  vii-present-pr          Present (standalone visual HTML showcase + verification guide)
```

`pipeline-triage` sits at the entry: dirty repo, open PR, or unclear intent — it inspects git state and routes to the right station.

## Why this pipeline exists

AI coding agents default to the shortest path: skipping specs, tests, and reviews. Each station here is a narrow contract with entry conditions, verification gates, and a plain-English report — so nothing ships on "seems right". Key design choices:

- **Proof before review.** Station IV refuses to review unproven code; Station III refuses to ship unverified builds.
- **Never invent.** A reviewer persona missing from disk is skipped and recorded, never simulated. A missing trigger acknowledgement is reported honestly, never assumed.
- **Spec axis runs separately.** "Follows every standard but implements the wrong thing" is a different finding from "implements correctly but breaks standards" — they are never merged.
- **Quota-conscious reviews.** One review round per PR, with a reuse-first fallback when the review bot is rate-limited.
- **The issue is the star.** Reports open with the issue and its plan; machinery stays in `tasks/plan.md`.

## Installation

**Any agent, one command** (via the open [skills CLI](https://github.com/vercel-labs/skills)):

```bash
npx skills add AI-Degen-69/issue-to-pr-skills            # install everything
npx skills add AI-Degen-69/issue-to-pr-skills --list     # browse before installing
```

Or grab one station:

```bash
npx skills add AI-Degen-69/issue-to-pr-skills --skill iv-review-build-and-pr
```

**Manual install:** copy `skills/<name>/` into your project's skills directory (e.g. `.agents/skills/`, `.claude/skills/`, `~/.config/opencode/skills/`) and `agents/*.md` into your agent personas directory. See [docs/getting-started.md](docs/getting-started.md).

**Requirements:** `gh` (GitHub CLI, authenticated) for issue/PR stations; `git`; a CodeRabbit account for the Station IV/V review loop (optional — the pipeline degrades to agent fallback reviews without it).

## The stations

| Station | Skill | Slash command | Purpose |
|---|---|---|---|
| Entry | `pipeline-triage` | n/a (auto) | Dirty-repo triage: inspects git state, routes to the right station |
| X | `x-workflow-issue` | `/x-workflow-issue` | Discovery (backlog map + order) and orchestrator driving II–VII |
| I | `i-create-issue` | `/i-create-issue <idea>` | Raw thought → researched `ready-for-agent` issue |
| II | `ii-plan-issue` | `/ii-plan-issue` (or `<id>`) | Right-sizing, stack detection, `CONSTRAINTS.md`, `tasks/plan.md` |
| III | `iii-build-plan` | `/iii-build-plan auto` | TDD build per task, atomic commits, error resolvers |
| IIIB | `iiib-iterate-after-build` | `/iiib-iterate-after-build` | Human-feedback fix loop, local only, no push |
| IV | `iv-review-build-and-pr` | `/iv-review-build-and-pr` | Review, verify, push, open PR, trigger + classify review ack |
| V | `v-babysit-pr-and-merge` | `/v-babysit-pr-and-merge` | Track review, triage comments, squash merge, sync base |
| VI | `vi-prune-artifacts` | `/vi-prune-artifacts` | Sweep stale per-issue scratch, preserve knowledge |
| VII | `vii-present-pr` | `/vii-present-pr <id>` | Visual HTML showcase + manual verification guide |

Full station contracts: [docs/pipeline.md](docs/pipeline.md).

## Supporting skills (33)

Grouped by role. Each activates automatically when its station needs it — or invoke directly.

**Build:** `test-driven-development`, `incremental-implementation`, `source-driven-development`, `doubt-driven-development`, `context-engineering`, `planning-and-task-breakdown`, `using-agent-skills`
**Define:** `interview-me`, `idea-refine`, `spec-driven-development`, `constraint-driven-development`
**Verify:** `browser-testing-with-devtools`, `debugging-and-error-recovery`, `diagnosing-bugs`, `verification-before-completion`, `click-path-audit`
**Review:** `code-review-and-quality`, `code-simplification`, `security-and-hardening`, `performance-optimization`, `documentation-and-adrs`, `extract-design-system`
**Ship:** `git-workflow-and-versioning`, `ci-cd-and-automation`, `deprecation-and-migration`, `observability-and-instrumentation`, `shipping-and-launch`
**Frontend:** `frontend-ui-engineering`, `tailwind-design-system`, `web-design-guidelines`, `vercel-react-best-practices`, `vercel-composition-patterns`
**API:** `api-and-interface-design`

## Reviewer agents (18)

Specialist personas dispatched by Stations II–V based on the diff. A persona missing from disk is skipped and recorded — never simulated.

| Agent | Role |
|---|---|
| `code-reviewer` | General code quality, five-axis review |
| `security-reviewer` | Vulnerabilities, auth, secrets |
| `python-reviewer` | Python: asyncio, typing, PEP 8 |
| `typescript-reviewer` | TS/JS: types, async, Node security |
| `react-reviewer` | React: hooks, a11y, RSC, render performance |
| `go-reviewer` | Go: goroutines, errors, interfaces |
| `rust-reviewer` | Rust: lifetimes, unsafe, borrowing |
| `database-reviewer` | SQL/ORM: N+1, indexes, migrations |
| `silent-failure-hunter` | Swallowed errors, empty catches, lost traces |
| `tdd-guide` | Write-tests-first enforcement |
| `build-error-resolver` | Generic build/compile failures |
| `react-build-resolver` | React build failures |
| `go-build-resolver` | Go build failures |
| `rust-build-resolver` | Rust build failures |
| `refactor-cleaner` | Dead code removal with proof |
| `type-design-analyzer` | Interface/domain-model design |
| `code-explorer` | Execution-path tracing in unfamiliar code |
| `doc-updater` | Docs drift after behavior changes |

## How skills work

Every skill follows the same anatomy: `SKILL.md` with frontmatter (`name` + `description` trigger surface), invocation, step-by-step protocol, guardrails, and a chat output contract. Detail lives in `references/` (loaded on demand); each skill with tests ships `evals/evals.json`. Verification is non-negotiable — every station ends with evidence (tests, build output, or runtime data), never "seems right".

## Contributing

Skills must be **specific** (steps, not advice), **verifiable** (exit criteria with evidence), and **minimal** (only what guides the agent). See [CONTRIBUTING.md](CONTRIBUTING.md).

## License

MIT — see [LICENSE](LICENSE).
