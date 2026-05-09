import { describe, expect, it } from 'vitest';
import { getAppointmentById } from '@vitalpro/appointments';

import { createStartupMessage, parsePort } from './main';
import {
  createCoreApiApp,
  isBearerAuthorizationValid,
  resolveAppointmentsOpenApiPath,
} from './interface/http/create-core-api-app';

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

describe('appointments use case', () => {
  it('returns appointment projection when id exists', () => {
    expect(getAppointmentById('apt-001')).toEqual({
      id: 'apt-001',
      status: 'scheduled',
    });
  });

  it('returns null when id does not exist', () => {
    expect(getAppointmentById('apt-999')).toBeNull();
  });
});

describe('runtime validation helpers', () => {
  it('resolves the OpenAPI contract file path', () => {
    expect(resolveAppointmentsOpenApiPath()).toContain(
      'contracts/openapi/core/appointments.openapi.yaml',
    );
  });

  it('validates bearer authorization format', () => {
    expect(isBearerAuthorizationValid('Bearer token')).toBe(true);
    expect(isBearerAuthorizationValid(undefined)).toBe(false);
    expect(isBearerAuthorizationValid('Basic token')).toBe(false);
  });
});

describe('core api app', () => {
  it('creates express application instance', () => {
    const app = createCoreApiApp();
    expect(app).toBeDefined();
  });
});
