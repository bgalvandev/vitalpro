export type AppointmentStatus = 'scheduled' | 'completed' | 'cancelled';

export interface Appointment {
  readonly id: string;
  readonly status: AppointmentStatus;
  readonly serviceName: string;
  readonly clientName: string;
  readonly startsAt: Date;
  readonly durationMinutes: number;
}

/**
 * Day-view ordering rule (business decision): operators act on upcoming work
 * first, so scheduled appointments lead, then by start time; completed and
 * cancelled fall to the bottom. Deterministic and framework-free.
 */
const STATUS_PRIORITY: Record<AppointmentStatus, number> = {
  scheduled: 0,
  completed: 1,
  cancelled: 2,
};

export function compareForDayView(a: Appointment, b: Appointment): number {
  const byStatus = STATUS_PRIORITY[a.status] - STATUS_PRIORITY[b.status];
  if (byStatus !== 0) {
    return byStatus;
  }
  return a.startsAt.getTime() - b.startsAt.getTime();
}

export function isActionable(appointment: Appointment): boolean {
  return appointment.status === 'scheduled';
}
