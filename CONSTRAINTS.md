# Quality Guardrails & Constraints — Issue #24

## Zero Regressions & Accuracy
- `skills/` must contain exactly the 46 pipeline-invoked skills documented in the canonical Skill-Call Map (`~/.agents/docs/issue-to-pr-skill-workflow.md`): 10 pipeline stations + 36 supporting skills. `agents/` holds 17 reviewer personas.
- Every mirrored skill directory must be a byte-identical copy of its upstream source in `~/.agents/skills/`, **after** the documented path rewrites in `scripts/sync-from-canonical.js` (canonical `docs/issue-to-pr-skill-workflow.md` is published here as `docs/pipeline.md`). Both `verify-mirror.js` and `sync-from-canonical.js` apply the same `REWRITE` table — keep them in step.
- No merging or selective editing of mirrored files. Upstream is the single source of truth.
- The 4 retired skill directories must be completely removed.

## Scope Discipline
- Strictly touch only `skills/` and the mirror scripts (plus planning docs under `tasks/` and `CONSTRAINTS.md`).
- Do NOT touch `agents/`, `docs/`, `.claude/commands/`, or `site/`.
- Working tree outside `skills/` and `scripts/` must remain untouched.

## Dependencies & Platform Standards
- The mirror scripts must be ES modules using only Node built-in modules (`node:fs`, `node:path`, `node:os`, `node:crypto`).
- Path separators must be normalized across platforms (`/`).
- Must pass `node scripts/verify-mirror.js` with `OK: 46 skills, byte-identical to source`.
- Must pass `node scripts/sync-from-canonical.js --check` (no station drift).
- Must pass `npm run validate` (all 46 skills valid).
