# SPEC — Issue #48: make the full gate honest about what it enforces

## Reduced scope (decided with the operator)

Original #48 asked for two things: a localized-station drift **report** in
`verify-mirror.js`, and a decision about whether `npm run check` fails on it.

Planning surfaced that `agents-home#2` (extract the Hebrew reporting contract out
of `SKILL.md`) makes localized stations byte-syncable. Once it lands there is no
localized exception left to under-check, so a drift *collector* in
`verify-mirror.js` becomes dead code within weeks. Building it now would create
churn to undo.

**Scope reduced to the one item that survives #2 unchanged: the gate's exit code.**

## The defect

```json
"check": "... && npm run sync:check || echo 'note: sync:check flags the 10 localized stations as drifted by design'"
```

Shell precedence makes a trailing `||` bind to the whole `&&` chain, so `echo`
ran whenever *any* stage failed and the command exited `0`. Verified before the
fix: `npm run check` exited `0` while `sync:check` exited `1`. `prepublishOnly`
inherited it — a publish could never be blocked.

The `||` was also shell-specific. npm runs scripts through `cmd.exe` on Windows,
so the usual fix (`&& { npm run sync:check || echo ...; }`) would break Windows
contributors — on the platform where the original Hebrew leak happened.

## The fix

Move the "differs by design" knowledge out of the shell and into code, so
tolerance is expressed by the thing that has the information:

- **`scripts/drift-policy.js`** (new, pure, unit-tested) — `classifyDrift()` splits
  drifted pack paths into three buckets that mean different things:
  `translated` (localized station, canonical is Hebrew, we translated it),
  `stale` (localized station, canonical has **no** Hebrew — not a translation
  difference, our English is out of date or hand-edited), and `blocking` (a
  mirrored skill that must be byte-identical and is not). `driftExitCode()`
  returns `1` whenever `blocking` is non-empty, and for either localized bucket
  only under `--strict`.

  Three buckets, not two, because lumping the first two together tells the next
  maintainer to re-translate work that is already done — the misdirection #48's
  own comment thread called out. Measured today: **19 translated, 21 stale.**
- **`scripts/sync-from-canonical.js`** — `--check` prints both buckets by name,
  states plainly that localized drift is expected and is not a failure, and exits
  per the policy. `--strict` is a new flag.
- **`package.json`** — `check` becomes a plain `&&` chain with no mask;
  `check:strict` adds `--strict`. Both are portable across `sh` and `cmd.exe`.

Net effect: the gate is **stronger** than before. Previously any mirrored-skill
drift was masked by the same `||`; now it fails. Localized drift still passes,
but is printed by name on every run.

## Acceptance criteria

1. `npm run check` exits non-zero when `validate`, `validate:mirror` or
   `version:check` fails. *(Proved by injecting a bad skill and asserting exit 1.)*
2. `npm run check` exits `0` on a clean tree with only localized drift.
3. `npm run check:strict` exits `1` while localized drift exists.
4. Neither script contains `|| echo` / `|| true`.
5. `npm test` green — the policy is pure and unit-tested, plus a regression test
   asserting the mask cannot be reintroduced, and one asserting the two
   `LOCALIZED_SKILLS` lists still agree.
6. `npm run version:check` → IN SYNC after a `--doc` bump (`+0.1`: scripts + docs,
   no change under `skills/` or `agents/`).
7. Every drift bucket is printed by name, and the reason printed for each is true
   for every file in it.

## Known hazard, disclosed not fixed (found during review)

`npm run sync` in **write** mode still overwrites the 21 `stale` files: the Hebrew
guard blocks a write only when canonical contains Hebrew, so a Hebrew-free
canonical file inside a localized station is copied over the hand-maintained
English without complaint. Observed directly during this work — 21 tracked files
were rewritten, and restored with `git checkout -- skills/`. So #48's earlier
claim that "`npm run sync` exits 0 and writes 0 files" does not hold for the
current pack state. The fix belongs with agents-home#2 (make localized stations
byte-syncable) or with a wider guard; neither is this issue's scope, so this
change only makes the condition **visible** in `sync:check`.

## Out of scope

- Localized-station drift collection in `verify-mirror.js` — obsoleted by
  agents-home#2.
- Enforcing the `LOCALIZED_SKILLS` list agreement between both scripts as a fatal
  error — obsoleted when the list itself disappears.
- `site/skills.json` metadata drift (4 stations) — that is #47, and it is also
  expected to self-resolve once `npm run sync && npm run sync:site` can carry a
  corrected description through.
- Touching any skill content under `skills/`.