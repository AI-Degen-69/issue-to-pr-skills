---
name: i-create-issue
description: Station I (Intake) — Turn a raw operator idea, thought, or request into a researched, structured, publishable GitHub issue labeled `ready-for-agent`.
---

# Station I: Create Issue (`i-create-issue`)

Turn one raw operator idea into one professional GitHub issue, publishable and
workable by any agent later — including a fresh session with no memory of this
conversation.

## Pipeline Position
- **Station:** Station I of VII
- **Next Station:** `ii-plan-issue <issue-id>` (or `x-workflow-issue`)

## Workflow

1. **Read the tracker conventions.** Open the issue-tracker doc that ships with
   this skill at `references/issue-tracker.md` (relative to the skill root) and
   use its intake template and command conventions (auth pre-flight, body-file
   publishing, label fallbacks, split-failure handling). That doc is the single
   source of truth for the intake template itself — see it there, under
   "Raw idea intake → Intake template".
2. **Research before drafting.** Scan the repo for relevant files (search for
   symbols, render sites, config) so Relevant files names real paths with line
   numbers. An issue written without research is not ready-for-agent.
3. **Capture open questions in the issue.** If the operator's intent is
   ambiguous, do NOT stop to interrogate: write each unclear point into the
   issue under **Open questions** (what is unclear + why it matters + the
   default assumption the next station should work with) and add the
   `needs-answers` label. Ask the operator only when the idea cannot be drafted
   at all without an answer. Never guess intent silently.
4. **Decide single vs split.** If the idea is one coherent change, draft it as
   a single issue (below). If it is really several separable work items — e.g.
   different files, different owners, or one part clearly blocks another — split
   it into multiple issues. Splitting is the agent's call: do it when a single
   issue would be too large to pick up cleanly or when the parts have distinct
   acceptance criteria. Never split a genuinely atomic idea just to multiply
   tickets.
5. **Draft in English.** Interpret the operator's raw words into the template
   sections; never quote them back. Title: short, plain-English, action-shaped.
   For a split, each issue gets its own title + body; keep the shared context in
   each so none reads as orphaned.
6. **Publish immediately (No waiting for approval).** Once the draft is prepared
   (and any clarifying questions resolved), publish directly to GitHub without
   pausing to show the draft or waiting for user confirmation.
   - Single issue:
     `gh issue create --title "..." --body-file <file> --label ready-for-agent`
     (add `needs-triage` alongside only when the idea is genuinely unshaped even
     after research).
   - Split: publish every issue first, capture each `#number`, then wire them
     together so they are visibly one family, not orphans:
     - Put `Part of #<first-issue>` at the top of every later sibling's body,
       pointing at the first published issue (the first sibling carries only the
       `Related:` line — matches the convention in this skill's
       `references/issue-tracker.md`).
     - Post a cross-reference comment on each issue pointing at the others, e.g.
       `gh issue comment <n> --body "Related: #<a>, #<b>"`.
     - If one part blocks another, add a native dependency edge:
       `gh api --method POST repos/<owner>/<repo>/issues/<child>/dependencies/blocked_by -F issue_id=<blocker-db-id>`
       where `<blocker-db-id>` is the blocker's numeric database id
       (`gh api repos/<owner>/<repo>/issues/<n> --jq .id`), not the `#number`.
7. **Closeout in chat:** You MUST report to the user in clean, everyday English following the Output Contract below. Never make the user wait before creation.

## Intake template

See `references/issue-tracker.md` → "Raw idea intake → Intake template" — it is
the single source of truth for the body of every intake issue (English only, the
operator's raw words are never quoted back, and the final acceptance criterion
must be a runnable verification command).

## Split variant

When the agent splits one idea into several issues, every later sibling body
leads with a `Part of #<first-issue>` line pointing at the first published
issue, and every sibling (first included) carries a **Related** note so none
reads as orphaned. Example top of each *later* sibling body:

```markdown
Part of #<first-issue>  ·  Related: #<a>, #<b>

## Summary
...
```

The first-published sibling gets only the `Related:` line — no self-reference.
The agent posts a cross-reference comment on each issue and, where one part
blocks another, adds a native dependency edge (see Workflow step 6).

## Quality bar

A published issue is ready-for-agent when a fresh agent, given only the issue
and repo access, can start work without asking the operator anything:
real file paths, an explicit out-of-scope line, and acceptance criteria whose
last item is a runnable verification command.

---

## Chat Output Contract

At the conclusion of Station I, you MUST report to the user in clean, everyday English using this exact structured format:

```markdown
# 📝 Issue Creation Summary:

## 🔍 What was found in the code:
* **Files and locations:**
  - `[file_path:line]` — [what is there and why it relates to the task]
* **Scope (in and out):** [one-two lines: what the task covers, and what is explicitly out of scope]
* **Acceptance criteria:**
  - [central acceptance criterion]
  - Verification command: `[check that must pass]`

---

## 📊 Issue details:
* **Number and link:** [#<id> - <issue title>](<direct link to the GitHub issue>)
* **Sub-issues:** [only if the idea was split — the siblings and their numbers; if not split, this line does not appear at all]

## 🧠 Summary in plain words:
[2-3 sentences anyone can understand, no code terms: what the idea or problem was, what the issue asks to do, and how they will know the work is done. No filler, no buzzwords.]

## 👉 What now:
1. Run `/x-workflow-issue` to map the whole backlog and pick which issue to work on.
2. If there is a suggested improvement to the written issue (clarification, scoping, missing acceptance criterion) — propose it here in one-two lines; if none, write "no suggestions" — never invent.
```
