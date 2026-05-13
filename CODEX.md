@AGENTS.md

# Codex Runtime Instructions

This repository is optimized for agentic execution with strict architecture constraints.

## Operating constraints
- Follow all mandatory rules from `AGENTS.md`.
- Keep edits small, coherent, and test-backed.
- Prefer `rg` for search and `pnpm nx` targets for monorepo tasks.

## Execution checklist
1. Build task context with `pnpm run ai:task-pack -- --task "<task>"`.
2. Implement using existing project boundaries and naming conventions.
3. Run `pnpm run ai:guard` and target tests.
4. Run `pnpm run check` before proposing merge.

## Architecture guardrails
- `domain` is deterministic and framework-free.
- `application` orchestrates use cases and ports.
- `infrastructure` contains side effects and adapter implementations.
- `interface` handles DTO/transport mapping only.

## Contract discipline
- External API behavior changes require OpenAPI updates in `contracts/openapi/**`.
