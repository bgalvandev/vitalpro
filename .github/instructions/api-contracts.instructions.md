---
applyTo: "contracts/openapi/**/*.yaml,apps/**/src/**/interface/**/*.ts,libs/**/src/**/interface/**/*.ts"
---

Keep external API behavior and contracts aligned:

- Update `contracts/openapi/**` in the same change when external API behavior changes.
- Preserve request/response compatibility unless explicitly introducing breaking changes.
- Keep DTO and validation boundaries in interface layers aligned with contract schemas.
- Prefer additive, backward-compatible contract evolution.
- If behavior changes are not reflected in OpenAPI, stop and request correction before merge.
