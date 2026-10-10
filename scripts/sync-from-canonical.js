#!/usr/bin/env node
// Mirror the pipeline stations from the canonical agent home into this public pack.
//
// Canonical source : ~/.agents/skills/<station>   (the single source of truth)
// This repo         : skills/<station>            (public, portable copy)
//
// Run:  node scripts/sync-from-canonical.js          (copy + report)
//       node scripts/sync-from-canonical.js --check  (report drift, write nothing)
//
// Why this exists: this pack is a public mirror. The skills used to be copied
// by hand and silently went stale (the mirror still advertised a "Station VII"
// that no longer exists). Run this before every release commit.
//
// Rules (see AGENTS.md and CONSTRAINTS.md):
//   - Canonical is authoritative. Never hand-edit a mirrored skill to differ.
//   - All 47 mirrored skills are covered - the 10 pipeline/system stations AND
//     the 37 supporting skills. This list must stay identical to
//     EXPECTED_SKILLS in verify-mirror.js, or `npm run check` fails.
//   - Eval snapshots (evals/snapshots, evals/iteration-*) are historical
//     baselines and are NOT synced.
//   - results.json is a local grading artifact and is NOT synced.
//   - Skills in canonical that are NOT listed here are deliberately out of the
//     public pack; adding one means adding it here too.
import fs from "node:fs";
import path from "node:path";
import { classifyDrift, driftExitCode } from "./drift-policy.js";
import { blocksPublication, contentViolation, stripLocalOnly, neutralizeLanguage } from "./content-rules.js";

const ROOT = path.resolve(import.meta.dirname, "..");
const CANONICAL = process.env.AGENTS_HOME
  ? path.join(process.env.AGENTS_HOME, "skills")
  : path.join(process.env.USERPROFILE || process.env.HOME, ".agents", "skills");

// Keep in sync with EXPECTED_SKILLS in scripts/verify-mirror.js.
const STATIONS = [
  "pipeline-triage",
  "i-pick-issue",
  "create-issue",
  "ii-plan-issue",
  "iii-build-plan",
  "iiib-iterate-after-build",
  "iv-review-build-and-pr",
  "v-babysit-pr-and-merge",
  "vi-close-pipeline",
  "present-pr",
  "using-agent-skills",
  "context-engineering",
  "frontend-ui-engineering",
  "frontend-design",
  "tailwind-design-system",
  "extract-design-system",
  "api-and-interface-design",
  "debugging-and-error-recovery",
  "doubt-driven-development",
  "performance-optimization",
  "security-and-hardening",
  "documentation-and-adrs",
  "humanizer",
  "idea-refine",
  "test-driven-development",
  "incremental-implementation",
  "spec-driven-development",
  "constraint-driven-development",
  "planning-and-task-breakdown",
  "source-driven-development",
  "code-simplification",
  "git-workflow-and-versioning",
  "observability-and-instrumentation",
  "diagnosing-bugs",
  "click-path-audit",
  "browser-testing-with-devtools",
  "verification-before-completion",
  "playwright-cli",
  "code-review-and-quality",
  "web-design-guidelines",
  "vercel-react-best-practices",
  "vercel-composition-patterns",
  "deprecation-and-migration",
  "ci-cd-and-automation",
  "interview-me",
  "shipping-and-launch",
  "quick-fix",
];

// Never synced: historical eval baselines and local grading artifacts.
// Local-only Hebrew report templates are never published either - the pack
// keeps English-only contracts, so references/output-template.md stays out
// for every skill (the 10 localized stations were already skipped by the
// Hebrew guard; this makes the rule explicit and covers non-localized
// skills like quick-fix the same way).
const EXCLUDE = [
  (rel) => rel.startsWith("evals/snapshots/") || rel.startsWith("evals/iteration-"),
  (rel) => rel === "results.json",
  (rel) => rel === "references/output-template.md",
];

