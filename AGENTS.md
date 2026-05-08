# AGENTS.md

## Scope
This document is the mandatory engineering standard for this repository.
It applies to all contributors (human and AI agents), all modules, and all CI workflows.

## AGENTS.md Rule Writing Standard (Mandatory)
This standard applies to any change that adds, removes, or modifies normative instructions in any `AGENTS.md` file in this repository tree.

### Normative Language
The key words **"MUST", "MUST NOT", "REQUIRED", "SHALL", "SHALL NOT", "SHOULD", "SHOULD NOT", "RECOMMENDED", "MAY", and "OPTIONAL"** in this document are to be interpreted as described in BCP 14 (RFC 2119 and RFC 8174), when and only when they appear in all capitals.

### Rule Requirements and Validation
1. Rules MUST be repository-specific, explicit, actionable, and verifiable.
2. Rules MUST identify scope (repository-wide or path/module-specific).
3. Rules MUST use one requirement level only (`MUST`/`SHOULD`/`MAY`) per sentence.
4. Rules using `SHOULD` MUST define acceptable deviation and required justification.
5. Rules MUST define observable verification (review step, command, file pattern, or CI gate).
6. Markdown MUST be valid and pass configured linting.
7. Mandatory commands documented in AGENTS.md MUST be executable and current.
8. Rules outdated by workflow/tooling changes MUST be updated in the same PR.
9. AGENTS.md changes MUST be reviewed for ambiguity, stale references, and contradictions.

### Precedence and Conflicts
1. When multiple `AGENTS.md` files apply, the nearest file to the edited path takes precedence.
2. `AGENTS.override.md` takes precedence over `AGENTS.md` at the same directory level.
3. Direct system, developer, and user instructions override AGENTS.md instructions.
4. Conflicting rules at the same scope level MUST be resolved in the same PR; unresolved conflicts are merge blockers.

## Nested AGENTS.md Activation Rule (Mandatory)
Scope: repository-wide.

Rules:
1. A nested `AGENTS.md` MUST be created only when a subdirectory has stable instructions that differ from root standards (for example: different build/test commands, architecture constraints, compliance rules, or deployment workflow).
2. A nested `AGENTS.md` MUST NOT duplicate root rules verbatim; it MUST document only local deltas and local verification commands.
3. A nested `AGENTS.md` MUST include a short "Why this file exists" section with the local deviation rationale.
4. If local divergence is temporary, `AGENTS.override.md` MAY be used instead of introducing permanent nested rules.
5. When a nested `AGENTS.md` becomes obsolete, it MUST be removed or updated in the same PR that changes the underlying workflow.

Verification:
1. Reviewer checks that each new nested `AGENTS.md` contains module-specific deltas and no unnecessary duplication.
2. Reviewer checks that each local rule has an observable verification step (command, file pattern, or CI gate).
3. Reviewer checks that temporary divergence uses `AGENTS.override.md` or includes explicit permanence rationale in the PR.
4. Reviewer checks that stale nested guidance is removed or updated when workflows change.

Reference sources to consult for AGENTS format and best practices:
- https://agents.md/
- https://github.com/agentsmd/agents.md
- https://openai.com/index/introducing-codex/

## Language Standard (Mandatory)
All technical artifacts MUST be written in English by default:
- code comments
- ADRs
- pull request descriptions
- commit messages
- repository standards and architecture docs

Another language MAY be used only for explicit product/content requirements.

Verification:
1. Reviewer checks changed technical artifacts for English language usage.
2. Reviewer checks PR description and commit message language for compliance.

## Commit Message Standard (Mandatory)
Commit messages MUST follow **Conventional Commits 1.0.0**:

```txt
<type>[optional scope]: <description>

[optional body]
[optional footer(s)]
```

Rules:
1. Every commit MUST start with a valid type.
2. Allowed default types: `feat`, `fix`, `refactor`, `perf`, `docs`, `test`, `build`, `ci`, `chore`, `revert`.
3. Scope SHOULD map to an Nx project or module.
4. Breaking changes MUST be marked with `!` in the header and/or a `BREAKING CHANGE:` footer.
5. Subject lines MUST be concise, specific, and written in English.
6. One commit SHOULD represent one logical change.
7. `WIP`, `tmp`, or unclear commit messages MUST NOT be used in shared branches.
8. Commit messages MUST NOT include authorship trailers (for example `Co-Authored-By:` or `Co-authored-by:`).
9. Non-compliant commit messages MUST be treated as merge blockers.

