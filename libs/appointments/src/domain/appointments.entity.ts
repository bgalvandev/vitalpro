export interface AppointmentsProps {
  id: string;
  status: AppointmentStatus;
  serviceName: string;
  clientName: string;
  startsAt: Date;
  durationMinutes: number;
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

    if (props.serviceName.trim().length === 0) {
      throw new Error('Appointment service name is required.');
    }

    if (props.clientName.trim().length === 0) {
      throw new Error('Appointment client name is required.');
    }

    if (Number.isNaN(props.startsAt.getTime())) {
      throw new Error('Appointment start time is invalid.');
    }

    if (!Number.isInteger(props.durationMinutes) || props.durationMinutes <= 0) {
      throw new Error('Appointment duration must be a positive integer.');
    }

    return new AppointmentsEntity(props);
  }

  get id(): string {
    return this.props.id;
  }

  get status(): AppointmentStatus {
    return this.props.status;
  }

  get serviceName(): string {
    return this.props.serviceName;
  }

  get clientName(): string {
    return this.props.clientName;
  }

  get startsAt(): Date {
    return this.props.startsAt;
  }

  get durationMinutes(): number {
    return this.props.durationMinutes;
  }
}
