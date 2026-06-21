import type { Appointment } from '../../domain/appointment.entity';
import { isActionable } from '../../domain/appointment.entity';
import { formatTime } from '../format-time';
import { StatusBadge } from './status-badge';

export function AppointmentItem({ appointment }: { appointment: Appointment }) {
  const dimmed = !isActionable(appointment);
  return (
    <li className="flex gap-4">
      {/* Time rail: tabular mono timestamps form the day's vertical spine. */}
      <div className="flex flex-col items-center pt-1">
        <time
          dateTime={appointment.startsAt.toISOString()}
          className="font-data text-sm tabular-nums text-ink"
        >
          {formatTime(appointment.startsAt)}
        </time>
        <span
          aria-hidden
          className="mt-2 w-px flex-1 bg-line"
        />
      </div>

      <article
        className={`mb-4 flex-1 rounded-card border border-line bg-card p-4 transition-colors ${
          dimmed ? 'opacity-60' : 'hover:border-brand/40'
        }`}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-medium text-ink">{appointment.serviceName}</h3>
            <p className="text-sm text-muted">{appointment.clientName}</p>
          </div>
          <StatusBadge status={appointment.status} />
        </div>
        <p className="mt-3 font-data text-xs text-muted">
          {appointment.durationMinutes} min
        </p>
      </article>
    </li>
  );
}
