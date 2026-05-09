import { EventEmitter } from 'node:events';

import type express from 'express';
import httpMocks from 'node-mocks-http';
import { describe, expect, it } from 'vitest';

import { createCoreApiApp } from './create-core-api-app';

interface InvocationResult {
  status: number;
  body: unknown;
}

async function invokeGet(
  app: express.Express,
  path: string,
  authorization?: string,
): Promise<InvocationResult> {
  const headers: Record<string, string> = {};
  if (authorization) {
    headers.authorization = authorization;
  }

  const request = httpMocks.createRequest({
    method: 'GET',
    url: path,
    headers,
  });

  const response = httpMocks.createResponse({
    eventEmitter: EventEmitter,
  });

  await new Promise<void>((resolve, reject) => {
    response.on('end', resolve);
    response.on('error', reject);
    app.handle(request, response, reject);
  });

  return {
    status: response.statusCode,
    body: response._getJSONData(),
  };
}

describe('Core API integration', () => {
  const app = createCoreApiApp();

  it('returns 401 when authorization header is missing', async () => {
    const response = await invokeGet(app, '/api/v1/appointments/apt-001');

    expect(response.status).toBe(401);
    expect(response.body).toEqual({
      code: 'unauthorized',
      message: 'Authorization header required',
    });
  });

  it('returns 200 with appointment payload', async () => {
    const response = await invokeGet(
      app,
      '/api/v1/appointments/apt-001',
      'Bearer local-test-token',
    );

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      id: 'apt-001',
      status: 'scheduled',
    });
  });

  it('returns 404 when appointment does not exist', async () => {
    const response = await invokeGet(
      app,
      '/api/v1/appointments/apt-999',
      'Bearer local-test-token',
    );

    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      code: 'not_found',
      message: 'Appointment not found',
    });
  });
});
