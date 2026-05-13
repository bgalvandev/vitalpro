# VitalPro Copilot Instructions

Follow `AGENTS.md` as the mandatory engineering standard.

## High-priority repository constraints
- Preserve Clean Architecture boundaries: `interface -> application -> domain` and `infrastructure -> application/domain`.
- Never introduce dependencies from `VitalPro Core` to `VitalPro Health`.
- Do not leak ORM, persistence, transport, or framework objects into `domain`.
- Keep all external side effects inside `infrastructure` adapters.
- Keep API behavior and OpenAPI contracts synchronized in the same change.

## Implementation workflow
1. Identify the target project and layer.
2. Update domain rules first when business behavior changes.
3. Implement or update use cases in `application`.
4. Implement adapters in `infrastructure` only when side effects are required.
5. Expose behavior through `interface` DTO/controller boundaries.
6. Add or update tests by layer.
7. Run relevant quality gates before finalizing.

## Commands
- Install: `pnpm install`
- Full quality: `pnpm run check`
- Affected projects: `pnpm run affected -- --base=origin/main --head=HEAD`
- API advanced checks: `pnpm run api:advanced:check`
- AI guardrails: `pnpm run ai:guard`

## Coding standards
- Use explicit names (`*.use-case.ts`, `*.repository.ts`, `*.controller.ts`, `*.dto.ts`, `*.mapper.ts`).
- Prefer small, testable units over large multi-responsibility files.
- Validate boundary input with schemas and keep business rules out of transport layers.
- Keep comments short, technical, and only where logic is non-obvious.

## Output expectations
- Return concrete file-level changes.
- Explain tradeoffs only when they impact architecture, safety, or contract compatibility.
- Propose follow-up improvements only after implementing the requested change.
