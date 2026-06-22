# ADR 0001: OpenAPI breaking-change policy is advisory until API v1.0

- Status: Accepted
- Date: 2026-06-22
- Impact: low — internal CI policy; does not change a production platform, cost model, or CI/CD execution platform.

## Context

The `OpenAPI Breaking Changes` workflow (`.github/workflows/openapi-breaking.yml`)
runs `oasdiff` with `fail-on: WARN` and is a required status check. It blocks any
pull request whose `contracts/openapi/**` change is backward-incompatible versus
`main`.

The Core Appointments API is pre-launch (workspace `0.1.0`) and has **no external
consumers**. The first substantive contract work intentionally introduced
breaking changes — migrating error responses to RFC 9457 Problem Details
(`code`/`message` → `type`/`title`/`status`/...) and tightening request
validation (`appointmentId` `minLength` `0` → `1`). The gate correctly flagged
these, but it blocked the very PR that introduces the intended change, with no
built-in path to consciously accept a pre-stability break.

## Decision

While the API is pre-1.0, the breaking-change detection is **advisory**: the step
keeps running and reporting breaks in logs/annotations, but does not fail the job
(`continue-on-error: true`). The `contracts` check therefore stays green and does
not block merges for intentional pre-1.0 contract changes.

This is a deliberate, documented relaxation — not an ad-hoc patch to clear a
single merge block. Breaking changes MUST still be declared in the PR (Conventional
Commits `!` / `BREAKING CHANGE:` footer) and evaluated per the API Query and
Response Shape Standard.

## Consequences

- Pre-1.0 contract evolution is unblocked while breaks remain visible for review.
- The gate does not protect against accidental breaks during this window; reviewers
  carry that responsibility until it is re-enabled.
- Re-enabling is a one-line change: remove `continue-on-error` from the detection
  step so the check blocks again.

## Review / expiration

Re-evaluate when the Core Appointments API is declared stable (v1.0) or gains its
first external consumer, whichever comes first. At that point blocking MUST be
restored and this ADR superseded.
