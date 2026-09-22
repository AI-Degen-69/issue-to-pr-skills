# Post-Merge Steps (`v-babysit-pr-and-merge` Steps 5b–5c)

## Step 5b — Post-Merge Local Reset (Fresh Start on Base)

A merge on GitHub does NOT move the local checkout: the terminal keeps showing the feature branch and local `master` stays stale. Every session must end back on a clean, up-to-date base branch so the next session starts fresh. Run this after every merge (and after every escalation that abandons the PR):

1. **Record the base branch** (captured in Step 0; default to the repo default):
   ```bash
   gh repo view --json defaultBranchRef -q .defaultBranchRef.name
   ```
2. **Guard against uncommitted work — never blow away a dirty tree:**
   ```bash
   git status --porcelain
   ```
   - **Dirty tree:** these are unmerged changes that do not belong to the merged PR. Do NOT discard them. Commit-and-push them to the branch, or stash them with `git stash push -m "pre-reset <branch>"`, before proceeding. If ownership is ambiguous, escalate instead of destroying.
3. **Confirm the PR is actually merged on the remote** (required before the force-delete in step 5 — squash merges leave the local branch with commits that are NOT ancestors of base, so `git branch -d` will always refuse):
   ```bash
   gh pr view <pr-number> --json state --jq .state   # must print MERGED
   ```
4. **Switch to base and fast-forward it:**
   ```bash
   git checkout <base> && git pull --ff-only origin <base>
   ```
5. **Delete the merged local branch** (`-D` is safe here precisely because step 3 confirmed `MERGED` on the remote; the remote branch was already removed by `--delete-branch`):
   ```bash
   git branch -D <branch-name>
   git fetch --prune
   ```
6. **Verify the fresh start:**
   ```bash
   git branch --show-current   # -> <base>
   git status                   # -> clean, up to date with origin/<base>
   ```
   Output note: `Local reset: on <base>, clean, merged branch <branch-name> deleted.`

**Failure handling:** if `git pull --ff-only` fails (diverged local base), or the tree cannot be safely cleaned, stop and escalate — never force-reset the operator's checkout.

## Step 5c — Post-Merge Workspace Sweep (Leave a Clean Folder)

Instead of routing to `vi-prune-artifacts`, do a quick focused sweep right here:

1. Look for junk tied to this issue's work only: temp files, one-off debug scripts, leftover single-use outputs under `tasks/` / `scratch/` that served this issue and nothing else.
2. Delete only what is clearly unrelated to the repo and single-use. Never touch tracked source, configs, or anything shared.
3. On any doubt about a file's ownership or purpose — leave it and escalate instead of deleting.
4. Output note: `Workspace sweep: removed <files> (issue-scoped temp/junk). Folder left clean.` (or `nothing to remove`).