// Mirror-specific rewrites applied AFTER copying. Canonical is authoritative for
// content, but this pack is public and portable, so a few paths are renamed
// here. Without these, every sync would revert them and re-break the links.
const REWRITE = [
  // Canonical: docs/issue-to-pr-skill-workflow.md. This pack: docs/pipeline.md.
  [
    /docs\/issue-to-pr-skill-workflow\.md/g,
    "docs/pipeline.md",
  ],
  // Canonical points personas at the operator home (~/.agents/agents/), which
  // is correct where the skill runs locally. This pack is portable (AGENTS.md
  // rule 1: no machine specifics), so the pointer is rewritten to this repo's
  // agents/ directory - the same 17 personas live in both places. The local
  // copy keeps working; only the published copy is renamed. Paired list first
  // (Station IV names both the project dir and the home), then standalones.
  [
    /`\.agents\/agents\/`,\s*`~\/\.agents\/agents\/`/g,
    "this repo's `agents/` directory",
  ],
  [
    /`~\/\.agents\/agents\/`/g,
    "this repo's `agents/` directory",
  ],
  // Same idea for skill installs: ~/.agents/skills/<name> is home-local, the
  // pack path is skills/<name>.
  [
    /`~\/\.agents\/skills\//g,
    "`skills/",
  ],
  // Absolute Windows pointer at a canonical skill (the "Skill pointer"
  // sections in evals/intake.md): home-local, rewritten to the pack skill.
  // Specific shape first, generic fallback second.
  [
    /`[A-Za-z]:[\\/]Users[\\/][^`]*?\.agents[\\/]skills[\\/]([^`\\/]+)`\s*\(global copy is the single source of truth\)\.?/g,
    "the `$1` skill in this pack.",
  ],
  [
    /`[A-Za-z]:[\\/]Users[\\/][^`]*?\.agents[\\/]skills[\\/]([^`\\/]+)`/g,
    "`skills/$1` in this pack",
  ],
];

// --- Hebrew guard -----------------------------------------------------------
// The local canonical home (~/.agents) runs Hebrew reporting contracts. This
// pack is public and must stay English-only (verify-mirror.js enforces it on
// LOCALIZED_SKILLS). The 10 localized stations are therefore hand-maintained in
// English here, NOT machine-copied: a copy of a Hebrew canonical file would
// overwrite the English translation with Hebrew, which `npm run check` then
// rejects - leaving the operator with a broken pack and a sync that "succeeded".
//
// Translations cannot be derived mechanically, so this script does NOT attempt
// them. It blocks the write and names the file, leaving the English version
// intact. Re-translating the changed file is a deliberate human step.
// Keep this list identical to LOCALIZED_SKILLS in verify-mirror.js.
const LOCALIZED_SKILLS = new Set([
  "pipeline-triage",
  "i-pick-issue",
  "create-issue",
  "ii-plan-issue",
  "iii-build-plan",
  "iiib-iterate-after-build",
  "iv-review-build-and-pr",
  "v-babysit-pr-and-merge",
  "vi-close-pipeline",
  "present-pr",
]);

// Scope: every active text file of a localized station, not just the .md and
// evals.json pair verify-mirror.js inspects. verify-mirror only scans those two
// extensions, so a Hebrew comment in a station .js would pass its English-only
// gate while still shipping to a public repo - covering scripts/ here closes that.
const TEXT_FILE = /\.(md|json|ya?ml|js|mjs|cjs|ts)$/i;
const isActiveLocalized = (skill, rel) =>
  LOCALIZED_SKILLS.has(skill) &&
  TEXT_FILE.test(rel) &&
  !rel.startsWith("evals/snapshots/") &&
  !rel.startsWith("evals/iteration-");

// The files verify-mirror.js actually runs its content gate over: localized
// .md and evals/evals.json. A file in this set must clear the FULL rule set
// before it is copied, because the gate will judge the copy by exactly these
// rules and reject it afterwards otherwise - the "sync reported success, npm
// run check failed later" shape this pair of scripts exists to prevent.
//
// Outside this set the writer keeps the narrower rule (blocksSync via
// blocksPublication): a localized .js is published without the word-level gate,
// so blocking it on that gate would stop imports the verifier will never
// complain about.
const GATE_SCANNED = (rel) => rel.endsWith(".md") || rel === "evals/evals.json";

// Hebrew characters only. A word-level "Hebrew" test was also tried and
// reverted: it matched English prose that merely *mentions* the reporting
// language (e.g. "// The Hebrew report template = ..." or docs prose saying
// "reports in plain Hebrew"), so 21 of the 40 blocked files were pure English
// with zero Hebrew characters. Any genuinely Hebrew text contains Hebrew
// characters, so the character test loses no coverage. There is no mojibake
// case to catch either: all 52 active canonical text files were scanned for
// mangled Hebrew (Latin-1 supplement runs, cp1255-in-UTF-8 artifacts) and none
// matched. This now mirrors what verify-mirror.js actually enforces.
const CHECK_ONLY = process.argv.includes("--check");
// --strict additionally fails on localized drift (see drift-policy.js). The 10
// localized stations are hand-maintained English and differ from canonical by
// design, so the default gate reports them without failing; a release check that
// wants a perfectly synchronized pack asks for --strict explicitly.
const STRICT = process.argv.includes("--strict");

// Would the guard above block this canonical file? Same shared rule, so the
// drift report and the writer can never disagree about a single file.
// Judged on the SHIPPED bytes (what the writer below actually publishes):
// text files go through the rewrite pipeline, anything else is byte-copied,
// so the gate checks rewritten text for the former and raw text for the
// latter. The broad content gate covers published prose (.md, evals.json),
// the narrow publication block everything else. A pure language order is
// neutralized away, a home install is renamed to its portable pack path;
// Hebrew script still blocks everywhere.
const shippedText = (src, rel) =>
  (rel && !TEXT_REWRITE.test(rel) ? read(src) : rewrite(read(src)));
const shippedViolation = (station, rel) => {
  if (!isActiveLocalized(station, rel)) return null;
  const shipped = shippedText(path.join(CANONICAL, station, rel), rel);
  return (GATE_SCANNED(rel) ? contentViolation(shipped) : blocksPublication(shipped));
};
const canonicalIsBlocked = (station, rel) => {
  const src = path.join(CANONICAL, station, rel);
  if (!fs.existsSync(src)) return false;
  return shippedViolation(station, rel) !== null;
};

function walk(dir, base = dir, out = {}) {
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === "node_modules" || entry.name === ".git") continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, base, out);
    else out[path.relative(base, full).split(path.sep).join("/")] = full;
  }
  return out;
}

