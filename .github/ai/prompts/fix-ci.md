A CI run is failing in the VitalPro monorepo.

Objective:
- Fix only the failing scope with minimal, high-confidence changes.

Rules:
- Follow AGENTS.md constraints.
- Do not introduce unrelated refactors.
- Preserve contracts and layer boundaries.

Execution:
1. Read failing job logs and identify root cause.
2. Apply the smallest patch that addresses the failure.
3. Run focused checks first.
4. Run full check for final verification.

Output:
- Root cause summary.
- Files changed.
- Validation commands and results.
