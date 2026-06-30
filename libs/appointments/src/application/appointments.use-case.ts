import type { AppointmentStatus, AppointmentEntity } from '../domain';

export interface AppointmentResult {
  id: string;
  status: AppointmentStatus;
  serviceName: string;
  clientName: string;
  startsAt: Date;
  durationMinutes: number;
}

export interface ListAppointmentsOptions {
  // Bounded by the interface contract (max 100); the repository enforces the take.
  limit: number;
}

export interface AppointmentRepository {
  findById(id: string): Promise<AppointmentEntity | null>;
  // Returns appointments ordered by start time ascending, capped at `limit`.
  list(options: ListAppointmentsOptions): Promise<AppointmentEntity[]>;
}

function toResult(appointment: AppointmentEntity): AppointmentResult {
  return {
    id: appointment.id,
    status: appointment.status,
    serviceName: appointment.serviceName,
    clientName: appointment.clientName,
    startsAt: appointment.startsAt,
    durationMinutes: appointment.durationMinutes,
  };
}

export class GetAppointmentByIdUseCase {
  constructor(private readonly appointmentRepository: AppointmentRepository) {}

  async execute(id: string): Promise<AppointmentResult | null> {
    const appointment = await this.appointmentRepository.findById(id);
    if (!appointment) {
      return null;
    }

    return toResult(appointment);
  }
}

export class ListAppointmentsUseCase {
  constructor(private readonly appointmentRepository: AppointmentRepository) {}

  async execute(options: ListAppointmentsOptions): Promise<AppointmentResult[]> {
    const appointments = await this.appointmentRepository.list(options);
    return appointments.map(toResult);
  }
}

export async function getAppointmentById(
  id: string,
  appointmentRepository: AppointmentRepository,
): Promise<AppointmentResult | null> {
  return new GetAppointmentByIdUseCase(appointmentRepository).execute(id);
}

export async function listAppointments(
  options: ListAppointmentsOptions,
  appointmentRepository: AppointmentRepository,
): Promise<AppointmentResult[]> {
  return new ListAppointmentsUseCase(appointmentRepository).execute(options);
}
