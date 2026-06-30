# AGENTS.md

## Scope
This document is the mandatory engineering standard for this repository. It applies
to all contributors (human and AI), all modules, and all CI workflows. It holds
**always-on standing rules**. Repeatable *procedures* live in skills under
`.agents/skills/**` and are referenced from here, not restated.

The key words **MUST, MUST NOT, REQUIRED, SHALL, SHALL NOT, SHOULD, SHOULD NOT,
RECOMMENDED, MAY, OPTIONAL** are interpreted per BCP 14 (RFC 2119, RFC 8174) when in
all capitals.

## AGENTS.md Rule Writing Standard (Mandatory)
Applies to any change to normative instructions in any `AGENTS.md` in this tree.

1. Rules MUST be repository-specific, explicit, actionable, and verifiable.
2. Rules MUST identify scope (repository-wide or path/module-specific).
3. Each sentence MUST use one requirement level (`MUST`/`SHOULD`/`MAY`).
4. A `SHOULD` rule MUST state acceptable deviation and required justification.
5. Each rule MUST define an observable verification (review step, command, file
   pattern, or CI gate).
6. Markdown MUST be valid and pass configured linting.
7. Documented mandatory commands MUST be executable and current; rules outdated by
   tooling changes MUST be updated in the same PR.

### Precedence
1. When multiple `AGENTS.md` files apply, the nearest to the edited path wins.
2. `AGENTS.override.md` beats `AGENTS.md` at the same level.
3. Direct system/developer/user instructions override `AGENTS.md`.
4. Conflicting rules at the same scope MUST be resolved in the same PR; unresolved
   conflicts are merge blockers.
5. This standard is evolvable, not frozen: when a better tool, pattern, or practice
   supersedes a rule, the contributor MUST update the affected rule in the **same**
   change (not work around it silently). The constraint is coherence, never a ceiling
   on adopting something better — silent drift between a rule and the actual practice
   is the only thing forbidden.

## Nested AGENTS.md Activation Rule (Mandatory)
Scope: repository-wide.

1. Create a nested `AGENTS.md` only when a subdirectory has stable instructions that
   differ from root standards (build/test commands, architecture constraints,
   compliance, deployment). Use `AGENTS.override.md` for temporary divergence.
2. A nested file MUST document only local deltas plus a short "Why this file exists"
   rationale and local verification — never duplicate root rules.
3. Obsolete nested guidance MUST be removed or updated in the PR that changes the
   underlying workflow.

Verification: reviewer confirms each nested file has module-specific deltas, a
rationale, and an observable verification step per local rule.

## Language Standard (Mandatory)
All technical artifacts (code comments, ADRs, PR descriptions, commit messages,
standards/architecture docs) MUST be written in English by default. Another language
MAY be used only for explicit product/content requirements. Verification: reviewer
checks changed artifacts and PR/commit language.

## Research and Recommendation Coverage Standard (Mandatory)
Scope: tooling evaluations, architecture option analyses, and recommendation
artifacts in `docs/**`, ADRs, issues, and PR descriptions.

Impact: an artifact is **high-impact** when it selects/replaces a production
platform, changes security/compliance posture or production cost model, changes the
CI/CD execution platform, asks for the best/default option for current use, or
selects/replaces the local-dev or CI emulation stack. Otherwise it is **low-impact**.

1. Every recommendation artifact MUST declare `high-impact` or `low-impact` with a
   one-sentence rationale.
2. A high-impact artifact MUST evaluate at least one option from each of:
   official/vendor-native, commercial, and open-source emerging; MUST include a
   side-by-side comparison (capabilities, limitations, cost/licensing, maturity);
   and MUST give one explicit risk/unknown per option plus a final recommendation
   tied to a stated decision context.
3. A low-impact artifact MUST include at least two options and a one-sentence
   tradeoff summary.
4. Any artifact citing external sources MUST include consultation dates in
   `YYYY-MM-DD`.

