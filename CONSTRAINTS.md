# CONSTRAINTS — Issue #44: Distinct theme-consistent page backgrounds

## Scope (locked)
- CSS-only background layer: shared utilities in `site/shared-interactions.css` + additive body classes on 21 pages (Home, Skills, Agents, Docs, 17 agent-detail pages).
- Distinct but harmonious dark-family backdrops; existing content, nav/IA, light mode out of scope.
- Must NOT modify: `skills/`, `agents/` markdown sources, `site/app.js`, `site/shared-interactions.js`, `server.js`, workflows, validators, version badges/footers rewritten by `scripts/version-sync.js`.

## Zero regressions
- Body base colors stay (`bg-[#09090b]` top-level, `bg-[#020617]` detail pages); existing `.glass`, `.hero-grid`, inline header gradients, per-page `selection:` accents untouched.
- No new stacking contexts trapping nav/modal/tooltips/fixed controls; sticky nav, modal, tooltips, back-to-top/progress controls keep working.
- No horizontal overflow introduced; Home + Skills desktop TOCs intact.

## Accessibility
- Text contrast preserved (4.5:1 normal, 3:1 large) at each variant's brightest region; static backdrop under `prefers-reduced-motion: reduce`.

## Dependencies
- No external images/fonts/JS, no new npm packages, no new network requests; works from static file serving.

## Anti-cheat
- No skipping validators; `npm run validate`, `node scripts/validate-links.js`, `npm run validate:mirror`, `npm run version:check` each run separately (never masked by `npm run check`'s `|| echo`); `npm test` green.
- Version bump policy: `+0.1` doc change (`npm run version:bump -- --doc` then `npm run sync:site`); never hand-edit `site/version.json` or `site/skills.json`.


