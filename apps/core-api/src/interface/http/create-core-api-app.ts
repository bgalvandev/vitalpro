import { timingSafeEqual } from 'node:crypto';

import fastifySwagger from '@fastify/swagger';
import {
  type AppointmentRepository,
  type AppointmentResult,
  getAppointmentById,
  listAppointments,
} from '@vitalpro/appointments';
import Fastify, { type FastifyBaseLogger, type FastifyInstance } from 'fastify';
import {
  jsonSchemaTransform,
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from 'fastify-type-provider-zod';
import { z } from 'zod';

// Zod schemas are the single source of truth: Fastify uses them for runtime
// validation/serialization, and @fastify/swagger derives the OpenAPI contract
// from them (see scripts/contracts/generate-openapi.mjs).
const appointmentStatusSchema = z.enum(['scheduled', 'completed', 'cancelled']);

const appointmentParamsSchema = z.object({
  appointmentId: z.string().min(1),
});

const appointmentSchema = z.object({
  id: z.string(),
  status: appointmentStatusSchema,
  serviceName: z.string(),
  clientName: z.string(),
  startsAt: z.string(),
  durationMinutes: z.number().int(),
});

// Collection contract: bounded result size and explicit ordering, never an
// unbounded ORM graph (AGENTS.md API Query and Response Shape Standard).
const DEFAULT_LIST_LIMIT = 50;
const MAX_LIST_LIMIT = 100;

const appointmentListQuerySchema = z.object({
  limit: z.coerce
    .number()
    .int()
    .min(1)
    .max(MAX_LIST_LIMIT)
    .default(DEFAULT_LIST_LIMIT),
});

const appointmentListSchema = z.object({
  items: z.array(appointmentSchema),
  limit: z.number().int(),
});

// RFC 9457 Problem Details for HTTP APIs (application/problem+json).
const problemDetailsSchema = z.object({
  type: z.string(),
  title: z.string(),
  status: z.number().int(),
  detail: z.string().optional(),
  instance: z.string().optional(),
});

const PROBLEM_CONTENT_TYPE = 'application/problem+json';

// The Zod transform emits `application/json` for every response, but the error
// handler sends RFC 9457 bodies as `application/problem+json`. Relabel every
// error (>= 400) media type so the published contract matches what the server
// actually returns. This runs for both the served spec and the generated
// contract (scripts/contracts/generate-openapi.mjs), keeping them in sync.
function useProblemJsonForErrorResponses<T extends { paths?: unknown }>(
  document: T,
): T {
  const paths = (document.paths ?? {}) as Record<string, unknown>;
  for (const pathItem of Object.values(paths)) {
    if (!pathItem || typeof pathItem !== 'object') {
      continue;
    }
    for (const operation of Object.values(pathItem as Record<string, unknown>)) {
      const responses = (operation as { responses?: Record<string, unknown> })
        ?.responses;
      if (!responses || typeof responses !== 'object') {
        continue;
      }
      for (const [status, response] of Object.entries(responses)) {
        if (Number(status) < 400) {
          continue;
        }
        const content = (response as { content?: Record<string, unknown> })
          ?.content;
        if (content && 'application/json' in content) {
          content[PROBLEM_CONTENT_TYPE] = content['application/json'];
          delete content['application/json'];
        }
      }
    }
  }
  return document;
}

interface HttpError extends Error {
  statusCode: number;
}

function httpError(statusCode: number, message: string): HttpError {
  const error = new Error(message) as HttpError;
  error.statusCode = statusCode;
  return error;
}

// Maps the application result to the transport DTO (Date -> ISO 8601 string).
function toAppointmentResponse(appointment: AppointmentResult) {
  return {
    id: appointment.id,
    status: appointment.status,
    serviceName: appointment.serviceName,
    clientName: appointment.clientName,
    startsAt: appointment.startsAt.toISOString(),
    durationMinutes: appointment.durationMinutes,
  };
}

const BEARER_PREFIX = 'Bearer ';

// Returns the raw token from a well-formed `Authorization: Bearer <token>`
// header, or null when the header is absent or malformed.
function extractBearerToken(authorization: string | undefined): string | null {
  if (
    typeof authorization !== 'string' ||
    !authorization.startsWith(BEARER_PREFIX) ||
    authorization.length <= BEARER_PREFIX.length
  ) {
    return null;
  }
  return authorization.slice(BEARER_PREFIX.length);
}

// Constant-time comparison to avoid leaking the token through timing.
function tokensMatch(provided: string, expected: string): boolean {
  const providedBuffer = Buffer.from(provided);
  const expectedBuffer = Buffer.from(expected);
  return (
    providedBuffer.length === expectedBuffer.length &&
    timingSafeEqual(providedBuffer, expectedBuffer)
  );
}

export interface CoreApiAppOptions {
  appointmentRepository: AppointmentRepository;
  // Shared secret required as the Bearer token on /api/* (service-to-service auth).
  serviceToken: string;
  // Readiness probe for downstream dependencies (e.g. the database).
  checkReadiness?: () => Promise<void>;
  // Pino instance for request/app logging; omit for quiet (tests).
  loggerInstance?: FastifyBaseLogger;
}

export async function createCoreApiApp(
  options: CoreApiAppOptions,
): Promise<FastifyInstance> {
  const { appointmentRepository, serviceToken, checkReadiness, loggerInstance } =
    options;

  const app = (
    loggerInstance ? Fastify({ loggerInstance }) : Fastify({ logger: false })
  ).withTypeProvider<ZodTypeProvider>();

  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);

  await app.register(fastifySwagger, {
    openapi: {
      openapi: '3.1.0',
      info: {
        title: 'VitalPro Core Appointments API',
        version: '1.0.0',
        summary: 'Initial external contract for appointments module.',
        license: { name: 'Apache-2.0', identifier: 'Apache-2.0' },
      },
      servers: [{ url: 'https://api.vitalpro.example' }],
      security: [{ bearerAuth: [] }],
      components: {
        securitySchemes: {
          bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
        },
      },
    },
    transform: jsonSchemaTransform,
    transformObject: (documentObject) =>
      'openapiObject' in documentObject
        ? useProblemJsonForErrorResponses(documentObject.openapiObject)
        : documentObject.swaggerObject,
  });

  // Operational endpoints — outside the business contract, no authentication.
  app.get('/health', { schema: { hide: true } }, async () => ({ status: 'ok' }));
  app.get('/ready', { schema: { hide: true } }, async (_request, reply) => {
    if (!checkReadiness) {
      return { status: 'ok' };
    }
    try {
      await checkReadiness();
      return { status: 'ok', database: 'up' };
    } catch {
      return reply.code(503).send({ status: 'error', database: 'down' });
    }
  });

  // Security headers + bearer auth for the business API surface only.
  // (For broader hardening, @fastify/helmet is the standard next step.)
  app.addHook('onRequest', async (request, reply) => {
    if (!request.url.startsWith('/api/')) {
      return;
    }
    reply.header('Cache-Control', 'no-store');
    reply.header('Pragma', 'no-cache');
    reply.header('X-Content-Type-Options', 'nosniff');
    const token = extractBearerToken(request.headers.authorization);
    // eslint-disable-next-line security/detect-possible-timing-attacks -- this is a null/absence check, not a secret comparison; the secret is compared in constant time via tokensMatch() (timingSafeEqual) below.
    if (token === null) {
      throw httpError(401, 'Authorization header required');
    }
    if (!tokensMatch(token, serviceToken)) {
      throw httpError(401, 'Invalid authorization token');
    }
  });

  app.get(
    '/api/v1/appointments',
    {
      schema: {
        operationId: 'listAppointments',
        summary: 'List appointments ordered by start time ascending (max 100)',
        tags: ['appointments'],
        querystring: appointmentListQuerySchema,
        response: {
          200: appointmentListSchema,
          401: problemDetailsSchema,
          500: problemDetailsSchema,
        },
      },
    },
    async (request) => {
      const { limit } = request.query;
      const appointments = await listAppointments({ limit }, appointmentRepository);

      return { items: appointments.map(toAppointmentResponse), limit };
    },
  );

  app.get(
    '/api/v1/appointments/:appointmentId',
    {
      schema: {
        operationId: 'getAppointmentById',
        summary: 'Get an appointment by id',
        tags: ['appointments'],
        params: appointmentParamsSchema,
        response: {
          200: appointmentSchema,
          401: problemDetailsSchema,
          404: problemDetailsSchema,
          500: problemDetailsSchema,
        },
      },
    },
    async (request, reply) => {
      const appointment = await getAppointmentById(
        request.params.appointmentId,
        appointmentRepository,
      );

      if (!appointment) {
        return reply.code(404).type(PROBLEM_CONTENT_TYPE).send({
          type: 'about:blank',
          title: 'Not Found',
          status: 404,
          detail: 'Appointment not found',
          instance: request.url,
        });
      }

      return toAppointmentResponse(appointment);
    },
  );

  // Central error handler returning RFC 9457 Problem Details.
  app.setErrorHandler((error, request, reply) => {
    const rawStatus = (error as Partial<HttpError>).statusCode;
    const status =
      typeof rawStatus === 'number' && rawStatus >= 400 && rawStatus < 600
        ? rawStatus
        : 500;

    if (status >= 500) {
      request.log.error({ err: error }, 'Unhandled error');
    }

    const message = error instanceof Error ? error.message : 'Error';
    const titles: Record<number, string> = {
      400: 'Bad Request',
      401: 'Unauthorized',
      404: 'Not Found',
    };

    return reply
      .code(status)
      .type(PROBLEM_CONTENT_TYPE)
      .send({
        type: 'about:blank',
        title: titles[status] ?? (status >= 500 ? 'Internal Server Error' : 'Error'),
        status,
        detail: status >= 500 ? 'Internal server error' : message,
        instance: request.url,
      });
  });

  await app.ready();
  return app;
}
