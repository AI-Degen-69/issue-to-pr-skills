// The single REWRITE table + text-extension predicate shared by the sync
// writer (sync-from-canonical.js) and the mirror gate (verify-mirror.js).
//
// The same six regex/replacement pairs lived in both files, and each file's
// comment pointed at the other ("which applies the same table"). That is the
// coupling AGENTS.md calls out as dangerous: the writer and the gate must never
// disagree about what may be published. A rewrite added to one table but not
// the other means the writer ships a path rename the gate hashes against the
// un-renamed form - a permanent hash mismatch (or a rename the gate silently
// accepts), with both gates green and the pack wrong. Extracting the table makes
// "they agree" structural instead of a comment.
//
// Canonical is authoritative for content, but this pack is public and portable,
// so a few machine-local paths are renamed on the way in. Order matters: the
// more specific shapes (the Windows "global copy is the single source of truth"
// pointer, the paired agents/ list) must run before the generic fallbacks.

/**
 * Path rewrites applied to text files when mirroring canonical into the pack.
 * @type {Array<[RegExp, string]>}
 */
export const REWRITE = [
  // Canonical: docs/issue-to-pr-skill-workflow.md. This pack: docs/pipeline.md.
  [/docs\/issue-to-pr-skill-workflow\.md/g, "docs/pipeline.md"],
  // Canonical points personas at the operator home (~/.agents/agents/), which
  // is correct where the skill runs locally. This pack is portable (AGENTS.md
  // rule 1: no machine specifics), so the pointer is rewritten to this repo's
  // agents/ directory - the same 17 personas live in both places. The local
  // copy keeps working; only the published copy is renamed. Paired list first
  // (Station IV names both the project dir and the home), then standalones.
  [/`\.agents\/agents\/`,\s*`~\/\.agents\/agents\/`/g, "this repo's `agents/` directory"],
  [/`~\/\.agents\/agents\/`/g, "this repo's `agents/` directory"],
  // Same idea for skill installs: ~/.agents/skills/<name> is home-local, the
  // pack path is skills/<name>.
  [/`~\/\.agents\/skills\//g, "`skills/"],
  // Absolute Windows pointer at a canonical skill (the "Skill pointer"
  // sections in evals/intake.md): home-local, rewritten to the pack skill.
  // Specific shape first, generic fallback second.
  [/`[A-Za-z]:[\\/]Users[\\/][^`]*?\.agents[\\/]skills[\\/]([^`\\/]+)`\s*\(global copy is the single source of truth\)\.?/g, "the `$1` skill in this pack."],
  [/`[A-Za-z]:[\\/]Users[\\/][^`]*?\.agents[\\/]skills[\\/]([^`\\/]+)`/g, "`skills/$1` in this pack"],
];

/**
 * Extensions whose text is rewritten. Non-text extensions are byte-copied, so
 * comparing them against a rewritten expectation would invent drift (e.g. a
 * .js comment mentioning the Hebrew template). Shared so the writer rewrites
 * and the gate compares the exact same set.
 * @type {RegExp}
 */
export const TEXT_REWRITE = /\.(md|json|ya?ml)$/i;

/**
 * Apply every rewrite in REWRITE, in order, to `text`.
 * @param {string} text
 * @returns {string}
 */
export function applyRewrites(text) {
  return REWRITE.reduce((acc, [re, to]) => acc.replace(re, to), text);
}
