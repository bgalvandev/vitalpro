export interface AppointmentsProps {
  id: string;
  status: AppointmentStatus;
}

export type AppointmentStatus = 'scheduled' | 'completed' | 'cancelled';

const APPOINTMENT_STATUSES = new Set<AppointmentStatus>([
  'scheduled',
  'completed',
  'cancelled',
]);

export class AppointmentsEntity {
  private constructor(private readonly props: AppointmentsProps) {}

  static create(props: AppointmentsProps): AppointmentsEntity {
    if (props.id.trim().length === 0) {
      throw new Error('Appointment id is required.');
    }

    if (!APPOINTMENT_STATUSES.has(props.status)) {
      throw new Error('Appointment status is invalid.');
    }

    return new AppointmentsEntity(props);
  }

  get id(): string {
    return this.props.id;
  }

  get status(): AppointmentStatus {
    return this.props.status;
  }
}
