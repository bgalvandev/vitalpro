---
name: health-entity-modeling
description: Design VitalPro Health (and general) domain entities using HL7 FHIR R4, openEHR, and clinical terminologies (SNOMED CT, LOINC) as field/concept references — while modeling clean, flat internal entities, never the standard's structure. Use when creating or shaping a health domain entity (Patient, Practitioner, Encounter, Observation, …) or any new domain entity.
---

# Health (and General) Entity Modeling

How to decide what a domain entity contains and shape it well — without falling into
the trap of adopting an interoperability format as the internal model.

## The rule: references inform fields, never structure

Model every entity as a clean, flat internal domain object following the existing
pattern (`AppointmentsEntity`: private constructor + static `create()`, invariants in
the domain, no framework/IO). Use external standards ONLY as **references** for *what
fields and concepts an entity should carry* — never copy their wire/resource structure
into the domain. Adopting a FHIR/openEHR resource shape internally is the same trap as
JSON:API: verbose, deeply nested, and it couples business logic to an exchange format.

## Which reference for what (health)

| Need | Reference | Use it for |
|---|---|---|
| Internal clinical structure / detail | **openEHR** archetypes | The richest "maximal" models of clinical concepts — the best guide for the fields a clinical entity needs *at rest* (your case) |
| Common entities + future interop | **HL7 FHIR R4** | The field list of common resources (`Patient`, `Practitioner`, `Encounter`, `Observation`, `Appointment`, …); also the boundary format IF external interop is ever added |
| Coded field values | **SNOMED CT** (diagnoses/findings), **LOINC** (labs/measurements); also ICD, RxNorm | The value sets for coded fields |

- openEHR is the specialist for data at rest; FHIR is exchange-shaped. Use either field
  list as a **checklist**, then keep only what the current use case needs (Simplicity
  Standard).
- A coded clinical field should carry `{ code, system, display }` bound to the
  terminology (e.g. SNOMED/LOINC) — do not hand-roll an enum for a clinical concept.

## General (non-health) entities

There is no single canonical reference. Model to the business with Domain-Driven Design:
identify invariants and the language domain experts use. Schema.org can inspire common
concepts (Person, Organization, Event) but is not authoritative.

## Process

1. Name the entity and its single responsibility.
2. Draft the candidate field list from the reference (openEHR/FHIR for health; DDD for
   general); cut everything the current use case does not need.
3. Model it as a clean domain entity (`*.entity.ts`, private ctor + `create()`, with
   invariants enforced in `create()`). Coded fields carry `{ code, system, display }`.
4. Scaffold the module with the generator (`scaffold-module` skill) and fill the entity.
5. Map to FHIR/openEHR ONLY at an interoperability boundary, and only if/when external
   exchange is added by ADR (see "Health Data Modeling and FHIR" in AGENTS.md).

## Verification

- Reviewer checks the entity is a clean internal domain model (private ctor +
  `create()`, invariants in `domain`), NOT a FHIR/openEHR resource shape.
- Coded clinical fields reference a terminology (code + system), not ad-hoc enums.
- No FHIR/openEHR structure or SDK leaks into `domain`/`application`.

## References

- HL7 FHIR R4 resource list: https://hl7.org/fhir/R4/resourcelist.html
- openEHR Clinical Knowledge Manager (archetypes): https://ckm.openehr.org/
- SNOMED CT: https://www.snomed.org/ · LOINC: https://loinc.org/

Related: [[backend-architecture]] (where entities live), [[engineering-discipline]],
and the `scaffold-module` skill.
