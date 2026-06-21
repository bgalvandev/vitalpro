import type { Appointment } from '../domain/appointment.entity';

/**
 * Port the application depends on to read appointments. Implemented by an
 * infrastructure adapter (mock today, HTTP against core-api later).
 */
export interface AppointmentReader {
  listForDay(): Promise<Appointment[]>;
}