Verification: reviewer checks classification, required coverage, per-option risks,
final recommendation, and consultation dates.

## Commit Message Standard (Mandatory)
Commit messages MUST follow **Conventional Commits 1.0.0**.

1. Every commit MUST start with a valid type: `feat`, `fix`, `refactor`, `perf`,
   `docs`, `test`, `build`, `ci`, `chore`, `revert`.
2. Scope SHOULD map to an Nx project/module; deviation is acceptable when no stable
   scope exists and the PR justifies it.
3. Breaking changes MUST use `!` and/or a `BREAKING CHANGE:` footer.
4. Subjects MUST be concise, specific, English; one commit SHOULD be one logical
   change (emergency-hotfix deviation MUST be justified in the PR).
5. Commit messages MUST NOT include authorship trailers (e.g. `Co-Authored-By:`).
6. `WIP`/`tmp`/unclear messages MUST NOT be used on shared branches.

Non-compliant messages are merge blockers. Use the `commit-check` skill before
committing. Examples: `feat(scheduling-api): add waitlist auto-fill use case`,
`fix(billing): prevent duplicate charge retries`, `refactor(auth)!: remove legacy
token format`.

## Git Risk Controls and Authorization (Mandatory)
### High-risk commands (explicit owner/maintainer approval required on shared work)
`git reset --hard`, destructive `git clean -fd[x]`, discarding local changes via
`git checkout -- <path>`/`git restore --worktree`, `git rebase -i` on pushed
branches, `git push --force`/`--mirror`, and remote branch/tag deletions.

### Safer defaults
1. Prefer `git revert` to undo published commits.
2. Prefer non-destructive `git restore`/`git reset` for local corrections.
3. If a force update is unavoidable, use `git push --force-with-lease` (never plain
   `--force`), only on non-protected branches, with explicit approval.
4. Before a destructive op: confirm the branch (`git status`), back up history
   (`git branch backup/<date>-<name> HEAD`), dry-run cleans (`git clean -n`), and
   record the reason in the PR/task.

### Protected branch policy
1. `main` and release branches MUST be protected; force push and deletion MUST stay
   disabled.
2. Protected branches MUST require pull requests and required status checks, with
   "branches up to date before merging" (strict) enabled.
3. Merge commits MUST be disabled and squash merge MUST be enabled for PRs targeting
   protected branches.

Verification: `gh api repos/bgalvandev/vitalpro/branches/main/protection --jq
'.required_status_checks.strict'` returns `true`; repo settings keep squash on and
merge commits off.

### PR branch, merge, and readiness (Mandatory)
Scope: all PRs targeting protected branches. Use the `pr-ready` skill to run the
readiness sequence; the normative rules are:

1. Create a non-protected working branch before the first edit; never commit feature
   work directly on `main`/release branches.
2. The squash commit subject MUST follow Conventional Commits and include the PR
   number suffix `(#<number>)`; PR titles MUST be usable as that subject verbatim.
3. After merge, sync local `main` with `git pull --rebase origin main` before the
   next change.
4. Before reporting a PR ready/merge-able, contributors MUST confirm the branch
   contains current `origin/main` (`git fetch origin` +
   `git merge-base --is-ancestor origin/main HEAD`) and inspect GitHub state
   (`gh pr view <n> --json mergeStateStatus,statusCheckRollup,headRefName,baseRefName`).
5. Contributors MUST NOT report a PR ready when `mergeStateStatus` is `DIRTY`, MUST
   re-query when `UNKNOWN`, and MUST NOT report checks "running" when
   `statusCheckRollup` is `null`.
6. The PR URL, merge state, and required check names MUST be recorded in the task
   trail when finishing PR work.

### Merge-block triage (Mandatory)
When GitHub reports `Merging is blocked` while required checks pass, inspect branch
protection, unresolved review threads, and code-scanning conversations before adding
code. Fix true-positive security/code-scanning findings; dismiss false positives
with written justification in the thread. Do not add unrelated patches to clear an
administrative block. Record the cause and resolution in the PR/task trail.

