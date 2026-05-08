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

Reference sources to consult for AGENTS format and best practices:
- https://agents.md/
- https://github.com/agentsmd/agents.md
- https://openai.com/index/introducing-codex/

## Language Standard
All technical artifacts must be written in English by default:
- code comments
- ADRs
- pull request descriptions
- commit messages
- repository standards and architecture docs

Use another language only for explicit product/content requirements.

## Commit Message Standard (Mandatory)
Commit messages must follow **Conventional Commits 1.0.0**:

```txt
<type>[optional scope]: <description>

[optional body]
[optional footer(s)]
```

Rules:
1. Every commit must start with a valid type.
2. Allowed default types: `feat`, `fix`, `refactor`, `perf`, `docs`, `test`, `build`, `ci`, `chore`, `revert`.
3. Scope is optional but strongly recommended, and should map to an Nx project or module.
4. Breaking changes must be marked with `!` in the header and/or a `BREAKING CHANGE:` footer.
5. Subject lines must be concise, specific, and written in English.
6. One commit should represent one logical change (avoid mixed unrelated changes).
7. `WIP`, `tmp`, or unclear commit messages are not allowed in shared branches.
8. Commit messages MUST NOT include authorship trailers (for example `Co-Authored-By:` or `Co-authored-by:`).
9. Non-compliant commit messages are merge blockers.

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
1. `main` and release branches must be protected in the Git hosting platform.
2. Force push and branch deletion must stay disabled for protected branches.
3. Protected branches must require pull requests and required status checks.

### Safety Checklist Before Risky Git Operations
1. Run `git status` and confirm target branch.
2. Create a backup ref before destructive history changes (for example `git branch backup/<date>-<name> HEAD`).
3. For clean operations, run a dry-run first (`git clean -n`).
4. Record the reason and executed command in the PR/task for auditability.

## Repository Platform Standard (Mandatory)
This repository standard is **Nx monorepo + pnpm workspaces**.

### Required Root Artifacts
The repository root must contain:
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
1. Internal workspace dependencies must use the `workspace:` protocol.
2. Every project must be discoverable by pnpm/Nx via workspace config and/or `project.json`.
3. Avoid cross-project relative imports that bypass project boundaries.
4. Install dependencies from repository root.
5. Keep one shared workspace lockfile.

### Nx Task Orchestration Rules
1. Run monorepo tasks through Nx (`pnpm nx ...`).
2. Each project must define clear targets (at minimum when applicable):
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
3. Non-deterministic targets (time/network side effects) must not rely on cache correctness.
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

Each module may contain:
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
1. `domain` must not depend on framework, database, HTTP, queues, or external SDKs.
2. `application` orchestrates use cases and depends only on `domain` plus ports/contracts.
3. `infrastructure` implements technical details (DB, external APIs, queues, providers).
4. `interface` exposes transport concerns (HTTP handlers/controllers, DTOs, serializers).
5. Dependencies always point inward toward business rules.

This standard is non-negotiable. PRs that violate it must be rejected.

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

## Stack Baseline (2026)
Use this default unless an ADR approves an exception.

### Monorepo and Tooling
- Monorepo orchestration: **Nx**
- Package manager: **pnpm workspaces**
- Language: **TypeScript** with `"strict": true`

### Product Stack (Default)
- Web: Next.js + React + TypeScript
- Mobile: React Native + Expo + TypeScript
- Backend: Node.js services (REST/OpenAPI when external clients are expected)
- Validation: boundary validation for all external input (DTO schemas)
- Database: PostgreSQL
- ORM: Prisma (or Drizzle by ADR)
- Migrations: versioned migrations in source control; deploy via CI/CD
- Cache/queue: Redis when needed
- Observability: structured logs, error tracking, traces for critical flows

## Non-Negotiable Coding Rules
1. No cross-layer shortcuts (`interface` or `infrastructure` cannot bypass `application` use cases).
2. No anemic boundaries: controllers orchestrate I/O, use cases orchestrate app flow, domain owns business decisions.
3. Never return ORM entities directly from API handlers.
4. Every external side effect (DB, HTTP, queue, file, email) must be behind an adapter in `infrastructure`.
5. Domain logic must be deterministic and unit-testable without network/database.
6. Every new module must ship with at least one core use case and corresponding tests.
7. No hidden coupling across Nx projects through path hacks or forbidden imports.

## Testing Standard
- `domain`: fast unit tests for invariants and rules.
- `application`: unit tests with mocked ports for happy path + error path.
- `infrastructure`: integration tests for adapters (DB/external providers) when applicable.
- `interface`: contract tests for request/response shape and status codes.

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

Set `NX_BASE` to the latest successful `main` commit in CI.

## Exceptions and ADRs
Any exception to this document requires a short ADR including:
- Context
- Decision
- Consequences
- Expiration/review date

Without ADR approval, this AGENTS.md is the source of truth.
