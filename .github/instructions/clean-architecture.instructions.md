---
applyTo: "apps/**/src/**/*.ts,libs/**/src/**/*.ts"
---

Enforce repository architecture and module boundaries:

- Keep dependency direction strict:
  - `interface -> application -> domain`
  - `infrastructure -> application/domain`
  - `domain` has no inward custom dependencies.
- In `domain/**`, reject framework/ORM/HTTP/queue/external SDK dependencies.
- In `interface/**`, do not call `domain` or `infrastructure` directly.
- In `application/**`, orchestrate use cases and ports; avoid transport and persistence details.
- In `infrastructure/**`, implement adapters and mapping boundaries only.
- Do not add Core-to-Health dependencies.

When generating code, include matching tests for the changed layer.
