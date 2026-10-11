// The plain-language layers on the site must cover everything the pack ships.
//
// site/plain-skills.js and site/plain-agents.js are hand-maintained
// translations of the 47 skill descriptions and 17 reviewer personas into
// everyday English for non-developer visitors. Nothing syncs them: a skill or
// persona added to the pack with no matching entry silently renders no
// "In plain words" block, and the site quietly reverts to jargon-only for
// that item. That is the same class of silent drift the localized-descriptions
// gate exists for, one layer down.
//
// This is the comparison that was missing. It reads only; it never writes.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SKILLS_DIR = path.join(ROOT, 'skills');
const AGENTS_DIR = path.join(ROOT, 'agents');
const SKILLS_FILE = path.join(ROOT, 'site', 'plain-skills.js');
const AGENTS_FILE = path.join(ROOT, 'site', 'plain-agents.js');

// The site files assign to `window.PLAIN_SKILLS` / `window.PLAIN_AGENTS`, so
// evaluating them needs a window. Reading them as text and comparing keys
// avoids executing anything, keeping this gate independent of the page.
const read = (file) => fs.readFileSync(file, 'utf8');

/** Skill directories that ship a SKILL.md. */
function skillsOnDisk() {
  return fs
    .readdirSync(SKILLS_DIR)
    .filter((d) => fs.existsSync(path.join(SKILLS_DIR, d, 'SKILL.md')))
    .sort();
}

/** Persona files in agents/ (*.md). */
function agentsOnDisk() {
  return fs
    .readdirSync(AGENTS_DIR)
    .filter((f) => f.endsWith('.md'))
    .map((f) => f.replace(/\.md$/, ''))
    .sort();
}

/**
 * Top-level object keys declared by a `window.X = { ... }` assignment. Only
 * top-level keys are the public layer, so a key nested inside another object
 * is correctly ignored.
 */
function keysInFile(file, globalName) {
  const src = read(file);
  const start = src.indexOf(`${globalName} = {`);
  assert.ok(start !== -1, `${file} no longer declares ${globalName}`);
  const body = src.slice(start);
  return [...body.matchAll(/^\s{2}'([a-z0-9-]+)':\s*\{/gm)].map((m) => m[1]).sort();
}

/** The `plain:` value for a given key, or '' when absent. */
function plainValue(file, key) {
  const src = read(file);
  const re = new RegExp(`'${key}':\\s*\\{([\\s\\S]*?)\\n\\s{2}\\}`, 'm');
  const m = src.match(re);
  if (!m) return '';
  const v = m[1].match(/plain:\s*'((?:[^'\\]|\\.)*)'/);
  return v ? v[1] : '';
}

// Jargon that defeats the purpose of the layer. A visitor who does not write
// code should not hit these on a plain line. Input-meaning technical terms
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
  /\ba11y\b/i,
  /\basync\b/i,
  /\bAPI\b(?!\s*(?:is|means))/i,
  /\brepo\b/i,
  /\brefactor/i,
  /\bgoroutine/i,
  /\bhydrat/i,
  /\bborrow checker/i,
  /\bvertical slices?\b/i,
  /\bhooks?\b/i,
  /\bJSX\b/,
  /\bTSX\b/,
  /\blifetimes?\b/i
];

const LAYERS = [
  { file: SKILLS_FILE, global: 'window.PLAIN_SKILLS' },
  { file: AGENTS_FILE, global: 'window.PLAIN_AGENTS' }
];

test('every skill on disk has a plain-language entry', () => {
  const disk = skillsOnDisk();
  const keys = new Set(keysInFile(SKILLS_FILE, 'window.PLAIN_SKILLS'));
  const missing = disk.filter((d) => !keys.has(d));
  assert.deepEqual(
    missing,
    [],
    `skills/ ships ${missing.length} skill(s) with no entry in site/plain-skills.js: ${missing.join(', ')}\n` +
      'Add a "plain" line (and ideally an "analogy") for each, so the site does not fall back to jargon-only.'
  );
  // The reverse matters too: an entry naming a skill the pack no longer ships
  // is dead copy that renders nothing and rots in place.
  const extra = keysInFile(SKILLS_FILE, 'window.PLAIN_SKILLS').filter((k) => !disk.includes(k));
  assert.deepEqual(extra, [], `site/plain-skills.js names skill(s) that skills/ no longer ships: ${extra.join(', ')}`);
});

test('the skills layer covers the same count the pack advertises', () => {
  // The site headline says "47 skills". If the pack and the site ever
  // disagree on the number, both the headline and the gate are wrong.
  assert.equal(skillsOnDisk().length, 47, 'pack skill count changed — update the site copy that hardcodes 47');
  assert.equal(keysInFile(SKILLS_FILE, 'window.PLAIN_SKILLS').length, 47, 'plain-skills.js entry count changed — expected one per shipped skill');
});

// ---- agents layer --------------------------------------------------------
test('every persona on disk has a plain-language entry', () => {
  const disk = agentsOnDisk();
  const keys = new Set(keysInFile(AGENTS_FILE, 'window.PLAIN_AGENTS'));
  const missing = disk.filter((d) => !keys.has(d));
  assert.deepEqual(
    missing,
    [],
    `agents/ ships ${missing.length} persona(s) with no entry in site/plain-agents.js: ${missing.join(', ')}\n` +
      'Add a "plain" line (and ideally an "analogy") for each.'
  );
  const extra = keysInFile(AGENTS_FILE, 'window.PLAIN_AGENTS').filter((k) => !disk.includes(k));
  assert.deepEqual(extra, [], `site/plain-agents.js names persona(s) that agents/ no longer ships: ${extra.join(', ')}`);
});

test('the agents layer covers the same count the site advertises', () => {
  assert.equal(agentsOnDisk().length, 17, 'persona count changed — update the site copy that hardcodes 17');
  assert.equal(keysInFile(AGENTS_FILE, 'window.PLAIN_AGENTS').length, 17, 'plain-agents.js entry count changed — expected one per shipped persona');
});

test('every entry in both layers has a non-trivial plain line', () => {
  const thin = [];
  for (const { file, global } of LAYERS) {
    for (const key of keysInFile(file, global)) {
      const v = plainValue(file, key);
      if (!v || v.length < 40) thin.push(`${key} (${v.length} chars)`);
    }
  }
  assert.deepEqual(thin, [], `entries too short to explain anything: ${thin.join(', ')}`);
});

test('no plain line leans on unexplained developer jargon', () => {
  const offenders = [];
  for (const { file, global } of LAYERS) {
    for (const key of keysInFile(file, global)) {
      const v = plainValue(file, key);
      const hit = JARGON.find((re) => re.test(v));
      if (hit) offenders.push(`${key}: matched ${hit}`);
    }
  }
  assert.deepEqual(
    offenders,
    [],
    `plain lines containing jargon a non-developer would not know: ${offenders.join('; ')}\n` +
      'Rewrite the line in everyday words, or move the term to the technical description.'
  );
});
