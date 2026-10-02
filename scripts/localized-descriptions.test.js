// Localized pipeline stations are hand-maintained English in this pack:
// `npm run sync` refuses to copy their canonical counterparts, so nothing keeps
// them in step. `verify-mirror.js` cannot see it (a hand-maintained file is
// always byte-consistent with itself), `version:check` reports 46/46 aligned,
// and `sync:check` files the file under `stale` without saying why. So Station
// IV shipped "playwright-cli preferred" long after canonical pinned the browser
// gate to "only" — and `site/skills.json` regenerated the wrong wording for
// every reader of the public site (#47).
//
// This is the comparison that was missing. It reads only; it never writes.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const CANONICAL = process.env.AGENTS_HOME
  ? path.join(process.env.AGENTS_HOME, 'skills')
  : path.join(process.env.USERPROFILE || process.env.HOME || '', '.agents', 'skills');

// Keep identical to LOCALIZED_SKILLS in sync-from-canonical.js and
// verify-mirror.js. A station missing here is one whose English text can drift
// with nothing to catch it.
const LOCALIZED = [
  'pipeline-triage',
  'i-pick-issue',
  'create-issue',
  'ii-plan-issue',
  'iii-build-plan',
  'iiib-iterate-after-build',
  'iv-review-build-and-pr',
  'v-babysit-pr-and-merge',
  'vi-close-pipeline',
  'present-pr',
];

// The ONLY difference a localized description may carry: the English-only
// reporting contract. Canonical reports in Hebrew; this pack must not. Anything
// else is drift, and drift is the bug this test exists for.
//
// A new entry here is a claim that a difference is intentional. Give it a
// reason, and expect the "whitelist stays live" test below to demand its
// removal the moment it stops being true.
const ALLOWED_LOCALIZED_SUBSTITUTIONS = [['Reports in Hebrew', 'Reports in English']];

const read = (file) => fs.readFileSync(file, 'utf8').replace(/\r\n/g, '\n');

const description = (file) => {
  const frontmatter = read(file).match(/^---\n([\s\S]*?)\n---/);
  assert.ok(frontmatter, `${file} has no frontmatter`);
  const value = frontmatter[1].match(/^description:[ \t]*(.*)$/m);
  assert.ok(value, `${file} has no description`);
  return value[1].trim();
};

/** Canonical text with the pack's intended English-only substitutions applied. */
const localized = (text) =>
  ALLOWED_LOCALIZED_SUBSTITUTIONS.reduce((acc, [from, to]) => acc.replace(from, to), text);

// A consumer installs this pack read-only and has no canonical home. Skipping
// is the honest outcome there: there is nothing to compare against, so there is
// no drift to report.
const canonicalAvailable = fs.existsSync(CANONICAL);

test('every localized station description matches canonical', { skip: !canonicalAvailable && 'no canonical home' }, () => {
  const drifted = [];
  for (const station of LOCALIZED) {
    const canonicalFile = path.join(CANONICAL, station, 'SKILL.md');
    const packFile = path.join(ROOT, 'skills', station, 'SKILL.md');
    if (!fs.existsSync(canonicalFile)) continue;
    const canonicalText = localized(description(canonicalFile));
    const packText = description(packFile);
    if (canonicalText !== packText) drifted.push({ station, canonicalText, packText });
  }
  assert.deepEqual(
    drifted,
    [],
    drifted
      .map((d) => `${d.station}:\n  canonical: ${d.canonicalText}\n  pack:      ${d.packText}`)
      .join('\n') +
      '\n\nEither the pack drifted, or a difference became intentional — then extend\n' +
      'ALLOWED_LOCALIZED_SUBSTITUTIONS with a reason instead of editing the pack text.'
  );
});

test('the whitelist stays live', { skip: !canonicalAvailable && 'no canonical home' }, () => {
  // An entry nothing needs is rot: it silently excuses a difference that is
  // about to come back, or that upstream already removed.
  const needed = ALLOWED_LOCALIZED_SUBSTITUTIONS.filter(([from, to]) =>
    LOCALIZED.some((station) => {
      const canonicalFile = path.join(CANONICAL, station, 'SKILL.md');
      return fs.existsSync(canonicalFile) && description(canonicalFile).includes(from) && description(path.join(ROOT, 'skills', station, 'SKILL.md')).includes(to);
    })
  );
  assert.deepEqual(needed, ALLOWED_LOCALIZED_SUBSTITUTIONS, 'an ALLOWED_LOCALIZED_SUBSTITUTIONS entry no longer applies — remove it');
});

test('the comparison actually detects drift', () => {
  // Anti-vacuity: prove the check is not green by construction.
  const canonical = 'Station II ... hands off to /iii-build-plan auto. Reports in Hebrew, issue-first.';
  assert.equal(localized(canonical), 'Station II ... hands off to /iii-build-plan auto. Reports in English, issue-first.');
  assert.notEqual(localized(canonical), 'Station II ... hands off to /iii-build-plan auto. Reports in English, and in French.');
  assert.notEqual(localized('Station IV ... playwright-cli only.'), 'Station IV ... playwright-cli preferred.');
});