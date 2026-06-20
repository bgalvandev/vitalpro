---
name: scaffold-module
description: Scaffold a new Clean Architecture module library under libs/ using the @vitalpro/tools:clean-module Nx generator. Use when asked to create a new VitalPro module, a new bounded context, a new domain library, or a Core/Health surface module.
argument-hint: "<module-name> [core|health]"
allowed-tools: Bash(pnpm nx g *) Bash(pnpm nx show *) Read Glob
---

# Scaffold a VitalPro module

This repository requires every new module library under `libs/**` to be created with the
local Nx generator (see AGENTS.md → "Module Scaffolding Standard"). Manual scaffolding is a
merge blocker. Follow these steps.

## Inputs

- `$0` (or `$ARGUMENTS[0]`): module name (kebab-case, e.g. `billing`, `clinical-encounters`).
- `$1` (or `$ARGUMENTS[1]`): product surface, `core` or `health`. Default `core`.

If the surface is missing, ask which surface the module belongs to before generating.
Recall the topology rule: `Core` MUST NOT depend on `Health`; reverse dependencies are
merge blockers. Health-only concepts (patients, encounters, consents, FHIR) are `health`.

## Steps

1. Preview first — never generate blind:
   ```bash
   pnpm nx g @vitalpro/tools:clean-module $0 --domain=$1 --dry-run
   ```
2. Review the dry-run file list with the user. Confirm the target path is under `libs/`.
3. Generate for real once confirmed:
   ```bash
   pnpm nx g @vitalpro/tools:clean-module $0 --domain=$1
   ```
4. Verify the generated structure meets the standard:
   - `libs/$0/src/domain`, `src/application`, `src/infrastructure`, `src/interface` all exist.
   - `libs/$0/project.json` defines `build`, `lint`, `test`, and `typecheck` targets.
   - `libs/$0/project.json` `tags` include `surface:core` or `surface:health` matching `$1`.
5. Confirm boundaries with:
   ```bash
   pnpm nx show project $0
   ```
6. Remind the user of the next steps from the Change Workflow: add the domain rule first,
   then the use case in `application`, adapters in `infrastructure` only if side effects are
   needed, expose via `interface` with Zod DTO validation, and add tests per layer.

## Do not

- Do not hand-create the `libs/<name>` folder tree; the generator is mandatory.
- Do not add speculative abstractions, shared utils, or extra modules (Simplicity Standard).
- Do not let a `core` module import from a `health` module.
