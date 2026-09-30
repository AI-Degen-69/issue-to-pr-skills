import test from 'node:test';
import assert from 'node:assert/strict';
import {
  extractSkillsData,
  computeFolderHash,
  getFolderVersion,
  getSiteVersion,
  checkSync,
  bumpVersion,
  syncSite
} from './version-sync.js';

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

  // Restore back to 1.0 for repository baseline
  bumpVersion('set:1.0');
  syncSite();
  assert.equal(getFolderVersion(), '1.0');
  assert.equal(getSiteVersion(), '1.0');
  assert.equal(checkSync(), true);
});
