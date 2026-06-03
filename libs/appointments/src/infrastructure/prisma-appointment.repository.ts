import type { AppointmentRepository } from '../application';
import {
  type AppointmentStatus,
  AppointmentsEntity,
} from '../domain';

interface AppointmentRecord {
  id: string;
  status: string;
}

interface PrismaAppointmentDelegate {
  findUnique(args: {
    where: { id: string };
  }): Promise<AppointmentRecord | null>;
}

export interface PrismaAppointmentClient {
  appointment: PrismaAppointmentDelegate;
}

function toAppointmentStatus(status: string): AppointmentStatus {
  if (
    status === 'scheduled' ||
    status === 'completed' ||
    status === 'cancelled'
  ) {
    return status;
  }

  throw new Error('Appointment status is invalid.');
}

export class PrismaAppointmentRepository implements AppointmentRepository {
  constructor(private readonly prisma: PrismaAppointmentClient) {}

  async findById(id: string): Promise<AppointmentsEntity | null> {
    const record = await this.prisma.appointment.findUnique({
      where: { id },
    });

    if (!record) {
      return null;
    }

    return AppointmentsEntity.create({
      id: record.id,
      status: toAppointmentStatus(record.status),
    });
  }
}
