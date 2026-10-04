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

---

# Addendum — Issue #47: a hand-maintained localized station drifts, and the site copies it

## The defect

`site/skills.json` carried Station IV's old `playwright-cli preferred` description. The
obvious reading is stale site metadata; the actual cause is upstream of it.

`site/skills.json` is **generated**. `extractSkillsData` reads `description` from this
repo's own `skills/<name>/SKILL.md`, and `syncSite()` rewrites the file. The pack source
was stale in exactly the same way, so regenerating reproduced the stale string and a
hand-edit would be erased by the next `sync:site`.

The pack source is stale because `iv-review-build-and-pr` is one of the 10 localized
stations. `sync-from-canonical.js` refuses to machine-copy those (Hebrew reporting
contracts, home paths), so their English text is hand-maintained — and drifts silently
after every canonical change. Canonical fixed the gate in `0b6563e` (tool allowlist,
call cap, abort rule); the pack never received it. Canonical 196 lines vs pack 173: the
missing 23 lines are the entire `Step 0.1` section.

`version:check` cannot see this — a hand-maintained localized station is always in sync
with itself, so it reports `46/46 skills aligned`. `sync:check` sees the file as
`stale`, which does not distinguish "needs re-copy" from "needs a human".

## The fix

Port the canonical browser-gate fix into the pack's English copy, then regenerate the
site so the corrected description propagates instead of being typed in twice.

| Site text | Source | Action |
|---|---|---|
| `site/skills.json` | generated from pack `SKILL.md` | regenerate via `sync:site` |
| `site/skills-flow.js` | hand-maintained | edit (2 strings) |
| `skills/iv-review-build-and-pr/SKILL.md` | hand-maintained localized English | edit (the actual fix) |

## Scope item 2, resolved by measurement

All 10 localized stations compared, canonical vs pack, description frontmatter only:

| Result | Count | Stations |
|---|---|---|
| Byte-identical | 8 | triage, pick, create, build, iterate, babysit, close, present |
| English-only localization (intended) | 1 | `ii-plan-issue` — `Reports in English` vs `Reports in Hebrew` |
| Real drift | 1 | `iv-review-build-and-pr` |

Scope item 3 resolves to `site/skills-flow.js`, not `site/index.html`: `sync:site` never
touches `skills-flow.js`, and `index.html` contains no browser-tool wording at all.

## Acceptance criteria

1. The pack Station IV skill states `playwright-cli only` in both the description and
   Step 0, and carries `Step 0.1` — allowlist table, attempt budget, abort rule.
2. `site/skills.json` carries the corrected description, produced by `sync:site`
   (never hand-edited).
3. No site or pack copy describes the browser tool as *preferred*.
4. Pack stays English-only and portable — no Hebrew characters, no home path.
5. `npm test`, `validate`, `validate:mirror`, `version:check`, `check` all green;
   `check`'s exit-code contract untouched.
6. The `blocked` / `stale` drift buckets are unchanged (`21` / `19`) — this issue
   changes a localized station's hand-written English, not the sync rules.

---

# Addendum — Issue #55: the declared Node floor was wrong by four majors

## The defect

`package.json` declared `engines.node: ">=18"`. The repo needs **Node 22**.

| API | Needs | Used by |
|---|---|---|
| `import.meta.dirname` | 20.11 | `validate.js`, `validate-links.js`, `sync-from-canonical.js`, `drift-policy.test.js`, `version-sync.test.js` |
| **`fs.globSync`** | **22.0.0** | `validate-links.js` (top-level, unguarded) |

The issue that reported this blamed `import.meta.dirname` and proposed a `>=20.11` floor.
That floor is still wrong: `fs.globSync` is documented as *Added in: v22.0.0* with no
Node 20 entry and no backport to the 20.x line, so `npm run validate:links` throws
`TypeError: fs.globSync is not a function` on any Node 20.

## Why it drifted four majors without a red check

