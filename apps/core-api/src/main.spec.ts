import { AppointmentEntity } from '@vitalpro/appointments';
import { afterEach, describe, expect, it } from 'vitest';

import { createCoreApiApp } from './interface/http/create-core-api-app';
import { createStartupMessage, shutdown } from './main';

afterEach(async () => {
  await shutdown();
});

describe('createStartupMessage', () => {
  it('includes listening message', () => {
    expect(createStartupMessage(3000)).toContain('listening');
  });
});

describe('shutdown', () => {
  it('is safe when the API has not been started', async () => {
    await expect(shutdown()).resolves.toBeUndefined();
  });
});

describe('createCoreApiApp', () => {
  it('builds a Fastify application instance', async () => {
    const app = await createCoreApiApp({
      serviceToken: 'local-test-token',
      appointmentRepository: {
        async findById(id) {
          return AppointmentEntity.create({
            id,
            status: 'scheduled',
            serviceName: 'Consultation call',
            clientName: 'Mara Quispe',
            startsAt: new Date('2026-06-22T08:40:00.000Z'),
            durationMinutes: 30,
          });
        },
        async list() {
          return [];
        },
      },
    });

    expect(app).toBeDefined();
    expect(typeof app.inject).toBe('function');
    await app.close();
  });
});
