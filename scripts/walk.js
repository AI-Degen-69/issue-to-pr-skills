// The pack's single recursive directory walker.
//
// It replaced three copies:
//   - version-sync.js        walkFiles  (map rel->full, skips node_modules/.git)
//   - sync-from-canonical.js walk       (byte-identical body to walkFiles)
//   - verify-mirror.js       walkDir    (sorted array, fails on symlinks)
//
// version-sync.js and sync-from-canonical.js were not merely similar, they were
// the same function pasted twice: the folder hash (what the version gate
// publishes to the site) and the sync writer (what canonical copies into the
// pack) enumerated files with independent walkers. A change to one - a new skip
// rule, a path-normalization fix - would not reach the other, so the two halves
// of the same "does the pack match?" question could answer differently while
// every gate stayed green.
//
// Two shapes, deliberately not merged into one clever return: a Map for hashing
// (look up a rel path's absolute file), an array for the mirror diff (iterate
// and compare sets). Callers pick the shape they need instead of re-implementing
// the traversal. `onEntry` is the one policy hook: the mirror gate uses it to
// reject symlinks, so that rule lives here rather than being re-derived per
// call site.

import fs from 'node:fs';
import path from 'node:path';

/**
 * Walk a directory recursively into a map of relative -> absolute path.
 *
 * @param {string} dir Directory to walk.
 * @param {string} [base] Base for the relative keys (defaults to `dir`).
 * @param {object} [opts]
 * @param {(rel: string, full: string) => boolean} [opts.onEntry] Called per file; return false to exclude it.
 * @returns {Record<string, string>} relative POSIX path -> absolute path.
 */
export function walkFiles(dir, base = dir, out = {}, opts = {}) {
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name === '.git') continue;
    const full = path.join(dir, entry.name);
    const rel = path.relative(base, full).split(path.sep).join('/');
    if (entry.isDirectory()) {
      walkFiles(full, base, out, opts);
    } else {
      // Always let onEntry see the entry first (it decides keep/drop), then
      // apply the default. A symlink is neither isFile() nor isDirectory()
      // under readdirSync(withFileTypes); the default keeps it only if the
      // caller has no onEntry, so the mirror gate (which passes onEntry and
      // excludes symlinks) sees it and fails loudly instead of it being
      // silently dropped.
      const keep = opts.onEntry ? opts.onEntry(rel, full) : !entry.isSymbolicLink();
      if (keep) out[rel] = full;
    }
  }
  return out;
}

/**
 * Walk a directory recursively into a sorted array of relative POSIX paths.
 *
 * @param {string} dir Directory to walk.
 * @param {(rel: string, full: string) => boolean} [onEntry] Called per file; return false to exclude it.
 * @returns {string[]} Sorted relative paths.
 */
export function walkList(dir, onEntry) {
  return Object.keys(walkFiles(dir, dir, {}, { onEntry })).sort();
}
