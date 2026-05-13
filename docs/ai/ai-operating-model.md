# AI Operating Model for VitalPro

This document defines how to maximize AI productivity in this repository while preserving engineering quality.

## Objectives
- Accelerate implementation, refactoring, and review cycles.
- Preserve Clean Architecture and module boundaries.
- Keep changes verifiable through automated quality gates.

## High-value AI use cases
1. Implement bounded use cases in existing modules.
2. Refactor code within a single layer while preserving behavior.
3. Generate and update tests for domain/application/interface boundaries.
4. Review pull requests for bugs, regression risk, and boundary violations.
5. Propose fixes for failing CI jobs with concrete patches.

## Required context for every AI task
- `AGENTS.md`
- `README.md`
- Relevant `project.json`
- Relevant module files under `src/domain|application|infrastructure|interface`
- Contract files under `contracts/openapi/**` when API behavior is involved

Use:

```bash
pnpm run ai:task-pack -- --task "<task>"
```

## Fast execution loop
1. Prepare context pack.
2. Execute focused change.
3. Run `pnpm run ai:guard`.
4. Run project-specific tests.
5. Run `pnpm run check` before merge.

## Failure recovery loop
When AI output fails checks:
1. Capture failing command output.
2. Ask the agent to fix only failing scope.
3. Re-run only impacted checks first.
4. Re-run full check once failures are resolved.

## Recommended model routing
- Fast model: formatting, boilerplate, small scoped edits.
- Strong model: architecture-sensitive edits, regression-prone changes, cross-module refactors.

## Non-negotiables
- No Core -> Health dependency.
- No layer boundary shortcuts.
- No contract drift for external API behavior.