## Repository Platform Standard (Mandatory)
Standard: **Nx monorepo + pnpm workspaces**. Root MUST contain `nx.json`,
`pnpm-workspace.yaml`, `package.json` (with a pinned `packageManager`), and
`pnpm-lock.yaml`.

1. Use Node.js LTS and pnpm via Corepack; do not hand-edit lockfiles; commit lockfile
   changes with the dependency change.
2. Internal deps MUST use the `workspace:` protocol; every project MUST be
   discoverable via workspace config and/or `project.json`; install from the root.
3. Run tasks through Nx; prefer `nx run`/`run-many`/`affected`. Each project MUST
   define `build`, `lint`, `test`, and `typecheck` targets when applicable.
4. Keep `defaultBase` in `nx.json` (`main`); in CI set `NX_BASE`/`NX_HEAD` for
   affected runs.
5. Cache only deterministic targets via `targetDefaults`/`inputs`/`outputs`;
   `--skip-nx-cache` is for troubleshooting only.
6. Tag projects (`surface:`, `type:`, `layer:`, `scope:`) and enforce import
   constraints with `@nx/enforce-module-boundaries`; boundary violations are merge
   blockers.
7. Keep `nx` and `@nx/*` plugins in sync; add with `nx add`, upgrade with
   `nx migrate`; do not drift versions manually.

## Mandatory Architecture Standard
**Pragmatic Clean Architecture per module.** This standard is non-negotiable; PRs
that violate it MUST be rejected. Procedures: the `backend-architecture` and
`backend-performance` skills for `apps/core-api` and `libs/**`; the
`frontend-architecture` and `frontend-performance` skills for `apps/web`; the
`database-design` skill for the Prisma/Postgres schema, indexes, and migrations behind
any module.

Dependency direction (mandatory; enforced by `pnpm run ai:guard`):

```txt
interface -> application -> domain
infrastructure -> application/domain
domain -> (no inward custom dependency)
```

Layer responsibilities:
- **domain** — entities, value objects, domain services, invariants, events;
  business language only. No framework/ORM/HTTP/IO. Deterministic and unit-testable
  without network/DB.
- **application** — use cases (`*.use-case.ts`) and app services; defines
  ports/interfaces for repositories and providers; owns transaction boundaries via
  abstractions.
- **infrastructure** — adapters for persistence/messaging/storage/external APIs;
  maps persistence/network models to/from domain; MUST NOT leak persistence models
  to `application`/`interface`. Prisma Client is the default ORM (alternative by
  ADR); raw SQL/TypedSQL/query builders stay inside `infrastructure`.
- **interface** — controllers/handlers, request/response DTOs, validation wiring,
  transport mapping. No business rules.

Default module template:

```txt
<project-root>/src/<module>/
  domain/        appointment.entity.ts        scheduling.rules.ts
  application/   create-appointment.use-case.ts
  infrastructure/ appointment.repository.ts    prisma-appointment.mapper.ts
  interface/     scheduling.controller.ts      create-appointment.dto.ts
```

## Simplicity and Proportionality Standard (Mandatory)
Scope: repository-wide.

1. Changes MUST use the smallest code path, module scope, and layer surface that
   satisfies the requirement while preserving the architecture.
2. Contributors MUST NOT add abstractions, adapters, services, modules, shared
   utilities, or generators for speculative future reuse.
3. New files MAY be added when they preserve Clean Architecture boundaries, isolate
   external side effects, or test changed behavior.

Verification: reviewer confirms new files/abstractions are required by the changed
behavior, not speculative. The `engineering-discipline` skill is the working
protocol for this.

## VitalPro Product Topology Standard (Mandatory)
Scope: module boundaries, contracts, architecture docs, dependency decisions.

