# Contributing

## What makes a good skill here

- **Specific:** numbered steps an agent can follow, not advice it can admire.
- **Verifiable:** exit criteria with evidence (tests, build output, runtime data). "Seems right" is never sufficient.
- **Minimal:** only what guides the agent. Detail goes in `references/`, loaded on demand.

## Adding or changing a skill

1. Keep `SKILL.md` lean (under ~500 lines); move detail to `references/`.
2. Frontmatter: `name` (kebab-case, matches folder) + `description` (what it does + when to use — this is the trigger surface).
3. Every relative file link and every backticked skill/agent name must resolve inside the repo (no phantom references).
4. If the skill is testable, ship `evals/evals.json` with at least a happy path and a negative case.
5. End the skill with a chat output contract: short, plain-English, with the single next step.

## Adding a reviewer agent

Copy the closest persona in `agents/`, keep the role narrow (one stack or axis), and make sure at least one station's routing table can reach it. Stations skip missing personas — they never simulate them — so a new agent is purely additive.
