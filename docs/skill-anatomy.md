# Skill Anatomy

Every skill in this repo follows the same structure so agents can parse it reliably.

```
skills/<name>/
  SKILL.md              # entry point — frontmatter + workflow
  references/           # detail loaded on demand (optional)
  evals/evals.json      # happy path + negative case (if testable)
```

## Frontmatter

```yaml
---
name: kebab-case-matches-folder
description: What it does + when to use — this is the trigger surface.
---
```

- `name` must exactly match its folder.
- `description` must be non-empty; it's how `pipeline-triage` and routing pick the skill.

## Body Sections

1. **Overview** — one paragraph, plain English.
2. **When to Use** — bullet list of trigger phrases / scenarios.
3. **Process** — numbered steps the agent follows. This is the workflow, not advice.
4. **Guardrails** — what the agent must NOT do (e.g., "never simulate a missing reviewer").
5. **Verification** — evidence required before claiming done (tests, build output, runtime data).
6. **Chat Output Contract** — short, plain-English report template with single next step.

## References

Large checklists and examples live in `references/<topic>.md`. The main `SKILL.md` links to them; the agent loads them only when the task needs that detail. Keep `SKILL.md` under ~500 lines — move everything else to `references/`.

## Evals

If the skill is testable, ship `evals/evals.json`:

```json
{
  "cases": [
    { "name": "happy path", "prompt": "...", "expect": "contains: ..." },
    { "name": "negative", "prompt": "...", "expect": "refuses: ..." }
  ]
}
```

## Portability Rule

All paths are relative, no absolute paths, no usernames, no OS-specific homes. A skill installed via `npx skills add` must work unchanged on Linux, macOS, and Windows.
