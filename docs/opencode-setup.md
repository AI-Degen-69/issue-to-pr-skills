# OpenCode Setup

## Install

```bash
npx skills add AI-Degen-69/issue-to-pr-skills            # all skills
npx skills add AI-Degen-69/issue-to-pr-skills --list     # browse
```

Files land in `~/.config/opencode/skills/` (global) or `.opencode/skills/` (project).

## Use

Agents discover skills via the `skill` tool. Stations are slash-like prompts:

- `/i-pick-issue` → map the backlog and pick an issue
- `/ii-plan-issue 123` → plan issue #123
- `/iii-build-plan auto` → build all tasks

Or ask naturally: "plan issue #42" routes via `pipeline-triage`.

## Agents

Copy `agents/*.md` to your OpenCode agents directory if you use persona dispatch. Stations skip missing personas — they never simulate.

## Verify

```bash
npm run validate   # checks frontmatter + links
```