1. The platform is modeled as two surfaces: **VitalPro Core** (vertical-agnostic for
   appointment-based service businesses) and **VitalPro Health** (a vertical
   extension that MAY depend on Core).
2. Core MUST NOT depend on Health-only semantics or modules; reverse (Core→Health)
   dependencies are merge blockers. Cross-surface dependencies MUST point Health→Core.
3. Health MAY add healthcare modules (patients, encounters, consents, observations),
   modeled as clean internal domain models per "Entity Modeling".

Verification: reviewer classifies each changed module as Core/Health in the PR and
checks import direction (rejecting Core→Health). CI runs the affected validation command
(see "CI Execution Guidance").

## Stack Baseline (2026)
Default unless an ADR approves an exception.

- Monorepo: **Nx**; package manager: **pnpm workspaces**; language: **TypeScript**
  `"strict": true`.
- Web: **Next.js (App Router) + React + TypeScript**; styling **Tailwind CSS**; UI as
  repository-owned source components. The **React Compiler is enabled** (see Frontend
  Architecture and Rendering Standard).
- Mobile: React Native + Expo + TypeScript.
- Backend: Node.js services (REST/OpenAPI when external clients are expected);
  boundary validation with **Zod**.
- Data: **PostgreSQL**, **Prisma** (Drizzle by ADR), versioned migrations deployed via
  CI/CD; Redis when needed.
- Observability: structured logs, error tracking, traces for critical flows.

## Frontend Architecture and Rendering Standard (Mandatory)
Scope: `apps/web/**`. Procedures: `frontend-architecture` and `frontend-performance`
skills.

1. Web UI MUST follow per-module Clean Architecture (`apps/web/src/<module>/{domain,
   application,infrastructure,interface}`), mirroring `apps/web/src/appointments`.
   `app/**` route files are composition roots and MUST NOT hold business logic.
2. Components MUST be Server Components by default; `'use client'` MUST be placed only
   on the leaf component that needs interactivity/browser APIs — never on layouts,
   pages, or containers.
3. UI MUST receive domain types, not raw API/DTO/ORM shapes; the `infrastructure`
   adapter MUST validate external responses (Zod) and map to domain before the UI.
4. One exported component per file; component files SHOULD stay under ~150 lines —
   when exceeded, extract sub-components/hooks (justify any deliberate exception in
   the PR). Generic `utils.ts`/`service.ts` names MUST NOT be used.
5. Manual memoization (`useMemo`/`useCallback`/`React.memo`) MUST NOT be added by
   default; rely on the React Compiler and add manual memo only with a
   Profiler-measured reason recorded in a comment.
6. Lists over ~500 items MUST be virtualized; lists over ~100 items SHOULD be
   virtualized (deviation justified in the PR).

Verification: `pnpm run ai:guard` and `pnpm nx lint web` pass (the
`eslint-plugin-react-hooks` Rules-of-React/React-Compiler rules are the automated
gate); reviewer checks `'use client'` placement, file size, no raw-shape leakage, and
virtualization on large lists.

## API Contract and Response Shape Standard (Mandatory)
Scope: `src/**/{interface,application,infrastructure}/**`, `apps/**/src/**`,
`libs/**/src/**`, `contracts/openapi/**`. Procedure: `openapi-contract-update` skill.

1. External input boundaries MUST validate with **Zod** (alternatives by ADR);
   internal TypeScript-only APIs MAY use tRPC.
2. APIs consumed by external clients MUST publish REST contracts in OpenAPI 3.1.x or
   3.2.x under `contracts/openapi/**`, versioned and updated in the same PR that
   changes external API behavior. Code-generated contracts MUST be regenerated and
   committed in that PR; hand-authored 3.2.x usage MUST state why in the PR.
3. External responses MUST be explicit response DTOs or documented OpenAPI schemas
   and MUST NOT expose Prisma models, ORM entities, persistence records, or unbounded
   object graphs.
