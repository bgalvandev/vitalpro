import {
  type AppointmentRepository,
  PrismaAppointmentRepository,
} from '@vitalpro/appointments';

import { createPrismaClientFromEnvironment } from './prisma-client';

export function createAppointmentRepository(): AppointmentRepository | null {
  const prisma = createPrismaClientFromEnvironment();
  if (!prisma) {
    return null;
  }

  return new PrismaAppointmentRepository(prisma);
}
