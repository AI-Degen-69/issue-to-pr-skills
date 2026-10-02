# CONSTRAINTS — Issue #48: make the full gate honest about what it enforces

## Scope (locked, reduced)
- `scripts/drift-policy.js` (new), `scripts/sync-from-canonical.js` (`--check` exit
  semantics only), `package.json` (`check` / `check:strict` only),
  `scripts/drift-policy.test.js` (new), `AGENTS.md` wording, `SPEC.md`, this file.
- Must NOT modify: anything under `skills/`, `agents/`, `site/` content,
  `validate.js`, `validate-links.js`, `verify-mirror.js`, `server.js`, or the
  Hebrew guard's `needsTranslation` rule / blocked-file semantics.
- Deliberately NOT built: a localized drift collector in `verify-mirror.js`.
  `agents-home#2` makes localized stations byte-syncable, after which that
  collector has nothing to do. Recorded in `SPEC.md` so it is not rebuilt later.

## Behavior (locked)
- A mirrored (non-localized) skill that drifted from canonical **always** fails.
- Localized-station drift is reported by name on every run, split into two
  buckets that are never merged: `translated` (canonical is Hebrew) and `stale`
  (canonical has no Hebrew — our English is out of date, not untranslated).
  Either bucket fails only under `--strict` (`npm run check:strict`).
- The reason printed for a bucket must be true for every file in it.
- `npm run check` must exit non-zero when `validate`, `validate:mirror` or
  `version:check` fails.
- npm scripts must work under both `sh` and `cmd.exe`: no brace groups, no
  shell-specific syntax in `package.json`.

## Zero regressions
- The 36 supporting skills stay byte-identical; the byte-compare path is untouched.
- `verify-mirror.js`'s fatal rules (Hebrew characters, Hebrew reporting
  references, non-portable paths, file-set mismatch) keep exiting `1`.
- `sync:check` still prints the untranslated-file report; `npm run sync` (write
  mode) is unchanged and still exits `0`.
- Never run `npm run sync` (write mode) while working on this issue: it
  overwrites the 21 `stale` localized files from canonical. See SPEC.md.
- Existing 5 tests unchanged; `npm test` green at 15.

## Anti-cheat
- No test skipped, deleted, or weakened; no assertion removed.
- No `|| true`, `|| echo`, or any construct that makes a gate exit `0` on failure —
  in `package.json` or in a script. A regression test enforces this.
- Drift policy must be a pure, importable, unit-tested function. Importing
  `sync-from-canonical.js` from a test is forbidden: it writes files at import.
- Tests must not mutate repository files; restore in `finally` if they ever must.

## Dependencies
- No new npm packages, no new runtime, no network. Node >= 18, ESM, `node:test`.

## Versioning
- Scripts + docs only, no change under `skills/` or `agents/` →
  `npm run version:bump -- --doc`, then `npm run sync:site`. Never hand-edit
  `site/version.json` or `site/skills.json`.