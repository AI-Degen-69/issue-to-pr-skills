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
 * A canonical file that ORDERS output in Hebrew, written in English words with
 * no Hebrew characters at all - "report to the user in clean, everyday Hebrew".
 *
 * This is the gap that let `npm run sync` overwrite the pack's English output
 * contracts with Hebrew ones: blocksSync() only tested for Hebrew CHARACTERS,
 * so a file carrying the instruction in plain ASCII sailed through the guard.
 * Every station hit this at once, and the corrupted English contracts were only
 * caught because the drift was noticed by hand afterwards.
 *
 * Deliberately narrower than reportsInHebrew(), which is why this can be a
 * write-block when that one cannot (#50): it matches the word "Hebrew" only
 * when a reporting verb governs it within the same sentence. Prose that merely
 * *mentions* Hebrew - a note that the pack is translated, a voice-note intake
 * description, a reviewer persona's provenance - does not match, so the ~20
 * legitimately translated files keep importing.
 */
const HEBREW_OUTPUT_ORDER =
  /(?:report|reporting|answer|answers|respond|responds|reply|replies|closeout|output|outputs)\b[^.\n]{0,60}\bHebrew\b/i;

/** The local-only block: canonical-only content the pack must never publish. */
export const LOCAL_ONLY_BLOCK = /[ \t]*<!--\s*local-only:begin\s*-->[\s\S]*?<!--\s*local-only:end\s*-->\n?/g;

/**
 * Remove local-only blocks. Canonical marks its machine-local sections (chiefly
 * the pointer to references/output-template.md, the Hebrew chat contract that
 * is deliberately NOT published) with these markers so a consumer can strip
 * them mechanically. Stripping is what keeps those pointers - which name a file
 * this pack does not ship - from becoming dangling links on import.
 */
export function stripLocalOnly(text) {
  return text.replace(LOCAL_ONLY_BLOCK, "");
}

/**
 * A canonical file whose English output contract cannot be published: it either
 * contains Hebrew characters, names a machine-specific home path, or orders its
 * output in Hebrew in plain ASCII.
 */
export function blocksPublication(text) {
  return blocksSync(stripLocalOnly(text)) ?? (HEBREW_OUTPUT_ORDER.test(stripLocalOnly(text)) ? "orders its output in Hebrew (pack is English-only)" : null);
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