4. Collection endpoints MUST return list-oriented DTOs (only fields the collection
   needs), MUST be paginated/cursored or have an explicitly bounded limit in the
   contract, and MUST document ordering when paginated. Detail endpoints MUST use
   separate detail DTOs when extra fields are required.
5. Field expansion MUST use documented view variants or allowlisted field masks; it
   MUST NOT accept arbitrary client-controlled ORM `select`/`include`.
6. Prisma is the default query mechanism; read paths MUST use explicit `select` or
   intentionally bounded `include`. Raw SQL/TypedSQL/db-specific adapters MAY be used
   for measured hot paths/reporting/native features, MUST live behind an
   `infrastructure` adapter/port, and MUST carry a comment or test name stating the
   reason.
7. Adding response fields MUST update the OpenAPI contract in the same PR when
   externally consumed; removing/renaming/broadening fields MUST be treated as a
   contract change and evaluated for backwards compatibility.
8. Web projects MUST use Tailwind CSS; shared UI MUST be committed source files, never
   opaque binary bundles.
9. Success responses MUST use tailored, flat, per-use-case DTOs (a collection envelope
   plus a separate detail DTO). Any other response paradigm requires an ADR justifying
   a specific consumer. Canonical shapes live in the `api-response-patterns` skill.
10. Error responses MUST use RFC 9457 Problem Details with the
    `application/problem+json` content type and at least `type`, `title`, and
    `status`; handlers MUST NOT return ad-hoc error shapes. Procedure: the
    `api-response-patterns` skill.

Verification: reviewer checks explicit DTOs/schemas, bounded+ordered collections,
flat per-use-case response shape, RFC 9457 error bodies, explicit Prisma `select`,
infra-confined raw SQL with stated reason, and `contracts/openapi/**` updates;
contract/interface tests assert both the success-DTO shape and the Problem Details
error shape. CI runs the affected validation command and `openapi:lint`.

## Code Quality Gates (Mandatory)
Scope: repository-wide. Procedure: `code-quality` skill.

1. Dead code MUST be removed: `pnpm run dead-code` (knip) MUST pass; a genuinely-used
   dependency that knip cannot import-trace MAY be added to `knip.json`
   `ignoreDependencies` only with PR justification.
2. Copy-paste duplication MUST NOT be introduced: `pnpm run dupes` (jscpd, enforced at
   `--threshold 0` over `apps libs tools scripts`, tests excluded) MUST report zero
   clones. Shared logic MUST be extracted into the owning layer, not a speculative
   utility (see Simplicity Standard).
3. Both gates run inside `pnpm run check` and the CI `quality` job and MUST pass.

Verification: `pnpm run dead-code` and `pnpm run dupes` exit 0; reviewer checks any
new ignore entry is justified.

## CI and Supply Chain Security Standard (Mandatory)
Scope: `.github/workflows/**`, `.github/dependabot.yml`, deployment workflows.

1. GitHub Actions MUST run lint, typecheck, test, and build validation on pull
   requests.
2. CodeQL code scanning MUST be enabled and run in PR/default-branch contexts.
3. Dependency update automation MUST be configured via `.github/dependabot.yml` for
   active ecosystems.
4. Production deployments MUST use protected GitHub Environments with required
   reviewers.
5. Workflow credentials MUST be stored in GitHub Secrets and MUST NOT be committed in
   plaintext.

Verification: reviewer checks `pull_request` triggers, the CodeQL workflow, the
dependabot config, `${{ secrets.* }}` usage with no plaintext secrets; maintainer
checks production environment protection rules.

## AI Agent Safety Standard (Mandatory)
Scope: AI-assisted development and automation.

1. AI coding agents MUST NOT receive unrestricted production credentials and MUST run
   with least-privilege tokens scoped to required repos/actions.
2. Agent-initiated destructive operations MUST require explicit human approval before
   execution.
