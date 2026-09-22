---
name: vi-prune-artifacts
description: Station VI (Prune Artifacts) — Post-merge sweep that safely removes stale per-issue scratch, temporary task lists, and closed plans while strictly preserving permanent showcases, research papers, and live knowledge.
---

# Station VI: Prune Artifacts (`vi-prune-artifacts`)

Post-merge (or periodic) sweep that removes stale per-issue scratch files and temporary plans, relocates misplaced files, and ensures the repository carries only live knowledge. Works across **any project, language, or repository** without assuming repo-specific folder naming.

## Pipeline Position
- **Station:** Station VI of VII
- **Previous Station:** `v-babysit-pr-and-merge` (Babysit & Merge)
- **Next Station:** `vii-present-pr <id>` (Present PR)

---

## 1. Overview & Core Philosophy

Every shipped change sheds husks: temporary scratch notes, local plan checklists (`tasks/todo.md`) whose code now lives in the repository, and obsolete drafts.
Left unattended, they rot and mislead future agents. This skill distinguishes disposable exhaust from permanent knowledge:
- **Discards the dead:** Stale temporary plans and transient scratch files for closed/merged work.
- **Relocates the misplaced:** Moves loose drafts to appropriate documentation directories.
- **Protects permanent knowledge:** Preserves showcase artifacts (`*-presentation-*.html`, legacy `*-showcase-*.html`), research papers, architecture decision records (ADRs), and active plans.
- **Boundary — code-level dead code:** this station sweeps per-issue artifacts only. Dead or zombie **code** discovered after merge (unused modules, superseded APIs) is work for `deprecation-and-migration`, not for this sweep — route it, don't delete it here.

---

## 2. Core Sweep Rules & Patterns

### Pattern 1: Discover, Never Assume Layout
- **First step:** Scan the repository for artifact-shaped candidates (`*.html`, `*.md`, temporary scratch folders) outside version control and package dependencies.
- Match candidate homes (`docs/`, `docs/issues/`, `tasks/`, `scratch/`, `%TEMP%`).
- Treat paths as discovery targets, not rigid assumptions.

### Pattern 2: Two-Gate Obsolescence Test
A candidate file is eligible for deletion **only when BOTH conditions hold**:
1. **Work is Closed:** The associated work item is verified CLOSED or PR MERGED via tracker CLI (`gh issue view <n> --json state`).
2. **Zero Inbound References:** A full repo-wide search (excluding `.git/`) finds zero active references or links to the file.
- *If either gate fails (work is open OR file is referenced):* The file MUST be kept.
- *If tracker state is ambiguous:* Prompt the operator — never guess.

### Pattern 3: Knowledge is Untouchable (Strict Preservation Rule)
**The following categories are PERMANENT KNOWLEDGE and must NEVER be deleted:**
1. **Station VII Visual Presentations (`docs/issues/<id>-presentation-*.html`, legacy `<id>-showcase-*.html`):**
   These HTML files are historical architectural showcases and visual documentation of record. They remain permanently even when the issue is CLOSED.
2. **Research Papers & Findings (`runs/.../research-papers/`, `docs/reports/*-explained.html`):**
   Dated empirical findings, benchmark records, and methodology papers.
3. **Active Planning & Backlog (`TODO.md`, `ideas/`, active RFCs):**
   Future roadmaps and active architectural plans.
4. **Permanent Docs:** Anything linked from `README.md` or indexed in project documentation.

### Pattern 4: Target Artifacts for Pruning (Safe Deletion List)
Only the following items are pruned once their issue is CLOSED and merged:
- Closed task checklists: `tasks/plan.md` / `tasks/todo.md` (when archived or superseded by repository code).
- Transient scratch files: Local scratch directories (`scratch/`, temporary prompt logs) that served closed PRs.
- Empty directories left behind after cleanup.

### Pattern 5: Relocate Misplaced Keepers
If a valuable document lives in an arbitrary scratch location or repo root:
- Propose moving to `docs/` or `docs/issues/` with a clean, descriptive kebab-case name (`<topic>-<date>-<kind>.<ext>`).
- Confirm before moving; update any inbound references.

### Pattern 6: Dead Code Discovered During the Sweep (`refactor-cleaner`)
If the sweep surfaces dead or zombie **code** (unused modules, superseded APIs, orphaned exports) tied to the closed work: deploy the `refactor-cleaner` agent persona (from this repo's `agents/` directory) — run its analysis tools (knip / depcheck / ts-prune where applicable), remove with proof (zero references), one focused commit. Persona not found on disk → skip and record the skip; the `deprecation-and-migration` boundary (above) still applies.

---

## 3. Best Practices & Safety Guardrails

1. **Dry-Run Preview Table First:**
   Always generate a Keep / Delete / Relocate table detailing:
   - File path
   - Classification
   - Issue state
   - Recommendation & rationale
2. **Leave Nothing Uncommitted (Hygiene Rule):**
   An untracked keeper is as dirty as a stale scratch file. After the sweep:
   - `git add` every kept artifact the sweep found untracked (showcases, relocated docs) so nothing sits unrecorded.
   - If `git status --porcelain` now shows ONLY this sweep's work (your deletions, moves, and staged keepers), commit it: `chore(<scope>): prune closed-issue artifacts (#<n>)`.
   - If foreign dirt exists (files you did not touch and cannot attribute), stage and commit ONLY your files, then list the foreign paths in the report and stop — never bundle strangers into your commit.
3. **Verify Empty Folders:**
   Remove directories only after verifying they contain zero remaining files.

---

## Chat Output Contract

At the conclusion of Station VI, you MUST report to the user in clean, everyday English using this exact structured format:

```markdown
# 🧹 Leftover Cleanup Summary (Prune):

## 🗑️ Leftovers and temp files cleaned:
* [List of merged temp plan files from `tasks/`, drafts, or scratch safely deleted]
*(If no leftovers found: "Repo is completely clean — no leftovers to delete.")*

## 🛡️ Permanent knowledge assets preserved:
* **Visual showcase reports:** all `docs/issues/*-presentation-*.html` files (and legacy `*-showcase-*.html`) preserved as permanent record.
* **Research reports & ADRs:** [research reports and architectural docs preserved]

---

## 📊 Repo state:
* **Status:** Repo is clean of leftovers from the closed issue, carrying live and historical knowledge only.

## 🧠 Summary:
A few lines in plain English: what was cleaned to avoid misleading future agents, and which assets were kept as the project's documentation history.

👉 **Next step:** `/vii-present-pr <id>` — visual interactive HTML report, plain explanation, and manual verification guide.
```
