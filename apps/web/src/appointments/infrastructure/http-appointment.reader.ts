import type { AppointmentReader } from '../application/appointment-reader.port';
import type { Appointment } from '../domain/appointment.entity';
import { appointmentListResponseSchema } from './appointment-api.dto';
import { toDomain } from './appointment.mapper';
import type { CoreApiConfig } from './core-api.config';

// Day-view upper bound; matches the collection contract's max limit.
const DAY_VIEW_LIMIT = 100;

/**
 * HTTP adapter for the appointments read port. Reads the live collection from
 * core-api and validates the response against the published contract schema
 * before mapping to the domain. The use case, the page, and the UI are unaware
 * of the transport.
 */
export class HttpAppointmentReader implements AppointmentReader {
  constructor(
    private readonly config: CoreApiConfig,
    private readonly fetchImpl: typeof fetch = fetch,
  ) {}

  async listForDay(): Promise<Appointment[]> {
    const url = `${this.config.baseUrl}/api/v1/appointments?limit=${DAY_VIEW_LIMIT}`;
    const response = await this.fetchImpl(url, {
      headers: { authorization: `Bearer ${this.config.token}` },
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`core-api responded with status ${response.status}`);
    }

    const payload = appointmentListResponseSchema.parse(await response.json());
    return payload.items.map(toDomain);
  }
}
