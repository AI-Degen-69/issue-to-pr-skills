import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {
  extractSkillsData,
  computeFolderHash,
  getFolderVersion,
  getSiteVersion,
  checkSync,
  bumpVersion,
  syncSite
} from './version-sync.js';

const ROOT = path.resolve(import.meta.dirname, '..');

// The bump/sync round below runs against the REAL repository files. Capture the
// exact contents of every file it can touch and restore them in finally, so a
// failing assertion can never leave the repo mutated, and a repo at any version
// comes back byte-identical (not reset to 1.0).
const GUARDED_FILES = [
  'VERSION',
  'version.json',
  'package.json',
  'README.md',
  'AGENTS.md',
  'site/version.json',
  'site/index.html',
  'site/skills/index.html',
  'site/agents/index.html',
  'site/docs/index.html',
  'site/skills.json'
];

function snapshot() {
  return GUARDED_FILES.map((rel) => {
    const full = path.join(ROOT, rel);
    return { rel, full, existed: fs.existsSync(full), content: fs.existsSync(full) ? fs.readFileSync(full, 'utf8') : null };
  });
}

function restore(snap) {
  for (const f of snap) {
    if (f.existed) fs.writeFileSync(f.full, f.content, 'utf8');
    else if (fs.existsSync(f.full)) fs.rmSync(f.full);
  }
}

test('extractSkillsData returns all 47 skills with descriptions', () => {
  const skills = extractSkillsData();
  assert.equal(skills.length, 47, 'Should extract exactly 47 skills');
  for (const s of skills) {
    assert.ok(s.name, 'Skill must have a name');
    assert.ok(s.desc && s.desc.length > 5, `Skill ${s.name} must have a non-empty description`);
  }
});

test('computeFolderHash produces deterministic 10-char hash', () => {
  const hash1 = computeFolderHash();
  const hash2 = computeFolderHash();
  assert.equal(hash1, hash2, 'Hash must be deterministic');
  assert.equal(hash1.length, 10, 'Hash length should be 10');
});

test('Folder Version and Site Version match initially', () => {
  const folderVer = getFolderVersion();
  const siteVer = getSiteVersion();
  assert.equal(folderVer, siteVer, 'Folder and Site version should match');
  assert.match(folderVer, /^[0-9]+\.[0-9]+$/, 'Version should be formatted like X.Y');
});

test('checkSync returns true when site and folder are in sync', () => {
  const inSync = checkSync();
  assert.equal(inSync, true, 'checkSync should report inSync = true');
});

test('bumpVersion handles +0.1 for docs and +1.0 for skills correctly', () => {
  const snap = snapshot();
  try {
    const initial = getFolderVersion(); // e.g. "1.0"
    const initialNum = parseFloat(initial);

    // Bump doc (+0.1)
    const docVer = bumpVersion('doc');
    const expectedDoc = (Math.round((initialNum + 0.1) * 10) / 10).toFixed(1);
    assert.equal(docVer, expectedDoc, 'Bumping doc should increment by +0.1');

    // Should now detect OUT OF SYNC (folder bumped, site not synced yet)
    const inSyncBefore = checkSync();
    assert.equal(inSyncBefore, false, 'Should be out of sync before syncSite()');

    // Bump skill (+1.0)
    const skillVer = bumpVersion('skill');
    const expectedSkill = (Math.round((parseFloat(expectedDoc) + 1.0) * 10) / 10).toFixed(1);
    assert.equal(skillVer, expectedSkill, 'Bumping skill should increment by +1.0');

    // Sync site
    syncSite();
    assert.equal(getSiteVersion(), expectedSkill, 'Site version should match folder version after sync');
    assert.equal(checkSync(), true, 'checkSync should report inSync = true after sync');
  } finally {
    // Restore the exact pre-test repository state, even on assertion failure.
    restore(snap);
  }

  // Post-restore invariants (outside try so restore failures surface clearly)
  assert.equal(getFolderVersion(), snapInitial(snap), 'Folder version restored');
  assert.equal(getSiteVersion(), snapInitial(snap), 'Site version restored');
  assert.equal(checkSync(), true, 'Repo back in sync after restore');
});

