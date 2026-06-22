# ADR 0002: Deployment platform — Render at launch

- Status: Accepted
- Date: 2026-06-22
- Impact: **high** — selects the production hosting platform and cost model.

## Context

VitalPro Core has three runtime pieces: a Next.js web app, a containerized
Fastify API (`Dockerfile`), and PostgreSQL. The project is pre-launch with a
solo/small team that has the experience to self-host but prioritizes **quality**
and **low cost/effort**. Because the API is already containerized, the platform
choice is reversible — we can start managed and move to full control later with
little rework.

## Options considered

One option per required category (vendor-native, commercial, open-source emerging):

| Option (category) | Capabilities | Limitations | Cost (2026-06-22) | Maturity |
| --- | --- | --- | --- | --- |
| **Vercel** (vendor-native) | Best-in-class Next.js DX, SSR/edge, preview deploys | Hosts the web only — API + Postgres need a second provider; per-seat + bandwidth pricing | Pro ~$20/mo + usage; compounds with traffic/seats | Very mature for Next |
| **Render** (commercial) | Runs the `Dockerfile`, web + API + managed Postgres in one place, managed TLS/scaling, **Postgres backups/PITR** | Free tier spins down; fixed per-service pricing | ~$7 web + ~$7 API + ~$6–7 Postgres ≈ **$20/mo** | Mature ("Heroku successor") |
| **Coolify/Dokploy on a VPS** (open-source) | Full control, git-push deploy, cheapest at scale | You own OS/patching/backups/TLS/uptime | VPS ~$4–6/mo + your time | Emerging, growing fast |

### Risks / unknowns per option

- **Vercel:** cost compounding at scale and split-vendor operations (API/DB elsewhere); some lock-in to Vercel-specific edge features.
- **Render:** usage growth can require tier bumps; free tier cold-starts are unsuitable for production (use paid tiers).
- **Coolify/VPS:** operational burden and single-host reliability risk — heavier for data that must be durable (health-adjacent product).

## Decision

Adopt **Render** at launch: one provider for web + API (from the existing
`Dockerfile`) + **managed PostgreSQL with backups/PITR**, fixed and predictable
pricing (~$20/mo), managed TLS/scaling. Railway is the accepted fallback if a
faster deploy DX is preferred (trade-off: usage-based billing is less
predictable). Vercel is reserved for the web only if Next-specific edge features
later justify a split. A VPS + Coolify is the migration target if cost at scale
dominates — reachable without rework thanks to the container.

## Consequences

- Single, low-effort provider with durable managed Postgres suits a pre-launch,
  quality-first product.
- Need to provision Render services and inject env per service (`DATABASE_URL`,
  `CORE_API_SERVICE_TOKEN`, and the web's `CORE_API_URL`/`CORE_API_TOKEN`).
- Portability is preserved: the `Dockerfile` lets us move to Railway or a VPS later.

## Review / expiration

Revisit when monthly cost materially exceeds a VPS alternative, when control needs
grow, or at the next major scaling milestone.

## Sources (consulted 2026-06-22)

- [Railway vs Render vs Fly.io — Techsy](https://techsy.io/en/blog/railway-vs-render-vs-fly-io)
- [Render vs Railway — Encore](https://encore.dev/articles/render-vs-railway)
- [Vercel alternatives — DigitalOcean](https://www.digitalocean.com/resources/articles/vercel-alternatives)