`scripts/validate-links.js` is the only `fs.globSync` user, and **no gate ever ran it**:

- `check` = `validate` + `validate:mirror` + `version:check` + `sync:check` — no `validate:links`.
- `validate.js` has its own link logic; it does not import `validate-links.js`.
- CI ran only `npm run validate`, on `node-version: 20`.

CI was green on a Node version that cannot run the repo's own link validator.

## The trap

`validate-links.js` always exited `0` — it printed `N warning(s)` and returned, with no
`process.exitCode`. Wiring it into `check` unmodified would have added a step that can
never turn the gate red: coverage that looks real and verifies nothing — the same shape as
the `|| echo` incident in AGENTS.md. The exit code is fixed first, so the wiring means
something.

## The fix

1. `engines.node` → `">=22"`.
2. `validate-links.js` exits non-zero when it has warnings.
3. `check` and `check:strict` run `validate:links`.
4. CI's validate job matrixes `[22, 24]` and runs `npm run validate && npm run validate:links && npm run test` — the declared floor plus current LTS, so the floor is *tested*, not asserted.

Option 2 (make Node 18 real) was rejected on evidence: it needs hand-rolled globbing to
replace `fs.globSync`, five `import.meta.dirname` rewrites, and an 18 matrix entry — to
support a runtime CI never ran. `npm run check` still does not run in CI: `sync:check`
needs a canonical home this repo does not publish.

## Acceptance criteria

1. `engines.node` equals the version the code actually requires, and CI runs that version.
2. `validate:links` fails on a broken link instead of printing and passing.
3. `npm run check` covers link validation and stays cross-shell safe (plain `&&`).
4. CI matrixes the declared floor, not only a newer one.
5. `npm run check` → exit 0; `npm test` green; the drift buckets stay `21` / `19`.

---

# Addendum — Operator brief (no issue): quick-fix lane site integration

## Goal

The quick-fix lane (mirrored into the pack as the 47th skill) reads as a
first-class escape hatch everywhere a visitor meets it: the skills catalog
card renders from data like every other skill, the home page counts say 47,
the carousel/flow/lifecycle surfaces name the lane beside (never inside)
the #1–#6 chain, the pipeline doc's call-map rows list it where stations
divert to it, and the 4 connected stations (I, II, III, IV) carry the
divert wiring in the pack's English — ported from canonical, behavior
unchanged. Station count stays 7.

## Acceptance criteria

- [ ] `skills/i-pick-issue`, `ii-plan-issue`, `iii-build-plan`,
  `iv-review-build-and-pr` each name the quick-fix divert; `npm run
  validate` and `npm run validate:mirror` green.
- [ ] No hardcoded 46 remains in `site/index.html` (og:description,
  JSON-LD, CTA, stats bento, both catalog badges, install line, layer
  table); quick-fix card renders on `site/skills/`.
- [ ] `site/app.js` SYSTEM_SKILLS lists the lane; `site/skills-flow.js`
  shows it on the i/ii/iii/iv nodes; lifecycle names it under System &
  Ad-hoc; home carousel + flow + `#lifecycle` verified in browser
  preview with zero console errors.
- [ ] `docs/pipeline.md` call-map rows I–IV list quick-fix, read off the
  ported pack files. `npm run check` + `npm test` 30/30 green.

## Edge cases

- Catalog card with the 441-char lane description must not break card
  layout (length is inside the observed range — verify, don't assume).
- `sync:site` owns badges/footers/skills.json: regen, never hand-edit.
- Port wording follows canonical divert blocks; any conflict between a
  pack station and canonical is resolved in favor of canonical semantics
  in plain English, recorded in `tasks/plan.md`.

## Out of scope

- Skill behavior changes (canonical owns behavior). Re-translating other
  stale stations. Site restyling. Generator changes (the syncSite
  count-spot proposal is opt-in only). New issues or sub-issues.
