# Site stays static — decision record (Issue #40, Option A)

Status: decided — `site/` remains plain static HTML. No `site-web/` rebuild, no shadcn install.

## Decision
Keep `site/` as static HTML + CDN Tailwind. Use the shadcn skill as design-rules inspiration
only (Card, Tabs, Badge, Button patterns hand-applied in static HTML/CSS) — never as installed
components via CLI/MCP.

## Evidence
- `site/index.html` loads Tailwind via CDN (`https://cdn.tailwindcss.com`); `package.json`
  `build` is a no-op echo — there is no build step.
- `server.js` only serves `site/` statically via `express.static`; the only routes are
  `/api/health` and `/api/version`.
- `.github/workflows/static.yml` deploys `path: 'site'` to GitHub Pages with no build job.
- `site/` holds 26 HTML pages (~1.4 MB total) with vanilla JS (`app.js`, `skills-flow.js`,
  `shared-interactions.js`); no React/Vite/Next and no `components.json` anywhere.
- A rebuild would add a build toolchain, a deploy migration, and a full page port for no
  matching payoff at this size and interactivity level.

## Revisit when (objective triggers for a future rebuild)
- Page count or interactive complexity outgrows hand-maintained static HTML (e.g. shared
  components duplicated across many pages become a maintenance burden).
- The site needs a real build (bundling, code-splitting, typed components) rather than CDN scripts.
- Design-system pressure: three or more pages need identical stateful primitives (tabs, dialogs,
  command palettes) that shadcn would provide consistently.
- Until one of these holds, stay static.

## What this decision does not change
- Page content, nav/IA, deploy path, `server.js` behavior, and `skills/`/`agents/` sources
  are untouched. No new dependencies were added.
