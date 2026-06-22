import 'dotenv/config';

import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error(
    'DATABASE_URL is required to seed the database. Copy .env.local.example to .env or export DATABASE_URL.',
  );
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

// Vertical-agnostic sample data: VitalPro Core serves appointment-based service
// businesses across verticals, so seeds must not carry health-only semantics.
const appointments = [
  {
    id: 'apt-001',
    status: 'scheduled',
    serviceName: 'Consultation call',
    clientName: 'Mara Quispe',
    startsAt: new Date('2026-06-22T08:40:00.000Z'),
    durationMinutes: 30,
  },
  {
    id: 'apt-002',
    status: 'completed',
    serviceName: 'Account review',
    clientName: 'Diego Salinas',
    startsAt: new Date('2026-06-22T09:15:00.000Z'),
    durationMinutes: 20,
  },
  {
    id: 'apt-003',
    status: 'cancelled',
    serviceName: 'Bike tune-up',
    clientName: 'Luis Ferreyra',
    startsAt: new Date('2026-06-22T11:00:00.000Z'),
    durationMinutes: 45,
  },
];

try {
  for (const appointment of appointments) {
    const { id, ...fields } = appointment;
    await prisma.appointment.upsert({
      where: { id },
      update: fields,
      create: appointment,
    });
  }
} finally {
  await prisma.$disconnect();
}
