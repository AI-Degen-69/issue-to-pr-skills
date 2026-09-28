# AGENTS.md — working in this repo

## What this repo is

Public skill pack: 10 pipeline station skills (`skills/`), 36 supporting skills, 17 reviewer personas (`agents/`), guides (`docs/`). Consumers install it read-only — keep files portable (relative paths, no machine specifics).

Counts are exact and must stay true: `skills/` = 46 directories (10 stations + 36 supporting), `agents/` = 17 personas. `scripts/verify-mirror.js` checks the skill set and is the source of truth for that number.

## Rules for changes here

1. **Portability first.** No absolute paths, no usernames, no OS-specific homes. Agent homes are referenced as "this repo's `agents/` directory".
2. **English only** in skill content and reports. (Translations live in forks, not here.)
3. **One router owns a request** — the pipeline's own triage rule applies to issues filed here too: bug reports and feature asks become GitHub issues, small fixes go direct.
4. **Verify, don't assume.** Every skill change must pass the validator (`node scripts/validate.js skills/<name>` — see `scripts/` once added, or validate frontmatter + relative links by hand): `name` matches folder, description non-empty, every relative file ref and backticked skill ref resolves.
5. **Minimal diffs.** Fix the finding, don't restyle the skill.
6. **Never commit scratch.** `scratch/`, OS temp, and per-issue work files don't belong in this repo.

## The 10 pipeline stations are a mirror — never hand-edit them

`skills/pipeline-triage`, `i-pick-issue`, `create-issue`, `ii-plan-issue`,
`iii-build-plan`, `iiib-iterate-after-build`, `iv-review-build-and-pr`,
`v-babysit-pr-and-merge`, `vi-close-pipeline`, `present-pr` are **copied** from
the canonical agent home (`~/.agents/skills/`). Canonical is authoritative.

Change the station at the source, then re-sync:

```bash
node scripts/sync-from-canonical.js --check   # report drift, write nothing
node scripts/sync-from-canonical.js           # copy into this pack
```

Run `--check` before every release commit. A hand-edit here is overwritten on the
next sync — this pack already drifted once and was still advertising a "Station
VII" that no longer existed.

Not synced on purpose: `evals/snapshots/`, `evals/iteration-*/` (historical
baselines) and `results.json` (local grading artifact). The other skills here
are a curated subset, not a mirror.

