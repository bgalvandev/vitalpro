import { describe, expect, it } from 'vitest';
import type { Appointment } from './appointment.entity';
import { compareForDayView, isActionable } from './appointment.entity';

function make(
  overrides: Partial<Appointment> & Pick<Appointment, 'id' | 'status' | 'startsAt'>
): Appointment {
  return {
    serviceName: 'Service',
    clientName: 'Client',
    durationMinutes: 30,
    ...overrides,
  };
}

describe('compareForDayView', () => {
  it('orders scheduled before completed and cancelled', () => {
    const completed = make({
      id: 'a',
      status: 'completed',
      startsAt: new Date('2026-06-22T08:00:00.000Z'),
    });
    const scheduled = make({
      id: 'b',
      status: 'scheduled',
      startsAt: new Date('2026-06-22T12:00:00.000Z'),
    });
    const cancelled = make({
      id: 'c',
      status: 'cancelled',
      startsAt: new Date('2026-06-22T07:00:00.000Z'),
    });

    const ordered = [completed, scheduled, cancelled]
      .sort(compareForDayView)
      .map((a) => a.id);

    expect(ordered).toEqual(['b', 'a', 'c']);
  });

  it('orders by start time within the same status', () => {
    const later = make({
      id: 'late',
      status: 'scheduled',
      startsAt: new Date('2026-06-22T11:00:00.000Z'),
    });
    const earlier = make({
      id: 'early',
      status: 'scheduled',
      startsAt: new Date('2026-06-22T09:00:00.000Z'),
    });

    expect([later, earlier].sort(compareForDayView).map((a) => a.id)).toEqual([
      'early',
      'late',
    ]);
  });
});

describe('isActionable', () => {
  it('is true only for scheduled appointments', () => {
    const base = { id: 'x', startsAt: new Date('2026-06-22T09:00:00.000Z') };
    expect(isActionable(make({ ...base, status: 'scheduled' }))).toBe(true);
    expect(isActionable(make({ ...base, status: 'completed' }))).toBe(false);
    expect(isActionable(make({ ...base, status: 'cancelled' }))).toBe(false);
  });
});
