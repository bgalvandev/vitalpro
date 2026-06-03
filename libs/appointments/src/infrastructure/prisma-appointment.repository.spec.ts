import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import { PostgreSqlContainer } from '@testcontainers/postgresql';
import { describe, expect, it } from 'vitest';

import { PrismaAppointmentRepository } from './prisma-appointment.repository';

describe('PrismaAppointmentRepository', () => {
  it('reads an appointment from PostgreSQL', async (context) => {
    if (process.env.RUN_TESTCONTAINERS !== 'true') {
      context.skip();
      return;
    }

    const container = await new PostgreSqlContainer('postgres:17-alpine').start();
    const connectionString = container.getConnectionUri();
    const adapter = new PrismaPg({ connectionString });
    const prisma = new PrismaClient({ adapter });

    try {
      await prisma.$executeRawUnsafe(
        `CREATE TYPE "appointment_status" AS ENUM ('scheduled', 'completed', 'cancelled')`,
      );
      await prisma.$executeRawUnsafe(`
        CREATE TABLE "appointments" (
          "id" TEXT NOT NULL,
          "status" "appointment_status" NOT NULL,
          "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updated_at" TIMESTAMP(3) NOT NULL,
          CONSTRAINT "appointments_pkey" PRIMARY KEY ("id")
        )
      `);
      await prisma.appointment.create({
        data: {
          id: 'apt-001',
          status: 'scheduled',
        },
      });

      const repository = new PrismaAppointmentRepository(prisma);

      await expect(repository.findById('apt-001')).resolves.toMatchObject({
        id: 'apt-001',
        status: 'scheduled',
      });
      await expect(repository.findById('apt-999')).resolves.toBeNull();
    } finally {
      await prisma.$disconnect();
      await container.stop();
    }
  });
});
