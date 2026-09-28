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
//   - All 46 mirrored skills are covered - the 10 pipeline/system stations AND
//     the 36 supporting skills. This list must stay identical to
//     EXPECTED_SKILLS in verify-mirror.js, or `npm run check` fails.
//   - Eval snapshots (evals/snapshots, evals/iteration-*) are historical
//     baselines and are NOT synced.
//   - results.json is a local grading artifact and is NOT synced.
//   - Skills in canonical that are NOT listed here are deliberately out of the
//     public pack; adding one means adding it here too.
import fs from "node:fs";
import path from "node:path";

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
];

// Never synced: historical eval baselines and local grading artifacts.
const EXCLUDE = [
  (rel) => rel.startsWith("evals/snapshots/") || rel.startsWith("evals/iteration-"),
  (rel) => rel === "results.json",
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
];

const CHECK_ONLY = process.argv.includes("--check");

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
const rewrite = (text) =>
  REWRITE.reduce((acc, [re, to]) => acc.replace(re, to), text);

// What this pack SHOULD contain for a file, after rewrites.
const expected = (src) => rewrite(read(src));
const same = (src, dest) => read(dest) === expected(src);

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
    if (fs.existsSync(dest) && same(src, dest)) continue;
    drifted.push(`skills/${station}/${rel}`);
    if (CHECK_ONLY) continue;
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    if (/\.(md|json|ya?ml)$/i.test(rel)) {
      fs.writeFileSync(dest, expected(src), "utf8");
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

if (CHECK_ONLY) {
  console.log(
    drifted.length
      ? `✗ ${drifted.length} file(s) out of sync with canonical:`
      : "✓ all mirrored stations match canonical"
  );
  drifted.forEach((f) => console.log(`  ~ ${f}`));
  process.exit(drifted.length ? 1 : 0);
}

console.log(
  copied.length
    ? `✓ synced ${copied.length} file(s) from canonical:`
    : "✓ already in sync with canonical"
);
copied.forEach((f) => console.log(`  + ${f}`));
