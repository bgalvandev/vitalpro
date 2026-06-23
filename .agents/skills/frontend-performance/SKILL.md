---
name: frontend-performance
description: Keep apps/web fast and fluid — rely on the React Compiler instead of manual memoization, stream with Suspense, virtualize large lists, and keep the client bundle small. Use when a UI feels slow, renders large/long data, or you are tempted to add useMemo/useCallback/memo.
---

# Frontend Rendering Performance (apps/web)

The React Compiler is **enabled** (`reactCompiler: true` in `apps/web/next.config.js`,
backed by `babel-plugin-react-compiler`). It auto-memoizes components and hooks at
build time. Work *with* it.

## Do not hand-write memoization

- Do **not** add `useMemo`, `useCallback`, or `React.memo` by default — the compiler
  inserts memoization optimally. Manual memo is now noise and can fight the compiler.
- Only add manual memoization after the **React Profiler** proves a specific hot path
  the compiler did not cover. When you do, leave a comment with the measured reason.
- The `eslint-plugin-react-hooks` v7 rules (`recommended-latest`, wired in
  `apps/web/eslint.config.mjs`) enforce the Rules of React the compiler depends on
  (`purity`, `set-state-in-render`, `immutability`, `preserve-manual-memoization`,
  …). A lint failure there means the code breaks an assumption the compiler needs —
  fix the code, don't disable the rule.

## Render the minimum, stream the rest

- Keep `'use client'` at the leaves (see [[frontend-architecture]]). Server
  Components ship 0 KB of component JS to the browser.
- Give each independent data dependency its **own `<Suspense>` boundary** with a
  size-matched skeleton, so the shell streams immediately and slow data fills in
  without blocking the page.
- Fetch in **parallel**: place independent server fetches in sibling Server
  Components (or `Promise.all`), never awaited one-after-another in a chain.

## Cut waterfalls and redundant work

- The biggest server-render cost is usually **request waterfalls**: awaiting one fetch
  before starting an independent one. Start independent reads together (sibling
  Server Components or `Promise.all`); only chain when B genuinely needs A's result.
- Deduplicate identical reads within a single render with **`React.cache()`** (wrap
  the data-loading function) so two components asking for the same resource hit the
  source once.
- Hoist static, request-independent I/O (config, constant lookups) to module scope so
  it runs once, not per request. Never share mutable module state across requests.

## Keep the client bundle small

- Lazy-load heavy, interaction-only client components below the fold with
  `next/dynamic` (and a fallback). Don't lazy-load tiny components — the overhead
  isn't worth it.
- Import granularly (`import { x } from 'lib/x'`) instead of pulling a whole library
  when only one helper is used, so tree-shaking can drop the rest.
- Keep server-only dependencies out of Client Components — anything imported into a
  `'use client'` module ships to the browser.

## Keep interactions responsive

- For expensive state updates that would otherwise jank typing/clicks, use
  `useTransition` (mark the update non-urgent) or `useDeferredValue` (defer a derived
  value). These schedule work — they are not memoization, so they remain correct and
  useful alongside the React Compiler.
- Add resource hints for critical third-party origins when needed
  (`preconnect`/`preload`/`prefetchDNS`).

## Large lists and heavy data

- Lists over ~100 rows SHOULD be virtualized; over ~500 rows virtualization is
  required. Use `@tanstack/react-virtual` — install it only when a real list needs
  it (`pnpm add @tanstack/react-virtual`); do not add it speculatively.
- Paginate/bound data at the API per the response-shape standard so the client
  never receives unbounded payloads (this is the FE half of preventing
  over-fetching — see AGENTS.md "API Query and Response Shape Standard" and the
  `openapi-contract-update` skill). The appointments reader already requests a
  bounded `limit`.

## Visual fluidity

- Avoid layout thrash: animate `transform`/`opacity`, not `width`/`top`/`height`.
- Respect `prefers-reduced-motion`.
- Defer non-critical, interaction-only client code with `next/dynamic` when it is
  large and below the fold.

## Verification

- `pnpm nx build web` succeeds with the compiler enabled.
- `pnpm nx lint web` passes (Rules-of-React lint active).
- Reviewer checks: no gratuitous `useMemo`/`useCallback`/`memo`; large lists are
  virtualized; independent data has separate Suspense boundaries.

## Further reading

For a deeper React/Next performance rule catalog (40+ rules, maintained by the
Next.js team), see Vercel's `react-best-practices` skill:
https://github.com/vercel-labs/agent-skills — consult it externally; it is not
vendored here (no license published as of 2026-06).

Related: [[frontend-architecture]], [[code-quality]], [[engineering-discipline]].
