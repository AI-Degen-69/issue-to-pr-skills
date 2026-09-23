# Claude Code Setup

## Option A — Plugin (recommended, auto-updates)

```
/plugin marketplace add AI-Degen-69/issue-to-pr-skills
/plugin install issue-to-pr-skills@ai-degen-marketplace
```

Updates arrive automatically when we ship.

## Option B — Skills CLI (editable copy)

```bash
npx skills add AI-Degen-69/issue-to-pr-skills
```

Writes skills into your repo as ordinary files you own and can edit. Pull updates with `npx skills update`.

## Option C — Manual

Copy `skills/<name>/` to `.claude/skills/` and `agents/*.md` to your personas directory.

## Verify

Inside Claude Code, type `/i-pick-issue` — you should see the backlog map. Or run `npm run validate` in the repo.
