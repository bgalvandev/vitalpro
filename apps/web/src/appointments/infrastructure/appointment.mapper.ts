import type { Appointment } from '../domain/appointment.entity';
import type { AppointmentDto } from './appointment-api.dto';

/** Maps a validated network DTO to the domain entity. */
export function toDomain(dto: AppointmentDto): Appointment {
  return {
    id: dto.id,
    status: dto.status,
    serviceName: dto.serviceName,
    clientName: dto.clientName,
    startsAt: new Date(dto.startsAt),
    durationMinutes: dto.durationMinutes,
  };
}
