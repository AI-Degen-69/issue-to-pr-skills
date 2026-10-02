import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { classifyDrift, driftExitCode } from './drift-policy.js';

const LOCALIZED = new Set(['i-pick-issue', 'present-pr']);
// Stands in for the canonical Hebrew check: only these two "canonical" files are Hebrew.
const isTranslated = (station, rel) => rel === 'SKILL.md' && station === 'i-pick-issue';

test('classifyDrift splits mirrored, translated and stale drift', () => {
  const { blocking, translated, stale } = classifyDrift(
    [
      'skills/i-pick-issue/SKILL.md',
      'skills/i-pick-issue/README.md',
      'skills/present-pr/README.md',
      'skills/using-agent-skills/SKILL.md',
    ],
    LOCALIZED,
    isTranslated
  );
  assert.deepEqual(translated, ['skills/i-pick-issue/SKILL.md']);
  assert.deepEqual(stale, [
    'skills/i-pick-issue/README.md',
    'skills/present-pr/README.md',
  ]);
  assert.deepEqual(blocking, ['skills/using-agent-skills/SKILL.md']);
});

test('localized drift with no Hebrew canonical is not reported as a translation', () => {
  // The bug this bucket exists for: lumping these with translated files tells the
  // next maintainer to re-translate work that is already done.
  const { translated, stale } = classifyDrift(
    ['skills/present-pr/README.md'],
    LOCALIZED,
    isTranslated
  );
  assert.deepEqual(translated, []);
  assert.deepEqual(stale, ['skills/present-pr/README.md']);
});

test('classifyDrift returns empty buckets when nothing drifted', () => {
  const { blocking, translated, stale } = classifyDrift([], LOCALIZED, isTranslated);
  assert.deepEqual(blocking, []);
  assert.deepEqual(translated, []);
  assert.deepEqual(stale, []);
});

test('a path that is not under skills/ is treated as blocking', () => {
  const { blocking } = classifyDrift(['somewhere/else/file.md'], LOCALIZED, isTranslated);
  assert.deepEqual(blocking, ['somewhere/else/file.md']);
});

test('a mirrored skill that drifted always fails the gate', () => {
  const drift = classifyDrift(['skills/context-engineering/SKILL.md'], LOCALIZED, isTranslated);
  assert.equal(driftExitCode(drift, false), 1);
  assert.equal(driftExitCode(drift, true), 1);
});

test('localized drift alone passes by default and fails under --strict', () => {
  const drift = classifyDrift(['skills/i-pick-issue/SKILL.md'], LOCALIZED, isTranslated);
  assert.equal(driftExitCode(drift, false), 0, 'by design, must not fail the default gate');
  assert.equal(driftExitCode(drift, true), 1, '--strict must demand a synchronized pack');
});

test('--strict also fails on stale localized drift', () => {
  const drift = classifyDrift(['skills/present-pr/README.md'], LOCALIZED, isTranslated);
  assert.equal(driftExitCode(drift, false), 0);
  assert.equal(driftExitCode(drift, true), 1);
});

test('clean tree passes under both modes', () => {
  const drift = classifyDrift([], LOCALIZED, isTranslated);
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