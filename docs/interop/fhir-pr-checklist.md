# FHIR PR Checklist Template

Use this checklist in the PR description for any change in FHIR interoperability scope.

- [ ] I confirmed the baseline is FHIR `R4 (4.0.1)` or linked an approved ADR for non-R4 behavior.
- [ ] I mapped each interoperability change in `docs/interop/fhir-mapping.md`.
- [ ] I added official HL7 source URL(s) and consultation date (`YYYY-MM-DD`) in `docs/interop/fhir-mapping.md`.
- [ ] I updated `docs/interop/capabilitystatement-r4.json` for each new or changed FHIR endpoint.
- [ ] I validated request/response payloads include `resourceType`, and exchanged resources include `id`.
- [ ] I ran repository checks for affected projects (`lint`, `typecheck`, `test`, `build`).
