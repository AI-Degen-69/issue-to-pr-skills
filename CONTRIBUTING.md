# Contributing

## What makes a good skill here

- **Specific:** numbered steps an agent can follow, not advice it can admire.
- **Verifiable:** exit criteria with evidence (tests, build output, runtime data). "Seems right" is never sufficient.
- **Minimal:** only what guides the agent. Detail goes in `references/`, loaded on demand.

## Line endings

The repository stores **LF** for every text file, on every platform. `.gitattributes` enforces it, so you never need to configure anything locally:

```
* text=auto
* text eol=lf
```

Do not "fix" this by committing CRLF, and do not add a `.gitattributes` override in your own fork — the point is that the bytes are identical for everyone.

**Why it matters here specifically.** This pack is a *mirror*: 37 of the 47 skills must stay byte-identical to the canonical agent home, and `npm run check` compares them by SHA-256. CRLF drift is invisible in a diff review but very visible to a hash, so a contributor who saves a file in a CRLF editor can fail the gate on a line they never touched.

**If you see a phantom modified file** — `git status` reports a file as changed while `git diff` shows nothing — your working copy has the wrong line endings. Check with `git ls-files --eol <file>`: `i/lf w/crlf` means the index holds LF and your copy holds CRLF. The fix is to re-checkout, not to commit:

```bash
git checkout -- <file>          # single file
git rm -r --cached . && git reset --hard   # whole tree, once, after cloning
```

Note that `core.autocrlf=true` is a *local* setting and is ignored wherever `.gitattributes` speaks, which is why the attributes file is the fix rather than a docs note.

## Adding or changing a skill

1. Keep `SKILL.md` lean (under ~500 lines); move detail to `references/`.
2. Frontmatter: `name` (kebab-case, matches folder) + `description` (what it does + when to use — this is the trigger surface).
3. Every relative file link and every backticked skill/agent name must resolve inside the repo (no phantom references).
4. If the skill is testable, ship `evals/evals.json` with at least a happy path and a negative case.
5. End the skill with a chat output contract: short, plain-English, with the single next step.

## Adding a reviewer agent

Copy the closest persona in `agents/`, keep the role narrow (one stack or axis), and make sure at least one station's routing table can reach it. Stations skip missing personas — they never simulate them — so a new agent is purely additive.
