import { z } from 'zod';

/**
 * Server-side configuration for reaching core-api. Validated at the boundary so
 * a misconfiguration fails with a clear message instead of an opaque fetch error.
 */
const coreApiConfigSchema = z.object({
  baseUrl: z.string().url(),
  token: z.string().min(1),
});

export type CoreApiConfig = z.infer<typeof coreApiConfigSchema>;

export function loadCoreApiConfig(): CoreApiConfig {
  const parsed = coreApiConfigSchema.safeParse({
    baseUrl: process.env.CORE_API_URL,
    token: process.env.CORE_API_TOKEN,
  });

  if (!parsed.success) {
    const fields = parsed.error.issues
      .map((issue) => issue.path.join('.'))
      .join(', ');
    throw new Error(
      `Invalid core-api configuration (${fields}). Set CORE_API_URL and CORE_API_TOKEN.`,
    );
  }

  return parsed.data;
}
