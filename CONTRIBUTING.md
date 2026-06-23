# Contributing to VitalPro

Thanks for contributing — whether you are a person or an AI coding agent.

## Standards live in AGENTS.md

All engineering standards are defined in **[`AGENTS.md`](./AGENTS.md)**: architecture,
conventions, commit/PR rules, and the quality gates. Read it before changing code.
On-demand procedures live in `.agents/skills/`. This file only orients you — `AGENTS.md`
is the authority.

## Workflow

1. Branch off `main`; never commit feature work directly to `main`.
2. Make the smallest correct change and respect Clean Architecture per module.
3. Run `pnpm check` (lint, typecheck, test, build, and the quality gates) before opening a PR.
4. Use Conventional Commits; the PR title doubles as the squash subject and must end with
   `(#<number>)`.
