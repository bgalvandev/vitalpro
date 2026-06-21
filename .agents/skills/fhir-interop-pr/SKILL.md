---
name: fhir-interop-pr
description: Drive a VitalPro Health FHIR interoperability change to PR-readiness — enforce R4 baseline, Health-only scope, required docs/interop artifacts, mapping evidence, and the mandatory PR checklist. Use whenever a change adds or modifies FHIR endpoints, resources, or interop contracts under contracts/openapi/**, src/**/interface/**, src/**/application/**, or docs/interop/**.
argument-hint: "[fhir-resource or endpoint, e.g. Appointment]"
allowed-tools: Read Glob Grep Bash(pnpm nx affected *) Bash(git diff *)
---

# FHIR interoperability PR

Enforces AGENTS.md → "FHIR Interoperability Standard". This skill applies ONLY when a change
touches Health FHIR interop behavior. If the change is not FHIR/Health interop, stop — this
skill does not apply.

## Guardrails (verify before writing code)

1. R4 baseline: external interop contracts MUST use HL7 FHIR R4 (`4.0.1`) semantics. Any
   non-R4 behavior MUST be approved by an ADR linked in the PR.
2. Scope: FHIR behavior MUST live in `VitalPro Health` only. FHIR MUST NOT become the
   canonical model for Core business entities. Map FHIR at the interop boundary; keep Health
   internal domain models free to be non-FHIR.
3. Resource mapping: map scheduling/clinical concepts to canonical FHIR resources when an
   equivalent exists (`Patient`, `Practitioner`, `Organization`, `Location`, `Appointment`,
   `Schedule`, `Slot`, `Encounter`, `HealthcareService`).
4. Payload shape: FHIR JSON MUST include `resourceType`; persisted resources MUST include
   `id`; create-requests MAY omit `id` when the server assigns the logical id.

## Required artifacts

Check whether `docs/interop/` already exists:

- Existing interop docs: !`ls docs/interop 2>/dev/null || echo "ABSENT — this is the first FHIR endpoint"`

### First FHIR endpoint in the repo (docs/interop absent)

Create all three, in the same PR:

1. `docs/interop/fhir-mapping.md` — concept → FHIR resource/field mapping table for this change.
2. `docs/interop/fhir-pr-checklist.md` — the reusable checklist contributors paste into PRs.
3. `docs/interop/capabilitystatement-r4.json` — a valid R4 `CapabilityStatement` listing the
   FHIR endpoints/resources exposed.

When `docs/interop/fhir-mapping.md` does not yet exist, the PR description MUST instead carry
a mapping summary until the file lands in this same PR.

### Subsequent FHIR PRs (docs/interop present)

1. Update `docs/interop/fhir-mapping.md` with the new/changed mapping.
2. Update `docs/interop/capabilitystatement-r4.json` when endpoints/resources are added or changed.

## PR description requirements

The PR description MUST include all of:

1. A completed copy of the FHIR PR checklist.
2. At least one consulted official HL7 FHIR source URL (e.g. `https://hl7.org/fhir/R4/`).
3. At least one consultation date in `YYYY-MM-DD` format (use today's real date).
4. A mapping summary when `docs/interop/fhir-mapping.md` does not yet exist.
5. An ADR link if any non-R4 behavior is introduced.

## Verify before reporting ready

1. Confirm FHIR changes are in Health scope only and Core does not import Health.
2. Run the affected CI gate (see AGENTS.md → "CI Execution Guidance"):
   ```bash
   pnpm nx affected -t lint,typecheck,test,build --base="$NX_BASE" --head="$NX_HEAD"
   ```
3. Hand off to the `pr-ready` skill for mergeability and check visibility.
