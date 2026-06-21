import { z } from 'zod';

/**
 * Schema for the data the appointments UI consumes, validated at the
 * infrastructure boundary before mapping to the domain. This is NOT a
 * published API contract: only `id` and `status` align with the published
 * OpenAPI `Appointment` schema (contracts/openapi/core/appointments.openapi.yaml);
 * the display fields are view-only. If a real collection endpoint is added,
 * define its contract under contracts/openapi/** and reconcile this schema
 * with it in the same change.
 */
export const appointmentStatusDtoSchema = z.enum([
  'scheduled',
  'completed',
  'cancelled',
]);

export const appointmentDtoSchema = z.object({
  id: z.string().min(1),
  status: appointmentStatusDtoSchema,
  serviceName: z.string().min(1),
  clientName: z.string().min(1),
  startsAt: z.string().datetime(),
  durationMinutes: z.number().int().positive(),
});

export const appointmentListDtoSchema = z.array(appointmentDtoSchema);

export type AppointmentDto = z.infer<typeof appointmentDtoSchema>;
