import { afterEach, describe, expect, it } from 'vitest';

import { AppointmentsEntity } from '@vitalpro/appointments';

import {
  createAppointmentRepositoryRuntimeForEnvironment,
  createStartupMessage,
  parsePort,
  shouldUseInMemoryAppointments,
  shutdown,
} from './main';
import {
  createCoreApiApp,
  isBearerAuthorizationValid,
  loadAppointmentsOpenApiSpecForRuntime,
  resolveAppointmentsOpenApiPath,
} from './interface/http/create-core-api-app';

afterEach(async () => {
  delete process.env.CORE_API_USE_IN_MEMORY_APPOINTMENTS;
  await shutdown();
});

describe('createStartupMessage', () => {
  it('includes listening message', () => {
    expect(createStartupMessage(3000)).toContain('listening');
  });
});

describe('parsePort', () => {
  it('uses default port when variable is missing', () => {
    expect(parsePort(undefined)).toBe(3000);
  });

  it('uses provided port when value is valid', () => {
    expect(parsePort('3100')).toBe(3100);
  });
});

describe('shouldUseInMemoryAppointments', () => {
  it('requires explicit true value', () => {
    expect(shouldUseInMemoryAppointments('true')).toBe(true);
    expect(shouldUseInMemoryAppointments('false')).toBe(false);
    expect(shouldUseInMemoryAppointments(undefined)).toBe(false);
  });
});

describe('createAppointmentRepositoryRuntimeForEnvironment', () => {
  it('creates a disposable in-memory repository when explicitly enabled', async () => {
    process.env.CORE_API_USE_IN_MEMORY_APPOINTMENTS = 'true';

    const runtime = createAppointmentRepositoryRuntimeForEnvironment();

    await expect(runtime.appointmentRepository.findById('apt-001')).resolves.toMatchObject({
      id: 'apt-001',
      status: 'scheduled',
    });
    await expect(runtime.shutdown()).resolves.toBeUndefined();
  });
});

describe('shutdown', () => {
  it('is safe when the API has not been started', async () => {
    await expect(shutdown()).resolves.toBeUndefined();
  });
});

describe('runtime validation helpers', () => {
  it('resolves the OpenAPI contract file path', () => {
    expect(resolveAppointmentsOpenApiPath()).toContain(
      'contracts/openapi/core/appointments.openapi.yaml',
    );
  });

  it('loads a runtime-compatible OpenAPI spec', () => {
    const spec = loadAppointmentsOpenApiSpecForRuntime();
    expect(spec.openapi).toBe('3.1.2');
  });

  it('validates bearer authorization format', () => {
    expect(isBearerAuthorizationValid('Bearer token')).toBe(true);
    expect(isBearerAuthorizationValid(undefined)).toBe(false);
    expect(isBearerAuthorizationValid('Basic token')).toBe(false);
  });
});

describe('core api app', () => {
  it('creates express application instance', () => {
    const app = createCoreApiApp({
      appointmentRepository: {
        async findById(id) {
          return AppointmentsEntity.create({
            id,
            status: 'scheduled',
          });
        },
      },
    });
    expect(app).toBeDefined();
  });
});
