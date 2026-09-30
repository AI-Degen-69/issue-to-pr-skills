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

test('extractSkillsData returns all 46 skills with descriptions', () => {
  const skills = extractSkillsData();
  assert.equal(skills.length, 46, 'Should extract exactly 46 skills');
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
