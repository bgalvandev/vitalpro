import type { Server } from 'node:http';

import { InMemoryAppointmentRepository } from '@vitalpro/appointments';

import { createAppointmentRepository } from './infrastructure/persistence/create-appointment-repository';
import { createCoreApiApp } from './interface/http/create-core-api-app';

export function createStartupMessage(port: number): string {
  return `VitalPro Core API listening on port ${port}`;
}

export function parsePort(value: string | undefined): number {
  const defaultPort = 3000;
  if (!value) {
    return defaultPort;
  }

  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed) || parsed <= 0) {
    return defaultPort;
  }

  return parsed;
}

let runtimeServer: Server | undefined;

export function shouldUseInMemoryAppointments(value: string | undefined): boolean {
  return value === 'true';
}

export async function bootstrap(): Promise<Server> {
  const appointmentRepository = shouldUseInMemoryAppointments(
    process.env.CORE_API_USE_IN_MEMORY_APPOINTMENTS,
  )
    ? new InMemoryAppointmentRepository()
    : createAppointmentRepository();

  const app = createCoreApiApp({
    appointmentRepository,
  });
  const port = parsePort(process.env.PORT);

  runtimeServer = await new Promise<Server>((resolve) => {
    const server = app.listen(port, () => {
      console.log(createStartupMessage(port));
      resolve(server);
    });
  });

  return runtimeServer;
}

if (process.env.NODE_ENV !== 'test' && process.env.VITEST !== 'true') {
  bootstrap();
}
