# CONSTRAINTS — Issues #48 and #52: an honest gate, and a portable pack

## Scope (locked)
- `scripts/content-rules.js` (new — the single rule set), `scripts/drift-policy.js`,
  `scripts/sync-from-canonical.js`, `scripts/verify-mirror.js`,
  `scripts/content-rules.test.js` (new), `scripts/drift-policy.test.js`,
  `AGENTS.md` wording, `SPEC.md`, this file, `package.json` (`check` / `check:strict`).
- Must NOT modify: anything under `skills/`, `agents/`, `site/` content,
  `validate.js`, `validate-links.js`, `server.js`, the count of 46 skills or 10
  localized stations.
- Deliberately NOT built: a localized-station drift collector in `verify-mirror.js`
  (#48) — `agents-home#2` makes localized stations byte-syncable, after which the
  exception has nothing to check. Recorded in `SPEC.md` so it is not rebuilt later.

## Behavior (locked)
- `npm run check` exits non-zero when `validate`, `validate:mirror` or
  `version:check` fails. npm scripts must work under both `sh` and `cmd.exe`:
  no brace groups, no shell-specific syntax in `package.json`.
- Drift is reported in three buckets that are never merged, because each answers a
  different question and the reason printed must be true for every file in it:
  `blocking` (mirrored skill that drifted) · `blocked` (localized file the sync
  guard refuses to copy) · `stale` (localized file sync would copy, pack is behind).
  `blocking` always fails; the two localized buckets fail only under `--strict`.
- What may be published lives in ONE module. `blocksSync()` is applied before a
  copy, `contentViolation()` after publication, so a file can never land in the pack
  only to be rejected afterwards.
- `blocksSync()` is strictly narrower than `contentViolation()`: it omits the
  Hebrew-reporting word heuristic, reverted in #50 for mislabelling 20 finished
  translations as untranslated. A test fails if that regression returns.

## Zero regressions
- The 36 supporting skills stay byte-identical; the byte-compare path is untouched.
- `verify-mirror.js` keeps its fatal rules and exit code; historical baselines under
  `evals/snapshots/` and `evals/iteration-*` stay excluded everywhere.
- `npm run sync` in write mode is unchanged apart from refusing unsafe copies.
- `npm test` green; no test skipped, deleted, or weakened.

## Anti-cheat
- No `|| true`, `|| echo`, or any construct that makes a gate exit `0` on failure.
- Rules go in `scripts/content-rules.js`, never inline in a script — a test enforces
  that both scripts import it and keep no private copy of the old regexes.
- Tests must not mutate repository files.
- Never run `npm run sync` (write mode) casually while working here: before #52 it
  overwrote 21 translated files, and after #52 it still copies the 19 `stale` ones.
  Use `--check`, or a temp `AGENTS_HOME`.

## Dependencies
- No new npm packages, no new runtime, no network. Node >= 18, ESM, `node:test`.

## Versioning
- Scripts + docs only, no change under `skills/` or `agents/` →
  `npm run version:bump -- --doc`, then `npm run sync:site`. Never hand-edit
  `site/version.json` or `site/skills.json`.