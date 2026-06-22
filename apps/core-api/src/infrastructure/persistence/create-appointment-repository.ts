import {
  type AppointmentRepository,
  PrismaAppointmentRepository,
} from '@vitalpro/appointments';

import { createPrismaClient } from './prisma-client';

export interface AppointmentRepositoryRuntime {
  appointmentRepository: AppointmentRepository;
  checkConnection(): Promise<void>;
  shutdown(): Promise<void>;
}

export function createAppointmentRepositoryRuntime(
  databaseUrl: string,
): AppointmentRepositoryRuntime {
  const prisma = createPrismaClient(databaseUrl);

  return {
    appointmentRepository: new PrismaAppointmentRepository(prisma),
    // `SELECT 1` is a connectivity/readiness probe (startup fail-fast and the
    // /ready endpoint), not a business query — hence the raw query in infrastructure.
    checkConnection: async () => {
      await prisma.$queryRaw`SELECT 1`;
    },
    shutdown: () => prisma.$disconnect(),
  };
}
