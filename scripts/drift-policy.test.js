import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { classifyDrift, driftExitCode } from './drift-policy.js';

const LOCALIZED = new Set(['i-pick-issue', 'present-pr']);
// Stands in for the sync guard: only these two "canonical" files may not be published.
const isBlocked = (station, rel) => rel === 'SKILL.md' && station === 'i-pick-issue';

test('classifyDrift splits blocking, blocked and stale', () => {
  const { blocking, blocked, stale } = classifyDrift(
    [
      'skills/i-pick-issue/SKILL.md',
      'skills/i-pick-issue/README.md',
      'skills/present-pr/README.md',
      'skills/using-agent-skills/SKILL.md',
    ],
    LOCALIZED,
    isBlocked
  );
  assert.deepEqual(blocked, ['skills/i-pick-issue/SKILL.md']);
  assert.deepEqual(stale, [
    'skills/i-pick-issue/README.md',
    'skills/present-pr/README.md',
  ]);
  assert.deepEqual(blocking, ['skills/using-agent-skills/SKILL.md']);
});

test('a file the guard would block is never called merely stale', () => {
  // The bug this bucket exists for: telling the next maintainer that a blocked
  // file is "just out of date" invites a re-sync the guard will refuse anyway.
  const { blocked, stale } = classifyDrift(
    ['skills/i-pick-issue/SKILL.md'],
    LOCALIZED,
    isBlocked
  );
  assert.deepEqual(blocked, ['skills/i-pick-issue/SKILL.md']);
  assert.deepEqual(stale, []);
});

test('classifyDrift returns empty buckets when nothing drifted', () => {
  const { blocking, blocked, stale } = classifyDrift([], LOCALIZED, isBlocked);
  assert.deepEqual(blocking, []);
  assert.deepEqual(blocked, []);
  assert.deepEqual(stale, []);
});

test('a path that is not under skills/ is treated as blocking', () => {
  const { blocking } = classifyDrift(['somewhere/else/file.md'], LOCALIZED, isBlocked);
  assert.deepEqual(blocking, ['somewhere/else/file.md']);
});

test('a mirrored skill that drifted always fails the gate', () => {
  const drift = classifyDrift(['skills/context-engineering/SKILL.md'], LOCALIZED, isBlocked);
  assert.equal(driftExitCode(drift, false), 1);
  assert.equal(driftExitCode(drift, true), 1);
});

test('localized drift alone passes by default and fails under --strict', () => {
  const drift = classifyDrift(['skills/present-pr/README.md'], LOCALIZED, isBlocked);
  assert.equal(driftExitCode(drift, false), 0, 'by design, must not fail the default gate');
  assert.equal(driftExitCode(drift, true), 1, '--strict must demand a synchronized pack');
});

test('--strict also fails on guard-blocked localized drift', () => {
  const drift = classifyDrift(['skills/i-pick-issue/SKILL.md'], LOCALIZED, isBlocked);
  assert.equal(driftExitCode(drift, false), 0);
  assert.equal(driftExitCode(drift, true), 1);
});

test('clean tree passes under both modes', () => {
  const drift = classifyDrift([], LOCALIZED, isBlocked);
  assert.equal(driftExitCode(drift, false), 0);
  assert.equal(driftExitCode(drift, true), 0);
});

// Regression: the `check` script used to end in `|| echo ...`, and shell
// precedence made that mask swallow EVERY earlier failure - `npm run check`
// exited 0 even when validate, validate:mirror or version:check failed. The
// tolerance for localized drift now lives in scripts/drift-policy.js, so the
// script must be a plain && chain that can actually fail.
test('the check script has no trailing mask that would swallow a failing gate', () => {
  const pkg = JSON.parse(
    fs.readFileSync(path.resolve(import.meta.dirname, '..', 'package.json'), 'utf8')
  );
  for (const name of ['check', 'check:strict']) {
    const script = pkg.scripts[name];
    assert.ok(script, `${name} script must exist`);
    assert.ok(
      !/\|\|\s*(echo|true)\b/.test(script),
      `${name} must not tolerate failure via \`||\`; it would mask every earlier failure: ${script}`
    );
  }
  assert.ok(
    pkg.scripts.check.includes('sync:check'),
    'check must still run sync:check (localized drift is reported there)'
  );
  assert.ok(
    pkg.scripts['check:strict'].includes('--strict'),
    'check:strict must pass --strict to sync:check'
  );
});

// Guards against the drift policy and the sync script drifting apart: the
// localized station list is duplicated in both, and the classification only
// works while they agree.
test('drift-policy stays in sync with the localized skill lists', () => {
  const here = path.resolve(import.meta.dirname);
  const extract = (file, name) => {
    const text = fs.readFileSync(path.join(here, file), 'utf8');
    const block = text.match(new RegExp(`${name}\\s*=\\s*(?:new Set\\()?\\[([\\s\\S]*?)\\n\\]`));
    assert.ok(block, `could not find ${name} in ${file}`);
    return [...block[1].matchAll(/"([^"]+)"/g)].map((m) => m[1]);
  };
  const a = extract('sync-from-canonical.js', 'LOCALIZED_SKILLS');
  const b = extract('verify-mirror.js', 'LOCALIZED_SKILLS');
  assert.deepEqual(a, b, 'the two LOCALIZED_SKILLS lists must stay identical');
  assert.equal(a.length, 10, 'all 10 localized pipeline stations must be listed');
});

// The writer and the gate must apply identical rules. Before this change the
// rules existed only in verify-mirror.js, so a file carrying a machine-specific
// home path was copied into the pack first and rejected afterwards - the same
// "sync reported success, npm run check failed later" shape as the Hebrew leak.
test('the sync guard and the mirror gate share one set of content rules', () => {
  const here = path.resolve(import.meta.dirname);
  const sync = fs.readFileSync(path.join(here, 'sync-from-canonical.js'), 'utf8');
  const mirror = fs.readFileSync(path.join(here, 'verify-mirror.js'), 'utf8');
  for (const [name, text] of [
    ['sync-from-canonical.js', sync],
    ['verify-mirror.js', mirror],
  ]) {
    assert.ok(
      text.includes('from "./content-rules.js"'),
      `${name} must import the shared content rules instead of carrying its own`
    );
  }
  // No local copy of the old inline rules may survive in the gate.
  assert.ok(
    !mirror.includes('\\u0590-\\u05FF'),
    'verify-mirror.js must not keep its own Hebrew-character regex'
  );
  assert.ok(
    !/Users\[\/\\\\\]/.test(mirror),
    'verify-mirror.js must not keep its own home-path regex'
  );
});