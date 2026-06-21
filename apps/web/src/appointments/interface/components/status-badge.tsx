import type { AppointmentStatus } from '../../domain/appointment.entity';

const STATUS_STYLES: Record<
  AppointmentStatus,
  { label: string; className: string }
> = {
  scheduled: {
    label: 'Scheduled',
    className: 'border-scheduled/30 bg-scheduled/10 text-scheduled',
  },
  completed: {
    label: 'Completed',
    className: 'border-completed/30 bg-completed/10 text-completed',
  },
  cancelled: {
    label: 'Cancelled',
    className: 'border-cancelled/30 bg-cancelled/10 text-cancelled',
  },
};

export function StatusBadge({ status }: { status: AppointmentStatus }) {
  const { label, className } = STATUS_STYLES[status];
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium tracking-wide ${className}`}
    >
      {label}
    </span>
  );
}
