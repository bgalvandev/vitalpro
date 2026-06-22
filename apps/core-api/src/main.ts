import 'dotenv/config';

import type { FastifyInstance } from 'fastify';

import { loadConfig } from './infrastructure/config/load-config';
import { logger } from './infrastructure/logging/logger';
import {
  createAppointmentRepositoryRuntime,
  type AppointmentRepositoryRuntime,
} from './infrastructure/persistence/create-appointment-repository';
import { createCoreApiApp } from './interface/http/create-core-api-app';

export function createStartupMessage(port: number): string {
  return `VitalPro Core API listening on port ${port}`;
}

let runtimeApp: FastifyInstance | undefined;
let appointmentRepositoryRuntime: AppointmentRepositoryRuntime | undefined;
let shutdownHandlersRegistered = false;

export async function shutdown(): Promise<void> {
  const app = runtimeApp;
  const repositoryRuntime = appointmentRepositoryRuntime;
  runtimeApp = undefined;
  appointmentRepositoryRuntime = undefined;

  if (app) {
    await app.close();
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
          logger.error({ err: error }, 'Error during shutdown');
          process.exit(1);
        });
    });
  }
}

export async function bootstrap(): Promise<FastifyInstance> {
  const config = loadConfig();
  const repositoryRuntime = createAppointmentRepositoryRuntime(config.databaseUrl);
  appointmentRepositoryRuntime = repositoryRuntime;

  // Fail fast if the database is unreachable instead of starting a server that
  // would only error on the first request.
  await repositoryRuntime.checkConnection();

  const app = await createCoreApiApp({
    appointmentRepository: repositoryRuntime.appointmentRepository,
    serviceToken: config.serviceToken,
    checkReadiness: () => repositoryRuntime.checkConnection(),
    loggerInstance: logger,
  });
  runtimeApp = app;

  await app.listen({ port: config.port, host: '0.0.0.0' });
  logger.info({ port: config.port }, createStartupMessage(config.port));

  return app;
}

if (process.env.NODE_ENV !== 'test' && process.env.VITEST !== 'true') {
  void bootstrap()
    .then(() => {
      registerShutdownHandlers();
    })
    .catch((error: unknown) => {
      logger.error({ err: error }, 'Failed to start Core API');
      process.exit(1);
    });
}
