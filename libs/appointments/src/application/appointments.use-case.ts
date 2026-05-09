import { type AppointmentStatus, AppointmentsEntity } from '../domain';

export interface AppointmentResult {
  id: string;
  status: AppointmentStatus;
}

const APPOINTMENT_FIXTURES = new Map<string, AppointmentStatus>([
  ['apt-001', 'scheduled'],
  ['apt-002', 'completed'],
  ['apt-003', 'cancelled'],
]);

export function getAppointmentById(id: string): AppointmentResult | null {
  const status = APPOINTMENT_FIXTURES.get(id);
  if (!status) {
    return null;
  }

  const appointment = AppointmentsEntity.create({ id, status });
  return {
    id: appointment.id,
    status: appointment.status,
  };
}
