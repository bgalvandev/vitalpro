import 'dotenv/config';

import { createRequire } from 'node:module';

import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

// End-to-end smoke: boots the real Core API (Fastify) against the PostgreSQL you
// provision yourself (`pnpm db:up && pnpm db:migrate`) and exercises the HTTP
// endpoints over a real socket. Fails fast if the database is unreachable —
// provisioning services is the developer's/CI's responsibility.
const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error(
    'DATABASE_URL is required for the Core API smoke. Run `pnpm db:up && pnpm db:migrate` first.',
  );
}

// The Core API accepts any well-formed Bearer token. The smoke seeds its own
// namespaced row so it does not depend on `pnpm db:seed` and never touches app data.
const token = 'local-test-token';
const TEST_ID = 'apt-smoke-001';

const require = createRequire(import.meta.url);
require('@swc-node/register');

async function getJson(baseUrl, path) {
  const response = await fetch(`${baseUrl}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return { status: response.status, body: await response.json() };
}

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });
let app;
let appointmentRepositoryRuntime;

try {
  await prisma.appointment.deleteMany({ where: { id: TEST_ID } });
  await prisma.appointment.create({
    data: {
      id: TEST_ID,
      status: 'scheduled',
      serviceName: 'Consultation call',
      clientName: 'Mara Quispe',
      startsAt: new Date('2026-06-22T08:40:00.000Z'),
      durationMinutes: 30,
    },
  });

  const { createCoreApiApp } = require('../../apps/core-api/src/interface/http/create-core-api-app.ts');
  const { createAppointmentRepositoryRuntime } = require('../../apps/core-api/src/infrastructure/persistence/create-appointment-repository.ts');

  appointmentRepositoryRuntime = createAppointmentRepositoryRuntime(connectionString);
  app = await createCoreApiApp({
    appointmentRepository: appointmentRepositoryRuntime.appointmentRepository,
    serviceToken: token,
  });

  const baseUrl = await app.listen({ port: 0, host: '127.0.0.1' });

  const found = await getJson(baseUrl, `/api/v1/appointments/${TEST_ID}`);
  if (
    found.status !== 200 ||
    found.body.id !== TEST_ID ||
    found.body.status !== 'scheduled' ||
    found.body.serviceName !== 'Consultation call' ||
    found.body.durationMinutes !== 30
  ) {
    throw new Error(`Unexpected appointment payload: ${found.status} ${JSON.stringify(found.body)}`);
  }

  const list = await getJson(baseUrl, '/api/v1/appointments?limit=100');
  const seeded = Array.isArray(list.body.items)
    ? list.body.items.find((item) => item.id === TEST_ID)
    : undefined;
  if (list.status !== 200 || !seeded || seeded.clientName !== 'Mara Quispe') {
    throw new Error(`Unexpected collection payload: ${list.status} ${JSON.stringify(list.body)}`);
  }

  const missing = await getJson(baseUrl, '/api/v1/appointments/apt-smoke-missing');
  if (missing.status !== 404 || missing.body.status !== 404 || missing.body.title !== 'Not Found') {
    throw new Error(`Unexpected missing payload: ${missing.status} ${JSON.stringify(missing.body)}`);
  }

  console.log('Core API Postgres smoke passed.');
} finally {
  if (app) {
    await app.close();
  }
  await appointmentRepositoryRuntime?.shutdown();
  await prisma.appointment.deleteMany({ where: { id: TEST_ID } }).catch(() => {});
  await prisma.$disconnect();
}
