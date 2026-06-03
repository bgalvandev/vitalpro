import { createRequire } from 'node:module';
import { setTimeout as wait } from 'node:timers/promises';

import { PostgreSqlContainer } from '@testcontainers/postgresql';

import { runCommand } from './core-api-runner.mjs';

const token = process.env.CORE_API_POSTGRES_SMOKE_TOKEN ?? 'local-test-token';
let baseUrl;
const require = createRequire(import.meta.url);
require('@swc-node/register');

async function waitForAppointment() {
  const url = `${baseUrl}/api/v1/appointments/apt-001`;
  const deadline = Date.now() + 20000;
  let lastError = 'no response received';

  while (Date.now() < deadline) {
    try {
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 200) {
        return;
      }

      lastError = `${response.status}: ${await response.text()}`;
    } catch {
      lastError = 'connection refused';
    }

    await wait(250);
  }

  throw new Error(`Timed out waiting for Core API on ${url}; last response: ${lastError}`);
}

async function expectJsonResponse(path, expectedStatus) {
  const response = await fetch(`${baseUrl}${path}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  const body = await response.json();

  if (response.status !== expectedStatus) {
    throw new Error(
      `Expected ${expectedStatus} for ${path}, got ${response.status}: ${JSON.stringify(body)}`,
    );
  }

  return body;
}

const container = await new PostgreSqlContainer('postgres:17-alpine').start();
const databaseUrl = container.getConnectionUri();
let server;

try {
  await runCommand('pnpm', ['run', 'prisma:migrate:deploy'], {
    env: {
      ...process.env,
      DATABASE_URL: databaseUrl,
    },
  });
  await runCommand('pnpm', ['run', 'db:seed'], {
    env: {
      ...process.env,
      DATABASE_URL: databaseUrl,
    },
  });

  process.env.DATABASE_URL = databaseUrl;
  process.env.NODE_ENV = 'development';
  const { createCoreApiApp } = require('../../apps/core-api/src/interface/http/create-core-api-app.ts');
  const { createAppointmentRepository } = require('../../apps/core-api/src/infrastructure/persistence/create-appointment-repository.ts');

  const app = createCoreApiApp({
    appointmentRepository: createAppointmentRepository(),
  });
  server = await new Promise((resolve, reject) => {
    const listener = app.listen(0, '127.0.0.1', () => {
      resolve(listener);
    });
    listener.on('error', reject);
  });
  const address = server.address();
  if (!address || typeof address === 'string') {
    throw new Error('Core API smoke server did not expose a TCP address.');
  }
  baseUrl = `http://127.0.0.1:${address.port}`;

  await waitForAppointment();

  const appointment = await expectJsonResponse(
    '/api/v1/appointments/apt-001',
    200,
  );
  if (appointment.id !== 'apt-001' || appointment.status !== 'scheduled') {
    throw new Error(`Unexpected appointment payload: ${JSON.stringify(appointment)}`);
  }

  const missing = await expectJsonResponse('/api/v1/appointments/apt-999', 404);
  if (missing.code !== 'not_found') {
    throw new Error(`Unexpected missing appointment payload: ${JSON.stringify(missing)}`);
  }
} finally {
  await new Promise((resolve) => {
    if (!server) {
      resolve();
      return;
    }

    server.close(resolve);
  });
  await container.stop();
}
