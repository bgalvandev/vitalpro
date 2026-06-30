import { describe, expect, it } from 'vitest';

import { AppointmentEntity } from './appointment.entity';

const baseProps = {
  id: 'seed-id',
  status: 'scheduled' as const,
  serviceName: 'Consultation call',
  clientName: 'Mara Quispe',
  startsAt: new Date('2026-06-22T08:40:00.000Z'),
  durationMinutes: 30,
};

describe('AppointmentEntity', () => {
  it('keeps deterministic identity and exposes its details', () => {
    const entity = AppointmentEntity.create(baseProps);
    expect(entity.id).toBe('seed-id');
    expect(entity.status).toBe('scheduled');
    expect(entity.serviceName).toBe('Consultation call');
    expect(entity.clientName).toBe('Mara Quispe');
    expect(entity.startsAt.toISOString()).toBe('2026-06-22T08:40:00.000Z');
    expect(entity.durationMinutes).toBe(30);
  });

  it('rejects an empty id', () => {
    expect(() => AppointmentEntity.create({ ...baseProps, id: ' ' })).toThrow(
      'Appointment id is required.',
    );
  });

  it('rejects a blank service or client name', () => {
    expect(() =>
      AppointmentEntity.create({ ...baseProps, serviceName: ' ' }),
    ).toThrow('Appointment service name is required.');
    expect(() =>
      AppointmentEntity.create({ ...baseProps, clientName: '' }),
    ).toThrow('Appointment client name is required.');
  });

  it('rejects a non-positive or non-integer duration', () => {
    expect(() =>
      AppointmentEntity.create({ ...baseProps, durationMinutes: 0 }),
    ).toThrow('Appointment duration must be a positive integer.');
    expect(() =>
      AppointmentEntity.create({ ...baseProps, durationMinutes: 12.5 }),
    ).toThrow('Appointment duration must be a positive integer.');
  });
});