Acceptable deviation:
1. Deviation from scope mapping is acceptable when no stable Nx project/module scope exists; the PR MUST include explicit justification.
2. Deviation from one-logical-change-per-commit is acceptable for emergency hotfixes; the PR MUST include explicit justification.

Verification:
1. Reviewer checks commit headers against Conventional Commits format.
2. Reviewer checks scope mapping and deviation justification when applicable.
3. CI or repository commit lint gate (when configured) MUST pass.

Examples:
- `feat(scheduling-api): add waitlist auto-fill use case`
- `fix(billing): prevent duplicate charge retries`
- `refactor(auth)!: remove legacy token format`

## Git Risk Controls and Authorization (Mandatory)
### High-Risk Commands (Explicit Authorization Required)
The following operations require explicit written approval from a repository owner or designated maintainer before execution on shared work:
- `git reset --hard ...`
- `git clean -fd`, `git clean -fdx`, or equivalent destructive clean variants
- `git checkout -- <path>` / `git restore --worktree --source=... <path>` when discarding local changes
- `git rebase -i` on branches already pushed for collaboration
- `git push --force` or `git push --mirror`
- branch/tag deletions on remote (`git push origin --delete ...`)

### Safer Alternatives (Default)
1. Prefer `git revert` to undo published commits.
2. Prefer `git restore`/`git reset` non-destructive modes for local corrections.
3. If a force update is unavoidable, use `git push --force-with-lease` (never plain `--force`) and only on non-protected branches with explicit approval.

### Protected Branch Policy
1. `main` and release branches MUST be protected in the Git hosting platform.
2. Force push and branch deletion MUST stay disabled for protected branches.
3. Protected branches MUST require pull requests and required status checks.

### Safety Checklist Before Risky Git Operations
1. Run `git status` and confirm target branch.
2. Create a backup ref before destructive history changes (for example `git branch backup/<date>-<name> HEAD`).
3. For clean operations, run a dry-run first (`git clean -n`).
4. Record the reason and executed command in the PR/task for auditability.

## Repository Platform Standard (Mandatory)
This repository standard is **Nx monorepo + pnpm workspaces**.

### Required Root Artifacts
The repository root MUST contain:
- `nx.json`
- `pnpm-workspace.yaml`
- `package.json` (including a pinned `packageManager` field)
- `pnpm-lock.yaml`

### Toolchain and Package Manager Rules
1. Use Node.js LTS.
2. Use pnpm via Corepack.
3. Pin pnpm through `packageManager` in root `package.json`.
4. Do not manually edit lockfiles.
5. Commit lockfile updates together with dependency changes.

### Workspace Rules
1. Internal workspace dependencies MUST use the `workspace:` protocol.
2. Every project MUST be discoverable by pnpm/Nx via workspace config and/or `project.json`.
3. Avoid cross-project relative imports that bypass project boundaries.
4. Install dependencies from repository root.
5. Keep one shared workspace lockfile.

### Nx Task Orchestration Rules
1. Run monorepo tasks through Nx (`pnpm nx ...`).
2. Each project MUST define clear targets (at minimum when applicable):
   - `build`
   - `lint`
   - `test`
   - `typecheck`
3. Prefer `nx run`, `nx run-many`, and `nx affected` over ad-hoc per-package task orchestration.
4. Keep `defaultBase` configured in `nx.json` (normally `main`).
5. In CI, explicitly set `NX_BASE` and `NX_HEAD` for affected runs.

### Caching Rules
1. Enable caching only for deterministic targets.
2. Configure caching with `targetDefaults`, `namedInputs`, `inputs`, and `outputs`.
3. Non-deterministic targets (time/network side effects) MUST NOT rely on cache correctness.
4. Use `--skip-nx-cache` only for troubleshooting.

### Dependency Boundary Enforcement in Nx
1. Tag projects (for example by `scope:`, `type:`, `layer:`, `domain:`).
2. Enforce import constraints with `@nx/enforce-module-boundaries`.
3. If language-agnostic graph enforcement is adopted, use Nx Conformance rules.
4. Boundary violations are merge blockers.

### Version Hygiene
1. Keep `nx` and official `@nx/*` plugins in sync.
2. Add official Nx plugins with `nx add`.
3. Upgrade Nx and official plugins with `nx migrate`.
4. Do not manually drift official Nx package versions.

## Mandatory Architecture Standard
We use **pragmatic Clean Architecture per module**.

