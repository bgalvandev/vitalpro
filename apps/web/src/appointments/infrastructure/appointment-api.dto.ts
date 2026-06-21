import { z } from 'zod';

/**
 * Boundary schema for the appointments API response (the network model).
 * `id` and `status` map to the published OpenAPI `Appointment` schema
 * (contracts/openapi/core/appointments.openapi.yaml). The display fields
 * belong to the planned appointments collection contract and are validated
 * here, at the infrastructure boundary, before mapping to the domain.
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
