import {
  type AppointmentRepository,
  PrismaAppointmentRepository,
} from '@vitalpro/appointments';

import { createPrismaClientFromEnvironment } from './prisma-client';

export interface AppointmentRepositoryRuntime {
  appointmentRepository: AppointmentRepository;
  shutdown(): Promise<void>;
}

export function createAppointmentRepository(): AppointmentRepository {
  return createAppointmentRepositoryRuntime().appointmentRepository;
}

export function createAppointmentRepositoryRuntime(): AppointmentRepositoryRuntime {
  const prisma = createPrismaClientFromEnvironment();
  if (!prisma) {
    throw new Error('DATABASE_URL is required to start the Core API.');
  }

  return {
    appointmentRepository: new PrismaAppointmentRepository(prisma),
    shutdown: () => prisma.$disconnect(),
  };
}
