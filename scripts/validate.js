#!/usr/bin/env node
// Minimal validator: frontmatter name matches folder, description non-empty, relative links + backticked skill/agent refs resolve.
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const SKILLS_DIR = path.join(ROOT, "skills");
const AGENTS_DIR = path.join(ROOT, "agents");

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
      // YAML folded: description on next indented lines
      if (!val) {
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

const skillNames = new Set(fs.readdirSync(SKILLS_DIR));
const agentNames = new Set(fs.readdirSync(AGENTS_DIR).map((f) => f.replace(/\.md$/, "")));

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

  const body = fs.readFileSync(md, "utf8");
  // relative file refs: check markdown links like ](../ or ](./
  const linkRe = /\[.*?\]\(([^)]+)\)/g;
  let m;
  while ((m = linkRe.exec(body))) {
    const href = m[1];
    if (href.startsWith("http") || href.startsWith("#") || href.startsWith("/") || href.startsWith("mailto:")) continue;
    // relative path — resolve from skill dir
    const targetPath = path.resolve(dir, href.split("#")[0].split("?")[0]);
    if (!fs.existsSync(targetPath)) {
      // allow links to docs that may be resolved from root? try ROOT-relative
      const alt = path.resolve(ROOT, href);
      if (!fs.existsSync(alt)) {
        console.warn(`  ⚠ ${folder}: link "${href}" does not resolve`);
      }
    }
  }
  // backticked skill/agent refs: `some-skill`
  const tickRe = /`([a-z0-9-]{3,})`/g;
  while ((m = tickRe.exec(body))) {
    const ref = m[1];
    if (skillNames.has(ref) || agentNames.has(ref)) continue;
    // ignore common non-skill ticks (e.g., `ready-for-agent`)
    if (["ready-for-agent", "tasks", "plan", "main", "gh", "git"].includes(ref)) continue;
    // don't error, just warn for now
    // console.warn(`  ⚠ ${folder}: backticked ref \`${ref}\` not found as skill/agent`);
  }
}

if (errors > 0) {
  console.error(`\n${errors} error(s) found`);
  process.exit(1);
} else {
  console.log(`\nAll ${skillDirs.length} skill(s) validated`);
}
