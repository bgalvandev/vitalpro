---
name: entity-modeling
description: Decide what any new domain entity, module, or piece of logic should contain — by researching the best-fit established model for the concept, then keeping only what the use case needs. No single source fits everything; research per case. Use when creating or shaping any entity, value object, module, or domain rule.
---

# Entity Modeling

How to decide what an entity should contain. There is **no single universal standard**
that fits every concept here — research the best-fit model per concept, then keep only
what you need. (For *how* to structure the entity in code, see [[backend-architecture]];
this skill is about *what it should hold*.)

## Principles

1. **No fixed source — research per concept.** Before modeling a new entity, module, or
   rule, find how the concept is canonically modeled (established domain patterns,
   authoritative references, prior art in this repo) and pick the best fit for the actual
   use case. There is no limit on where to look; note the sources in the PR.
2. **References inform fields, never structure.** Use what you find as a checklist of
   fields and concepts — model a clean internal entity, never a copy of the standard's
   shape.
3. **Prefer flexible roles over rigid, duplicated entities.** Check the repo first: model
   a concept once and let it play roles where the overlap is real — one `Person` that is a
   customer in Core and a patient in Health, not separate `Patient`/`Client`/`Contact`
   each duplicating name, contact, and identifiers. Do not generalize speculatively:
   introduce the shared abstraction when the second role actually appears (Simplicity
   Standard).
4. **Bind coded fields to an authoritative vocabulary** when one exists, instead of
   inventing ad-hoc enums; carry `{ code, system, display }`.
5. **Keep only what the current use case needs.** Cut every field the research surfaces
   that you do not need yet.

## Verification

- The entity is a clean internal domain model (see [[backend-architecture]]) — not a
  standard's resource shape, with no exchange-format or SDK structure in the domain.
- The PR notes the references the model was based on.
- No new entity duplicates one an existing entity plus a role would cover.
- Coded fields bind to an authoritative vocabulary, not ad-hoc enums.

Related: [[backend-architecture]] (how entities are structured),
[[database-design]] (how the entity maps to Postgres tables, indexes, and migrations),
[[engineering-discipline]], and the `scaffold-module` skill.
