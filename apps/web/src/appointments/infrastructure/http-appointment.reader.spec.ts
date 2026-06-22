import { describe, expect, it, vi } from 'vitest';
import type { CoreApiConfig } from './core-api.config';
import { HttpAppointmentReader } from './http-appointment.reader';

const config: CoreApiConfig = {
  baseUrl: 'https://core.example',
  token: 'test-token',
};

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

const validItem = {
  id: 'apt_0840',
  status: 'scheduled',
  serviceName: 'Consultation call',
  clientName: 'Mara Quispe',
  startsAt: '2026-06-22T08:40:00.000Z',
  durationMinutes: 30,
};

describe('HttpAppointmentReader', () => {
  it('fetches, validates and maps the collection to domain entities', async () => {
    const fetchImpl = vi.fn(async () =>
      jsonResponse({ items: [validItem], limit: 100 }),
    );
    const reader = new HttpAppointmentReader(
      config,
      fetchImpl as unknown as typeof fetch,
    );

    const result = await reader.listForDay();

    expect(fetchImpl).toHaveBeenCalledWith(
      'https://core.example/api/v1/appointments?limit=100',
      expect.objectContaining({
        headers: { authorization: 'Bearer test-token' },
        cache: 'no-store',
      }),
    );
    expect(result).toEqual([
      {
        id: 'apt_0840',
        status: 'scheduled',
        serviceName: 'Consultation call',
        clientName: 'Mara Quispe',
        startsAt: new Date('2026-06-22T08:40:00.000Z'),
        durationMinutes: 30,
      },
    ]);
  });

  it('throws when core-api responds with a non-2xx status', async () => {
    const fetchImpl = vi.fn(async () => jsonResponse({}, 503));
    const reader = new HttpAppointmentReader(
      config,
      fetchImpl as unknown as typeof fetch,
    );

    await expect(reader.listForDay()).rejects.toThrow('status 503');
  });

  it('rejects a payload that violates the published contract', async () => {
    const fetchImpl = vi.fn(async () =>
      jsonResponse({ items: [{ id: 'x', status: 'no-show' }], limit: 100 }),
    );
    const reader = new HttpAppointmentReader(
      config,
      fetchImpl as unknown as typeof fetch,
    );

    await expect(reader.listForDay()).rejects.toThrow();
  });
});