const read = (f) => fs.readFileSync(f, "utf8").replace(/\r\n/g, "\n");
// Canonical marks its machine-local sections - chiefly the pointer to
// references/output-template.md, the Hebrew chat contract this pack does not
// publish - with local-only markers. They are stripped on the way in, so the
// import never lands a dangling pointer at a file the pack does not ship.
// Reporting-language orders ("Answer in Hebrew", "report in everyday Hebrew")
// are neutralized at the same time: the pack carries no language choice, the
// only difference from canonical is the stripped local template pointer.
const rewrite = (text) =>
  REWRITE.reduce((acc, [re, to]) => acc.replace(re, to), neutralizeLanguage(stripLocalOnly(text)));

// What this pack SHOULD contain for a file, after rewrites. Text rewrites
// (marker strip, language neutralize, path rename) apply only to the files
// the writer rewrites (.md/.json/.yaml); other extensions are byte-copied,
// so comparing them against a neutralized expectation would invent drift
// (e.g. a .js comment mentioning the Hebrew template).
const TEXT_REWRITE = /\.(md|json|ya?ml)$/i;
const expected = (src, rel) => (rel && !TEXT_REWRITE.test(rel) ? read(src) : rewrite(read(src)));
const same = (src, dest, rel) => read(dest) === expected(src, rel);

if (!fs.existsSync(CANONICAL)) {
  console.error(`✗ canonical skills root not found: ${CANONICAL}`);
  console.error("  Set AGENTS_HOME to the folder that contains skills/ and retry.");
  process.exit(1);
}

// This list must match EXPECTED_SKILLS in verify-mirror.js. If they ever
// diverge, one guard checks a different set than the other syncs, and drift
// goes unnoticed. Fail loudly instead.
const verifySource = path.join(ROOT, "scripts", "verify-mirror.js");
try {
  const verifyText = fs.readFileSync(verifySource, "utf8");
  const block = verifyText.match(/EXPECTED_SKILLS\s*=\s*\[([\s\S]*?)\n\];/);
  if (block) {
    const verifyList = [...block[1].matchAll(/"([^"]+)"/g)].map((m) => m[1]);
    const onlyHere = STATIONS.filter((s) => !verifyList.includes(s));
    const onlyThere = verifyList.filter((s) => !STATIONS.includes(s));
    if (onlyHere.length || onlyThere.length) {
      console.error("✗ skill lists disagree between the two mirror scripts:");
      if (onlyHere.length) console.error(`  only in sync-from-canonical.js: ${onlyHere.join(", ")}`);
      if (onlyThere.length) console.error(`  only in verify-mirror.js:     ${onlyThere.join(", ")}`);
      process.exit(1);
    }
  }
} catch {
  // verify-mirror.js unreadable: the list check is a safety net, not the guard.
}

const copied = [];
const drifted = [];
const missing = [];
const untranslated = [];

