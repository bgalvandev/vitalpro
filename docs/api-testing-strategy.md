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

- Runtime validation currently relies on `express-openapi-validator`, which documents support for OpenAPI 3.0.x/3.1.x.
- Contracts stay on OpenAPI 3.1.2 while runtime validation is enforced in-process.
- Upgrade to OpenAPI 3.2.x once runtime validator/toolchain support is confirmed end-to-end.

## Workflow artifacts

- Arazzo workflows under `contracts/arazzo/**` define multi-step API consumption flows.
- `pnpm run workflow:artifacts:check` validates the expected Arazzo artifact structure.
