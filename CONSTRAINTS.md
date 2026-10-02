# CONSTRAINTS — Issue #55: declare the Node floor the code actually needs, and prove it

## Scope (locked)
- `package.json` (`engines`, the `check` / `check:strict` chains), `scripts/validate-links.js`,
  `.github/workflows/ci.yml`, `README.md`, `SPEC.md`, this file, and whatever
  `npm run sync:site` regenerates.
- Must NOT modify: anything under `skills/`, `agents/`, `site/` content, `validate.js`,
  `validate-links.js`'s scanning scope, `verify-mirror.js`, `sync-from-canonical.js`,
  `content-rules.js`, `drift-policy.js`, `version-sync.js`, `server.js`, the 46-skill
  count, the 10-station localized list.
- Deliberately NOT built: real Node 18 support. It needs hand-rolled globbing to replace
  `fs.globSync`, five `import.meta.dirname` rewrites and an 18 matrix entry — to support a
  runtime CI never ran. Recorded in `SPEC.md` so it is not rebuilt without new evidence.

## Behavior (locked)
- The floor is set by the hardest API the repo uses, not the first one noticed:
  `fs.globSync` (v22.0.0) outranks `import.meta.dirname` (20.11), so the declaration is
  `>=22` — never `>=20.11`, which still crashes `validate:links`.
- A gate that cannot fail is not a gate. `validate-links.js` must exit non-zero when it
  has warnings **before** anything is wired to call it. `check` keeps its plain `&&`
  chain: no brace groups, no shell-specific syntax, so it works under `sh` and `cmd.exe`.
- CI may never run `npm run check`: `sync:check` needs a canonical home that CI does not
  have, and it exits non-zero without one. CI runs the individual steps instead.
- The declared floor is **tested**, not asserted: CI's validate job matrixes the floor
  itself. A floor nobody runs is a comment, not a contract.

## Zero regressions
- No file under `skills/` or `agents/` changes, so the version bump is `--doc` (+0.1),
  never `--skill`; the `blocked` 21 / `stale` 19 buckets stay as they are.
- `npm test` green; no test skipped, deleted, or weakened.
- The localized-description parity test must keep **skipping** (not failing) when no
  canonical home is present — CI has none.

## Anti-cheat
- No `|| true`, `|| echo`, or any construct that makes a gate exit `0` on failure.
- Do not "fix" a red gate by loosening the check that went red. If adding
  `validate:links` to `check` turns it red, the links are broken — fix the links.
- Never run `npm run sync` (write mode): it still copies the 19 `stale` localized files
  and would revert hand-written English. Use `--check`, or a temp `AGENTS_HOME`.
- Tests and verification must not leave broken links or a mutated tree in the repo; any
  injection proof runs on a scratch copy or is reverted before the commit.

## Dependencies
- No new npm packages, no new runtime, no network. ESM, `node:test`, `fs.globSync`
  (Node 22+).