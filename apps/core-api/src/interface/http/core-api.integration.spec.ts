import { type AppointmentRepository, AppointmentsEntity } from '@vitalpro/appointments';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { createCoreApiApp } from './create-core-api-app';

const sampleDetail = {
  serviceName: 'Consultation call',
  clientName: 'Mara Quispe',
  startsAt: new Date('2026-06-22T08:40:00.000Z'),
  durationMinutes: 30,
};

const expectedAppointment = {
  id: 'apt-001',
  status: 'scheduled',
  serviceName: 'Consultation call',
  clientName: 'Mara Quispe',
  startsAt: '2026-06-22T08:40:00.000Z',
  durationMinutes: 30,
};

const appointmentRepository: AppointmentRepository = {
  async findById(id) {
    if (id !== 'apt-001') {
      return null;
    }
    return AppointmentsEntity.create({ id, status: 'scheduled', ...sampleDetail });
  },
  async list({ limit }) {
    return [
      AppointmentsEntity.create({ id: 'apt-001', status: 'scheduled', ...sampleDetail }),
    ].slice(0, limit);
  },
};

const SERVICE_TOKEN = 'local-test-token';
const BEARER = `Bearer ${SERVICE_TOKEN}`;

describe('Core API integration', () => {
  let app: Awaited<ReturnType<typeof createCoreApiApp>>;

  beforeAll(async () => {
    app = await createCoreApiApp({ appointmentRepository, serviceToken: SERVICE_TOKEN });
  });

  afterAll(async () => {
    await app.close();
  });

  it('exposes /health without authentication', async () => {
    const response = await app.inject({ method: 'GET', url: '/health' });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ status: 'ok' });
  });

  it('reports readiness ok when the dependency check passes', async () => {
    const readyApp = await createCoreApiApp({
      appointmentRepository,
      serviceToken: SERVICE_TOKEN,
      checkReadiness: async () => {},
    });
    try {
      const response = await readyApp.inject({ method: 'GET', url: '/ready' });
      expect(response.statusCode).toBe(200);
      expect(response.json()).toEqual({ status: 'ok', database: 'up' });
    } finally {
      await readyApp.close();
    }
  });

  it('reports 503 readiness when the dependency check fails', async () => {
    const notReadyApp = await createCoreApiApp({
      appointmentRepository,
      serviceToken: SERVICE_TOKEN,
      checkReadiness: async () => {
        throw new Error('database unreachable');
      },
    });
    try {
      const response = await notReadyApp.inject({ method: 'GET', url: '/ready' });
      expect(response.statusCode).toBe(503);
      expect(response.json()).toEqual({ status: 'error', database: 'down' });
    } finally {
      await notReadyApp.close();
    }
  });

  it('returns 401 Problem Details when authorization is missing', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/v1/appointments/apt-001',
    });

    expect(response.statusCode).toBe(401);
    expect(response.headers['content-type']).toContain('application/problem+json');
    expect(response.json()).toMatchObject({
      title: 'Unauthorized',
      status: 401,
      detail: 'Authorization header required',
    });
  });

  it('returns 401 Problem Details when the bearer token does not match', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/v1/appointments/apt-001',
      headers: { authorization: 'Bearer wrong-token' },
    });

    expect(response.statusCode).toBe(401);
    expect(response.headers['content-type']).toContain('application/problem+json');
    expect(response.json()).toMatchObject({
      title: 'Unauthorized',
      status: 401,
      detail: 'Invalid authorization token',
    });
  });

  it('returns 200 with the appointment payload', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/v1/appointments/apt-001',
      headers: { authorization: BEARER },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual(expectedAppointment);
  });

  it('returns 200 with the appointments collection', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/v1/appointments',
      headers: { authorization: BEARER },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ items: [expectedAppointment], limit: 50 });
  });

  it('rejects a collection limit above the contract maximum', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/v1/appointments?limit=500',
      headers: { authorization: BEARER },
    });

    expect(response.statusCode).toBe(400);
  });

  it('returns 404 Problem Details when the appointment does not exist', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/v1/appointments/apt-999',
      headers: { authorization: BEARER },
    });

    expect(response.statusCode).toBe(404);
    expect(response.headers['content-type']).toContain('application/problem+json');
    expect(response.json()).toMatchObject({ title: 'Not Found', status: 404 });
  });

  it('returns a sanitized 500 when the repository fails', async () => {
    const failingApp = await createCoreApiApp({
      serviceToken: SERVICE_TOKEN,
      appointmentRepository: {
        async findById() {
          throw new Error('database password leaked in driver message');
        },
        async list() {
          throw new Error('database password leaked in driver message');
        },
      },
    });
    try {
      const response = await failingApp.inject({
        method: 'GET',
        url: '/api/v1/appointments/apt-001',
        headers: { authorization: BEARER },
      });

      expect(response.statusCode).toBe(500);
      expect(response.json()).toMatchObject({
        title: 'Internal Server Error',
        status: 500,
        detail: 'Internal server error',
      });
    } finally {
      await failingApp.close();
    }
  });

  it('sets security headers and omits x-powered-by on API responses', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/v1/appointments/apt-001',
      headers: { authorization: BEARER },
    });

    expect(response.headers['cache-control']).toBe('no-store');
    expect(response.headers.pragma).toBe('no-cache');
    expect(response.headers['x-content-type-options']).toBe('nosniff');
    expect(response.headers['x-powered-by']).toBeUndefined();
  });
});
