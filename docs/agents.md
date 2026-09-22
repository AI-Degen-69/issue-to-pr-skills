# Agents — Reviewer Personas

Specialist personas dispatched by Stations II–V based on the diff. A persona missing from disk is skipped and recorded — never simulated.

## Dispatch Rules

1. Station II detects stack and writes the reviewer set into `tasks/plan.md`.
2. Station IV fans out to diff-matched reviewers in parallel; the Spec axis runs separately.
3. Station V reuses prior review evidence; only new delta is re-reviewed.
4. If `agents/<name>.md` is missing, that reviewer is skipped — not simulated.

## Catalog

| Agent | Role | Triggers on |
|---|---|---|
| `code-reviewer` | General quality, five-axis review | every PR |
| `security-reviewer` | OWASP, auth, secrets | auth, input, secrets in diff |
| `typescript-reviewer` | TS/JS types, async, Node | `*.ts`, `*.js` |
| `react-reviewer` | Hooks, a11y, RSC, perf | `*.tsx`, `*.jsx` |
| `python-reviewer` | asyncio, typing, PEP 8 | `*.py` |
| `go-reviewer` | goroutines, errors | `*.go` |
| `rust-reviewer` | lifetimes, unsafe | `*.rs` |
| `database-reviewer` | SQL/ORM, N+1, indexes | migrations, queries |
| `silent-failure-hunter` | Swallowed errors, lost traces | try/catch, empty handles |
| `tdd-guide` | Write-tests-first | station III per task |
| `type-design-analyzer` | Interface/domain design | API, schema changes |
| `code-explorer` | Path tracing | unfamiliar code |
| `doc-updater` | Docs drift | behavior changes |
| `build-error-resolver` | Generic build failures | build breaks |
| `react-build-resolver` | React build | React build breaks |
| `go-build-resolver` | Go build | Go build breaks |
| `rust-build-resolver` | Rust build | Rust build breaks |
| `refactor-cleaner` | Dead code proof | cleanup |

## Adding a New Agent

Copy the closest `agents/*.md`, keep the role narrow (one stack or axis), and make sure at least one station's routing table can reach it. See [CONTRIBUTING.md](../CONTRIBUTING.md).
