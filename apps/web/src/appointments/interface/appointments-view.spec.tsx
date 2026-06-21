import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import type { Appointment } from '../domain/appointment.entity';
import { AppointmentsView } from './appointments-view';

function appointment(
  id: string,
  status: Appointment['status'],
  serviceName: string
): Appointment {
  return {
    id,
    status,
    serviceName,
    clientName: 'Client',
    startsAt: new Date('2026-06-22T09:00:00.000Z'),
    durationMinutes: 30,
  };
}

describe('AppointmentsView', () => {
  it('renders the scheduled and total counts', () => {
    render(
      <AppointmentsView
        appointments={[
          appointment('a', 'scheduled', 'Consultation'),
          appointment('b', 'completed', 'Follow-up'),
        ]}
      />
    );

    expect(
      screen.getByRole('heading', { name: /today.+appointments/i })
    ).toBeInTheDocument();
    expect(screen.getByText(/1 scheduled/)).toBeInTheDocument();
    expect(screen.getByText(/2 total/)).toBeInTheDocument();
    expect(screen.getByText('Consultation')).toBeInTheDocument();
    expect(screen.getByText('Follow-up')).toBeInTheDocument();
  });

  it('shows an empty state when there are no appointments', () => {
    render(<AppointmentsView appointments={[]} />);
    expect(screen.getByText(/no appointments for today/i)).toBeInTheDocument();
  });

  it('labels each appointment with its status', () => {
    render(
      <AppointmentsView
        appointments={[appointment('a', 'cancelled', 'Physiotherapy')]}
      />
    );
    expect(screen.getByText('Cancelled')).toBeInTheDocument();
  });
});
