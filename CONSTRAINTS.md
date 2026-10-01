# CONSTRAINTS — Issue #23: "See it in action" real captures on agent pages

## Zero regressions
- The five target pages (`site/agents/{code-reviewer,python-reviewer,typescript-reviewer,react-reviewer,type-design-analyzer}/index.html`) keep their existing sections, order, tile routing, and reveal-observer behavior intact.
- `/agents/` grid reveal (`site/app.js` reveal-observer selector) must keep matching — no change to card markup or `site/app.js`.
- No changes to validators, workflows, `agents/*.md`, or pipeline skills.

## No fabrication (hard rule)
- Every capture comes from a real run of the actual persona on a checked-in demo diff. No mockups, no hand-written fake findings.
- Any capture that cannot be produced for real is reported as a skip in the issue thread and the page falls back to text.

## Portability / privacy
- No usernames, machine paths, tokens, private repo or customer names inside any committed capture or text. File-by-file hygiene check before commit.

## Page weight budgets (hard limits)
- PNG/JPEG/WebP still ≤ 256 KB each; GIF ≤ 1.5 MB; width ≤ 1200 px.
- Gate: the issue's inline `node -e` budget-check one-liner over `site/` must print `OK` and exit 0.

## Accessibility
- Descriptive alt text (never just "screenshot"), visible caption, `width`/`height` attributes, `loading="lazy"`, static poster shown for animated GIF under `prefers-reduced-motion: reduce`, section readable with images blocked.

## Anti-cheat
- No skipping or disabling validators; no deleting assertions; no widening `.gitignore` for scratch captures.
- Full-suite sweeps stay with CI on push; targeted checks here are the budget one-liner, `npm run validate`, and `node scripts/validate-links.js`.

## Dependencies
- No new external dependencies, no new npm packages, no `<video>`/external hosting.
