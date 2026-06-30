import type {
  AppointmentRepository,
  ListAppointmentsOptions,
} from '../application';
import {
  type AppointmentStatus,
  AppointmentEntity,
} from '../domain';

interface AppointmentRecord {
  id: string;
  status: string;
  serviceName: string;
  clientName: string;
  startsAt: Date;
  durationMinutes: number;
}

// Explicit field selection: read paths must never project unbounded ORM graphs
// (AGENTS.md API Query and Response Shape Standard).
const APPOINTMENT_SELECT = {
  id: true,
  status: true,
  serviceName: true,
  clientName: true,
  startsAt: true,
  durationMinutes: true,
} as const;

interface PrismaAppointmentDelegate {
  findUnique(args: {
    where: { id: string };
    select: typeof APPOINTMENT_SELECT;
  }): Promise<AppointmentRecord | null>;
  findMany(args: {
    select: typeof APPOINTMENT_SELECT;
    orderBy: { startsAt: 'asc' };
    take: number;
  }): Promise<AppointmentRecord[]>;
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

function toEntity(record: AppointmentRecord): AppointmentEntity {
  return AppointmentEntity.create({
    id: record.id,
    status: toAppointmentStatus(record.status),
    serviceName: record.serviceName,
    clientName: record.clientName,
    startsAt: record.startsAt,
    durationMinutes: record.durationMinutes,
  });
}

export class PrismaAppointmentRepository implements AppointmentRepository {
  constructor(private readonly prisma: PrismaAppointmentClient) {}

  async findById(id: string): Promise<AppointmentEntity | null> {
    const record = await this.prisma.appointment.findUnique({
      where: { id },
      select: APPOINTMENT_SELECT,
    });

    if (!record) {
      return null;
    }

    return toEntity(record);
  }

  async list({ limit }: ListAppointmentsOptions): Promise<AppointmentEntity[]> {
    const records = await this.prisma.appointment.findMany({
      select: APPOINTMENT_SELECT,
      orderBy: { startsAt: 'asc' },
      take: limit,
    });

    return records.map(toEntity);
  }
}
