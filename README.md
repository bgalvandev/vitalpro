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

## Workspace Bootstrap

### Prerequisites

- Node.js 22 LTS (see `.nvmrc`)
- Corepack enabled (`corepack enable`)
- pnpm version pinned by `packageManager` in `package.json`

### Install

```bash
pnpm install
```

### Run Quality Gates

```bash
pnpm check
```

`pnpm check` already runs with `NX_DAEMON=false` and `NX_ISOLATE_PLUGINS=false` for local/CI consistency.

### API Quality Gates

Baseline contract checks:

```bash
pnpm run openapi:lint
```

Advanced API checks (integration + Postman/Newman + Arazzo workflow verification + Pact provider verification):

```bash
pnpm run api:advanced:check
```

Full advanced checks including Docker-backed Testcontainers:

```bash
pnpm run api:advanced:check:full
```

Workflow artifact checks (Arazzo structure):

```bash
pnpm run workflow:artifacts:check
```

Executable Arazzo workflow verification:

```bash
pnpm run arazzo:verify
```

Advanced scheduled/manual CI workflow:
- `.github/workflows/api-advanced.yml`
- includes Testcontainers integration, Schemathesis, ZAP API scan, and k6 thresholds.

### API Workflow Artifacts

The repository also includes machine-readable API workflow artifacts:

- Arazzo workflows:
  - `contracts/arazzo/core/appointments-retrieval.arazzo.yaml`

## Environment Strategy

Current stage is local-only setup. Keep runtime config simple and local.

- Committed template:
  - `.env.example`
- Local file (ignored by git):
  - `.env`

Create your local file by copying the template:

```bash
cp .env.example .env
```

When deployment starts, add per-environment strategy and platform secrets.

## Initial Projects

- `apps/core-api`: initial Core application scaffold.
- `libs/health-domain`: initial Health domain library scaffold.

Both projects currently expose `build`, `lint`, `typecheck`, and `test` Nx targets.

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
