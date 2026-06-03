import { describe, expect, it } from 'vitest';

import { AppointmentsEntity } from './appointments.entity';

describe('AppointmentsEntity', () => {
  it('keeps deterministic identity', () => {
    const entity = AppointmentsEntity.create({
      id: 'seed-id',
      status: 'scheduled',
    });
    expect(entity.id).toBe('seed-id');
    expect(entity.status).toBe('scheduled');
  });

  it('rejects an empty id', () => {
    expect(() =>
      AppointmentsEntity.create({
        id: ' ',
        status: 'scheduled',
      }),
    ).toThrow('Appointment id is required.');
  });
});
