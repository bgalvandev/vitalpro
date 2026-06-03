import type { AppointmentRepository } from '../application';
import {
  type AppointmentStatus,
  AppointmentsEntity,
} from '../domain';

const DEFAULT_APPOINTMENT_FIXTURES = new Map<string, AppointmentStatus>([
  ['apt-001', 'scheduled'],
  ['apt-002', 'completed'],
  ['apt-003', 'cancelled'],
]);

export class InMemoryAppointmentRepository implements AppointmentRepository {
  constructor(
    private readonly appointments = new Map(DEFAULT_APPOINTMENT_FIXTURES),
  ) {}

  async findById(id: string): Promise<AppointmentsEntity | null> {
    const status = this.appointments.get(id);
    if (!status) {
      return null;
    }

    return AppointmentsEntity.create({ id, status });
  }
}
