import { describe, expect, it } from 'vitest';
import { appointmentDtoSchema } from './appointment-api.dto';

const validDto = {
  id: 'apt_0840',
  status: 'scheduled',
  serviceName: 'Initial consultation',
  clientName: 'Mara Quispe',
  startsAt: '2026-06-22T08:40:00.000Z',
  durationMinutes: 30,
};

describe('appointmentDtoSchema', () => {
  it('accepts a well-formed appointment payload', () => {
    expect(appointmentDtoSchema.parse(validDto)).toEqual(validDto);
  });

  it('rejects an unknown status', () => {
    expect(() =>
      appointmentDtoSchema.parse({ ...validDto, status: 'no-show' })
    ).toThrow();
  });

  it('rejects a non-positive duration', () => {
    expect(() =>
      appointmentDtoSchema.parse({ ...validDto, durationMinutes: 0 })
    ).toThrow();
  });

  it('rejects a non-datetime startsAt', () => {
    expect(() =>
      appointmentDtoSchema.parse({ ...validDto, startsAt: 'tomorrow' })
    ).toThrow();
  });
});
