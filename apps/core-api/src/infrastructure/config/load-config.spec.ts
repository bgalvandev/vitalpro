import { describe, expect, it } from 'vitest';

import { loadConfig } from './load-config';

const VALID_DATABASE_URL = 'postgresql://user:pass@localhost:5432/db?schema=public';
const VALID_SERVICE_TOKEN = 'local-dev-core-api-token';

describe('loadConfig', () => {
  it('parses a valid environment with defaults', () => {
    const config = loadConfig({
      DATABASE_URL: VALID_DATABASE_URL,
      CORE_API_SERVICE_TOKEN: VALID_SERVICE_TOKEN,
    });

    expect(config).toEqual({
      databaseUrl: VALID_DATABASE_URL,
      port: 3000,
      nodeEnv: 'development',
      serviceToken: VALID_SERVICE_TOKEN,
    });
  });

  it('coerces PORT and accepts a valid NODE_ENV', () => {
    const config = loadConfig({
      DATABASE_URL: VALID_DATABASE_URL,
      CORE_API_SERVICE_TOKEN: VALID_SERVICE_TOKEN,
      PORT: '3300',
      NODE_ENV: 'production',
    });

    expect(config.port).toBe(3300);
    expect(config.nodeEnv).toBe('production');
  });

  it('throws a clear error when DATABASE_URL is missing', () => {
    expect(() =>
      loadConfig({ CORE_API_SERVICE_TOKEN: VALID_SERVICE_TOKEN }),
    ).toThrowError(/DATABASE_URL/);
  });

  it('throws when CORE_API_SERVICE_TOKEN is missing or too short', () => {
    expect(() => loadConfig({ DATABASE_URL: VALID_DATABASE_URL })).toThrowError(
      /CORE_API_SERVICE_TOKEN/,
    );
    expect(() =>
      loadConfig({ DATABASE_URL: VALID_DATABASE_URL, CORE_API_SERVICE_TOKEN: 'short' }),
    ).toThrowError(/CORE_API_SERVICE_TOKEN/);
  });

  it('throws when PORT is not a positive integer', () => {
    expect(() =>
      loadConfig({
        DATABASE_URL: VALID_DATABASE_URL,
        CORE_API_SERVICE_TOKEN: VALID_SERVICE_TOKEN,
        PORT: '-1',
      }),
    ).toThrowError(/PORT/);
  });

  it('throws when NODE_ENV is not an allowed value', () => {
    expect(() =>
      loadConfig({
        DATABASE_URL: VALID_DATABASE_URL,
        CORE_API_SERVICE_TOKEN: VALID_SERVICE_TOKEN,
        NODE_ENV: 'staging',
      }),
    ).toThrowError(/NODE_ENV/);
  });
});
