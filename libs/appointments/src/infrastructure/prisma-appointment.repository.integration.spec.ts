import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { PrismaAppointmentRepository } from './prisma-appointment.repository';

// Integration test: runs against the PostgreSQL you provision yourself
// (`pnpm db:up && pnpm db:migrate`). It fails fast if the database is not
// reachable — provisioning services is the developer's/CI's responsibility.
const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error(
    'DATABASE_URL is required for the appointments integration test. Run `pnpm db:up && pnpm db:migrate` first.',
  );
}

// Namespaced ids so the test never touches seed or application data.
const TEST_ID = 'apt-itest-repository';
const LATER_ID = 'apt-itest-repository-late';

const sampleData = {
  status: 'scheduled' as const,
  serviceName: 'Consultation call',
  clientName: 'Mara Quispe',
  startsAt: new Date('2026-06-22T08:00:00.000Z'),
  durationMinutes: 30,
};

describe('PrismaAppointmentRepository (integration)', () => {
  const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });
  const repository = new PrismaAppointmentRepository(prisma);

  beforeAll(async () => {
    await prisma.appointment.deleteMany({
      where: { id: { startsWith: TEST_ID } },
    });
  });

  afterAll(async () => {
    await prisma.appointment.deleteMany({
      where: { id: { startsWith: TEST_ID } },
    });
    await prisma.$disconnect();
  });

  it('reads an appointment from PostgreSQL', async () => {
    await prisma.appointment.create({ data: { id: TEST_ID, ...sampleData } });

    await expect(repository.findById(TEST_ID)).resolves.toMatchObject({
      id: TEST_ID,
      status: 'scheduled',
      serviceName: 'Consultation call',
      clientName: 'Mara Quispe',
      durationMinutes: 30,
    });
  });

  it('returns null when the appointment does not exist', async () => {
    await expect(repository.findById('apt-itest-missing')).resolves.toBeNull();
  });

  it('lists appointments ordered by start time ascending', async () => {
    await prisma.appointment.create({
      data: {
        id: LATER_ID,
        ...sampleData,
        startsAt: new Date('2026-06-22T15:00:00.000Z'),
      },
    });

    const ids = (await repository.list({ limit: 100 })).map(
      (appointment) => appointment.id,
    );
    const earlyIndex = ids.indexOf(TEST_ID);
    const lateIndex = ids.indexOf(LATER_ID);

    expect(earlyIndex).toBeGreaterThanOrEqual(0);
    expect(lateIndex).toBeGreaterThan(earlyIndex);
  });
});
