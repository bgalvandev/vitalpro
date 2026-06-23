import type { Locator, Page } from '@playwright/test';

/**
 * Page Object for the appointments console (/appointments). Locators use roles
 * and accessible text — never CSS classes — so tests stay coupled to what a
 * user perceives, not to markup or styling details.
 */
export class AppointmentsPage {
  readonly heading: Locator;
  readonly appointments: Locator;

  constructor(private readonly page: Page) {
    this.heading = page.getByRole('heading', {
      level: 1,
      name: /today.?s appointments/i,
    });
    this.appointments = page.getByRole('listitem');
  }

  async goto(): Promise<void> {
    await this.page.goto('/appointments');
  }

  summary(): Locator {
    return this.page.getByText(/\d+ scheduled .* \d+ total/);
  }

  appointmentByService(serviceName: string): Locator {
    return this.page.getByRole('heading', { level: 3, name: serviceName });
  }
}
