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

If your local environment blocks Nx plugin IPC sockets, run checks with:

```bash
NX_DAEMON=false NX_ISOLATE_PLUGINS=false pnpm check
```

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
