---
name: api-response-patterns
description: The canonical success and error response shapes for VitalPro REST APIs — tailored flat DTOs, collection envelopes with bounded pagination, and RFC 9457 Problem Details for errors. Use when adding or changing any API endpoint's response or error body.
---

# API Response & Error Patterns

One consistent wire format across every endpoint, optimized for product clients that
render data directly. `apps/core-api/src/interface/http/create-core-api-app.ts` is the
current reference implementation.

## Success: tailored, flat DTOs (the chosen pattern)

- Each endpoint returns a **purpose-built DTO with only the fields that use case
  needs** — never the ORM model, never an unbounded graph (AGENTS.md rules 3, 9).
- **Collection** → an envelope with a flat array plus paging metadata:
  `{ items: T[], limit }` (the current shape) or `{ items, nextCursor }` for cursored
  sets. List DTOs carry only list fields.
- **Detail** → a separate DTO when the single-resource view needs more fields than the
  list row. Don't overload one DTO for both.
- **Map at the boundary**: convert domain/result → transport DTO explicitly, including
  `Date` → ISO 8601 string (see `toAppointmentResponse`). Field names are `camelCase`.
- Same envelope shape across endpoints so the client learns one structure.

## One response paradigm only

Flat tailored DTOs are the **single** success-response standard here — the API
resolves and joins data server-side and returns rows the client renders directly.
Do not introduce a different response paradigm (normalized/compound documents or
client-shaped queries); any alternative requires an ADR justifying a specific
consumer (AGENTS.md rule 9). Field variation, when genuinely needed, MUST use
documented view variants or allowlisted field masks — never arbitrary
client-controlled `select`/`include` (AGENTS.md rule 5).

## Errors: RFC 9457 Problem Details

- Every error MUST be `application/problem+json` with at least `type`, `title`,
  `status` (and usually `detail`, `instance`). Validate the shape with a Zod
  `problemDetailsSchema` and declare it per status in the route's `response` map.
- Throw `httpError(status, message)` and let the **central `setErrorHandler`** format
  the body — handlers never hand-roll error JSON. 5xx logs the error and returns a
  generic detail (no internal leakage); 4xx returns the specific message.
- Use the right status: 400 validation, 401 auth, 404 not found, etc.

## Pagination

- Prefer **cursor-based** paging for sets that grow (stable under inserts, scales);
  offset/limit is acceptable for small bounded sets. Always enforce a max limit in the
  contract and **document ordering** (the appointments list is `startsAt asc`, capped
  at 100).

## Verification

- Reviewer checks success bodies are flat tailored DTOs (no ORM leakage, no normalized
  envelope), collections are bounded + ordered, and errors are RFC 9457
  `application/problem+json` with `type`/`title`/`status`.
- Interface/contract tests assert both the success-DTO shape and the Problem Details
  error shape; the OpenAPI contract documents both (`openapi-contract-update` skill).

Related: [[backend-architecture]], [[backend-performance]], the
`openapi-contract-update` skill.
