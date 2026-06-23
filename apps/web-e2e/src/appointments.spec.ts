import { expect, test } from '@playwright/test';
import { AppointmentsPage } from './pages/appointments.page';

test.describe('Appointments console', () => {
  test('renders the day schedule served by the core API', async ({ page }) => {
    const appointments = new AppointmentsPage(page);
    await appointments.goto();

    await expect(appointments.heading).toBeVisible();

    // One of the two stubbed appointments is `scheduled` (actionable), so the
    // summary reflects "1 scheduled" out of "2 total".
    await expect(appointments.summary()).toHaveText(/1 scheduled.*2 total/);

    await expect(appointments.appointments).toHaveCount(2);
    await expect(
      appointments.appointmentByService('Dental cleaning'),
    ).toBeVisible();
    await expect(appointments.appointmentByService('Eye exam')).toBeVisible();
  });

  test('shows the client and duration for an appointment', async ({ page }) => {
    const appointments = new AppointmentsPage(page);
    await appointments.goto();

    await expect(page.getByText('Ada Lovelace')).toBeVisible();
    await expect(page.getByText('30 min')).toBeVisible();
  });
});
