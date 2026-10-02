# CONSTRAINTS — Issue #47: correct the source of the browser-gate wording, not the generated copy

## Scope (locked)
- `skills/iv-review-build-and-pr/SKILL.md` (hand-maintained localized English — the
  actual fix), `site/skills-flow.js`, `SPEC.md`, this file, and whatever
  `npm run sync:site` regenerates (`site/skills.json`, `site/version.json`,
  `site/index.html` badges, `VERSION`, `version.json`, `package.json`).
- Optional, on explicit operator approval: one new test file under `scripts/`.
- Must NOT modify: the sync/verify machinery (`content-rules.js`, `drift-policy.js`,
  `sync-from-canonical.js`, `verify-mirror.js`), `validate.js`, `validate-links.js`,
  `server.js`, the 46-skill count, the 10-station localized list, and any skill other
  than `iv-review-build-and-pr`.
- Deliberately NOT built: making localized stations byte-syncable (external:
  `agents-home#2`). Until that lands, localized English is hand-maintained by
  definition, and this issue is one instance of the resulting drift.

## Behavior (locked)
- The fix starts at the pack skill. `site/skills.json` is **generated** and must never
  be hand-edited — the next `sync:site` would erase the edit, which is how the stale
  text survived a regeneration in the first place.
- The pack stays English-only and portable: zero Hebrew characters (baseline: 0), no
  `~/.agents` or other machine-specific path, in every published file.
- The ported `Step 0.1` keeps all four canonical rules intact — closed tool allowlist,
  whole-gate cap of 8 calls, stop after 2 failures on a tool with no substitution, and
  dead browser session = *unverified*, never a correction item for
  `iiib-iterate-after-build`. A prose "translation" that softens any of them is a
  regression, not a translation.
- `npm run version:bump -- --skill` (a `skills/` file changed → +1.0 → 2.6) runs
  **before** the final `sync:site`, which stamps the site with the folder version and
  content hash.

## Zero regressions
- The other 9 localized stations and the 36 supporting skills are untouched;
  `validate:mirror` and `sync:check` buckets stay `blocked` 21 / `stale` 19.
- The `ii-plan-issue` description difference (`Reports in English` vs
  `Reports in Hebrew`) is the intended English-only localization — do not "fix" it.
- `npm test` green; no test skipped, deleted, or weakened.

## Anti-cheat
- No `|| true`, `|| echo`, or any construct that makes a gate exit `0` on failure.
- Never run `npm run sync` (write mode): it still copies the 19 `stale` localized files
  and would revert hand-written English. Use `--check`, or a temp `AGENTS_HOME`.
- Never hand-edit `site/skills.json` or `site/version.json` — regenerate via `sync:site`.
- Tests must not mutate repository files, and must skip rather than fail when no
  canonical home (`AGENTS_HOME`) is present, so a consumer's `npm test` stays green.

## Dependencies
- No new npm packages, no new runtime, no network. Node >= 18, ESM, `node:test`.