Each module MAY contain:
- `domain/`
- `application/`
- `infrastructure/`
- `interface/`

Dependency direction is mandatory:

```txt
interface -> application -> domain
infrastructure -> application/domain
domain -> (no inward custom dependency)
```

Rules:
1. `domain` MUST NOT depend on framework, database, HTTP, queues, or external SDKs.
2. `application` orchestrates use cases and depends only on `domain` plus ports/contracts.
3. `infrastructure` implements technical details (DB, external APIs, queues, providers).
4. `interface` exposes transport concerns (HTTP handlers/controllers, DTOs, serializers).
5. Dependencies always point inward toward business rules.

This standard is non-negotiable. PRs that violate it MUST be rejected.

## Minimum Module Template

Use this as a default template inside a project:

```txt
<project-root>/src/<module>/
  domain/
    appointment.entity.ts
    scheduling.rules.ts

  application/
    create-appointment.use-case.ts

  infrastructure/
    appointment.repository.ts
    prisma-appointment.mapper.ts

  interface/
    scheduling.controller.ts
    create-appointment.dto.ts
```

## Layer Responsibilities
### domain
- Owns entities, value objects, domain services, invariants, domain events.
- Contains business language and rules only.
- No ORM decorators or framework inheritance.

### application
- Owns use cases (`*.use-case.ts`) and application services.
- Defines ports/interfaces for repositories and external providers.
- Manages transaction boundaries via abstractions (never raw framework objects).

### infrastructure
- Owns adapters for persistence, messaging, storage, external APIs.
- Maps persistence/network models to domain and back.
- Must not leak persistence models to `application` or `interface`.

### interface
- Owns controllers/handlers, request-response DTOs, validation wiring.
- Performs transport mapping DTO <-> application command/query models.
- Must not contain business rules.

## VitalPro Product Topology Standard (Mandatory)
Scope: repository-wide for module boundaries, contracts, architecture docs, and dependency decisions.

Rules:
1. The platform MUST be modeled as two product surfaces: `VitalPro Core` and `VitalPro Health`.
2. `VitalPro Core` MUST remain vertical-agnostic for appointment-based service businesses.
3. `VitalPro Core` MUST NOT depend on health-only semantics, health-only modules, or FHIR artifacts.
4. `VitalPro Health` MUST be treated as a vertical extension that can depend on Core capabilities.
5. `VitalPro Health` MAY introduce healthcare-specific modules such as patients, clinical encounters, consents, and clinical observations.
6. Cross-surface dependencies MUST point from Health to Core when shared behavior is required.
7. Reverse dependencies from Core to Health MUST be treated as merge blockers.
8. FHIR usage MUST be constrained to Health interoperability boundaries.
9. FHIR artifacts MUST NOT be used as the governing internal domain model for the entire platform.
10. Health internal domain models MAY use non-FHIR structures when they are mapped at interoperability boundaries.

Verification:
1. Reviewer checks changed modules and confirms each one is classified as Core or Health in the PR description.
2. Reviewer checks import direction in changed files and rejects any Core dependency on Health.
3. Reviewer checks FHIR-specific artifacts and PR evidence are justified as Health interoperability work.
4. CI gate runs `pnpm nx affected -t lint,typecheck,test,build --base="$NX_BASE" --head="$NX_HEAD"` and MUST pass for affected projects.

## Stack Baseline (2026)
Use this default unless an ADR approves an exception.

### Monorepo and Tooling
- Monorepo orchestration: **Nx**
- Package manager: **pnpm workspaces**
- Language: **TypeScript** with `"strict": true`

### Product Stack (Default)
- Web: Next.js + React + TypeScript
- Styling: Tailwind CSS
- UI component strategy: repository-owned source components (for example shadcn/ui-style generated components)
- Mobile: React Native + Expo + TypeScript
- Backend: Node.js services (REST/OpenAPI when external clients are expected)
- Validation: boundary validation for all external input with schema-based DTO validation (Zod by default)
- Database: PostgreSQL
- ORM: Prisma (or Drizzle by ADR)
- Migrations: versioned migrations in source control; deploy via CI/CD
- Cache/queue: Redis when needed
- Observability: structured logs, error tracking, traces for critical flows

## Frontend and API Contract Standard (Mandatory)
Scope: repository-wide for `src/**/interface/**`, `src/**/application/**`, `apps/**`, and `contracts/openapi/**`.

