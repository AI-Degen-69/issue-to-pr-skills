// Drift policy for the localized pipeline stations.
//
// Canonical (~/.agents) reports in Hebrew; this pack is public and English-only,
// so the 10 localized stations are hand-maintained translations that differ from
// canonical BY DESIGN. A straight hash comparison is meaningless for them.
//
// That "differs by design" knowledge used to live in a `|| echo ...` at the end of
// the `check` npm script. Shell precedence made that mask swallow EVERY earlier
// failure, so `npm run check` exited 0 no matter what - it could not fail. This
// module moves the knowledge into code, where it is testable, and lets the drift
// that genuinely needs attention still fail the gate.
//
// Three buckets, not two, because lumping them together tells the next maintainer
// to re-translate work that is already done - the exact misdirection #48 called
// out. The classifier asks two separate questions per file, both answered by
// shared rules rather than local copies:
//
//   is it inside a localized station?   -> LOCALIZED_SKILLS
//   would sync write it, or block it?   -> blocksSync() in content-rules.js
//
// so "blocked" here means exactly what the sync guard will do, and the report can
// never disagree with the writer.
//
// See agents-home#2: extracting the Hebrew reporting contract out of SKILL.md
// makes the localized stations byte-syncable, after which this distinction (and
// this file) should collapse into the ordinary hash path.

/**
 * Split drifted pack paths into the three kinds that mean different things:
 *
 *  - blocking: a mirrored skill that should be byte-identical and is not
 *  - blocked:  a localized file the sync guard refuses to copy (Hebrew
 *              characters, or a machine-specific home path) - intentionally hand-written
 *  - stale:    a localized file sync *would* copy, but the pack's copy is behind
 *
 * Paths are `skills/<station>/<rel>`; only the station decides whether a path is
 * localized. `isBlocked(station, rel)` answers the second question from the
 * canonical file's own content.
 */
export function classifyDrift(driftedPaths, localizedSkills, isBlocked = () => false) {
  const blocking = [];
  const blocked = [];
  const stale = [];
  for (const p of driftedPaths) {
    const parts = String(p).split("/");
    const station = parts[0] === "skills" ? parts[1] : undefined;
    if (station === undefined || !localizedSkills.has(station)) {
      blocking.push(p);
    } else if (isBlocked(station, parts.slice(2).join("/"))) {
      blocked.push(p);
    } else {
      stale.push(p);
    }
  }
  return { blocking, blocked, stale };
}

/**
 * A mirrored skill that drifted always fails. Localized drift fails only under
 * --strict, so the default gate is honest without blocking releases, while a
 * release check can still demand a perfectly synchronized pack.
 */
export function driftExitCode({ blocked, stale, blocking }, strict = false) {
  if (blocking.length > 0) return 1;
  if (strict && blocked.length + stale.length > 0) return 1;
  return 0;
}