# CONSTRAINTS — Issue #40: site/ stays static (Option A decision)

## Decision (locked): Option A — stay static
- `site/` remains plain static HTML + CDN Tailwind (`cdn.tailwindcss.com` in `site/index.html:16`). No `site-web/`, no Vite/Next, no `components.json`, no shadcn CLI/MCP install.
- The shadcn skill is used as design-rules inspiration only (Card/Tabs/Badge/Button patterns hand-applied in static HTML/CSS), never as installed components.
- Rationale: site is ~26 HTML pages (~1.4 MB total), single `server.js` static serve + GitHub Pages `path: 'site'` deploy; a rebuild adds build toolchain + deploy migration cost with no matching payoff while the page count and interactivity (vanilla `app.js`, `skills-flow.js`, `shared-interactions.js`) stay small.

## Zero regressions
- No new directories (`site-web/` must not exist), no changes to `server.js` static-serve behavior, no changes to `.github/workflows/static.yml` deploy path (`site`), no changes to `skills/` or `agents/` markdown sources.
- `site/index.html` CDN Tailwind script tag stays; no build step introduced (`npm run build` stays a no-op echo).

## Portability
- English only in committed docs (per repo AGENTS.md); relative paths only; no absolute paths, usernames, or OS-specific homes.
- `docs/site-static-decision.md` is the explicit "stay static + why" record the issue's Option-A acceptance criterion demands.

## Anti-cheat
- No skipping or disabling validators; `npm run check` must pass. A shadcn rebuild (Option B artifacts: `site-web/`, `components.json`) failing to appear is the correct outcome, not a gap.
- Minimal diff: decision record + pointer docs only; no restyling of the site, no touching skills/agents sources.