Rules:
1. Web interface projects MUST use Tailwind CSS as the default styling system.
2. Shared UI components MUST be committed as repository-owned source files.
3. Shared UI components MUST NOT be consumed as opaque binary bundles.
4. External input boundaries MUST use Zod schemas by default.
5. Any alternative to Zod MUST be approved by ADR before merge.
6. Internal TypeScript-only APIs MAY use tRPC.
7. APIs consumed by external clients MUST publish REST contracts in OpenAPI 3.2.x under `contracts/openapi/**`.
8. OpenAPI contracts MUST be versioned and updated in the same PR that changes the external API behavior.

Acceptable deviation:
1. OpenAPI 3.1.x is acceptable only when a required external integration cannot consume 3.2.x; the PR MUST include explicit compatibility justification and an ADR link.

Verification:
1. Reviewer checks web projects for Tailwind configuration (`tailwind.config.*` and stylesheet integration).
2. Reviewer checks component libraries are source-controlled in the repository tree.
3. Reviewer checks boundary validators use Zod schemas in DTO/interface entry points.
4. Reviewer checks ADR link when a non-Zod validator is introduced.
5. Reviewer checks external API changes include OpenAPI updates under `contracts/openapi/**`.
6. CI gate runs `pnpm nx affected -t lint,typecheck,test,build --base="$NX_BASE" --head="$NX_HEAD"` and MUST pass for affected projects.

## CI and Supply Chain Security Standard (Mandatory)
Scope: repository-wide for `.github/workflows/**`, `.github/dependabot.yml`, and deployment workflows.

Rules:
1. The repository MUST run GitHub Actions workflows on pull requests for lint, typecheck, test, and build validation.
2. Code scanning MUST be enabled with CodeQL using default or advanced setup.
3. Dependency update automation MUST be configured through `.github/dependabot.yml`.
4. Production deployments MUST use protected GitHub Environments with required reviewers.
5. Workflow credentials MUST be stored in GitHub Secrets.
6. Workflow credentials MUST NOT be committed in plaintext.

Verification:
1. Reviewer checks `.github/workflows/*.yml` includes `pull_request` triggers for validation workflows.
2. Reviewer checks CodeQL workflow exists and runs in PR/default-branch contexts.
3. Reviewer checks `.github/dependabot.yml` exists and covers active package ecosystems.
4. Maintainer checks production environment protection rules include required reviewers.
5. Reviewer checks workflows reference `${{ secrets.* }}` and scans diffs for plaintext secrets.

## AI Agent Safety Standard (Mandatory)
Scope: repository-wide for AI-assisted development workflows and automation.

Rules:
1. AI coding agents MUST NOT receive unrestricted production credentials.
2. AI coding agents MUST run with least-privilege tokens scoped to required repositories and actions.
3. Agent-initiated destructive operations MUST require explicit human approval before execution.
4. Repositories with cloud coding agents MUST configure access controls or explicitly opt out sensitive repositories.

Verification:
1. Maintainer checks repository and organization policies for agent permission scopes.
2. Reviewer checks task or PR audit trail includes explicit human approval for destructive actions.
3. Maintainer checks cloud-agent access configuration for sensitive repository exclusions or restrictions.

## FHIR Interoperability Standard (Mandatory)
Scope: this standard applies only when a PR introduces or changes `VitalPro Health` FHIR interoperability behavior in `contracts/openapi/**`, `src/**/interface/**`, `src/**/application/**`, or `docs/interop/**`.

Rules:
1. External healthcare interoperability contracts MUST use HL7 FHIR R4 (`4.0.1`) resource semantics as the default baseline.
2. FHIR JSON payloads MUST include `resourceType`.
3. Persisted FHIR resources MUST include `id` according to FHIR base resource rules.
4. FHIR create-request payloads MAY omit `id` when server-side logical id assignment is intended.
5. FHIR in this repository MUST be implemented as an interoperability layer for Health external exchange.
6. FHIR in this repository MUST NOT be used as the mandatory canonical model for Core business entities.
7. Healthcare scheduling and clinical workflow contracts MUST map to canonical FHIR resources (`Patient`, `Practitioner`, `Organization`, `Location`, `Appointment`, `Schedule`, `Slot`, `Encounter`, `HealthcareService`) when equivalent concepts exist.
8. The first PR that introduces any FHIR endpoint in this repository MUST create `docs/interop/fhir-mapping.md`, `docs/interop/fhir-pr-checklist.md`, and `docs/interop/capabilitystatement-r4.json`.
9. Every PR in this scope MUST update `docs/interop/fhir-mapping.md` when that file exists.
10. Every PR in this scope MUST update `docs/interop/capabilitystatement-r4.json` when FHIR endpoints are added or changed and that file exists.
11. Any non-R4 behavior MUST be approved by ADR before merge.
12. Any PR that introduces non-R4 behavior MUST link the approving ADR.
13. Every PR in this scope MUST include a completed checklist in the PR description.
14. Every PR in this scope MUST include at least one consulted official HL7 FHIR source URL and one consultation date in `YYYY-MM-DD` format.
15. Every PR in this scope MUST include a mapping summary in the PR description when `docs/interop/fhir-mapping.md` does not yet exist.

