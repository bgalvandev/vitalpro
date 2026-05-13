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

This repository includes an AI-first runtime for agentic development:

- Copilot repository instructions: `.github/copilot-instructions.md`
- Context-specific instruction files: `.github/instructions/*.instructions.md`
- Agent task prompts: `.github/ai/prompts/*.md`
- Agent operating docs: `docs/ai/ai-operating-model.md`
- AI guardrail checks: `pnpm run ai:guard`
- AI context pack generator: `pnpm run ai:task-pack -- --task \"<task>\"`

### AI Workflows (GitHub Actions)

- `AI Codex PR Review`: `.github/workflows/ai-codex-review.yml`
  - Add label `ai:review` on a pull request to trigger review.
  - Optional repository variable `AI_AUTO_REVIEW=true` enables auto-run for all PRs.
- `AI Codex Dispatch`: `.github/workflows/ai-codex-dispatch.yml`
  - Manually dispatch a coding task and optionally create a PR.

Required secrets:

- `OPENAI_API_KEY` for Codex workflows.

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

AI-specific commands:

```bash
pnpm run ai:guard
pnpm run ai:task-pack -- --task "implement bookings waitlist use case"
```

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

Local runtime config remains simple:

- Committed template:
  - `.env.example`
- Local file (ignored by git):
  - `.env`

Create your local file by copying the template:

```bash
cp .env.example .env
```

The workflows use `GITHUB_TOKEN` with `packages:write` for GHCR publication.

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
