# ADR 0003: Authentication strategy — service-token now, user auth deferred

- Status: Accepted
- Date: 2026-06-22
- Impact: medium — sets security posture for API access; no external consumers yet.

## Context

Two distinct authentication concerns exist and are often conflated:

1. **Service-to-service (M2M):** the web server calling the Core API.
2. **End-user authentication:** humans signing in, sessions, roles, user management.

The platform is pre-launch with no end users and no login flow yet. Building a
full user-auth/identity system now would be speculative structure (against the
Simplicity and Proportionality Standard).

## Decision

- **M2M (implemented):** `/api/*` requires a shared **service token**
  (`CORE_API_SERVICE_TOKEN`), validated with a constant-time comparison. The web
  sends it as `Authorization: Bearer <token>`. This replaces the earlier stub that
  accepted any well-formed bearer.
- **End-user auth (deferred):** intentionally not built yet. When users are
  introduced, adopt a managed **OIDC/OAuth2** provider (e.g. Clerk, Auth0, WorkOS,
  or self-hosted Keycloak) rather than a hand-rolled identity system; the Core API
  will validate the resulting tokens and derive authorization.
- **M2M evolution:** the static shared token is adequate pre-launch. Upgrade to
  OAuth2 client-credentials (short-lived JWTs) or mTLS when there are multiple
  services or stricter requirements.

## Alternatives considered

- Hand-rolled user auth (passwords/sessions): rejected — high risk, reinvents a
  solved problem; a managed OIDC provider is the quality choice.
- OAuth2 client-credentials / mTLS for M2M now: rejected as premature for a single
  caller pre-launch; revisit per above.

## Consequences

- API access is genuinely gated today (no more "any token") without over-building.
- The service token is a credential: delivered via env (`.env` locally, secrets in
  deploy), never committed; web and API must hold the same value.
- A clear, documented path exists for user auth so the current absence is a
  deliberate deferral, not an oversight.

## Review / expiration

Revisit when the first end-user login is needed, or when a second internal service
calls the Core API (whichever comes first).
