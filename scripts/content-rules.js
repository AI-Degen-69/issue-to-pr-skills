// Content rules that keep the public pack English-only and portable.
//
// These live in one module because they are enforced in two places that must
// agree: verify-mirror.js checks the pack AFTER it was written, and
// sync-from-canonical.js checks a canonical file BEFORE it is copied in. When
// the rules existed only in the verifier, a file carrying a machine-specific
// home path was copied into the pack first and rejected afterwards - the same
// "sync reported success, npm run check failed later" shape as the Hebrew leak,
// one rule narrower.
//
// Scope note: verify-mirror.js only inspects .md and evals/evals.json, while
// sync writes .md, .json, .yaml, .js and .ts. Keeping the rules here lets the
// write path cover the wider set, which is where leaks actually start.

/** Hebrew characters. Any genuinely Hebrew text contains Hebrew characters. */
export const HEBREW_CHARS = /[֐-׿]/;

/**
 * Machine-specific locations. AGENTS.md rule 1: no absolute paths, no
 * usernames, no OS-specific homes - agent homes are referred to as "this
 * repo's agents/ directory".
 */
export const NON_PORTABLE_PATH =
  /~\/?\.agents|[A-Za-z]:[\\/]Users|(?:^|[^\w/])\/home\/[a-z_][\w.-]*|[\\/]Users[\\/][A-Za-z][\w.-]*/i;

/**
 * English prose that names Hebrew as a *reporting* language. Technical mentions
 * of Hebrew as input (branch-slug stripping, voice-note intake) are whitelisted.
 */
const HEBREW_REPORTING_WHITELIST = /never Hebrew[^.\n"]*|Hebrew-only|Hebrew voice-notes/gi;

export function reportsInHebrew(text) {
  return /Hebrew/i.test(text.replace(HEBREW_REPORTING_WHITELIST, ""));
}

/**
 * Returns a short, quotable reason string when `text` may not be published, or
 * null when it is fine. Used to name the offending file in sync reports.
 */
export function contentViolation(text) {
  if (HEBREW_CHARS.test(text)) return "contains Hebrew characters (pack is English-only)";
  if (reportsInHebrew(text)) return "names Hebrew as the reporting language (pack is English-only)";
  if (NON_PORTABLE_PATH.test(text)) return "contains a machine-specific home path (pack is portable)";
  return null;
}

/**
 * The subset that stops the sync *writer*. Deliberately narrower than the full
 * rule set: the Hebrew-reporting word heuristic is a property of the PUBLISHED
 * pack, not of a canonical file, and using it as a write-block was tried and
 * reverted in #50 - it matched English prose that merely mentions the reporting
 * language, mislabelling 20 already-translated files as untranslated.
 *
 * Hebrew characters and machine-specific home paths are different: those are
 * facts about the bytes being copied, so blocking the copy is correct.
 */
export function blocksSync(text) {
  if (HEBREW_CHARS.test(text)) return "contains Hebrew characters (pack is English-only)";
  if (NON_PORTABLE_PATH.test(text)) return "contains a machine-specific home path (pack is portable)";
  return null;
}