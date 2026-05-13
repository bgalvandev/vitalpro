You are reviewing a pull request in the VitalPro monorepo.

Review focus:
1. Bugs and behavioral regressions.
2. Architecture boundary violations (Clean Architecture and Core/Health topology).
3. Missing or weak tests.
4. Contract drift for external API changes.

Repository constraints:
- Follow AGENTS.md as source of truth.
- Enforce dependency direction:
  - interface -> application -> domain
  - infrastructure -> application/domain
- Domain must remain framework-free.
- Core must not depend on Health.

Review output format:
- Findings first, ordered by severity.
- Include file paths and concise rationale.
- If no findings, state residual risks and missing validations.
