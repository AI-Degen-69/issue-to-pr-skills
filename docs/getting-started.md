# Getting Started

## One-command install (any agent)

Via the open [skills CLI](https://github.com/vercel-labs/skills) (70+ agents supported):

```bash
npx skills add AI-Degen-69/issue-to-pr-skills            # everything
npx skills add AI-Degen-69/issue-to-pr-skills --list     # browse first
npx skills add AI-Degen-69/issue-to-pr-skills --skill ii-plan-issue   # one station
```

## Manual install

Skills are plain Markdown. Copy `skills/<name>/` into your tool's skills directory and `agents/*.md` into its personas directory:

| Tool | Skills go to | Agents go to |
|---|---|---|
| Claude Code | `~/.claude/skills/` or project `.claude/skills/` | project agent dir / plugin |
| OpenCode | `~/.config/opencode/skills/` | built-in agent config |
| Gemini CLI | `~/.gemini/skills/` | n/a |
| Cursor | `.cursor/skills/` | `.cursor/rules/` (short policies only — never paste full skills into rules) |
| Anything else | Any directory your agent reads as instructions | Same |

## Prerequisites

- `git` and [`gh`](https://cli.github.com/) (authenticated: `gh auth login`) — Stations I, II, IV, V need them.
- A CodeRabbit account wired to your repos — Stations IV/V use `@coderabbitai review`. Without it the pipeline falls back to agent reviews automatically.

## First run

1. Open any repo with GitHub issues.
2. Run `/x-workflow-issue` — pick an issue and an execution mode (step-by-step recommended first).
3. Follow the stations. Each report tells you the single next step.

## Adapting to your team

- The pipeline reports in plain English. If your team prefers another language, translate the Chat Output Contract templates in `skills/*/SKILL.md` — keep the structure, change the words.
- Reviewer personas live in `agents/` — add your stack's reviewer by copying the closest one.
- Quality bars live in each project's `CONSTRAINTS.md` (written by Station II per issue), not in the skills — the skills stay generic.
