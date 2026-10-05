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
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const SKILLS_DIR = path.join(ROOT, "skills");

function readFrontmatter(file) {
  const text = fs.readFileSync(file, "utf8");
  if (!text.startsWith("---")) return null;
  const end = text.indexOf("\n---", 3);
  if (end === -1) return null;
  const fm = text.slice(3, end);
  const obj = {};
  const lines = fm.split("\n");
  for (let i = 0; i < lines.length; i++) {
    const m = parseLine(lines[i]);
    if (m) {
      let val = m[2].trim().replace(/^["']|["']$/g, "");
      // YAML folded/literal: description on next indented lines
      if (!val || /^(\||>)[+-]?$/.test(val)) {
        const buf = [];
        for (let j = i + 1; j < lines.length; j++) {
          const nxt = lines[j];
          if (/^\s{2,}\S/.test(nxt) || /^\t+\S/.test(nxt)) buf.push(nxt.trim());
          else break;
        }
        if (buf.length) val = buf.join(" ");
      }
      obj[m[1]] = val;
    }
  }
  // multiline description: keep first line is enough for validation
  return obj;
}

function parseLine(line) {
  // handle CRLF: strip trailing \r
  const clean = line.replace(/\r$/, "");
  const m = clean.match(/^(\w+):\s*(.*)$/);
  return m;
}

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
  const fm = readFrontmatter(md);
  if (!fm) {
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
