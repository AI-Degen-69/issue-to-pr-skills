# CONSTRAINTS — Operator brief (no issue): quick-fix lane site integration

## Scope (locked)
- `site/index.html` (hardcoded counts, lifecycle prose), `site/app.js`
  (`SYSTEM_SKILLS`), `site/skills-flow.js` (lane edges), `site/skills.json`
  (regen check only), `docs/pipeline.md` (call-map rows), the 4 connected
  station files (`i-pick-issue`, `ii-plan-issue`, `iii-build-plan`,
  `iv-review-build-and-pr` — divert ports only), `SPEC.md` (new section),
  this file, and whatever `npm run sync:site` regenerates.
- Must NOT modify: any other file under `skills/` or `agents/`, anything
  under `scripts/` (no generator changes without the opt-in proposal),
  canonical-owned behavior, site styling/layout beyond the listed prose.

## Behavior (locked)
- The lane is presented beside the #1–#6 chain, never inside it. Station
  count stays 7; skill count stays 47.
- Station ports are English-only with portable paths — the mirror gate
  (`npm run validate:mirror`) proves it. Hebrew output templates are
  never copied into the pack.
- Call-map rows are read off the ported pack files, never canonical
  directly and never invented.
- Counts change only at the listed spots; `sync:site`-owned files
  (badges, footers, skills.json) are regenerated, not hand-edited.

## Zero regressions
- `npm run check` green (validate + links + mirror + version + sync);
  `npm test` 30/30.
- Station ports must not alter station behavior — prose wiring only,
  verified by diff review against canonical divert blocks.

## Anti-cheat
- No test skipping, weakening, or deletion; no lint suppressions to
  force a green gate.
- Do not "fix" a red mirror gate by loosening `content-rules.js` or
  `drift-policy.js`. If the gate is red, the port is wrong — fix the port.
- Never run `npm run sync` in write mode: it overwrites hand-maintained
  localized stations (demonstrated this session — reverted). `--check` only.

## Dependencies
- No new npm packages, no new runtime, no network. Browser preview for
  UI verification; targeted suites for logic (none expected here).
