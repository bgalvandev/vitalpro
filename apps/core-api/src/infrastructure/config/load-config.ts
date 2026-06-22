import { z } from 'zod';

// Configuration is an external input boundary, so it is validated with Zod
// (per AGENTS.md) and fails fast with a clear message when the environment is
// misconfigured — provisioning correct config is the operator's responsibility.
const configSchema = z.object({
  DATABASE_URL: z.string().min(1, 'is required'),
  PORT: z.coerce.number().int().positive().default(3000),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  // Shared secret required as the Bearer token on the business API surface
  // (service-to-service auth). No default: a built-in secret would be a
  // vulnerability, so a misconfigured environment must fail fast.
  CORE_API_SERVICE_TOKEN: z.string().min(16, 'must be at least 16 characters'),
});

export interface CoreApiConfig {
  databaseUrl: string;
  port: number;
  nodeEnv: 'development' | 'production' | 'test';
  serviceToken: string;
}

export function loadConfig(env: NodeJS.ProcessEnv = process.env): CoreApiConfig {
  const result = configSchema.safeParse(env);
  if (!result.success) {
    const issues = result.error.issues
      .map((issue) => `${issue.path.join('.')} ${issue.message}`)
      .join('; ');
    throw new Error(`Invalid Core API configuration: ${issues}`);
  }

  return {
    databaseUrl: result.data.DATABASE_URL,
    port: result.data.PORT,
    nodeEnv: result.data.NODE_ENV,
    serviceToken: result.data.CORE_API_SERVICE_TOKEN,
  };
}
