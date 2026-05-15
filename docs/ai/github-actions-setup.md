# AI Workflow Setup (GitHub Actions)

This repository includes optional AI workflows for Codex.

## Required repository secrets
- `OPENAI_API_KEY` for:
  - `.github/workflows/ai-codex-review.yml`
  - `.github/workflows/ai-codex-dispatch.yml`

## Optional repository variables
- `AI_AUTO_REVIEW=true`
  - enables automatic Codex review for all pull requests.

## Recommended branch protection alignment
- Keep required status checks from `CI`, `CodeQL`, and contract workflows enabled.
- Treat AI workflows as assistants; do not bypass mandatory quality gates.

## Usage quickstart
1. Add required secrets.
2. Open a PR and apply label `ai:review` (or keep `AI_AUTO_REVIEW=true`).
3. Trigger implementation with one of:
   - `AI Codex Dispatch` (manual workflow dispatch)
   - PR comment command: `/codex <task>`
   - terminal command: `pnpm run ai:dispatch -- --task "<task>"`
4. Review generated PRs and merge only after standard checks pass.

Command examples:
- `/codex implement patients module in health domain`
- `/codex add endpoint for patient retrieval --effort=high --create-pr=true`
- `/codex fix-ci quality job failed after latest push`

## Optional auto-recovery
- `AI Codex Auto-Fix CI` listens to failed `CI` runs on AI-managed PRs and can open a targeted fix PR.
- `AI Codex Fix CI` provides manual fallback for targeted PR repair (`pnpm run ai:fix-ci -- --pr-number <n>`).

## Behavior without secret
- If `OPENAI_API_KEY` is missing, `AI Codex PR Review` is skipped with an explicit message instead of failing.
