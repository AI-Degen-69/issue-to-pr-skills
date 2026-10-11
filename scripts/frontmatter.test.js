// scripts/frontmatter.js is the single frontmatter parser for this pack.
//
// It replaced two copies: validate.js's readFrontmatter and version-sync.js's
// parseFrontmatter. They were the same logic — same regex, same folded-block
// handling, same quote strip — which meant every future parser fix had to be
// made twice or the two gates would silently disagree about what a skill's
// frontmatter says. validate.js gates name/description; version-sync.js hashes
// those descriptions into the published catalog, so a drift between them puts
// a wrong description on the public site while every gate stays green.
//
// The copies were also untested: only their two call sites exercised them,
// and only against the 47 real skills (43 plain, 3 quoted, 1 folded). These
// tests pin the behavior that mattered so the shared parser cannot quietly
// change under the gates that now depend on it.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseFrontmatter } from './frontmatter.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

test('parses a plain key: value frontmatter field', () => {
  const fm = parseFrontmatter('---\nname: quick-fix\ndescription: Fast lane\n---\n# Body');
  assert.equal(fm.name, 'quick-fix');
  assert.equal(fm.description, 'Fast lane');
});

test('strips surrounding quotes from a value', () => {
  const fm = parseFrontmatter('---\ndescription: "Quoted words"\n---\n');
  assert.equal(fm.description, 'Quoted words');
  const single = parseFrontmatter("---\ndescription: 'Single quoted'\n---\n");
  assert.equal(single.description, 'Single quoted');
});

test('joins a folded (|) description block into one line', () => {
  const fm = parseFrontmatter('---\ndescription: |\n  First line.\n  Second line.\n---\n');
  assert.equal(fm.description, 'First line. Second line.');
});

test('joins a folded (>) description block into one line', () => {
  const fm = parseFrontmatter('---\ndescription: >\n  Folded\n  together\n---\n');
  assert.equal(fm.description, 'Folded together');
});

test('accepts CRLF line endings', () => {
  const fm = parseFrontmatter('---\r\nname: crlf-skill\r\ndescription: A description\r\n---\r\n');
  assert.equal(fm.name, 'crlf-skill');
  assert.equal(fm.description, 'A description');
});

test('returns an empty object when frontmatter is absent or unterminated', () => {
  assert.deepEqual(parseFrontmatter('# No frontmatter here'), {});
  assert.deepEqual(parseFrontmatter('---\nname: broken\nno terminator'), {});
});

test('parses the real pack: every SKILL.md name matches its folder', () => {
  // The behavior the two gates actually depend on. If this holds, both callers
  // can safely share one parser over the real corpus.
  const skills = fs.readdirSync(path.join(ROOT, 'skills'));
  assert.ok(skills.length > 0, 'no skills found - this test would pass vacuously');
  for (const skill of skills) {
    const md = path.join(ROOT, 'skills', skill, 'SKILL.md');
    if (!fs.existsSync(md)) continue;
    const fm = parseFrontmatter(fs.readFileSync(md, 'utf8'));
    assert.equal(fm.name, skill, `${skill}: frontmatter name "${fm.name}" != folder`);
    assert.ok(fm.description && fm.description.length >= 10, `${skill}: description too short`);
  }
});
