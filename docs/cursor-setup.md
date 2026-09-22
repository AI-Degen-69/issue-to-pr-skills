# Cursor Setup

Sync skills from this repo into `.cursor/skills/` (do not paste full skills into `.cursor/rules/`).

```bash
npx skills add AI-Degen-69/issue-to-pr-skills --skill pipeline-triage
# or all:
npx skills add AI-Degen-69/issue-to-pr-skills
# then sync to .cursor:
cp -r ~/.config/opencode/skills/* .cursor/skills/  # or copy manually
```

Keep short policies in `.cursor/rules/*.mdc` — full skill content belongs in `.cursor/skills/`.
