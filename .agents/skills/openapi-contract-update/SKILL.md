---
name: openapi-contract-update
description: Keep the OpenAPI contract in sync when an externally-consumed API changes — update contracts/openapi/** in the same PR, enforce explicit response DTOs (no ORM/Prisma leakage), bounded collections, and run the contract lint. Use whenever a change adds, removes, renames, or broadens fields on an external REST endpoint, or adds/changes an external endpoint.
argument-hint: "[endpoint or contract file]"
allowed-tools: Read Glob Grep Bash(pnpm run openapi:lint) Bash(pnpm exec redocly *) Bash(pnpm nx affected *) Bash(git diff *)
---

# OpenAPI contract update

Enforces AGENTS.md → "Frontend and API Contract Standard" and "API Query and Response Shape
Standard". Run this whenever an externally-consumed API surface changes. Internal
TypeScript-only APIs (e.g. tRPC) are out of scope.

## When this applies

- A new external REST endpoint is added.
- Response fields are added, removed, renamed, or broadened on an external endpoint.
- Request shape / query parameters of an external endpoint change.

If the API is internal-only and not consumed by external clients, skip the OpenAPI step but
still apply the response-shape rules below to the interface DTOs.

## Locate the contract

- Existing contracts: !`find contracts/openapi -type f -name '*.openapi.*' 2>/dev/null`

External REST contracts live under `contracts/openapi/<surface>/<name>.openapi.yaml` and use
OpenAPI 3.2.x (3.1.x only with explicit compatibility justification + ADR link).

## Response-shape rules (must hold in the contract and the interface code)

1. Responses MUST be explicit response DTOs / documented OpenAPI schemas — NEVER Prisma
   models, ORM entities, persistence records, or unbounded domain graphs.
2. Collection endpoints MUST return list DTOs with only the fields the collection needs,
   MUST be paginated/cursored or explicitly bounded, and MUST document ordering semantics.
3. Detail endpoints MUST use a detail DTO, separate from the collection DTO when they differ.
4. Field expansion MUST use documented view variants or allowlisted field masks — NEVER
   arbitrary client-controlled `select`/`include`.
5. Prisma read queries serving API paths MUST use explicit `select` or bounded `include`.
6. Removing/renaming/broadening response fields is a contract change — evaluate backwards
   compatibility and call it out in the PR.

## Steps

1. Edit the interface DTOs and the matching `contracts/openapi/**` schema together, in the
   same PR. Keep the contract version updated.
2. Lint the contract:
   ```bash
   pnpm run openapi:lint
   ```
3. Run the affected CI gate (see AGENTS.md → "CI Execution Guidance"):
   ```bash
   pnpm nx affected -t lint,typecheck,test,build --base="$NX_BASE" --head="$NX_HEAD"
   ```
4. Confirm interface contract tests assert the intended list/detail DTO shape and status codes.
