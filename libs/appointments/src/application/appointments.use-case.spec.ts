import { describe, expect, it } from 'vitest';

import { getAppointmentById } from './appointments.use-case';

describe('getAppointmentById', () => {
  it('returns an appointment when id exists', () => {
    expect(getAppointmentById('apt-001')).toEqual({
      id: 'apt-001',
      status: 'scheduled',
    });
  });

  it('returns null when id does not exist', () => {
    expect(getAppointmentById('apt-999')).toBeNull();
  });
});
