# VitalPro

VitalPro is a modular AI-enabled SaaS platform for professional service businesses that depend on bookings, recurring clients, and continuous follow-up.

## Product Surfaces

### VitalPro Core

VitalPro Core is the horizontal platform for appointment-based businesses.

Core covers domains such as:
- Customers
- Bookings and schedules
- Services
- Professionals/staff
- Locations
- Messaging
- Payments
- Campaigns
- Follow-up workflows
- Audit trails
- Business insights

Core is vertical-agnostic and must not depend on Health-specific semantics.

### VitalPro Health

VitalPro Health is a vertical extension built on top of Core for healthcare and wellness contexts (for example clinics, dentistry, physiotherapy, psychology, nutrition, and medical aesthetics).

Health may add domains such as:
- Patients
- Healthcare professionals
- Clinical appointments
- Encounters
- Consents
- Observations
- Compliance workflows
- Healthcare interoperability

Health can depend on Core. Core cannot depend on Health.

## Engineering Standards

Repository-level technical and governance standards are defined in `AGENTS.md`.

## AI Development Runtime

This repository is built to be worked on by AI coding agents. The runtime is
tool-agnostic — there is no per-tool entry file duplicating the standards:

- Engineering standards (always-on): `AGENTS.md`, imported by `CLAUDE.md` and read
  natively by tool-agnostic agents.
- On-demand procedures: model-invocable skills under `.agents/skills/**`
  (`.claude/skills` is a symlink so Claude Code discovers the same files).
- Architecture guardrail: `pnpm run ai:guard` enforces Clean Architecture layer
  boundaries inside each project. It is part of `pnpm check`.
- Operating model: `docs/ai/ai-operating-model.md`.

## Workspace Bootstrap

### Prerequisites

- Node.js 24 LTS (see `.nvmrc`)
- Corepack enabled (`corepack enable`)
- pnpm version pinned by `packageManager` in `package.json`

### Install

```bash
pnpm install
```

### Run the apps

```bash
pnpm db:up        # start local PostgreSQL (required by the API)
pnpm dev:api      # run the Core API  (alias of: pnpm nx dev core-api)
pnpm dev:web      # run the web app   (alias of: pnpm nx dev web)
pnpm dev          # run every app at once (nx run-many -t dev)
```

The Core API fails fast at startup if `DATABASE_URL` or `CORE_API_SERVICE_TOKEN`
is missing/invalid or PostgreSQL is unreachable. It requires that exact token as
`Authorization: Bearer <token>` on `/api/*` (service-to-service auth) and exposes
`/health` (liveness) and `/ready` (readiness, checks the database) without auth.

### Run Quality Gates

```bash
pnpm check
```

The Nx daemon is disabled via `useDaemonProcess: false` in `nx.json` for local/CI consistency, so commands no longer need an `NX_DAEMON=false` prefix.

AI-specific commands:

```bash
pnpm run ai:guard
```

### API Quality Gates

OpenAPI contract lint:

```bash
pnpm run openapi:lint
```

Tests run in three tiers (see `docs/api-testing-strategy.md` for details).
Integration and e2e tiers need the database you bring up first:

```bash
pnpm test                       # unit — hermetic, no database
pnpm db:up && pnpm db:migrate   # provision the database for the tiers below
pnpm test:integration           # integration — runs against DATABASE_URL
pnpm test:e2e                   # end-to-end smoke — boots the API against DATABASE_URL
```

## Environment Strategy

The repository now uses two deployment environments in GitHub Actions:
- `staging`: automatic publish/deploy after a successful `CI` run on `main`.
- `production`: manual promotion with required environment approval.

Deployment workflows:
- `.github/workflows/deploy-staging.yml`
- `.github/workflows/deploy-production.yml`

Container strategy:
- Runtime image: `ghcr.io/<owner>/<repo>/core-api`
- Staging tags: `staging` and `sha-<commit-sha>`
- Production tags: `production` and immutable `prod-<UTC timestamp>`
- Production deploy promotes an existing image tag (no rebuild), following build-once/promote.

Manual production promotion example:

```bash
gh workflow run "Deploy Production" --field image_tag=sha-<commit-sha> --field run_smoke_tests=true
```

### Environment Files

Each runtime reads its own environment from its own location, mirroring how
deployed services each receive only their own config. Committed templates are
`*.example` and MUST NOT contain secrets; runtime files are git-ignored.

- `core-api` + Prisma CLI read the repo-root `.env` (`DATABASE_URL`, `PORT`,
  `NODE_ENV`). Per-environment templates: `.env.local.example`,
  `.env.staging.example`, `.env.production.example`.
- The web app (Next.js) reads `apps/web/.env.local` (`CORE_API_URL`,
  `CORE_API_TOKEN`) — Next loads env from the app directory, not the repo root.
  Template: `apps/web/.env.local.example`.

Real values for `staging`/`production` are injected at deploy time from GitHub
Environment secrets (`STAGING_DATABASE_URL`, `PRODUCTION_DATABASE_URL`), not from
committed files. Connection strings MUST NOT be hardcoded in scripts.

Create your local files by copying the templates:

```bash
cp .env.local.example .env
cp apps/web/.env.local.example apps/web/.env.local
```

Database setup:

```bash
pnpm run db:up
pnpm run prisma:generate
pnpm run db:migrate
pnpm run db:seed
```

To recreate the local development database volume after a PostgreSQL major
version change:

```bash
pnpm run db:reset:local
```

The workflows use `GITHUB_TOKEN` with `packages:write` for GHCR publication.

## Projects

- `apps/core-api`: Core REST API (Fastify + Zod + Prisma) exposing appointments.
- `apps/web`: Core web app (Next.js + React + Tailwind).
- `libs/appointments`: Core appointments module (Clean Architecture: domain/application/infrastructure/interface).
- `tools`: local Nx generator (`@vitalpro/tools:clean-module`).

Every project exposes `build`, `lint`, `typecheck`, and `test` Nx targets.

The first `VitalPro Health` module is scaffolded on demand with the generator
(`--domain=health`); no empty placeholder library is kept until a real Health
use case exists.

## Module Scaffolding (No Manual Boilerplate)

Use the local Nx generator to scaffold new modules with Clean Architecture layout.

```bash
pnpm nx g @vitalpro/tools:clean-module <module-name> --domain=core
```

Shortcut script:

```bash
pnpm run g:clean-module -- <module-name> --domain=health
```

Generated structure:

```txt
libs/<module-name>/
  src/
    domain/
    application/
    infrastructure/
    interface/
```

The generator also:
- creates a buildable `@nx/js` library with Vitest and ESLint.
- applies boundary tags (`surface:core` or `surface:health`).
- adds a `typecheck` target.
