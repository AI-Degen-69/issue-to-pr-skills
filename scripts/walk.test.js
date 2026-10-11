// scripts/walk.js is the pack's single recursive directory walker.
//
// It replaced three copies:
//   - version-sync.js        walkFiles  (map rel->full, skips node_modules/.git)
//   - sync-from-canonical.js walk       (byte-identical body to walkFiles)
//   - verify-mirror.js       walkDir    (sorted array, fails on symlinks)
//
// version-sync.js and sync-from-canonical.js were not merely similar, they were
// the same function pasted twice: the folder hash (what the version gate
// publishes to the site) and the sync writer (what canonical copies into the
// pack) enumerated files with independent walkers. A change to one - a new
// skip rule, a path-normalization fix - would not reach the other, so the two
// halves of the same "does the pack match?" question could answer differently
// while every gate stayed green.
//
// The two shapes are kept explicit rather than merged into one clever return:
// a Map for hashing, an array for the mirror diff. Callers pick the shape they
// need; they no longer re-implement the traversal. Symlink rejection is an
// option (the mirror gate needs it; the hash path deliberately does not) so the
// policy lives in one place instead of being re-derived per call site.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
import { walkFiles, walkList } from './walk.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function withTmp(fn) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'walk-test-'));
  try {
    return fn(dir);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

test('walkFiles returns a map of relative path to absolute path, POSIX-separated', () => {
  withTmp((dir) => {
    fs.mkdirSync(path.join(dir, 'sub'), { recursive: true });
    fs.writeFileSync(path.join(dir, 'a.md'), 'a');
    fs.writeFileSync(path.join(dir, 'sub', 'b.md'), 'b');
    const map = walkFiles(dir);
    assert.equal(map['a.md'], path.join(dir, 'a.md'));
    assert.equal(map['sub/b.md'], path.join(dir, 'sub', 'b.md'));
  });
});

test('skips node_modules and .git but keeps everything else', () => {
  withTmp((dir) => {
    fs.mkdirSync(path.join(dir, 'node_modules'), { recursive: true });
    fs.mkdirSync(path.join(dir, '.git'), { recursive: true });
    fs.mkdirSync(path.join(dir, 'keep'), { recursive: true });
    fs.writeFileSync(path.join(dir, 'node_modules', 'x.js'), 'x');
    fs.writeFileSync(path.join(dir, '.git', 'HEAD'), 'h');
    fs.writeFileSync(path.join(dir, 'keep', 'y.md'), 'y');
    const map = walkFiles(dir);
    assert.equal(map['keep/y.md'], path.join(dir, 'keep', 'y.md'));
    assert.ok(!Object.keys(map).some((k) => k.includes('node_modules') || k.includes('.git')));
  });
});

test('walkList returns a sorted array of relative paths', () => {
  withTmp((dir) => {
    fs.mkdirSync(path.join(dir, 'sub'), { recursive: true });
    fs.writeFileSync(path.join(dir, 'z.md'), 'z');
    fs.writeFileSync(path.join(dir, 'sub', 'a.md'), 'a');
    const list = walkList(dir);
    assert.deepEqual(list, ['sub/a.md', 'z.md']);
  });
});

test('walkList surfaces symbolic links to onEntry (mirror gate fails on them)', () => {
  // A symlink is neither isFile() nor isDirectory() under
  // readdirSync(withFileTypes), so a naive "else -> it's a file" silently drops
  // it. The mirror gate depends on seeing symlinks so it can fail loudly, so
  // the walker must report them to onEntry rather than swallow them.
  withTmp((dir) => {
    fs.writeFileSync(path.join(dir, 'real.md'), 'real');
    fs.symlinkSync(path.join(dir, 'real.md'), path.join(dir, 'link.md'));
    const seen = [];
    const list = walkList(dir, (rel) => { seen.push(rel); return true; });
    assert.deepEqual(seen.sort(), ['link.md', 'real.md']);
    // The mirror gate excludes symlinks from the file set (and fails on them in
    // its own check); returning false is how it keeps them out of the compare.
    const filtered = walkList(dir, (rel) => !fs.lstatSync(path.join(dir, rel)).isSymbolicLink());
    assert.deepEqual(filtered, ['real.md']);
    assert.ok(list.includes('link.md'));
  });
});

test('a missing directory yields an empty result, not a throw', () => {
  withTmp((dir) => {
    const missing = path.join(dir, 'nope');
    assert.deepEqual(Object.keys(walkFiles(missing)), []);
    assert.deepEqual(walkList(missing), []);
  });
});

test('the real pack walks the same way the hash and the mirror expect', () => {
  // Behavior the three former copies had to agree on: skills/ is walkable and
  // the two shapes describe the same file set.
  const map = walkFiles(path.join(ROOT, 'skills'));
  const list = walkList(path.join(ROOT, 'skills'));
  assert.ok(Object.keys(map).length > 0, 'no skills walked');
  assert.deepEqual(Object.keys(map).sort(), list.slice().sort());
});
