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
---

# Addendum — Issue #52: the sync writer had no portability rule

Found while fixing #48, by running `npm run sync` in write mode and watching 21
translated files get overwritten.

## The defect

The Hebrew guard decided what to block using one signal only: Hebrew characters.
Anything else was copied straight into the public pack. Measured before the fix:

```
files a blind `npm run sync` would WRITE: 21
  would contain Hebrew        : 0
  would carry a home path     : 2
    home-path: create-issue/evals/intake.md
    home-path: vi-close-pipeline/evals/intake.md
```

So the blind sync would not have broken the English-only rule — it would have
broken the *portability* rule, which `AGENTS.md` rule 1 and `verify-mirror.js` both
enforce. Same failure shape as the Hebrew leak: the copy lands, sync reports
success, and `npm run check` fails afterwards — one rule narrower.

## The fix

`scripts/content-rules.js` holds what may be published, and both sides of the
write apply it:

| Where | Function | When |
|---|---|---|
| before copying | `blocksSync()` | refuses the write, names the file, leaves the pack copy intact |
| after publishing | `contentViolation()` | fails `validate:mirror` |

`blocksSync()` is deliberately **narrower** than `contentViolation()`: it omits the
Hebrew-reporting word heuristic. That heuristic describes the published pack, not a
canonical file — using it as a write-block was tried and reverted in #50, where it
mislabelled 20 already-translated files as untranslated. Hebrew characters and home
paths are different: those are facts about the bytes being copied, so blocking the
copy is correct. A test fails if that regression returns.

## Effect on the drift report

The `translated` bucket became `blocked`, because its real question is "would sync
write this or refuse it" — and the answer is now a shared rule, so the report cannot
disagree with the writer. Measured after:

| Bucket | Count |
|---|---|
| `blocking` | 0 |
| `blocked` | 21 (19 Hebrew characters + 2 home paths) |
| `stale` | 19 |

## Acceptance criteria (all verified)

1. A canonical file with `~/.agents`, `C:\Users\…`, `/home/<user>` or `/Users/<user>`
   destined for a localized station is blocked and named; the pack copy is untouched.
   *(probe: temp `AGENTS_HOME`, 0 pack changes)*
2. The same content under a non-localized station is still written — the guard stays
   scoped to the localized exception. *(probe: `PROBE.txt` written, then cleaned)*
3. Rules live in one module used by both scripts; a test fails if either script
   reintroduces an inline copy.
4. `npm run sync` writes 19 files and blocks 21, instead of writing 21.
5. `npm test` 26/26; `validate`, `validate-links`, `validate:mirror`, `version:check`,
   `check` green; `check:strict` exits 1 as designed.
6. No file under `skills/` modified by any of this.
