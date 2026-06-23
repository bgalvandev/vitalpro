---
name: backend-architecture
description: How to build services in apps/core-api and libs/** — Clean Architecture with ports, Fastify handlers as thin composition roots, Zod as the single source of truth for validation + OpenAPI, and Prisma adapters that never leak. Use when adding or changing a backend use case, endpoint, repository, or DTO.
---

# Backend Architecture (core-api + libs)

Domain/application logic lives in reusable libraries under `libs/**`; `apps/core-api`
is the HTTP delivery layer that wires those libraries to Fastify. The rule is the
**structure and pattern below**, not any one module; `libs/appointments` +
`apps/core-api` are the current reference implementation to copy from while they
exist (if they change, the pattern still holds — refresh the example, not the
principle).

## Where each thing goes

```txt
libs/<module>/src/
  domain/         entities + invariants (AppointmentsEntity.create(...)), pure
  application/    use cases (*.use-case.ts) + ports (AppointmentRepository interface)
  infrastructure/ Prisma adapter implementing the port, record -> entity mapping
  interface/      (public barrel exports for the library)
apps/core-api/src/
  interface/http/ create-core-api-app.ts — routes, Zod schemas, auth, error handler
  infrastructure/ Prisma client, repository wiring, config, logging
  main.ts         composition root: build deps, createCoreApiApp(...), listen
```

## Rules of the pattern (as already implemented)

- **Ports, not concretions**: use cases depend on an interface (e.g.
  `AppointmentRepository` in `application/`), never on Prisma. The Prisma class in
  `infrastructure/` *implements* the port. This is what makes the domain testable
  without a database.
- **Handlers are thin**: a Fastify route validates input (Zod), calls a use case,
  maps the result to the transport DTO, and returns. No business logic in handlers
  (see `/api/v1/appointments` in `create-core-api-app.ts`).
- **Map at every boundary**: persistence record → domain entity (`toEntity`), domain
  result → transport DTO (`toAppointmentResponse`, including `Date` → ISO string).
  Never return a Prisma model or domain entity straight out of an HTTP handler.
- **Zod is the single source of truth**: request/response schemas drive Fastify
  runtime validation/serialization *and* the OpenAPI contract via `@fastify/swagger`
  (`fastify-type-provider-zod`). Changing a response shape means changing the Zod
  schema and regenerating the contract — see the `openapi-contract-update` skill.
- **Errors as RFC 9457 Problem Details** (`application/problem+json`) through the
  central `setErrorHandler`; throw `httpError(status, message)`, don't hand-format
  responses in handlers.
- **Layer direction is enforced**: `pnpm run ai:guard` checks intra-project layer
  imports; `@nx/enforce-module-boundaries` checks cross-project tags
  (`surface:core`/`surface:health`). The domain MUST NOT import `pg`/`prisma`/HTTP.

## New module

Scaffold with the generator (do not hand-roll): `pnpm nx g
@vitalpro/tools:clean-module <name> --domain=<core|health>` — see the
`scaffold-module` skill.

## Verification

- `pnpm run ai:guard` passes; `pnpm nx affected -t lint,typecheck,test,build` passes.
- New external endpoints/fields update `contracts/openapi/**` in the same PR.
- Reviewer checks: use cases depend on ports, handlers are thin, all boundaries map,
  no ORM/entity leaks out of the interface.

Related: [[backend-performance]], [[api-response-patterns]] (success/error wire
format), the `openapi-contract-update` and `scaffold-module` skills, and
[[engineering-discipline]].
