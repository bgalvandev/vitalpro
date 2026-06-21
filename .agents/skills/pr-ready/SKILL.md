---
name: pr-ready
description: Verify a pull request is genuinely ready before opening it, marking it ready for review, or reporting that checks are running. Runs the mandatory VitalPro readiness checks (fetch, ancestry, mergeStateStatus, statusCheckRollup) so you never report a DIRTY or stale branch as ready.
argument-hint: "[pr-number]"
allowed-tools: Bash(git fetch *) Bash(git merge-base *) Bash(git rev-parse *) Bash(git status *) Bash(gh pr view *) Bash(gh pr checks *)
---

# Pull Request readiness check

Enforces AGENTS.md → "Pull Request Readiness and Check Visibility". Run this before
creating a PR, updating one, or telling the user a PR is ready to merge. Do not skip steps.

## Inputs

- `$0` (optional): the PR number. If omitted, derive it from the current branch with
  `gh pr view --json number` once a PR exists.

## Pre-resolved remote state

The following are resolved when this skill loads, so you start from current facts:

- Current branch: !`git branch --show-current`
- Fetch + ancestry vs `origin/main`: !`git fetch origin --quiet && (git merge-base --is-ancestor origin/main HEAD && echo "UP-TO-DATE" || echo "BEHIND — must update")`

If the ancestry line reads `BEHIND`, the branch MUST be updated (rebase/merge `origin/main`)
before you report readiness. Do not report a stale branch as ready.

## Steps

1. The fetch and ancestry check above already ran. If it reported `BEHIND`, stop and update
   the branch first; re-run this skill afterward.
2. Inspect GitHub mergeability and checks:
   ```bash
   gh pr view $0 --json mergeStateStatus,statusCheckRollup,headRefName,baseRefName
   ```
3. Interpret the result strictly:
   - `mergeStateStatus == DIRTY` → NOT ready. Report the conflict; do not say it is ready.
   - `mergeStateStatus == UNKNOWN` → re-query or wait, then re-check. Do not conclude yet.
   - `statusCheckRollup == null` → required checks have NOT registered. Do not claim checks
     are running. Wait until checks appear as `QUEUED`, `IN_PROGRESS`, or `COMPLETED`.
4. When reporting, record in the task trail: the PR URL, the merge state, and the names of
   the required checks.

## Merge-block triage

If GitHub says "Merging is blocked" while required checks pass, do NOT add unrelated code to
clear it. Inspect, in order: branch protection requirements, unresolved review threads, and
security/code-scanning conversations. Fix true-positive findings; dismiss false positives
with written justification in the thread. Record the cause and resolution in the PR trail.
