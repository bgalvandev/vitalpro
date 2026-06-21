import { describe, expect, it } from 'vitest';
import type { Appointment } from '../domain/appointment.entity';
import type { AppointmentReader } from './appointment-reader.port';
import { ListAppointmentsUseCase } from './list-appointments.use-case';

function appointment(
  id: string,
  status: Appointment['status'],
  startsAt: string
): Appointment {
  return {
    id,
    status,
    serviceName: 'Service',
    clientName: 'Client',
    startsAt: new Date(startsAt),
    durationMinutes: 30,
  };
}

class StubReader implements AppointmentReader {
  constructor(private readonly data: Appointment[]) {}
  async listForDay(): Promise<Appointment[]> {
    return this.data;
  }
}

describe('ListAppointmentsUseCase', () => {
  it('returns appointments in day-view order regardless of source order', async () => {
    const reader = new StubReader([
      appointment('completed', 'completed', '2026-06-22T08:00:00.000Z'),
      appointment('late', 'scheduled', '2026-06-22T13:00:00.000Z'),
      appointment('early', 'scheduled', '2026-06-22T09:00:00.000Z'),
    ]);

    const result = await new ListAppointmentsUseCase(reader).execute();

    expect(result.map((a) => a.id)).toEqual(['early', 'late', 'completed']);
  });

  it('returns an empty list when the reader has no appointments', async () => {
    const result = await new ListAppointmentsUseCase(
      new StubReader([])
    ).execute();
    expect(result).toEqual([]);
  });

  it('propagates errors from the reader port', async () => {
    class FailingReader implements AppointmentReader {
      async listForDay(): Promise<Appointment[]> {
        throw new Error('reader unavailable');
      }
    }

    await expect(
      new ListAppointmentsUseCase(new FailingReader()).execute()
    ).rejects.toThrow('reader unavailable');
  });
});
