# AGENTS.md — working in this repo (Version: 6.7)

## What this repo is

Public skill pack: 10 pipeline station skills (`skills/`), 36 supporting skills, 17 reviewer personas (`agents/`), guides (`docs/`). Consumers install it read-only — keep files portable (relative paths, no machine specifics).

Counts are exact and must stay true: `skills/` = 47 directories (10 stations + 37 supporting), `agents/` = 17 personas. `scripts/verify-mirror.js` checks the skill set and is the source of truth for that number.

## Rules for changes here

1. **Portability first.** No absolute paths, no usernames, no OS-specific homes. Agent homes are referenced as "this repo's `agents/` directory".
2. **English only** in skill content and reports. (Translations live in forks, not here.)
3. **One router owns a request** — the pipeline's own triage rule applies to issues filed here too: bug reports and feature asks become GitHub issues, small fixes go direct.
4. **Verify, don't assume.** Every skill change must pass the validator (`node scripts/validate.js skills/<name>` — see `scripts/` once added, or validate frontmatter + relative links by hand): `name` matches folder, description non-empty, every relative file ref and backticked skill ref resolves.
5. **Minimal diffs.** Fix the finding, don't restyle the skill.
6. **Never commit scratch.** `scratch/`, OS temp, and per-issue work files don't belong in this repo.
7. **Keep site in sync.** Run `npm run check` before submitting changes.

## Versioning & Site Synchronization

This repository enforces a strict two-value version synchronization system:
- **Folder Version:** `VERSION` / `version.json` / `package.json` (source of truth).
- **Site Version:** `site/version.json` / `site/index.html` (public site).

### Version Bump Policy
- **`+0.1` (Doc/Small Change):** When editing docs, README, scripts, or site styles (`npm run version:bump -- --doc`).
- **`+1.0` (Skill Change):** Whenever modifying, adding, or deleting any skill in `skills/` or persona in `agents/` (`npm run version:bump -- --skill`).

### Agent NPM Commands
- `npm run version:status` — Displays the comparison board (Folder Version vs Site Version + SHA-256 hashes).
- `npm run version:bump` — Bumps the folder version (`--skill`, `--doc`, or auto-detect from git diff).
- `npm run sync:site` — Regenerates `site/skills.json` from `skills/`, writes `site/version.json`, and updates site badges.
- `npm run check` — Full gate: runs validate + mirror verification + version check +
  sync check. Plain `&&` chain, so a failure anywhere **fails the command**.
- `npm run check:strict` — same, plus `--strict`, which also fails on drift inside
  the 10 localized stations. Use before a release.
- `npm test` — Runs the test suite (`scripts/version-sync.test.js`).

## The 47 mirrored skills are a copy — never hand-edit them

Every skill in `skills/` is **copied** from the canonical agent home
(`~/.agents/skills/`): the 10 pipeline/system stations (`pipeline-triage`,
`i-pick-issue`, `create-issue`, `ii-plan-issue`, `iii-build-plan`,
`iiib-iterate-after-build`, `iv-review-build-and-pr`, `v-babysit-pr-and-merge`,
`vi-close-pipeline`, `present-pr`) plus the 36 supporting skills. Canonical is
authoritative for all of them.

Change the skill at the source, then re-sync:

```bash
npm run sync      # copy all 47 into this pack
npm run check         # validate + verify byte-identical + report drift
```

Or per-file: `node scripts/sync-from-canonical.js --check` reports drift and
writes nothing; drop `--check` to apply. Note: the localized station files above
intentionally differ from canonical (English-only contracts, portable paths), so
`sync:check` **reports** that drift by name and does **not** fail on it
(`scripts/drift-policy.js` draws the line: a mirrored skill that drifted always
fails, localized drift fails only under `--strict`). `scripts/verify-mirror.js`
(`npm run validate:mirror`) is the guard that accounts for the localization and
must stay green. Do not silence `npm run check` with a trailing `|| echo` — shell
precedence made that mask swallow every earlier failure, which is how the gate
came to exit `0` unconditionally.

Run `npm run check` before every release commit. A hand-edit here is overwritten
on the next sync — this pack already drifted once and was still advertising a
"Station VII" that no longer existed.Not synced on purpose: `evals/snapshots/`, `evals/iteration-*/` (historical baselines) and `results.json` (local grading artifact). Skills that exist only in canonical are deliberately out of the public pack; adding one means adding it to the list in `scripts/sync-from-canonical.js` **and** the identical `EXPECTED_SKILLS` list in `scripts/verify-mirror.js`.

**The writer and the gate share one rule set.** `scripts/content-rules.js` holds what may be published: no Hebrew characters, no Hebrew reporting language, no machine-specific home path. `sync-from-canonical.js` applies `blocksSync()` *before* copying and `verify-mirror.js` applies `contentViolation()` *after* — so a file can never land in the pack only to be rejected afterwards. `blocksSync()` is deliberately narrower: it omits the Hebrew-reporting word heuristic, which is a property of the published pack, not of a canonical file (tried and reverted in #50). Adding a rule means adding it to that module, never inline.

**The writer and the gate share one rule set.** `scripts/content-rules.js` holds what may be published: no Hebrew characters, no Hebrew reporting language, no machine-specific home path. `sync-from-canonical.js` applies `blocksSync()` *before* copying and `verify-mirror.js` applies `contentViolation()` *after* — so a file can never land in the pack only to be rejected afterwards. `blocksSync()` is deliberately narrower: it omits the Hebrew-reporting word heuristic, which is a property of the published pack, not of a canonical file (tried and reverted in #50). Adding a rule means adding it to that module, never inline.

