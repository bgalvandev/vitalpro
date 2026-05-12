import fs from 'node:fs';
import path from 'node:path';

import { getAppointmentById } from '@vitalpro/appointments';
import express from 'express';
import * as OpenApiValidator from 'express-openapi-validator';
import type { NextFunction, Request, Response } from 'express';
import { parse } from 'yaml';

type RuntimeApiSpec = Exclude<
  Parameters<typeof OpenApiValidator.middleware>[0]['apiSpec'],
  string
>;

const APPOINTMENTS_OPENAPI_PATH_CANDIDATES = [
  path.resolve(process.cwd(), 'contracts/openapi/core/appointments.openapi.yaml'),
  path.resolve(
    process.cwd(),
    '../../contracts/openapi/core/appointments.openapi.yaml',
  ),
  path.resolve(__dirname, '../../../../contracts/openapi/core/appointments.openapi.yaml'),
  path.resolve(
    __dirname,
    '../../../../../contracts/openapi/core/appointments.openapi.yaml',
  ),
];

export function resolveAppointmentsOpenApiPath(): string {
  const specPath = APPOINTMENTS_OPENAPI_PATH_CANDIDATES.find((candidate) =>
    fs.existsSync(candidate),
  );

  if (!specPath) {
    throw new Error('Unable to locate appointments OpenAPI contract.');
  }

  return specPath;
}

export function loadAppointmentsOpenApiSpecForRuntime(): RuntimeApiSpec {
  const specPath = resolveAppointmentsOpenApiPath();
  const specRaw = fs.readFileSync(specPath, 'utf8');
  const spec = parse(specRaw) as unknown as RuntimeApiSpec;

  if ((spec as { openapi?: string }).openapi === '3.2.0') {
    return {
      ...(spec as Record<string, unknown>),
      openapi: '3.1.2',
    } as unknown as RuntimeApiSpec;
  }

  return spec;
}

export function isBearerAuthorizationValid(
  authorization: string | undefined,
): boolean {
  return (
    typeof authorization === 'string' &&
    authorization.startsWith('Bearer ') &&
    authorization.length > 7
  );
}

export function createCoreApiApp(): express.Express {
  const app = express();
  app.disable('x-powered-by');

  app.use(express.json());

  app.use(
    OpenApiValidator.middleware({
      apiSpec: loadAppointmentsOpenApiSpecForRuntime(),
      validateApiSpec: true,
      validateRequests: true,
      validateResponses: true,
      validateSecurity: {
        handlers: {
          bearerAuth: (req) => {
            const authorization = req.headers.authorization;
            if (!isBearerAuthorizationValid(authorization)) {
              throw { status: 401, message: 'Unauthorized' };
            }
            return true;
          },
        },
      },
    }),
  );

  app.get('/api/v1/appointments/:appointmentId', (req, res) => {
    const appointment = getAppointmentById(req.params.appointmentId);
    if (!appointment) {
      return res.status(404).json({
        code: 'not_found',
        message: 'Appointment not found',
      });
    }

    return res.status(200).json(appointment);
  });

  app.use(
    (
      err: { status?: number; message?: string },
      req: Request,
      res: Response,
      _next: NextFunction,
    ) => {
    const status = err.status ?? 500;
    const message = err.message ?? 'Internal server error';
    const code = status === 401 ? 'unauthorized' : 'internal_error';

    if (
      status === 405 &&
      req.path.startsWith('/api/v1/appointments/')
    ) {
      res.setHeader('Allow', 'GET');
    }

    return res.status(status).json({
      code,
      message,
    });
    },
  );

  return app;
}
