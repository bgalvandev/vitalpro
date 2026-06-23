# AI Operating Model for VitalPro

How to get high-quality work from AI assistants in this repo without eroding
engineering standards.

## The working protocol lives in a skill

The step-by-step protocol — verify before claiming, no hallucinated APIs, smallest
correct change, respect the architecture, run the gates before declaring done — is
the `engineering-discipline` skill (`.agents/skills/engineering-discipline/`). Topic
skills cover specifics: `frontend-architecture`, `frontend-performance`,
`frontend-e2e`, `code-quality`, `openapi-contract-update`, `scaffold-module`,
`commit-check`, `pr-ready`, `fhir-interop-pr`.

Standing rules (always-on) live in `AGENTS.md`; this file and the skills must not
restate or relax them.

## High-value AI use cases

1. Implement bounded use cases in existing modules.
2. Refactor within a single layer while preserving behavior.
3. Generate/update tests at domain/application/interface boundaries.
4. Review changes for bugs, regressions, and boundary violations.
5. Propose concrete patches for failing CI jobs.

## Required context for a task

`AGENTS.md`, the relevant `project.json`, the target module's
`domain|application|infrastructure|interface` files, and `contracts/openapi/**` when
API behavior is involved.

## Model routing

- Fast model: formatting, boilerplate, small scoped edits.
- Strong model: architecture-sensitive, regression-prone, or cross-module changes.
