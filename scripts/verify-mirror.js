#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import crypto from "node:crypto";

const ROOT = path.resolve(import.meta.dirname, "..");
const TARGET_DIR = path.join(ROOT, "skills");
const SOURCE_DIR = path.join(os.homedir(), ".agents", "skills");

const EXPECTED_SKILLS = [
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

const RETIRED_SKILLS = [
  "x-workflow-issue",
  "i-create-issue",
  "vi-prune-artifacts",
  "vii-present-pr",
];

let errors = 0;

function fail(msg) {
  console.error(`✗ ${msg}`);
  errors++;
}

if (!fs.existsSync(SOURCE_DIR)) {
  console.error(`✗ source not found: ${SOURCE_DIR}`);
  process.exit(1);
}

if (!fs.existsSync(TARGET_DIR)) {
  console.error(`✗ target not found: ${TARGET_DIR}`);
  process.exit(1);
}

function sha256(filePath) {
  const content = fs.readFileSync(filePath);
  return crypto.createHash("sha256").update(content).digest("hex");
}

function walkDir(dir, baseDir = dir) {
  let fileList = [];
  const entries = fs.readdirSync(dir);
  for (const entry of entries) {
    const fullPath = path.join(dir, entry);
    const stat = fs.lstatSync(fullPath);
    if (stat.isSymbolicLink()) {
      fail(`target contains symbolic link or reparse point: ${path.relative(baseDir, fullPath)}`);
    }
    if (stat.isDirectory()) {
      fileList = fileList.concat(walkDir(fullPath, baseDir));
    } else if (stat.isFile()) {
      const relPath = path.relative(baseDir, fullPath).replace(/\\/g, "/");
      fileList.push(relPath);
    }
  }
  return fileList.sort();
}

// 1. Check retired directories in target
for (const retired of RETIRED_SKILLS) {
  const p = path.join(TARGET_DIR, retired);
  if (fs.existsSync(p)) {
    fail(`retired skill directory still exists: ${retired}`);
  }
}

// 2. Check directory set in target
const targetEntries = fs
  .readdirSync(TARGET_DIR)
  .filter((entry) => fs.statSync(path.join(TARGET_DIR, entry)).isDirectory());

const expectedSet = new Set(EXPECTED_SKILLS);
const targetSet = new Set(targetEntries);

for (const exp of EXPECTED_SKILLS) {
  if (!targetSet.has(exp)) {
    fail(`missing expected skill in target: ${exp}`);
  }
}

for (const actual of targetEntries) {
  if (!expectedSet.has(actual)) {
    fail(`unexpected extra directory in target: ${actual}`);
  }
}

// 3. Compare each skill directory against source
for (const skill of EXPECTED_SKILLS) {
  const srcSkillDir = path.join(SOURCE_DIR, skill);
  const tgtSkillDir = path.join(TARGET_DIR, skill);

  if (!fs.existsSync(srcSkillDir)) {
    fail(`source skill directory missing: ${skill}`);
    continue;
  }
  if (!fs.existsSync(tgtSkillDir)) {
    continue;
  }

  const srcFiles = walkDir(srcSkillDir);
  const tgtFiles = walkDir(tgtSkillDir);

  const srcFileSet = new Set(srcFiles);
  const tgtFileSet = new Set(tgtFiles);

  for (const f of srcFiles) {
    if (!tgtFileSet.has(f)) {
      fail(`${skill}: missing file in target: ${f}`);
    }
  }

  for (const f of tgtFiles) {
    if (!srcFileSet.has(f)) {
      fail(`${skill}: extra file in target: ${f}`);
    }
  }

  for (const f of srcFiles) {
    if (tgtFileSet.has(f)) {
      const srcHash = sha256(path.join(srcSkillDir, f));
      const tgtHash = sha256(path.join(tgtSkillDir, f));
      if (srcHash !== tgtHash) {
        fail(`${skill}/${f}: hash mismatch (source=${srcHash.slice(0, 8)}, target=${tgtHash.slice(0, 8)})`);
      }
    }
  }
}

if (errors > 0) {
  console.error(`\nFailed with ${errors} error(s).`);
  process.exit(1);
}

console.log(`OK: ${EXPECTED_SKILLS.length} skills, byte-identical to source`);
process.exit(0);
