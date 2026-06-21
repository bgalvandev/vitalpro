import type { Appointment } from '../domain/appointment.entity';
import type { AppointmentReader } from '../application/appointment-reader.port';
import { appointmentListDtoSchema } from './appointment-api.dto';
import { toDomain } from './appointment.mapper';

/**
 * Mock adapter for the appointments read port. The fixture is a view fixture,
 * not a published API contract: it is validated through the same Zod schema
 * the UI consumes. When a real collection endpoint exists, replace this with
 * an HTTP adapter and validate the response against the published OpenAPI
 * contract; the use case, the page, and the UI stay unchanged.
 *
 * Examples are deliberately vertical-agnostic: VitalPro Core serves
 * appointment-based service businesses across verticals, so the data must not
 * carry health-only semantics.
 */
const RAW_DAY_APPOINTMENTS: unknown = [
  {
    id: 'apt_0840',
    status: 'scheduled',
    serviceName: 'Consultation call',
    clientName: 'Mara Quispe',
    startsAt: '2026-06-22T08:40:00.000Z',
    durationMinutes: 30,
  },
  {
    id: 'apt_0915',
    status: 'completed',
    serviceName: 'Account review',
    clientName: 'Diego Salinas',
    startsAt: '2026-06-22T09:15:00.000Z',
    durationMinutes: 20,
  },
  {
    id: 'apt_1030',
    status: 'scheduled',
    serviceName: 'Haircut & style',
    clientName: 'Ana Beltrán',
    startsAt: '2026-06-22T10:30:00.000Z',
    durationMinutes: 25,
  },
  {
    id: 'apt_1100',
    status: 'cancelled',
    serviceName: 'Bike tune-up',
    clientName: 'Luis Ferreyra',
    startsAt: '2026-06-22T11:00:00.000Z',
    durationMinutes: 45,
  },
  {
    id: 'apt_1345',
    status: 'scheduled',
    serviceName: 'Personal training',
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
