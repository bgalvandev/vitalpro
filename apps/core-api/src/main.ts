import 'dotenv/config';

import type { Server } from 'node:http';

import { InMemoryAppointmentRepository } from '@vitalpro/appointments';

import {
  createAppointmentRepositoryRuntime,
  type AppointmentRepositoryRuntime,
} from './infrastructure/persistence/create-appointment-repository';
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
let appointmentRepositoryRuntime: AppointmentRepositoryRuntime | undefined;
let shutdownHandlersRegistered = false;

export function shouldUseInMemoryAppointments(value: string | undefined): boolean {
  return value === 'true';
}

export function createAppointmentRepositoryRuntimeForEnvironment(): AppointmentRepositoryRuntime {
  if (shouldUseInMemoryAppointments(process.env.CORE_API_USE_IN_MEMORY_APPOINTMENTS)) {
    return {
      appointmentRepository: new InMemoryAppointmentRepository(),
      shutdown: async () => {},
    };
  }

  return createAppointmentRepositoryRuntime();
}

function closeServer(server: Server): Promise<void> {
  return new Promise((resolve, reject) => {
    server.close((error) => {
      if (error) {
        reject(error);
        return;
      }

      resolve();
    });
  });
}

export async function shutdown(): Promise<void> {
  const server = runtimeServer;
  const repositoryRuntime = appointmentRepositoryRuntime;
  runtimeServer = undefined;
  appointmentRepositoryRuntime = undefined;

  if (server) {
    await closeServer(server);
  }

  await repositoryRuntime?.shutdown();
}

function registerShutdownHandlers(): void {
  if (shutdownHandlersRegistered) {
    return;
  }

  shutdownHandlersRegistered = true;
  for (const signal of ['SIGINT', 'SIGTERM'] as const) {
    process.once(signal, () => {
      void shutdown()
        .then(() => {
          process.exit(0);
        })
        .catch((error: unknown) => {
          console.error(error);
          process.exit(1);
        });
    });
  }
}

export async function bootstrap(): Promise<Server> {
  appointmentRepositoryRuntime = createAppointmentRepositoryRuntimeForEnvironment();

  const app = createCoreApiApp({
    appointmentRepository: appointmentRepositoryRuntime.appointmentRepository,
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
  void bootstrap()
    .then(() => {
      registerShutdownHandlers();
    })
    .catch((error: unknown) => {
      console.error(error);
      process.exit(1);
    });
}
