import { Client } from 'pg';
import { PostgreSqlContainer } from '@testcontainers/postgresql';
import { describe, expect, it } from 'vitest';

describe('PostgreSQL Testcontainers wiring', () => {
  it('starts a disposable PostgreSQL and runs a query', async (context) => {
    if (process.env.RUN_TESTCONTAINERS !== 'true') {
      context.skip();
      return;
    }

    const container = await new PostgreSqlContainer('postgres:16-alpine').start();
    const client = new Client({
      host: container.getHost(),
      port: container.getPort(),
      database: container.getDatabase(),
      user: container.getUsername(),
      password: container.getPassword(),
    });

    try {
      await client.connect();
      const result = await client.query<{ ready: number }>('SELECT 1 as ready');
      expect(result.rows[0]?.ready).toBe(1);
    } finally {
      await client.end();
      await container.stop();
    }
  });
});
