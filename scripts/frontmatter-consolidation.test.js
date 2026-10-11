// Guards around the frontmatter parser consolidation.
//
// scripts/frontmatter.js replaced two identical copies: validate.js's
// readFrontmatter and version-sync.js's parseFrontmatter. Same regex, same
// folded-block handling, same quote strip — so a parser fix had to be made
// twice or the two gates would silently disagree about a skill's frontmatter.
// validate.js gates name/description; version-sync.js hashes those descriptions
// into the published catalog, so drift puts a wrong description on the public
// site while every gate stays green.
//
// These tests fail if the duplication comes back, and fail if the shared
// parser ever loses the behavior that made the consolidation safe — in the
// same spirit as the guard tests that accompanied the link-scanner deletion.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseFrontmatter } from './frontmatter.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (rel) => fs.readFileSync(path.join(ROOT, rel), 'utf8');

test('the frontmatter parser is defined in exactly one place', () => {
  // A second local copy is how the two gates drift apart. Either file gaining
  // its own frontmatter parser means the consolidation regressed.
  for (const file of ['scripts/validate.js', 'scripts/version-sync.js']) {
    const source = read(file);
    assert.doesNotMatch(
      source,
      /function\s+(readFrontmatter|parseFrontmatter)\s*\(/,
      `${file} defines its own frontmatter parser again - use scripts/frontmatter.js`
    );
  }
});

test('both callers import the shared parser', () => {
  for (const file of ['scripts/validate.js', 'scripts/version-sync.js']) {
    const source = read(file);
    assert.match(
      source,
      /import\s*\{\s*parseFrontmatter\s*\}\s*from\s*['"]\.\/frontmatter\.js['"]/,
      `${file} no longer imports parseFrontmatter from scripts/frontmatter.js`
    );
  }
});

test('validate.js still fails on a SKILL.md with no frontmatter', () => {
  // The behavior the consolidation could have broken. The shared parser returns
  // {} for absent frontmatter where the old local copy returned null; validate.js
  // now tests Object.keys(fm).length, because `!fm` is false for {} and would
  // have made every malformed SKILL.md a silent pass. If that check is ever
  // reverted to `!fm`, a frontmatter-less skill would sail through the gate.
  const source = read('scripts/validate.js');
  assert.match(
    source,
    /Object\.keys\(fm\)\.length\s*===\s*0/,
    'validate.js no longer treats an empty parse result as missing frontmatter - `!fm` is false for {}'
  );
});

test('the shared parser distinguishes no frontmatter from malformed content', () => {
  // The contract the callers rely on: both are {} (falsy-ish but empty), which
  // the validate.js guard tests explicitly rather than via `!fm`.
  assert.deepEqual(parseFrontmatter('# just a heading'), {});
  assert.deepEqual(parseFrontmatter('---\nname: x\nno terminator'), {});
  assert.notDeepEqual(parseFrontmatter('---\nname: x\n---\n'), {});
});
