---
name: frontend-architecture
description: How to structure web UI in apps/web — Server Components by default, client at the leaves, Clean Architecture per module, and small single-purpose files. Use when adding or reshaping any component, page, hook, or module under apps/web/src.
---

# Frontend Architecture (apps/web)

The web app uses the same per-module Clean Architecture as the backend. The rule is
the **layout below**, not any one module; `apps/web/src/appointments/` is the current
reference implementation to copy from while it exists (if it changes, the pattern
still holds — refresh the example, not the principle).

## Module layout (copy this)

```txt
apps/web/src/<module>/
  domain/         # entities, value objects, pure rules — no React, no fetch
  application/    # use cases + ports (e.g. *.use-case.ts, *-reader.port.ts)
  infrastructure/ # adapters: HTTP readers, DTO schemas (Zod), mappers, config
  interface/      # React components, format helpers
    components/   # one component per file
```

Routing lives in `apps/web/src/app/**` (Next.js App Router). A `page.tsx` is the
**composition root**: it wires an infrastructure adapter into an application use
case and renders an `interface` component (see `app/appointments/page.tsx`). Pages
hold no business logic.

Dependency direction (enforced by `pnpm run ai:guard`): `interface → application →
domain`, `infrastructure → application/domain`, `domain` depends on nothing custom.

## Server Components by default

Every component is a React Server Component unless it needs interactivity. Add
`'use client'` only on the **leaf** that uses state/effects/event handlers or
browser APIs — never on a layout, a page, or a container. Push the directive as
far down the tree as possible so the client bundle stays minimal.

- Server Component: data fetching, composition, static markup.
- Client Component (`'use client'`): `useState`/`useEffect`, `onClick`, `useRef`,
  anything touching `window`/`document`.

Data is read server-side through an `infrastructure` adapter that validates the
response with Zod and maps it to a domain type before the UI sees it (see
`infrastructure/http-appointment.reader.ts` + `appointment.mapper.ts`). UI never
receives raw API/DTO shapes.

## Small, single-purpose files (no giant files)

- One component per file; one exported component per file.
- A component file should stay under ~150 lines. When it grows past that, extract
  sub-components into `interface/components/` and pull non-trivial logic into a
  hook or an `application`/`domain` function.
- Co-locate the component test (`*.spec.tsx`) next to the component.
- Name by role, not generic nouns: `appointment-item.tsx`, `status-badge.tsx` —
  never `utils.ts` / `service.ts`. Helpers go in a named file (`format-time.ts`).

## Verification

- `pnpm run ai:guard` passes (layer direction intact).
- `pnpm nx lint web` passes (React Compiler / Rules-of-React lint, see
  [[frontend-performance]]).
- Reviewer confirms `'use client'` sits on leaf components only, files are small
  and single-purpose, and no raw DTO/ORM shape reaches a component.

Related: [[frontend-performance]] for render cost, [[frontend-e2e]] for testing,
[[code-quality]] for duplication/dead-code, [[engineering-discipline]] for the
overall working protocol.