3. Repos with cloud coding agents MUST configure access controls or explicitly opt
   sensitive repositories out.

Verification: maintainer checks agent permission scopes and cloud-agent access config;
reviewer checks the PR/task trail for explicit approval of destructive actions.

## Agent Skills and Local Configuration Standard (Mandatory)
Scope: `.agents/**`, `.claude/**`, related `.gitignore` entries, `CLAUDE.md`.

1. A repeatable, verifiable procedure SHOULD be a skill rather than appended to
   `AGENTS.md`; a rule that must apply every turn MAY stay in `AGENTS.md` (PR states
   the justification when a procedure stays here).
2. Canonical skills MUST live under `.agents/skills/**` as `SKILL.md` files; Claude
   Code discovery MUST be a `.claude/skills` symlink to `.agents/skills` — skill files
   MUST NOT be duplicated across paths.
3. Team-owned config MUST be committed (`.agents/skills/**`, the `.claude/skills`
   symlink, `.claude/agents/**`, `.claude/settings.json`); personal/machine config
   (`.claude/settings.local.json` and equivalents) MUST stay gitignored.
4. `.claude/settings.json` and skill files MUST NOT contain plaintext secrets.
5. Every committed skill MUST be a `SKILL.md` with `name` and `description`
   frontmatter, and the `description` MUST state when the skill applies.
6. A command-running skill SHOULD declare `allowed-tools` scoped to the commands it
   needs, MUST NOT rely on `allowed-tools` to block destructive Git operations, and
   the PR MUST state when it omits `allowed-tools`.
7. A committed skill MUST NOT *silently* contradict a rule in this `AGENTS.md`. A
   skill MAY supersede a rule when it documents a better practice, but the same change
   MUST update the affected `AGENTS.md` rule so the standard and the skill stay
   coherent (per Precedence point 5). Hidden divergence between a skill and the
   standard is the merge blocker — not the improvement itself.
8. `CLAUDE.md` (and any per-tool entry file) MUST stay minimal, MUST import/defer to
   `AGENTS.md`, and MUST NOT duplicate normative rules.

Verification: `readlink .claude/skills` resolves to `../.agents/skills` with no
duplicated `SKILL.md`; `git ls-files .agents/skills .claude` and
`git check-ignore -v .claude/settings.local.json` confirm tracking;
reviewer checks frontmatter, scoped `allowed-tools`, no plaintext secrets, and that
any skill that supersedes a rule updated that rule in the same change (no silent
contradictions).

## Entity Modeling (Mandatory)
Scope: any new domain entity, value object, module, or domain rule. Procedure:
`entity-modeling` skill.

1. Every domain entity MUST be a clean, flat internal domain model (per the Architecture
   Standard) with invariants owned by the domain. No single source governs all entities:
   contributors MUST research the best-fit established model for the concept (domain
   patterns, authoritative references, prior art in this repo) and use it as a
   field/concept reference, noting the sources in the PR. References inform fields, never
   structure — a standard's resource/archetype shape MUST NOT become the internal model.
2. Coded fields SHOULD bind to an authoritative vocabulary (currency, units, clinical
   codes, …) as `{ code, system, display }` rather than ad-hoc enums (justify deviations
   in the PR). Prefer extending an existing entity or adding a role over duplicating one;
   do not generalize speculatively.

Verification: reviewer checks each entity is a clean internal domain model, the PR notes
the references it was based on, coded fields bind to a vocabulary, no exchange-format
structure leaks into the domain, and no entity duplicates one a role would cover.

## Non-Negotiable Coding Rules
1. No cross-layer shortcuts: `interface`/`infrastructure` MUST NOT bypass `application`
   use cases.
2. No anemic boundaries: controllers orchestrate I/O, use cases orchestrate app flow,
   domain owns business decisions.
3. Never return ORM entities directly from API handlers.
4. Every external side effect (DB, HTTP, queue, file, email) MUST be behind an
   `infrastructure` adapter.
