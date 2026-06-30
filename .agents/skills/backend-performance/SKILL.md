---
name: backend-performance
description: Keep backend reads fast and payloads lean — explicit Prisma select, bounded/paginated queries, no N+1, indexes for filters/sorts, raw SQL only behind an adapter for measured hot paths, and fast/safe HTTP transport (ETag→304, private caching, compression at the edge). Use when adding or changing a query, repository method, list endpoint, or response/caching behavior in core-api/libs.
---

# Backend Performance (core-api + libs)

The goal is the backend half of "no over-fetching": the API never ships more rows or
columns than the use case needs, and queries stay cheap. The `appointments`
repository is the current reference for this pattern.

For Prisma Client API specifics (queries, filters, relations, transactions,
`$queryRaw`), use the vendored **`prisma-client-api`** skill (from Prisma, MIT,
version-accurate for Prisma 7). VitalPro rules still take precedence: explicit
`select`, bounded reads, and raw SQL only behind an `infrastructure` adapter with a
stated reason.

## Query every read deliberately

- **Push data selection to the database**: any parameter that *selects data* —
  filtering, sorting, pagination, search, aggregation — MUST become a query predicate
  (`where`/`orderBy`/`take`/`groupBy`/aggregate), executed by the DB. Loading a broad
  set and then filtering/sorting/paginating it in application memory is an
  anti-pattern: it over-fetches, wastes CPU/memory, doesn't scale, and breaks
  pagination correctness. The DB has the indexes — let it do the work.
- **What DOES belong in the app layer** (not the anti-pattern): domain logic and
  derived values (e.g. the `upcoming` count, `isActionable`), and DTO/presentation
  mapping (record → DTO, `Date` → ISO). These are computation over already-selected
  rows, not data selection — resolving them in the app is correct.
- **Explicit `select`**: every Prisma read MUST list the columns it needs (see
  `APPOINTMENT_SELECT` in `prisma-appointment.repository.ts`). Never return the full
  row or an unbounded relation graph. This is also an AGENTS.md gate (API Contract and
  Response Shape Standard).
- **Bound every collection**: list queries MUST use `take` (and pagination/cursor when
  the set can grow), with a max enforced in the contract. The appointments list caps
  at `MAX_LIST_LIMIT` (100) and defaults to 50. Never run an unbounded `findMany`.
- **Order explicitly**: collection queries set `orderBy` so results are deterministic
  and index-friendly (`orderBy: { startsAt: 'asc' }`).

## Avoid the classic killers

- **N+1**: don't loop and query per item. Fetch the set once with a bounded
  `select`/`include`, or use a batched query. If you `.map(async … findUnique)`,
  that's an N+1 — restructure.
- **Indexes**: any column used in `where`/`orderBy`/joins on a non-trivial table needs
  an index in the Prisma schema + a migration. Add it in the same change as the query
  that relies on it.
- **Connection pooling**: reuse the singleton Prisma client (`prisma-client.ts` +
  `@prisma/adapter-pg`); never instantiate a client per request.
- **Don't compute in the DB round-trip what belongs in `domain`**, and don't pull
  rows to the app to filter what SQL can filter — push bounded filtering to the query.

## When Prisma isn't enough

Raw SQL / Prisma TypedSQL / db-specific queries MAY be used for measured hot paths,
reporting, or query plans Prisma can't express. They MUST live behind an
`infrastructure` adapter/repository port and MUST carry a comment or test name
stating the performance/plan/feature reason (AGENTS.md). Do not reach for raw SQL
before measuring.

## Caching

Add caching (e.g. Redis) only for a measured, repeated, read-heavy path — not
speculatively (Simplicity Standard). Document what is cached and its invalidation.

## Make the response fast over the wire (transport half)

The query work above keeps the payload small; this keeps the *request* cheap. The API
is authenticated (bearer token), so every transport choice is also a **security**
choice — the safe options below are the only recommended ones.

- **Conditional requests (ETag → 304):** the biggest per-request win for read
  endpoints. Send an `ETag`; when the client returns `If-None-Match`, reply `304 Not
  Modified` with no body. **Derive the ETag from a version field (`updatedAt`/`version`),
  not from hashing the response body** — `hash(id + updatedAt)` is constant-time and
  never blocks the event loop, whereas hashing a large JSON body on every request does.
  For a collection, derive it from `count + max(updatedAt)`. A **weak** ETag (`W/"…"`)
  is correct for JSON bandwidth-saving (CDNs downgrade strong ETags anyway).
- **`Cache-Control` on authenticated responses — never `public`.** A shared cache/CDN
  serving a `public` user-scoped response leaks one user's data to another. Use
  `Cache-Control: private, no-cache` **plus `Vary: Authorization`** so the ETag carries
  revalidation while no shared cache ever stores or mis-keys the body. Omitting `Vary`
  is itself the leak.
- **Compression belongs at the edge, not in Node.** Do **not** add `@fastify/compress`
  to the app: Node is single-threaded and compression is CPU-intensive, and compressing
  HTTPS responses that mix a secret with reflected input enables **BREACH**. Offload
  gzip/brotli to the reverse proxy/CDN (Nginx/Cloudflare) at deploy time; never compress
  a response that embeds a token/secret.
- **Never block the event loop.** One synchronous heavy serialization (a huge JSON,
  CPU-bound transform) stalls *every* in-flight request. When export/report payloads
  arrive, **stream** them instead of buffering — and that is also when to revisit
  compression at the proxy.
- **Measure before optimizing.** Track p95/p99 latency per route; optimize the route
  the numbers point at, not the one you assume. This mirrors the "measured hot path"
  rule for raw SQL above.

Trigger note: today the API is read-only GETs, so ETag + `private`/`Vary` are the
applicable wins now; compression and streaming are deploy/infra concerns to enable when
payloads grow, not app code to add speculatively (Simplicity Standard).

## Concurrency — add when write endpoints arrive (trigger)

The current API is read-only (`list`/`get`), so concurrency control would be
speculative today. **When the first write/booking endpoint is added** (anything that
mutates appointments — create, reschedule, cancel), author a `backend-concurrency`
skill and apply these patterns to avoid races/double-booking:

- **Optimistic locking** by default: a `version` (or `updatedAt`) column; the update's
  `where` includes the expected version, and a 0-row update means a conflict → reject
  or retry. Scales without lock contention.
- **Interactive transactions** (`prisma.$transaction(async (tx) => …)`) for
  multi-step writes that must be atomic; keep reads that don't need a lock outside the
  transaction and only the write set inside (short transactions).
- **Pessimistic locking** (`SELECT … FOR UPDATE`, behind an `infrastructure` adapter)
  only for genuinely contended rows; lock rows in a **deterministic order** (e.g. sort
  by id) to prevent deadlocks.
- **Idempotency** for create/booking (idempotency key) so retries don't double-book.
- **Retry with jitter** for transient serialization/deadlock errors — only if the
  operation is idempotent.

Until that endpoint exists, do not add version columns, transaction wrappers, or
locking — it's premature (Simplicity Standard).

## Verification

- Reviewer checks changed reads for explicit `select`, bounded `take`/pagination, and
  `orderBy`; confirms no N+1 loop and that new filter/sort columns have an index +
  migration.
- Raw SQL is confined to `infrastructure` and carries its stated reason.
- `pnpm nx affected -t test,build` passes (integration tests exercise the adapter).

Related: [[backend-architecture]], the `openapi-contract-update` skill (don't over-ship
fields at the contract), and [[frontend-performance]] (the client half).
