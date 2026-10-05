// AGENTS.md: "Counts are exact and must stay true: skills/ = 47 directories
// (10 stations + 37 supporting), agents/ = 17 personas."
//
// The skill count had a tripwire - version-sync.test.js asserts 47 - but the
// persona count had none. `package.json`'s description and AGENTS.md both
// publish "17 reviewer personas" as fact, and adding or retiring a persona left
// both sentences quietly wrong with every gate green. That is the same shape
// #60 fixed for `skillsCount`, which was a hardcoded 47 written into version.json
// and never compared against reality.
//
// These assertions read the published sentences and compare them to what is on
// disk, so the numbers are checked where they are stated rather than restated
// here. A restated copy would drift on exactly the day it mattered.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (rel) => fs.readFileSync(path.join(ROOT, rel), 'utf8');

const skillDirs = fs
  .readdirSync(path.join(ROOT, 'skills'), { withFileTypes: true })
  .filter((e) => e.isDirectory())
  .map((e) => e.name);
const personas = fs
  .readdirSync(path.join(ROOT, 'agents'))
  .filter((f) => f.endsWith('.md'));

// The one list that says which skills are pipeline stations rather than
// supporting skills, read from the mirror gate that already owns it.
const stations = new Set(
  [...read('scripts/verify-mirror.js').match(/LOCALIZED_SKILLS\s*=\s*new Set\(\[([\s\S]*?)\]\)/)[1].matchAll(/"([^"]+)"/g)].map(
    (m) => m[1]
  )
);

/** Pull "N <noun>" out of a published sentence. */
function claim(text, noun) {
  const m = text.match(new RegExp(`(\\d+)\\s+${noun}`));
  assert.ok(m, `no "N ${noun}" claim found - update this test alongside the sentence`);
  return Number(m[1]);
}

test('the reviewer personas on disk match the published total', () => {
  assert.ok(personas.length > 0, 'no personas found - this test would pass vacuously');
  assert.equal(
    personas.length,
    claim(read('package.json').match(/"description":\s*"([^"]*)"/)[1], 'reviewer personas'),
    'a persona was added or retired without updating the published count'
  );
});

test('the skill directories on disk match the published total', () => {
  assert.ok(skillDirs.length > 0, 'no skills found - this test would pass vacuously');
  // The description publishes a split ("10 station skills + 37 supporting"), never
  // a bare total, so the total is the sum of the two published halves.
  const description = read('package.json').match(/"description":\s*"([^"]*)"/)[1];
  assert.equal(
    claim(description, 'station skills') + claim(description, 'supporting skills'),
    skillDirs.length,
    'a skill was added or retired without updating the published counts'
  );
});

test('the station and supporting split adds up to the published total', () => {
  // The pack sells itself as "10 station skills + 37 supporting skills". Those
  // two are only meaningful if they sum to the total, and only the total was
  // checked anywhere.
  const description = read('package.json').match(/"description":\s*"([^"]*)"/)[1];
  const declaredStations = claim(description, 'station skills');
  const declaredSupporting = claim(description, 'supporting skills');
  const supporting = skillDirs.filter((d) => !stations.has(d)).length;

  assert.equal(stations.size, declaredStations, 'the station list disagrees with the published count');
  assert.equal(supporting, declaredSupporting, 'the supporting-skill count is stale');
  assert.equal(
    declaredStations + declaredSupporting,
    skillDirs.length,
    'the published split does not add up to the published total'
  );
});