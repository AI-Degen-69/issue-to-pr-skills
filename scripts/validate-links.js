#!/usr/bin/env node
// Checks that every relative file link in skills/SKILL.md and docs/*.md resolves.
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
let warnings = 0;

function checkFile(file) {
  const text = fs.readFileSync(file, "utf8");
  const re = /\[.*?\]\(([^)]+)\)/g;
  let m;
  while ((m = re.exec(text))) {
    const href = m[1];
    // Unwrap <dest> forms. Report templates use placeholder destinations like
    // <url> or <link> (no file extension) — skip those; still validate real
    // files written in angle brackets, e.g. <missing.md>.
    const wrapped = href.match(/^<(.*)>$/);
    const dest = wrapped ? wrapped[1] : href;
    if (wrapped && !/^https?:|\.[a-z0-9]+($|[?#])/i.test(dest)) continue;
    if (dest.startsWith("http") || dest.startsWith("#") || dest.startsWith("/") || dest.startsWith("mailto:")) continue;
    const base = path.dirname(file);
    const target = path.resolve(base, dest.split("#")[0].split("?")[0]);
    if (!fs.existsSync(target)) {
      console.warn(`⚠ ${path.relative(ROOT, file)}: broken link -> ${href}`);
      warnings++;
    }
  }
}

for (const md of [...fs.globSync("skills/*/SKILL.md"), ...fs.globSync("docs/*.md"), "README.md", "CONTRIBUTING.md", "AGENTS.md"]) {
  if (fs.existsSync(md)) checkFile(md);
}

if (warnings === 0) console.log("✓ all relative links resolve");
else console.log(`${warnings} warning(s)`);
