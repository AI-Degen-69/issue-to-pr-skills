// scripts/rewrites.js is the single REWRITE table + text-rewrite predicate
// shared by the sync writer and the mirror gate.
//
// The same five regex/replacement pairs lived in two files:
//   - scripts/sync-from-canonical.js  (the writer - applies them on copy)
//   - scripts/verify-mirror.js        (the gate - applies them to compare)
// Each file's comment even pointed at the other ("which applies the same
// table"). That is the exact coupling AGENTS.md calls out as dangerous: the
// writer and the gate must never disagree about what may be published. A new
// rewrite added to one table but not the other means the writer ships a path
// rename the gate hashes against the un-renamed form - a permanent hash
// mismatch (or, worse, a rename the gate silently accepts), with both gates
// green and the pack wrong.
//
// Extracting the table makes "they agree" structural instead of a comment.
// TEXT_REWRITE (which extensions get rewritten) comes along for the same
// reason: it decides what the writer rewrites and what the gate compares
// rewritten, so it must be one predicate.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { REWRITE, TEXT_REWRITE, applyRewrites } from './rewrites.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (rel) => fs.readFileSync(path.join(ROOT, rel), 'utf8');

test('applyRewrites rewrites a canonical home path to the portable pack path', () => {
  const out = applyRewrites('see `~/.agents/skills/quick-fix`');
  assert.equal(out, 'see `skills/quick-fix`');
});

test('applyRewrites rewrites the workflow doc pointer', () => {
  assert.equal(applyRewrites('docs/issue-to-pr-skill-workflow.md'), 'docs/pipeline.md');
});

test('TEXT_REWRITE matches only text extensions (md/json/yaml)', () => {
  assert.ok(TEXT_REWRITE.test('a.md'));
  assert.ok(TEXT_REWRITE.test('a.json'));
  assert.ok(TEXT_REWRITE.test('a.yaml'));
  assert.ok(!TEXT_REWRITE.test('a.js'));
  assert.ok(!TEXT_REWRITE.test('a.png'));
});

test('the REWRITE table is defined in exactly one place', () => {
  // A second table is how the writer and gate drift apart. If either consumer
  // re-declares it, this consolidation regressed.
  for (const file of ['scripts/sync-from-canonical.js', 'scripts/verify-mirror.js']) {
    const source = read(file);
    assert.doesNotMatch(
      source,
      /const\s+REWRITE\s*=/,
      `${file} declares its own REWRITE table again - use scripts/rewrites.js`
    );
  }
});

test('both the writer and the gate import the shared rewrites', () => {
  for (const file of ['scripts/sync-from-canonical.js', 'scripts/verify-mirror.js']) {
    const source = read(file);
    assert.match(
      source,
      /from\s+['"]\.\/rewrites\.js['"]/,
      `${file} no longer imports from scripts/rewrites.js`
    );
  }
});

test('the shared table has the expected number of rules (a dropped rule fails here)', () => {
  // The six pairs the writer and gate had agreed on. Losing one silently
  // changes what gets published, so pin the count.
  assert.equal(REWRITE.length, 6);
});