for (const station of STATIONS) {
  const from = path.join(CANONICAL, station);
  const to = path.join(ROOT, "skills", station);

  if (!fs.existsSync(from)) {
    missing.push(station);
    continue;
  }

  const srcFiles = Object.entries(walk(from)).filter(
    ([rel]) => !EXCLUDE.some((fn) => fn(rel))
  );

  for (const [rel, src] of srcFiles) {
    const dest = path.join(to, rel);
    if (fs.existsSync(dest) && same(src, dest, rel)) continue;

    // Block only what would actually ship unpublishable - judged on the
    // shipped bytes via shippedViolation, so writer and report agree. A pure
    // language order ("Answer in Hebrew") is neutralized away, a home install
    // is renamed to its portable pack path - so neither blocks. The pack copy
    // is the same text minus the language choice and with portable paths,
    // differing from canonical only by the stripped local template pointer.
    const violation = shippedViolation(station, rel);
    if (violation) {
      untranslated.push(`skills/${station}/${rel}`);
      continue;
    }

    drifted.push(`skills/${station}/${rel}`);
    if (CHECK_ONLY) continue;
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    if (/\.(md|json|ya?ml)$/i.test(rel)) {
      fs.writeFileSync(dest, expected(src, rel), "utf8");
    } else {
      fs.copyFileSync(src, dest);
    }
    copied.push(`skills/${station}/${rel}`);
  }

  // Flag files that exist only here (hand-edits that canonical does not have).
  for (const rel of Object.keys(walk(to))) {
    if (EXCLUDE.some((fn) => fn(rel))) continue;
    if (!fs.existsSync(path.join(from, rel))) {
      console.warn(`  ⚠ skills/${station}/${rel} exists only in this pack`);
    }
  }
}

for (const s of missing) console.warn(`  ⚠ station missing from canonical: ${s}`);

function reportUntranslated() {
  if (!untranslated.length) return;
  console.warn(
    `\n⚠ ${untranslated.length} file(s) skipped: canonical content cannot be published as-is (Hebrew characters, a machine-specific home path, or an output contract that orders Hebrew reports).`
  );
  console.warn("  These were NOT overwritten. Fix or adapt them in canonical by hand:");
  untranslated.forEach((f) => console.warn(`  ⚠ ${f}`));
}

if (CHECK_ONLY) {
  // The guard-blocked Hebrew files are drift too - they are just reported instead
  // of copied. They must go through the same classifier, or the "translated"
  // bucket stays permanently empty and the report splits on a line that does
  // not exist. reportUntranslated() is therefore the write-mode reporter only.
  const { blocking, blocked, stale } = classifyDrift(
    [...drifted, ...untranslated],
    LOCALIZED_SKILLS,
    canonicalIsBlocked
  );

  if (blocking.length) {
    console.log(`✗ ${blocking.length} file(s) out of sync with canonical:`);
    blocking.forEach((f) => console.log(`  ~ ${f}`));
  } else {
    console.log("✓ all mirrored skills match canonical byte-for-byte");
  }

  // Reported by name rather than hidden behind a shell `||`: this drift is real
  // and visible on every run. The three buckets are never merged - each answer a
  // different question, and the reason printed is true for every file in it.
  if (blocked.length) {
    console.log(
      `
⚠ ${blocked.length} file(s) inside the ${LOCALIZED_SKILLS.size} localized stations are NOT synced: canonical cannot be published as-is.`
    );
    console.log(
      `  Expected: hand-maintained here (Hebrew characters, or a machine-specific home path).${STRICT ? " Failing under --strict." : ""}`
    );
    blocked.forEach((f) => console.log(`  ~ ${f}`));
  }

  if (stale.length) {
    console.log(
      `
⚠ ${stale.length} file(s) inside the localized stations are stale: sync would copy them, the pack copy is behind.`
    );
    console.log(
      "  NOT blocked - these are portable English files. Re-sync or fix by hand."
    );
    console.log(
      `  Reported only${STRICT ? " — failing under --strict." : "; pass --strict (npm run check:strict) to require them to match"}.`
    );
    stale.forEach((f) => console.log(`  ~ ${f}`));
  }

  process.exit(driftExitCode({ blocking, blocked, stale }, STRICT));
}

reportUntranslated();
console.log(
  copied.length
    ? `✓ synced ${copied.length} file(s) from canonical:`
    : "✓ already in sync with canonical"
);
copied.forEach((f) => console.log(`  + ${f}`));
