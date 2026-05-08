# VitalPro

VitalPro is a modular AI-enabled SaaS platform for professional service businesses that depend on bookings, recurring clients, and continuous follow-up.

## Product Surfaces

### VitalPro Core

VitalPro Core is the horizontal platform for appointment-based businesses.

Core covers domains such as:
- Customers
- Bookings and schedules
- Services
- Professionals/staff
- Locations
- Messaging
- Payments
- Campaigns
- Follow-up workflows
- Audit trails
- Business insights

Core is vertical-agnostic and must not depend on Health-specific semantics.

### VitalPro Health

VitalPro Health is a vertical extension built on top of Core for healthcare and wellness contexts (for example clinics, dentistry, physiotherapy, psychology, nutrition, and medical aesthetics).

Health may add domains such as:
- Patients
- Healthcare professionals
- Clinical appointments
- Encounters
- Consents
- Observations
- Compliance workflows
- Healthcare interoperability

Health can depend on Core. Core cannot depend on Health.

## Engineering Standards

Repository-level technical and governance standards are defined in `AGENTS.md`.