test('version.json records the real skill count, not a hardcoded literal', () => {
  // version.json is published and its count is quoted in AGENTS.md, so a literal
  // that outlives a skill being added or retired is a lie with no gate behind
  // it. Assert the source AND the written value: the value alone would pass at
  // 47 == 47 and prove nothing.
  const source = fs.readFileSync(path.join(ROOT, 'scripts', 'version-sync.js'), 'utf8');
  const literals = source.match(/skillsCount:\s*\d+/g) || [];
  assert.deepEqual(literals, [], `hardcoded skill count still in version-sync.js: ${literals.join(', ')}`);
  assert.match(source, /skillsCount:\s*extractSkillsData\(\)\.length/, 'skillsCount is not derived from the pack');

  const snap = snapshot();
  try {
    const expected = extractSkillsData().length;
    bumpVersion('doc');
    const written = JSON.parse(fs.readFileSync(path.join(ROOT, 'version.json'), 'utf8')).skillsCount;
    assert.equal(written, expected, 'version.json must record the pack\'s actual skill count');
  } finally {
    restore(snap);
  }
  assert.equal(checkSync(), true, 'repo back in sync after restore');
});

test('checkSync fails on a site catalog entry the folder does not have', () => {
  // The catalog diff only walked the folder looking itself up in the site, so
  // an entry with no folder counterpart was invisible: the gate printed
  // "47/47 skills aligned" and exited 0 while the public site advertised a skill
  // this pack never shipped.
  const snap = snapshot();
  const file = path.join(ROOT, 'site', 'skills.json');
  let reported = '';
  try {
    const siteSkills = JSON.parse(fs.readFileSync(file, 'utf8'));
    siteSkills.push({ name: 'ghost-skill', desc: 'A skill this pack never shipped.' });
    fs.writeFileSync(file, JSON.stringify(siteSkills, null, 2) + '\n', 'utf8');

    const log = console.log;
    console.log = (...args) => { reported += args.join(' ') + '\n'; };
    try {
      assert.equal(checkSync(), false, 'a site-only catalog entry must fail version:check');
    } finally {
      console.log = log;
    }
    assert.match(reported, /ghost-skill/, 'the gate must name the entry it found only on the site');
  } finally {
    restore(snap);
  }
  assert.equal(checkSync(), true, 'restored catalog is in sync again');
});

test('checkSync fails when version.json declares a stale content hash', () => {
  // bump writes contentHash into version.json, but nothing ever read it back:
  // the gate compared the SITE hash against the computed folder hash and called
  // the pair verified. So a stale value sat in the committed file (39dc5ac86c
  // while the folder hashed to 49d41fa2ed) and `npm run check` printed IN SYNC.
  const snap = snapshot();
  const file = path.join(ROOT, 'version.json');
  let reported = '';
  try {
    const v = JSON.parse(fs.readFileSync(file, 'utf8'));
    fs.writeFileSync(file, JSON.stringify({ ...v, contentHash: 'deadbeefff' }, null, 2) + '\n', 'utf8');

    const log = console.log;
    console.log = (...args) => { reported += args.join(' ') + '\n'; };
    try {
      assert.equal(checkSync(), false, 'a stale declared content hash must fail version:check');
    } finally {
      console.log = log;
    }
    assert.match(reported, /deadbeefff/, 'the gate must name the declared hash it rejected');
  } finally {
    restore(snap);
  }
  assert.equal(checkSync(), true, 'restored version.json is in sync again');
});

test('the committed version.json declares this folder\'s real hash', () => {
  // Anti-vacuity for the check above: it only proves anything because the file
  // actually on disk agrees. This is the assertion that was missing.
  const declared = JSON.parse(fs.readFileSync(path.join(ROOT, 'version.json'), 'utf8')).contentHash;
  assert.equal(declared, computeFolderHash(), 'version.json contentHash is stale - run npm run version:bump');
});

function snapInitial(snap) {
  const v = snap.find((f) => f.rel === 'version.json');
  if (v && v.existed) {
    try {
      return JSON.parse(v.content).version;
    } catch {}
  }
  const versionFile = snap.find((f) => f.rel === 'VERSION');
  return versionFile && versionFile.existed ? versionFile.content.trim().replace(/^Version:\s*/i, '') : '1.0';
}
