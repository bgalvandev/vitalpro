import type { ReactElement } from 'react';
import { ListAppointmentsUseCase } from '../../appointments/application/list-appointments.use-case';
import { MockAppointmentReader } from '../../appointments/infrastructure/mock-appointment.reader';
import { AppointmentsView } from '../../appointments/interface/appointments-view';

// Composition root: wire the concrete reader into the use case. Replace
// MockAppointmentReader with an HTTP adapter to read from core-api.
const listAppointments = new ListAppointmentsUseCase(
  new MockAppointmentReader()
);

export default async function AppointmentsPage(): Promise<ReactElement> {
  const appointments = await listAppointments.execute();
  return <AppointmentsView appointments={appointments} />;
}
