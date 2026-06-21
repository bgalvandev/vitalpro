import type { Appointment } from '../domain/appointment.entity';
import type { AppointmentReader } from '../application/appointment-reader.port';
import { appointmentListDtoSchema } from './appointment-api.dto';
import { toDomain } from './appointment.mapper';

/**
 * Mock adapter for the appointments read port. It returns data shaped exactly
 * like the appointments API response and pushes it through the same Zod
 * boundary schema, so swapping this for an HTTP adapter that calls
 * `GET /api/v1/appointments` on core-api requires no change to the use case,
 * the page, or the UI.
 */
const RAW_DAY_APPOINTMENTS: unknown = [
  {
    id: 'apt_0840',
    status: 'scheduled',
    serviceName: 'Initial consultation',
    clientName: 'Mara Quispe',
    startsAt: '2026-06-22T08:40:00.000Z',
    durationMinutes: 30,
  },
  {
    id: 'apt_0915',
    status: 'completed',
    serviceName: 'Follow-up review',
    clientName: 'Diego Salinas',
    startsAt: '2026-06-22T09:15:00.000Z',
    durationMinutes: 20,
  },
  {
    id: 'apt_1030',
    status: 'scheduled',
    serviceName: 'Lab results read-out',
    clientName: 'Ana Beltrán',
    startsAt: '2026-06-22T10:30:00.000Z',
    durationMinutes: 25,
  },
  {
    id: 'apt_1100',
    status: 'cancelled',
    serviceName: 'Physiotherapy session',
    clientName: 'Luis Ferreyra',
    startsAt: '2026-06-22T11:00:00.000Z',
    durationMinutes: 45,
  },
  {
    id: 'apt_1345',
    status: 'scheduled',
    serviceName: 'Nutrition planning',
    clientName: 'Sofía Romero',
    startsAt: '2026-06-22T13:45:00.000Z',
    durationMinutes: 40,
  },
];

export class MockAppointmentReader implements AppointmentReader {
  async listForDay(): Promise<Appointment[]> {
    const dtos = appointmentListDtoSchema.parse(RAW_DAY_APPOINTMENTS);
    return dtos.map(toDomain);
  }
}