5. Domain logic MUST be deterministic and unit-testable without network/DB.
6. Every new module MUST ship with at least one core use case and tests.
7. No hidden coupling across Nx projects via path hacks or forbidden imports.

Verification: reviewer checks these rules in code review; `pnpm run ai:guard` enforces
layer/import boundaries and CI fails on violations; domain unit tests run without
network/DB.

## Testing Standard
- **domain**: fast unit tests for invariants/rules.
- **application**: unit tests with mocked ports for happy and error paths.
- **infrastructure**: integration tests for adapters (DB/external) when applicable.
- **interface**: contract tests for request/response shape and status codes.

Tooling:
1. TS unit/integration suites MUST use **Vitest**.
2. Web browser end-to-end tests MUST use **Playwright** (suite in `apps/web-e2e`, run
   with `pnpm run e2e`; see the `frontend-e2e` skill).
3. React component tests MUST use React Testing Library and assert user-visible
   behavior.
4. Critical mobile journeys MUST have e2e coverage with Detox or an ADR-approved
   Expo-compatible equivalent.
5. Pre-commit checks SHOULD be enforced with Husky and lint-staged; deviation is
   acceptable only with equivalent CI gates for all staged checks, justified in the PR.

Verification (minimum merge gate, affected projects): lint, typecheck, test, build pass;
web e2e passes when web behavior changes; no layer-dependency or Nx module-boundary
violations; dead-code and duplication gates pass.

## File and Naming Conventions
`*.entity.ts`, `*.value-object.ts`, `*.domain-service.ts`, `*.use-case.ts`,
`*.repository.ts` (clear interface vs implementation), `*.controller.ts`/`*.handler.ts`,
`*.dto.ts`, `*.mapper.ts`. Prefer explicit names; `service.ts`/`utils.ts` are
discouraged.

Verification: reviewer checks changed files use these suffixes and flags generic
`service.ts`/`utils.ts` names in review.

## Module Scaffolding Standard (Mandatory)
Scope: new module libraries under `libs/**`. Procedure: `scaffold-module` skill.

1. New `libs/**` modules MUST be scaffolded with `pnpm nx g @vitalpro/tools:clean-module
   <name> --domain=<core|health>`; manual scaffolding MUST NOT be used when the
   generator produces the same baseline.
2. Generator output MUST preserve `src/{domain,application,infrastructure,interface}`,
   include `build`, `lint`, `test`, and `typecheck` targets, and carry a
   `surface:core` or `surface:health` tag in `project.json`.

Verification: `pnpm nx g @vitalpro/tools:clean-module <name> --domain=<core|health>
--dry-run` shows the expected shape; reviewer checks the four layer folders, the four
targets, and the surface tag.

## Change Workflow
1. Identify the target module, Nx project(s), and layer(s).
2. Update domain rules first when behavior changes, then the application use case,
   then infrastructure adapters (only if side effects are needed), then the interface
   with DTO validation.
3. Add/adjust tests by layer; update the OpenAPI contract when the API surface
   changes.
4. Validate with affected Nx commands before merge. The `engineering-discipline` skill
   is the end-to-end protocol.

## CI Execution Guidance
Single source of truth for the affected validation command referenced by verification
gates above:

```bash
pnpm nx affected -t lint,typecheck,test,build --base="$NX_BASE" --head="$NX_HEAD"
```

CI MUST set `NX_BASE` to the latest successful `main` commit and `NX_HEAD` to the
current commit. The full local/CI gate is `pnpm run check` (lint, typecheck, test,
build, `openapi:lint`, `ai:guard`, `dead-code`, `dupes`); browser e2e runs via
`pnpm run e2e`.

## Exceptions and ADRs
Any exception MUST have a short ADR with Context, Decision, Consequences, and an
expiration/review date. Without ADR approval, this `AGENTS.md` is the source of truth.
