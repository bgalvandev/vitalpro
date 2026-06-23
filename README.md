# VitalPro

VitalPro is a modular, AI-native SaaS platform for professional service businesses — managing the full lifecycle of clients, bookings, payments, and follow-up, from a vertical-agnostic core to specialized vertical extensions like healthcare.

<!-- Add a product banner / screenshot here once brand assets exist. -->

## Product

VitalPro ships as two surfaces on one platform:

- **VitalPro Core** — the vertical-agnostic platform for service businesses: customers, bookings & schedules, services, staff, locations, payments, messaging, campaigns, follow-up workflows, audit trails, and insights.
- **VitalPro Health** — a clinical/wellness vertical extension (clinics, dentistry, physiotherapy, psychology, nutrition, aesthetics): patients, encounters, consents, observations, compliance. Health may depend on Core; **Core never depends on Health**.

## Quick start

```bash
pnpm install
cp .env.local.example .env   # configure local env (see the *.example files for the keys)
pnpm db:up                   # start local PostgreSQL
pnpm dev                     # run every app (or: pnpm dev:api / pnpm dev:web)
pnpm check                   # lint, typecheck, test, build, and quality gates
```

## Architecture

- **Nx monorepo + pnpm workspaces**, TypeScript `strict`.
- **Clean Architecture per module** — `domain → application`, with `infrastructure`/`interface` on the outside.
- **Backend**: Fastify + Zod + Prisma · **Web**: Next.js + React + Tailwind.
- New modules are scaffolded with the Nx generator — no manual boilerplate:
  ```bash
  pnpm nx g @vitalpro/tools:clean-module <name> --domain=core
  ```

## Working on VitalPro

This repository is built to be worked on by **AI coding agents** as much as by people. Everything needed to understand the project lives in:

- 📐 **[`AGENTS.md`](./AGENTS.md)** — the engineering standard: architecture, conventions, and always-on rules.
- 🛠️ **`.agents/skills/`** — on-demand procedures (backend, frontend, testing, releases…). `.claude/skills` is a symlink to the same files.
- 🧭 **[`docs/ai/ai-operating-model.md`](./docs/ai/ai-operating-model.md)** — how the standards and skills fit together.

## Projects

- `apps/core-api` — Core REST API (Fastify + Zod + Prisma).
- `apps/web` — Core web app (Next.js + React + Tailwind).
- `libs/*` — feature modules (Clean Architecture: domain / application / infrastructure / interface).
- `tools` — local Nx generator (`@vitalpro/tools:clean-module`).

## License

Proprietary — © 2026 Bruno Galván. All rights reserved. See [LICENSE](./LICENSE).
