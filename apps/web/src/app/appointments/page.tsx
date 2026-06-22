import type { ReactElement } from 'react';
import { ListAppointmentsUseCase } from '../../appointments/application/list-appointments.use-case';
import { loadCoreApiConfig } from '../../appointments/infrastructure/core-api.config';
import { HttpAppointmentReader } from '../../appointments/infrastructure/http-appointment.reader';
import { AppointmentsView } from '../../appointments/interface/appointments-view';

// Render at request time: the page reads live data from core-api, so it must
// not be statically prerendered at build time.
export const dynamic = 'force-dynamic';

export default async function AppointmentsPage(): Promise<ReactElement> {
  // Composition root: wire the HTTP reader (core-api) into the use case.
  const reader = new HttpAppointmentReader(loadCoreApiConfig());
  const appointments = await new ListAppointmentsUseCase(reader).execute();
  return <AppointmentsView appointments={appointments} />;
}
