# AGENTS.md — working in this repo

## What this repo is

Public skill pack: 10 pipeline station skills (`skills/`), 33 supporting skills, 18 reviewer personas (`agents/`), guides (`docs/`). Consumers install it read-only — keep files portable (relative paths, no machine specifics).

## Rules for changes here

1. **Portability first.** No absolute paths, no usernames, no OS-specific homes. Agent homes are referenced as "this repo's `agents/` directory".
2. **English only** in skill content and reports. (Translations live in forks, not here.)
3. **One router owns a request** — the pipeline's own triage rule applies to issues filed here too: bug reports and feature asks become GitHub issues, small fixes go direct.
4. **Verify, don't assume.** Every skill change must pass the validator (`node scripts/validate.js skills/<name>` — see `scripts/` once added, or validate frontmatter + relative links by hand): `name` matches folder, description non-empty, every relative file ref and backticked skill ref resolves.
5. **Minimal diffs.** Fix the finding, don't restyle the skill.
6. **Never commit scratch.** `scratch/`, OS temp, and per-issue work files don't belong in this repo.
