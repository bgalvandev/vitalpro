import fs from 'node:fs';
import path from 'node:path';

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
    const migrationSql = fs.readFileSync(
      path.resolve(
        process.cwd(),
        '../../prisma/migrations/20260603000000_create_appointments/migration.sql',
      ),
      'utf8',
    );

    try {
      await prisma.$executeRawUnsafe(migrationSql);
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
