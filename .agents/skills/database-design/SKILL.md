---
name: database-design
description: Design the physical Postgres schema behind a domain model — tables, column types, constraints, indexes for the queries you actually run, and safe versioned migrations with Prisma. Use when adding or changing a Prisma model, a migration, an index, or when a query is slow because the schema (not the query) is wrong. Pairs with entity-modeling (domain shape) and backend-performance (read paths).
---

# Database Design (Postgres + Prisma)

This skill covers the **physical** schema: how a domain entity lands in Postgres
tables that are correct, constrained, and fast for the access patterns that exist.
It does **not** decide what the entity *means* — that is `entity-modeling`. Design
the domain model first, then map it here.

Boundary with the other skills:
- **entity-modeling** — what fields/invariants the entity has (domain language).
- **database-design** (this) — tables, types, keys, constraints, indexes, migrations.
- **prisma-client-api** — how to *query* the schema.
- **backend-performance** — keeping read paths/payloads lean once the schema exists.

The schema lives in `prisma/schema.prisma`; it is **infrastructure**. The domain never
imports Prisma types — the `infrastructure` mapper translates rows ↔ domain.

## Conventions in this repo (follow them)

Match the existing schema (`prisma/schema.prisma`):
- Table names are `snake_case` plural via `@@map("appointments")`; column names are
  `snake_case` via `@map("starts_at")`. Prisma fields stay `camelCase`.
- Enums map to a Postgres enum type via `@@map` (e.g. `appointment_status`).
- Ids are application-generated `String @id` (the domain mints the id; the DB does not
  auto-increment). Keep this — it keeps id generation testable in the domain. **Mint
  time-ordered ids (UUIDv7 or ULID), not random UUIDv4/cuid2:** a random string PK
  scatters B-tree inserts and fragments the index (measurably slower reads and bigger
  on-disk indexes at scale); a time-sortable id preserves insert locality while staying
  globally unique and domain-generated.
- Timestamps: `createdAt @default(now())`, `updatedAt @updatedAt`, both `@map`-ed.

## Design checklist (in order)

1. **One table per aggregate root.** Do not split an entity across tables for
   speculative normalization, and do not merge two aggregates into one table. Child
   collections owned by the aggregate become their own table with a FK back.
2. **Pick the narrowest correct type.** `text` over `varchar(n)` unless a real bound
   exists; `timestamptz` (Prisma `DateTime`) for instants — never store local time;
   `numeric(p,s)` for money, never `float`; `boolean` not `int`; a Postgres `enum`
   (mapped) for a closed, stable set, otherwise a coded `{ code, system, display }`
   per the Entity Modeling vocabulary rule.
3. **Constrain at the database, not only in code.** `NOT NULL` for every field the
   domain treats as required; `@unique`/`@@unique` for real identity keys; FKs with an
   explicit `onDelete` decision (`Restrict` by default, `Cascade` only when the child
   truly cannot outlive the parent). The DB is the last line of defense for invariants.
4. **Index for the queries you actually run — not preemptively.** Read the repository
   methods and list endpoints first, then add an index per real filter/sort:
   - Equality/range filter on a column → single-column index.
   - Filter + sort together (e.g. `where status=... order by starts_at`) → a
     **composite** `@@index([status, startsAt])` (filter columns first, sort column
     last, matching the query's order direction).
   - Foreign keys that are queried → index them (Postgres does **not** auto-index FKs).
   - Uniqueness that is also a lookup → `@@unique` already creates the index.
   - A query that filters a known subset (e.g. `where status='scheduled'`) → a
     **partial** index (`@@index([...], where: ...)` via raw migration) is smaller and
     faster than indexing the whole table.
   Every index has a write cost; an index no query uses is dead weight — remove it.
   Rule of thumb: keep an OLTP table at **≤6 indexes** (PK included); audit usage with
   `pg_stat_user_indexes` and drop any index with zero scans over a sustained window.
5. **Bound growth.** Any table that grows per-tenant/per-day (events, appointments,
   logs) must have an index supporting its primary list query and a pagination key
   (usually `(tenantKey, startsAt, id)`); see `backend-performance` for cursoring.

## Migrations (safe + versioned)

- Author migrations with `pnpm run db:migrate` (`prisma migrate dev`) locally; they are
  committed under `prisma/migrations/**` and deployed in CI with
  `prisma migrate deploy`. Never hand-edit an applied migration — add a new one.
- **Expand → migrate → contract** for anything that could break a running deploy:
  1. *Expand*: add the new nullable column / new table (backwards compatible), and
     deploy app code that **dual-writes** to both old and new shapes.
  2. *Backfill* historical rows in a separate step, in **batches of 1k–10k rows**
     (never one giant transaction that locks the table); then enforce
     `NOT NULL`/constraints once the column is fully populated.
  3. *Contract*: drop the old column / stop dual-writing only after no code reads it.
  Renames and type-narrowing are not in-place — treat them as add-new + backfill +
  drop-old, each its own migration.
- A destructive migration (drop column/table, narrow type) MUST state in the PR what
  reads it today and why it is safe to remove now.
- Seed data lives in `prisma/seed.mjs` (run via `pnpm run db:seed`) and MUST stay
  vertical-agnostic per the Product Topology standard — no Health-only semantics in
  Core seeds.

## When raw SQL is justified

Prisma is the default. Reach for raw SQL / TypedSQL only for a **measured** hot path,
reporting aggregate, or a Postgres feature Prisma can't express. When you do: keep it
behind an `infrastructure` adapter/port, parameterize every input (never string-
interpolate), and leave a comment or test name stating the measured reason
(per the API Contract standard). See `prisma-client-api`'s raw-queries reference.

## Verification

- `pnpm run db:migrate` produces a clean, named migration; `prisma migrate deploy`
  applies it without drift (`prisma migrate status` is clean).
- Reviewer confirms: types are the narrowest correct ones, required fields are
  `NOT NULL`, FKs have an `onDelete` decision, **every new index maps to a real query**
  and no query-less index was added, and any destructive change is justified.
- The domain has no Prisma import; the `infrastructure` mapper does the row↔domain
  translation.

Related: [[entity-modeling]], [[prisma-client-api]], [[backend-performance]],
[[backend-architecture]].
