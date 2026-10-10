// Localized pipeline stations are hand-maintained English in this pack:
// `npm run sync` refuses to copy their canonical counterparts, so nothing keeps
// them in step. `verify-mirror.js` cannot see it (a hand-maintained file is
// always byte-consistent with itself), `version:check` reports 47/47 aligned,
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
import { fileURLToPath } from 'node:url';

// package.json declares `node: >=18`, and `import.meta.dirname` only landed in
// 20.11 — so it would be `undefined` here and the file would fail to load.
// The five scripts that use it are on Node 20 in CI; a new file does not have
// to repeat that, so derive the directory from import.meta.url instead.
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
// An empty fallback would resolve to the RELATIVE path `.agents/skills` - which
// exists in this very repo, empty. The gate would then run against nothing and
// fail in a way that reads like a real drift. No home variable means no canonical
// home, and that must be a clean skip, never a confident wrong answer.
const canonicalHome = process.env.AGENTS_HOME || process.env.USERPROFILE || process.env.HOME || '';
const CANONICAL = canonicalHome ? path.join(canonicalHome, '.agents', 'skills') : '';

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

// Localized descriptions must match canonical EXACTLY. Canonical carries no
// reporting language at all (neutral wording; Hebrew lives only in the
// local-only output-template pointer, which never ships), so there is no
// tolerated difference left. Anything else is drift, and drift is the bug
// this test exists for. The substitution machinery below stays with an empty
// list: if an intentional difference ever appears again, add it here with a
// reason, and the "whitelist stays live" test will demand its removal the
// moment it stops being true.
const ALLOWED_LOCALIZED_SUBSTITUTIONS = [];

const read = (file) => fs.readFileSync(file, 'utf8').replace(/\r\n/g, '\n');

const description = (file) => {
  const frontmatter = read(file).match(/^---\n([\s\S]*?)\n---/);
  assert.ok(frontmatter, `${file} has no frontmatter`);
  const value = frontmatter[1].match(/^description:[ \t]*(.*)$/m);
  assert.ok(value, `${file} has no description`);
  return value[1].trim();
};

/** Canonical text with the pack's intended substitutions applied (none remain). */
const localized = (text) =>
  ALLOWED_LOCALIZED_SUBSTITUTIONS.reduce((acc, [from, to]) => acc.replace(from, to), text);

// A consumer installs this pack read-only and has no canonical home. Skipping
// is the honest outcome there: there is nothing to compare against, so there is
// no drift to report.
const canonicalAvailable = CANONICAL !== '' && path.isAbsolute(CANONICAL) && fs.existsSync(CANONICAL);

test('every localized station description matches canonical', { skip: !canonicalAvailable && 'no canonical home' }, () => {
  const drifted = [];
  let compared = 0;
  for (const station of LOCALIZED) {
    const canonicalFile = path.join(CANONICAL, station, 'SKILL.md');
    const packFile = path.join(ROOT, 'skills', station, 'SKILL.md');
    // A canonical home that resolves but is missing stations is a broken
    // install. Skipping those silently would shrink the comparison and still
    // report green — the exact failure this gate exists to prevent.
    assert.ok(
      fs.existsSync(canonicalFile),
      `canonical ${canonicalFile} is missing — AGENTS_HOME does not look like a full skills home`
    );
    compared++;
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
  // A canonical home that resolves but holds none of these stations would make
  // the comparison above vacuously green. Silence here is the failure mode
  // this whole gate exists to prevent, so say so loudly instead.
  assert.ok(compared > 0, `AGENTS_HOME resolved to ${CANONICAL}, which holds none of the ${LOCALIZED.length} localized stations`);
});

test('this list matches the two scripts it shadows', () => {
  // The same 10 names are written out in three places. sync-from-canonical.js
  // already refuses to start when its list disagrees with verify-mirror.js;
  // this gate must not be the one copy that quietly falls behind.
  const listIn = (file, name) => {
    const block = read(path.join(ROOT, file)).match(new RegExp(`${name}\\s*=\\s*new Set\\(\\[([\\s\\S]*?)\\]\\)`));
    assert.ok(block, `${file} no longer declares ${name}`);
    return [...block[1].matchAll(/"([^"]+)"/g)].map((m) => m[1]);
  };
  assert.deepEqual(listIn('scripts/verify-mirror.js', 'LOCALIZED_SKILLS'), LOCALIZED);
  assert.deepEqual(listIn('scripts/sync-from-canonical.js', 'LOCALIZED_SKILLS'), LOCALIZED);
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
  const canonical = 'Station II ... hands off to /iii-build-plan auto. Reports issue-first.';
  assert.equal(localized(canonical), 'Station II ... hands off to /iii-build-plan auto. Reports issue-first.');
  assert.notEqual(localized(canonical), 'Station II ... hands off to /iii-build-plan auto. Reports daily.');
  assert.notEqual(localized('Station IV ... playwright-cli only.'), 'Station IV ... playwright-cli preferred.');
});