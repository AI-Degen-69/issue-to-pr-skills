# Changelog

All notable changes to this project will be documented in this file.

## [0.2.0] - 2026-09-24

- Station renames to match the canonical pipeline: former station X → `i-pick-issue`, former station I create → `create-issue`, former station VII → `present-pr` (now ad-hoc, on request)
- Prune merged into close: former station VI prune → `vi-close-pipeline` (confirms merge, prunes scratch, updates PROGRESS.md + handoff)
- Station IV browser proof gate now prefers `playwright-cli`; Chrome DevTools MCP kept for performance traces
- All skill content refreshed from the canonical source; docs and site updated to the new names and 7-station structure

## [0.1.0] - 2026-09-22

- Initial public release: 10 pipeline skills, 36 supporting skills, 17 reviewer personas
- Pipeline contracts with proof-before-review gates and quota-conscious reviews
- Marketplace + `npx skills add` install for Claude Code, OpenCode, Cursor, Gemini, and 70+ agents
- Docs: getting-started, pipeline guide, skill anatomy, agents
- CI validation + marketplace manifests
