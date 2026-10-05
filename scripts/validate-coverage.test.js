// validate.js used to resolve relative links itself, duplicating
// validate-links.js: same regex, same <dest> unwrap, same skip rules - and
// strictly less. validate.js scanned only skills/<dir>/SKILL.md and only
// WARNED; validate-links.js scans that same set plus docs/*.md, README.md,
// CONTRIBUTING.md and AGENTS.md, and FAILS. Every target the first one reached
// was already covered by the second, so the copy bought nothing and gave the
// gate two places to drift apart.
//
// Deleting a duplicate needs no test of its own, so these two are the guard
// rails around the deletion, in the same spirit as
// localized-descriptions.test.js: they fail if the duplication comes back, and
// fail if removing it ever cost real coverage.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (rel) => fs.readFileSync(path.join(ROOT, rel), 'utf8');

test('validate.js does not resolve relative links itself', () => {
  // Any markdown-link regex here means the duplicate is back and the two
  // scanners can disagree again.
  const source = read('scripts/validate.js');
  assert.doesNotMatch(
    source,
    /\\\[\.\*\?\\\]\\\(|linkRe|\]\(\(\[\^\)\]\+\)/,
    'validate.js is resolving relative links again - validate-links.js owns that job'
  );
});

test('validate-links.js still covers every SKILL.md in the pack', () => {
  // The coverage that made the deletion safe. Read the glob list out of the
  // script rather than restating it, so this fails if a glob is dropped.
  const source = read('scripts/validate-links.js');
  const block = source.match(/fs\.globSync\(([^)]*)\)/g) || [];
  assert.ok(block.length > 0, 'validate-links.js no longer resolves a file list by glob');

  const covered = new Set(block.flatMap((call) => {
    const quoted = [...call.matchAll(/"([^"]+)"/g)].map((m) => m[1]);
    return quoted.flatMap((pattern) => fs.globSync(pattern, { cwd: ROOT }));
  }));

  const skills = fs
    .readdirSync(path.join(ROOT, 'skills'))
    .map((d) => path.join('skills', d, 'SKILL.md'))
    .filter((rel) => fs.existsSync(path.join(ROOT, rel)));

  assert.ok(skills.length > 0, 'no skills found - this test would pass vacuously');
  const missed = skills.filter((rel) => !covered.has(rel));
  assert.deepEqual(missed, [], `validate-links.js no longer covers: ${missed.join(', ')}`);
});

test('validate-links.js is the gate, not a warning', () => {
  // The reason the duplicate was safe to drop: one of the two had to be the
  // real gate. A future edit that downgrades this to a warning would restore
  // the exact hole the duplication was covering up.
  const source = read('scripts/validate-links.js');
  assert.match(source, /process\.exitCode\s*=\s*1/, 'validate-links.js must be able to fail the gate');
});