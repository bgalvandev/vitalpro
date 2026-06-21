import type { Appointment } from '../domain/appointment.entity';
import { isActionable } from '../domain/appointment.entity';
import { AppointmentItem } from './components/appointment-item';

export function AppointmentsView({
  appointments,
}: {
  appointments: Appointment[];
}) {
  const upcoming = appointments.filter(isActionable).length;

  return (
    <main className="mx-auto w-full max-w-2xl px-5 py-12">
      <header className="border-b border-line pb-6">
        <p className="font-data text-xs uppercase tracking-[0.2em] text-brand">
          VitalPro Core
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-ink">
          Today&rsquo;s appointments
        </h1>
        <p className="mt-1 text-sm text-muted">
          {upcoming} scheduled &middot; {appointments.length} total
        </p>
      </header>

      {appointments.length === 0 ? (
        <p className="mt-10 rounded-card border border-dashed border-line p-8 text-center text-muted">
          No appointments for today. Open slots are ready to be booked.
        </p>
      ) : (
        <ol className="mt-8">
          {appointments.map((appointment) => (
            <AppointmentItem key={appointment.id} appointment={appointment} />
          ))}
        </ol>
      )}
    </main>
  );
}
