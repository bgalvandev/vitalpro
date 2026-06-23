import { z } from 'zod';

/**
 * Schemas for the appointments data the UI consumes, validated at the
 * infrastructure boundary before mapping to the domain. These mirror the
 * published core-api collection contract
 * (contracts/openapi/core/appointments.openapi.yaml, operation `listAppointments`).
 * Keep them reconciled with that contract in the same change.
 */
const appointmentStatusDtoSchema = z.enum([
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

export const appointmentListResponseSchema = z.object({
  items: z.array(appointmentDtoSchema),
  limit: z.number().int(),
});

export type AppointmentDto = z.infer<typeof appointmentDtoSchema>;
