export interface AppointmentsProps {
  id: string;
  status: AppointmentStatus;
}

export type AppointmentStatus = 'scheduled' | 'completed' | 'cancelled';

export class AppointmentsEntity {
  private constructor(private readonly props: AppointmentsProps) {}

  static create(props: AppointmentsProps): AppointmentsEntity {
    return new AppointmentsEntity(props);
  }

  get id(): string {
    return this.props.id;
  }

  get status(): AppointmentStatus {
    return this.props.status;
  }
}
