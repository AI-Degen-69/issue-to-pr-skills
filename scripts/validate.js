#!/usr/bin/env node
// Frontmatter validator: the declared name matches its folder and the
// description is usable.
//
// Relative link resolution is NOT done here. It used to be - the same regex,
// the same <dest> unwrap, the same skip rules as validate-links.js, but scoped
// to skills/<dir>/SKILL.md and only warning. validate-links.js scans that set
// plus docs/*.md, README.md, CONTRIBUTING.md and AGENTS.md, and fails, so the
// copy reached nothing the gate had not already covered while giving the two
// scanners a second place to drift apart. `npm run validate:links` owns it.
//
// A backticked `some-skill` reference check also used to sit here. It iterated
// 537 tokens across the 47 skills and discarded every one: both branches were
// no-ops and the warn was commented out. Measured across this pack, 196 of the
// distinct tokens are not skill or agent names at all (main, open, name,
// pytest, curl, master...), so turning it back on would be noise, not a gate.
// See scripts/validate-coverage.test.js for what guards this file now.
import fs from 'node:fs';
import path from 'node:path';
import { parseFrontmatter } from './frontmatter.js';

const ROOT = path.resolve(import.meta.dirname, '..');
const SKILLS_DIR = path.join(ROOT, 'skills');

function fail(msg) {
  console.error(`✗ ${msg}`);
  return false;
}
function ok(msg) {
  console.log(`✓ ${msg}`);
}

let errors = 0;
const target = process.argv[2]; // e.g. "skills/i-pick-issue" or "skills"

let skillDirs = [];
if (target && target !== "skills") {
  skillDirs = [path.join(ROOT, target)];
} else {
  skillDirs = fs.readdirSync(SKILLS_DIR).map((d) => path.join(SKILLS_DIR, d)).filter((p) => fs.statSync(p).isDirectory());
}

for (const dir of skillDirs) {
  const folder = path.basename(dir);
  const md = path.join(dir, "SKILL.md");
  if (!fs.existsSync(md)) {
    fail(`${folder}: missing SKILL.md`);
    errors++;
    continue;
  }
  // The shared parser returns {} for absent or unterminated frontmatter, where
  // the old local copy returned null. Treat the empty object as "missing"
  // explicitly — `!fm` is truthy for {} and would turn every malformed
  // SKILL.md into a silent pass.
  const fm = parseFrontmatter(fs.readFileSync(md, 'utf8'));
  if (Object.keys(fm).length === 0) {
    fail(`${folder}: missing or malformed frontmatter`);
    errors++;
    continue;
  }
  if (fm.name !== folder) {
    fail(`${folder}: frontmatter name "${fm.name}" != folder "${folder}"`);
    errors++;
  } else ok(`${folder}: name matches`);
  if (!fm.description || fm.description.length < 10) {
    fail(`${folder}: description empty or too short`);
    errors++;
  } else ok(`${folder}: description ok (${fm.description.length} chars)`);
}

if (errors > 0) {
  console.error(`\n${errors} error(s) found`);
  process.exit(1);
} else {
  console.log(`\nAll ${skillDirs.length} skill(s) validated`);
}
