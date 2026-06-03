import {
  type AppointmentRepository,
  PrismaAppointmentRepository,
} from '@vitalpro/appointments';

import { createPrismaClientFromEnvironment } from './prisma-client';

export function createAppointmentRepository(): AppointmentRepository {
  const prisma = createPrismaClientFromEnvironment();
  if (!prisma) {
    throw new Error('DATABASE_URL is required to start the Core API.');
  }

  return new PrismaAppointmentRepository(prisma);
}
