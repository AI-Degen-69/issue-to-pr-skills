#!/usr/bin/env node
// Mirror the pipeline stations from the canonical agent home into this public pack.
//
// Canonical source : ~/.agents/skills/<station>   (the single source of truth)
// This repo         : skills/<station>            (public, portable copy)
//
// Run:  node scripts/sync-from-canonical.js          (copy + report)
//       node scripts/sync-from-canonical.js --check  (report drift, write nothing)
//
// Why this exists: this pack is a public mirror. The stations used to be copied
// by hand and silently went stale (the mirror still advertised a "Station VII"
// that no longer exists). Run this before every release commit.
//
// Rules (see AGENTS.md):
//   - Canonical is authoritative. Never hand-edit a station here to differ.
//   - Only the 10 pipeline/system stations are mirrored. The supporting skills
//     are vendored separately and are intentionally a subset.
//   - Eval snapshots (evals/snapshots, evals/iteration-*) are historical
//     baselines and are NOT synced.
//   - results.json is a local grading artifact and is NOT synced.
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const CANONICAL = process.env.AGENTS_HOME
  ? path.join(process.env.AGENTS_HOME, "skills")
  : path.join(process.env.USERPROFILE || process.env.HOME, ".agents", "skills");

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
];

// Never synced: historical eval baselines and local grading artifacts.
const EXCLUDE = [
  (rel) => rel.startsWith("evals/snapshots/") || rel.startsWith("evals/iteration-"),
  (rel) => rel === "results.json",
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
const same = (a, b) => read(a) === read(b);

if (!fs.existsSync(CANONICAL)) {
  console.error(`✗ canonical skills root not found: ${CANONICAL}`);
  console.error("  Set AGENTS_HOME to the folder that contains skills/ and retry.");
  process.exit(1);
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
    fs.copyFileSync(src, dest);
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
