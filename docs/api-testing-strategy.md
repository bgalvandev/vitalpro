# API Testing Strategy

This repository uses focused, proportionate API quality gates for the Core API.

## Gates (PR blocking, `.github/workflows/ci.yml`)

- Lint, typecheck, unit tests, and build for affected projects (`pnpm check`).
- The API is built on **Fastify** with **Zod** schemas as the single source of
  truth: Fastify validates requests/responses against them at runtime.
- The OpenAPI contract is **generated from those Zod schemas** via
  `@fastify/swagger` (`pnpm run openapi:generate`) and committed under
  `contracts/openapi/**` — no hand-maintained spec, no version-normalization bridge.
- OpenAPI linting runs through Redocly (`pnpm run openapi:lint`).
- Breaking OpenAPI changes are checked in `.github/workflows/openapi-breaking.yml`.
- Errors follow **RFC 9457 Problem Details** (`application/problem+json`).
- Clean Architecture boundary checks (`pnpm run ai:guard`).

## Test tiers

Three tiers, each a generic root script that Nx orchestrates across the projects
that declare the matching target (no project names hardcoded in root scripts):

```bash
pnpm test              # unit — hermetic, no I/O (nx run-many -t test)
pnpm test:integration  # integration — needs the database (nx run-many -t test:integration)
pnpm test:e2e          # end-to-end smoke (nx run-many -t test:e2e)
```

Unit tests never touch I/O. Integration and e2e tests run against the PostgreSQL
you provision yourself — bring it up first with `pnpm db:up && pnpm db:migrate`.
They read `DATABASE_URL` and fail fast if the database is unreachable; provisioning
services is the developer's/CI's responsibility (no auto-provisioning, no skip gates).

What each tier covers today:

- `core-api:test:integration` — HTTP behavior of the Core API using an in-memory
  fake repository (no database needed).
- `appointments:test:integration` — the Prisma appointment repository adapter
  against the real PostgreSQL at `DATABASE_URL`.
- `core-api:test:e2e` — end-to-end smoke: boots the API against the real PostgreSQL
  at `DATABASE_URL` and exercises the HTTP endpoints.

## OpenAPI version policy

- The contract is generated as OpenAPI 3.1.0 by `@fastify/swagger` from the Zod
  schemas (`pnpm run openapi:generate`). There is no version-normalization bridge:
  the same Zod schemas drive runtime validation and the published contract.

## Practical limitation

No stack guarantees zero defects. The goal is fast defect detection and contract
drift prevention across CI, runtime validation, and DB-backed integration tests.
