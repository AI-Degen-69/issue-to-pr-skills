// The plain-language layer on the site must cover every skill the pack ships.
//
// site/plain-skills.js is a hand-maintained translation of the 47 skill
// descriptions into everyday English for non-developer visitors. Unlike the
// pipeline stations, nothing syncs it: a skill added to skills/ with no
// matching entry silently renders no "In plain words" block, and the site
// quietly reverts to jargon-only for that skill. That is the same class of
// silent drift the localized-descriptions gate exists for, one layer down.
//
// This is the comparison that was missing. It reads only; it never writes.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SITE_FILE = path.join(ROOT, 'site', 'plain-skills.js');
const SKILLS_DIR = path.join(ROOT, 'skills');

// site/plain-skills.js assigns to `window.PLAIN_SKILLS`, so evaluating it
// needs a window. Reading it as text and comparing keys avoids executing the
// file at all, which keeps this gate independent of how the site loads it.
const read = (file) => fs.readFileSync(file, 'utf8');

/** Skill directories that ship a SKILL.md — the set the site must cover. */
function skillsOnDisk() {
  return fs
    .readdirSync(SKILLS_DIR)
    .filter((d) => fs.existsSync(path.join(SKILLS_DIR, d, 'SKILL.md')))
    .sort();
}

/**
 * Keys declared in plain-skills.js. Matches top-level object keys, so a key
 * nested inside another object would not be picked up — which is correct:
 * only the top-level map is the public layer.
 */
function keysInPlainFile() {
  const src = read(SITE_FILE);
  const start = src.indexOf('window.PLAIN_SKILLS = {');
  assert.ok(start !== -1, 'site/plain-skills.js no longer declares window.PLAIN_SKILLS');
  const body = src.slice(start);
  const keys = [...body.matchAll(/^\s{2}'([a-z0-9-]+)':\s*\{/gm)].map((m) => m[1]);
  return keys.sort();
}

/** The `plain:` value for a given skill key, or '' when absent. */
function plainValue(key) {
  const src = read(SITE_FILE);
  const re = new RegExp(`'${key}':\\s*\\{([\\s\\S]*?)\\n\\s{2}\\}`, 'm');
  const m = src.match(re);
  if (!m) return '';
  const v = m[1].match(/plain:\s*'((?:[^'\\]|\\.)*)'/);
  return v ? v[1] : '';
}

// Jargon that defeats the purpose of the layer. A visitor who does not write
// code should not hit these on the plain line. Input-meaning technical terms
// stay in the technical description, which the page still shows.
const JARGON = [
  /\bTDD\b/i,
  /\bCI\/CD\b/i,
  /\bWCAG\b/i,
  /\bPR\b/,
  /\bN\+1\b/,
  /\bORM\b/,
  /\bSSRF\b/,
  /\bOWASP\b/,
  /\bRSC\b/,
  /\bWCAG\b/i,
  /\basync\b/i,
  /\bAPI\b(?!\s*(?:is|means))/i,
  /\brepo\b/i,
  /\brefactor/i,
  /\bgoroutine/i,
  /\bhydrat/i,
  /\bborrow checker/i,
  /\bvertical slices?\b/i
];

test('every skill on disk has a plain-language entry', () => {
  const disk = skillsOnDisk();
  const keys = new Set(keysInPlainFile());
  const missing = disk.filter((d) => !keys.has(d));
  assert.deepEqual(
    missing,
    [],
    `skills/ ships ${missing.length} skill(s) with no entry in site/plain-skills.js: ${missing.join(', ')}\n` +
      'Add a "plain" line (and ideally an "analogy") for each, so the site does not fall back to jargon-only.'
  );
  // The reverse matters too: an entry naming a skill the pack no longer ships
  // is dead copy that renders nothing and rots in place.
  const extra = keysInPlainFile().filter((k) => !disk.includes(k));
  assert.deepEqual(extra, [], `site/plain-skills.js names skill(s) that skills/ no longer ships: ${extra.join(', ')}`);
});

test('the layer covers the same count the pack advertises', () => {
  // The site headline says "47 skills". If the pack and the site ever
  // disagree on the number, both the headline and the gate are wrong.
  assert.equal(skillsOnDisk().length, 47, 'pack skill count changed — update the site copy that hardcodes 47');
  assert.equal(keysInPlainFile().length, 47, 'plain-skills.js entry count changed — expected one per shipped skill');
});

test('every entry has a non-trivial plain line', () => {
  const thin = [];
  for (const key of keysInPlainFile()) {
    const v = plainValue(key);
    if (!v || v.length < 40) thin.push(`${key} (${v.length} chars)`);
  }
  assert.deepEqual(thin, [], `entries too short to explain anything: ${thin.join(', ')}`);
});

test('no plain line leans on unexplained developer jargon', () => {
  const offenders = [];
  for (const key of keysInPlainFile()) {
    const v = plainValue(key);
    const hit = JARGON.find((re) => re.test(v));
    if (hit) offenders.push(`${key}: matched ${hit}`);
  }
  assert.deepEqual(
    offenders,
    [],
    `plain lines containing jargon a non-developer would not know: ${offenders.join('; ')}\n` +
      'Rewrite the line in everyday words, or move the term to the technical description.'
  );
});
