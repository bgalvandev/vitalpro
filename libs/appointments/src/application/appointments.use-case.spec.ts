import { describe, expect, it } from 'vitest';

import { type AppointmentStatus, AppointmentEntity } from '../domain';

import {
  type AppointmentRepository,
  getAppointmentById,
  GetAppointmentByIdUseCase,
  listAppointments,
  ListAppointmentsUseCase,
} from './appointments.use-case';

const detail = {
  serviceName: 'Consultation call',
  clientName: 'Mara Quispe',
  startsAt: new Date('2026-06-22T08:40:00.000Z'),
  durationMinutes: 30,
};

function entity(id: string, status: AppointmentStatus): AppointmentEntity {
  return AppointmentEntity.create({ id, status, ...detail });
}

const repository: AppointmentRepository = {
  async findById(id) {
    return id === 'apt-001' ? entity('apt-001', 'scheduled') : null;
  },
  async list({ limit }) {
    return [entity('apt-001', 'scheduled'), entity('apt-002', 'completed')].slice(
      0,
      limit,
    );
  },
};

describe('getAppointmentById', () => {
  it('returns an appointment when id exists', async () => {
    await expect(getAppointmentById('apt-001', repository)).resolves.toEqual({
      id: 'apt-001',
      status: 'scheduled',
      ...detail,
    });
  });

  it('returns null when id does not exist', async () => {
    await expect(getAppointmentById('apt-999', repository)).resolves.toBeNull();
  });
});

describe('GetAppointmentByIdUseCase', () => {
  it('orchestrates lookup through the repository port', async () => {
    const useCase = new GetAppointmentByIdUseCase({
      async findById(id) {
        return entity(id, 'completed');
      },
      async list() {
        return [];
      },
    });

    await expect(useCase.execute('apt-002')).resolves.toEqual({
      id: 'apt-002',
      status: 'completed',
      ...detail,
    });
  });
});

describe('listAppointments', () => {
  it('maps repository entities to results', async () => {
    await expect(listAppointments({ limit: 50 }, repository)).resolves.toEqual([
      { id: 'apt-001', status: 'scheduled', ...detail },
      { id: 'apt-002', status: 'completed', ...detail },
    ]);
  });

  it('honors the limit through the port', async () => {
    const result = await new ListAppointmentsUseCase(repository).execute({
      limit: 1,
    });
    expect(result.map((appointment) => appointment.id)).toEqual(['apt-001']);
  });
});
