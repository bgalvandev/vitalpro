# API Testing Strategy

This repository uses layered API quality gates.

## Baseline gates (PR blocking)

- OpenAPI contract is source-controlled under `contracts/openapi/**`.
- OpenAPI linting runs through Redocly (`pnpm run openapi:lint`).
- Breaking OpenAPI changes are checked in `.github/workflows/openapi-breaking.yml`.
- Runtime request/response validation is enabled via `express-openapi-validator`.
- Core CI runs lint, typecheck, test, and build in `.github/workflows/ci.yml`.

## Advanced gates

- Integration tests for HTTP behavior (`pnpm run test:integration:core-api`).
- Consumer smoke checks with Postman/Newman (`pnpm run postman:smoke`).
- Executable Arazzo workflow checks with Redocly Respect (`pnpm run arazzo:verify`).
- Provider verification with Pact (`pnpm run pact:verify`).
- Docker-backed integration validation with Testcontainers (`pnpm run test:integration:testcontainers`).
- Scheduled/manual deep checks in `.github/workflows/api-advanced.yml`:
  - Schemathesis
  - OWASP ZAP API scan
  - k6 performance thresholds

## Practical limitation

No stack can guarantee zero defects. The goal is fast defect detection and contract drift prevention across CI, runtime validation, and external black-box checks.

## OpenAPI version policy

- Source contract uses OpenAPI 3.2.0.
- Runtime validation currently relies on `express-openapi-validator`, which supports OpenAPI 3.0.x/3.1.x.
- Runtime validation normalizes the loaded 3.2.0 contract to 3.1.2 in-memory before middleware registration.
- The bridge keeps external contract semantics at 3.2.0 while preserving strict request/response runtime validation.
- ZAP API scan uses a temporary local copy normalized to OpenAPI 3.1.2 before execution.

## Workflow artifacts

- Arazzo workflows under `contracts/arazzo/**` define multi-step API consumption flows.
- Overlay documents under `contracts/overlay/**` define repeatable contract transformations.
- `pnpm run workflow:artifacts:check` validates both Arazzo and Overlay artifact structure.

## Arazzo version policy

- Source workflow contract uses Arazzo 1.1.0.
- Runtime workflow verification currently relies on Redocly Respect in `@redocly/cli`, which executes Arazzo 1.0.1.
- The verification script creates a temporary compatibility copy with `arazzo: 1.0.1` before Respect execution.
- The bridge keeps source workflow artifacts on 1.1.0 while preserving executable CI verification.
