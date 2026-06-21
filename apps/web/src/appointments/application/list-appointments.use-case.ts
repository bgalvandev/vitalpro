import type { Appointment } from '../domain/appointment.entity';
import { compareForDayView } from '../domain/appointment.entity';
import type { AppointmentReader } from './appointment-reader.port';

/**
 * Lists the day's appointments in the operator-facing order defined by the
 * domain. Orchestrates the read port only; holds no transport or persistence
 * concerns.
 */
export class ListAppointmentsUseCase {
  constructor(private readonly reader: AppointmentReader) {}

  async execute(): Promise<Appointment[]> {
    const appointments = await this.reader.listForDay();
    return [...appointments].sort(compareForDayView);
  }
}
