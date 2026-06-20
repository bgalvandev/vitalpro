---
name: commit-check
description: Validate a change against VitalPro commit and branch standards before committing — not on a protected branch, Conventional Commits header, Nx-aligned scope, and no authorship trailers. Use before running git commit, or when drafting a commit or squash-merge subject.
allowed-tools: Bash(git branch *) Bash(git status *) Bash(git diff *) Bash(git log *)
---

# Commit and branch standards check

Enforces AGENTS.md → "Commit Message Standard" and "Pull Request Branch and Merge Strategy".
Run before creating a commit. Report any failing check and stop until it is resolved.

## Steps

1. Confirm you are NOT on a protected branch:
   ```bash
   git branch --show-current
   ```
   If the branch is `main` or a release branch, STOP. Create a non-protected working branch
   before the first edit; never commit feature/fix/chore work directly on `main`.
2. Review what is staged:
   ```bash
   git status --short && git diff --cached --stat
   ```
3. Validate the proposed commit header against Conventional Commits 1.0.0:
   `<type>[optional scope]: <description>`
   - Type MUST be one of: `feat`, `fix`, `refactor`, `perf`, `docs`, `test`, `build`, `ci`,
     `chore`, `revert`.
   - Scope SHOULD map to an Nx project/module (e.g. `core-api`, `appointments`,
     `health-domain`, `tools`). If no stable scope fits, omit it and note why.
   - Mark breaking changes with `!` and/or a `BREAKING CHANGE:` footer.
   - Subject MUST be concise, specific, and in English.
4. The commit message MUST NOT contain authorship trailers — no `Co-Authored-By:` or
   `Co-authored-by:` lines. Strip them if present.
5. Prefer one logical change per commit. `WIP`/`tmp`/unclear messages are not allowed on
   shared branches.
6. If this subject will become the squash-merge subject on `main`, it MUST read cleanly as-is
   and the final squash subject will carry the `(#<number>)` PR suffix.

## Examples

- `feat(appointments): add waitlist auto-fill use case`
- `fix(core-api): prevent duplicate charge retries`
- `refactor(health-domain)!: remove legacy encounter format`