Verification:
1. Reviewer checks FHIR behavior changes are present only in Health scope.
2. Reviewer checks `docs/interop/**` exists only after the first FHIR endpoint is introduced.
3. Reviewer checks mapping evidence is present in `docs/interop/fhir-mapping.md` or PR description according to rule scope.
4. Reviewer checks PR description contains the completed checklist, consulted official HL7 URL(s), and consultation date.
5. CI gate runs `pnpm nx affected -t lint,typecheck,test,build --base="$NX_BASE" --head="$NX_HEAD"` and MUST pass for affected projects.

## Non-Negotiable Coding Rules
1. No cross-layer shortcuts (`interface` or `infrastructure` cannot bypass `application` use cases).
2. No anemic boundaries: controllers orchestrate I/O, use cases orchestrate app flow, domain owns business decisions.
3. Never return ORM entities directly from API handlers.
4. Every external side effect (DB, HTTP, queue, file, email) MUST be behind an adapter in `infrastructure`.
5. Domain logic MUST be deterministic and unit-testable without network/database.
6. Every new module MUST ship with at least one core use case and corresponding tests.
7. No hidden coupling across Nx projects through path hacks or forbidden imports.

## Testing Standard
- `domain`: fast unit tests for invariants and rules.
- `application`: unit tests with mocked ports for happy path + error path.
- `infrastructure`: integration tests for adapters (DB/external providers) when applicable.
- `interface`: contract tests for request/response shape and status codes.

Tooling requirements:
1. TypeScript unit and integration test suites MUST use Vitest by default.
2. Browser end-to-end tests MUST use Playwright for web applications.
3. React component tests MUST use React Testing Library and assert user-visible behavior.
4. Critical mobile user journeys MUST include end-to-end coverage with Detox or an ADR-approved Expo-compatible equivalent.
5. Projects SHOULD enforce pre-commit checks with Husky and lint-staged.
6. Deviation from pre-commit tooling is acceptable only when equivalent CI gates are present for all staged checks.
7. PRs that deviate from pre-commit tooling MUST include explicit justification.

Minimum gate for merge:
1. Lint passes for affected projects.
2. Typecheck passes for affected projects.
3. Tests pass for affected projects.
4. Build passes for affected deployable projects.
5. No layer dependency violations.
6. No Nx module-boundary violations.

## File and Naming Conventions
- `*.entity.ts`, `*.value-object.ts`, `*.domain-service.ts`
- `*.use-case.ts`
- `*.repository.ts` for ports/adapters (with clear interface vs implementation naming)
- `*.controller.ts` or `*.handler.ts`
- `*.dto.ts`
- `*.mapper.ts` for explicit mapping boundaries

Prefer explicit names over generic names (`service.ts`, `utils.ts` are discouraged).

## Change Workflow
For every feature or bugfix:
1. Identify target module, target Nx project(s), and layer(s).
2. Add/update domain rule first if business behavior changes.
3. Implement/update use case in `application`.
4. Implement adapters in `infrastructure` only if side effects are needed.
5. Expose through `interface` with DTO validation.
6. Add/adjust tests by layer.
7. Update OpenAPI contract when API surface changes.
8. Validate with affected Nx commands before merge.

## CI Execution Guidance
Default PR validation command pattern (adapt targets as needed):

```bash
pnpm nx affected -t lint,typecheck,test,build --base="$NX_BASE" --head="$NX_HEAD"
```

CI MUST set `NX_BASE` to the latest successful `main` commit in `main`.

## Exceptions and ADRs
Any exception to this document MUST include a short ADR with:
- Context
- Decision
- Consequences
- Expiration/review date

Without ADR approval, this AGENTS.md MUST be treated as the source of truth.
