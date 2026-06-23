---
name: engineering-discipline
description: The working protocol for any non-trivial change in this repo — verify before claiming, no hallucinated APIs, smallest correct solution, and run the gates before declaring done. Use at the start of an implementation task and before reporting it finished.
---

# Engineering Discipline

The goal: one clear line of reasoning to the best solution — no guessing, no
hallucinated APIs, no speculative scaffolding. This skill is the default operating
protocol; the topic skills ([[frontend-architecture]], [[frontend-performance]],
[[frontend-e2e]], [[code-quality]]) cover specifics.

## 1. Ground every claim in evidence

- Before using a function, type, package export, config flag, or CLI option,
  **confirm it exists** — read the file, check `package.json`, or check official
  docs. Do not invent names or assume an API shape from memory.
- Before asserting something works ("tests pass", "the build is green", "this
  fixes it"), **run the command and read the output**. Report what actually
  happened, including failures — never claim a result you did not observe.
- When unsure between two readings of the requirement, ask or state the assumption
  explicitly; do not silently pick one and build on it.

## 2. Smallest correct change

- Use the smallest code path, module scope, and layer surface that satisfies the
  requirement while preserving the architecture (AGENTS.md "Simplicity and
  Proportionality Standard").
- Do **not** add abstractions, adapters, services, or shared utilities for
  speculative future reuse. Add structure only when the current behavior needs it.
- Match the surrounding code: naming, file conventions
  (`*.use-case.ts`, `*.dto.ts`, …), comment density, and test style.

## 3. Respect the architecture

- Clean Architecture direction is non-negotiable: `interface → application →
  domain`, `infrastructure → application/domain`, `domain` free of framework/IO.
- Core must not depend on Health; FHIR stays at Health interop boundaries.
- External side effects (DB, HTTP, queue, file, email) live behind an
  `infrastructure` adapter. API handlers never return ORM/Prisma shapes.

## 4. Change workflow

1. Identify the target module, Nx project(s), and layer(s).
2. Change domain rules first when behavior changes, then the use case, then the
   adapter, then the interface/DTO. Add/adjust tests per layer.
3. Update the OpenAPI contract in the same change when an external API surface
   changes (`openapi-contract-update` skill).
4. Verify before declaring done.

## 5. Definition of done (run these, read the output)

- Focused: `pnpm run ai:guard` + the affected project's `lint`, `typecheck`,
  `test` (`pnpm nx affected -t lint,typecheck,test,build`).
- Full gate before merge: `pnpm run check` (lint, typecheck, test, build,
  openapi:lint, ai:guard, dead-code, dupes) — all green.
- For web behavior, add/run e2e ([[frontend-e2e]]).
- For PR readiness use the `pr-ready` skill; for commits use `commit-check`.

If a gate fails, fix the cause — do not weaken the gate, delete the test, or add an
ignore to make red turn green. Justify any genuinely-needed config exception in the
PR.
