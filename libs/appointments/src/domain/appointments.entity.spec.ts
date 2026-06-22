import { describe, expect, it } from 'vitest';

import { AppointmentsEntity } from './appointments.entity';

const baseProps = {
  id: 'seed-id',
  status: 'scheduled' as const,
  serviceName: 'Consultation call',
  clientName: 'Mara Quispe',
  startsAt: new Date('2026-06-22T08:40:00.000Z'),
  durationMinutes: 30,
};

describe('AppointmentsEntity', () => {
  it('keeps deterministic identity and exposes its details', () => {
    const entity = AppointmentsEntity.create(baseProps);
    expect(entity.id).toBe('seed-id');
    expect(entity.status).toBe('scheduled');
    expect(entity.serviceName).toBe('Consultation call');
    expect(entity.clientName).toBe('Mara Quispe');
    expect(entity.startsAt.toISOString()).toBe('2026-06-22T08:40:00.000Z');
    expect(entity.durationMinutes).toBe(30);
  });

  it('rejects an empty id', () => {
    expect(() => AppointmentsEntity.create({ ...baseProps, id: ' ' })).toThrow(
      'Appointment id is required.',
    );
  });

  it('rejects a blank service or client name', () => {
    expect(() =>
      AppointmentsEntity.create({ ...baseProps, serviceName: ' ' }),
    ).toThrow('Appointment service name is required.');
    expect(() =>
      AppointmentsEntity.create({ ...baseProps, clientName: '' }),
    ).toThrow('Appointment client name is required.');
  });

  it('rejects a non-positive or non-integer duration', () => {
    expect(() =>
      AppointmentsEntity.create({ ...baseProps, durationMinutes: 0 }),
    ).toThrow('Appointment duration must be a positive integer.');
    expect(() =>
      AppointmentsEntity.create({ ...baseProps, durationMinutes: 12.5 }),
    ).toThrow('Appointment duration must be a positive integer.');
  });
});
