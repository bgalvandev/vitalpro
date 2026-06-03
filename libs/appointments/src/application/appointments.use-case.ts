import type { AppointmentStatus, AppointmentsEntity } from '../domain';

export interface AppointmentResult {
  id: string;
  status: AppointmentStatus;
}

export interface AppointmentRepository {
  findById(id: string): Promise<AppointmentsEntity | null>;
}

export class GetAppointmentByIdUseCase {
  constructor(private readonly appointmentRepository: AppointmentRepository) {}

  async execute(id: string): Promise<AppointmentResult | null> {
    const appointment = await this.appointmentRepository.findById(id);
    if (!appointment) {
      return null;
    }

    return {
      id: appointment.id,
      status: appointment.status,
    };
  }
}

export async function getAppointmentById(
  id: string,
  appointmentRepository: AppointmentRepository,
): Promise<AppointmentResult | null> {
  return new GetAppointmentByIdUseCase(appointmentRepository).execute(id);
}
