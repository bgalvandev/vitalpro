import 'dotenv/config';

import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

const connectionString =
  process.env.DATABASE_URL ??
  'postgresql://vitalpro:vitalpro@localhost:5433/vitalpro?schema=public';

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

const appointments = [
  { id: 'apt-001', status: 'scheduled' },
  { id: 'apt-002', status: 'completed' },
  { id: 'apt-003', status: 'cancelled' },
];

try {
  for (const appointment of appointments) {
    await prisma.appointment.upsert({
      where: { id: appointment.id },
      update: { status: appointment.status },
      create: appointment,
    });
  }
} finally {
  await prisma.$disconnect();
}
