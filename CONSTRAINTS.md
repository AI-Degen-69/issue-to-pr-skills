# Quality Guardrails & Constraints — Issue #24

## Zero Regressions & Accuracy
- `skills/` must contain exactly the 46 pipeline-invoked skills documented in the canonical Skill-Call Map (`~/.agents/docs/issue-to-pr-skill-workflow.md`).
- Every mirrored skill directory must be a byte-identical copy of its upstream source in `~/.agents/skills/`.
- No merging or selective editing of mirrored files. Upstream is the single source of truth.
- The 4 retired directories (`i-create-issue`, `vi-prune-artifacts`, `vii-present-pr`, `x-workflow-issue`) must be completely removed.

## Scope Discipline
- Strictly touch only `skills/` and `scripts/verify-mirror.js` (plus planning docs under `tasks/` and `CONSTRAINTS.md`).
- Do NOT touch `agents/`, `docs/`, `.claude/commands/`, or `site/`.
- Working tree outside `skills/` and `scripts/` must remain untouched.

## Dependencies & Platform Standards
- `scripts/verify-mirror.js` must be an ES module using only Node built-in modules (`node:fs`, `node:path`, `node:os`, `node:crypto`).
- Path separators must be normalized across platforms (`/`).
- Must pass `node scripts/verify-mirror.js` with `OK: 46 skills, byte-identical to source`.
- Must pass `npm run validate` (all 46 skills valid).
