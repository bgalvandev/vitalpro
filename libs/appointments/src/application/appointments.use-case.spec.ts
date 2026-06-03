import { describe, expect, it } from 'vitest';

import { AppointmentsEntity } from '../domain';

import {
  type AppointmentRepository,
  getAppointmentById,
  GetAppointmentByIdUseCase,
} from './appointments.use-case';

describe('getAppointmentById', () => {
  const repository: AppointmentRepository = {
    async findById(id) {
      if (id !== 'apt-001') {
        return null;
      }

      return AppointmentsEntity.create({
        id,
        status: 'scheduled',
      });
    },
  };

  it('returns an appointment when id exists', async () => {
    await expect(getAppointmentById('apt-001', repository)).resolves.toEqual({
      id: 'apt-001',
      status: 'scheduled',
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
        return AppointmentsEntity.create({
          id,
          status: 'completed',
        });
      },
    });

    await expect(useCase.execute('apt-002')).resolves.toEqual({
      id: 'apt-002',
      status: 'completed',
    });
  });
});
