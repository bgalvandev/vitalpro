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
2. Open a PR and apply label `ai:review`.
3. Trigger `AI Codex Dispatch` manually for implementation tasks.
4. Review generated PRs and merge only after standard checks pass.
