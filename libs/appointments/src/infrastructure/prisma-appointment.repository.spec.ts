import { spawn } from 'node:child_process';
import path from 'node:path';

import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import { PostgreSqlContainer } from '@testcontainers/postgresql';
import { describe, expect, it } from 'vitest';

import { PrismaAppointmentRepository } from './prisma-appointment.repository';

function runCommand(command: string, args: string[], options: { cwd: string; env: NodeJS.ProcessEnv }) {
  return new Promise<void>((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: 'inherit',
      ...options,
    });

    child.on('error', reject);
    child.on('exit', (code) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(new Error(`${command} exited with code ${code}`));
    });
  });
}

describe('PrismaAppointmentRepository', () => {
  it('reads an appointment from PostgreSQL', async (context) => {
    if (process.env.RUN_TESTCONTAINERS !== 'true') {
      context.skip();
      return;
    }

    const container = await new PostgreSqlContainer('postgres:17-alpine').start();
    const connectionString = container.getConnectionUri();
    const adapter = new PrismaPg({ connectionString });
    const prisma = new PrismaClient({ adapter });
    const workspaceRoot = path.resolve(process.cwd(), '../..');

    try {
      await runCommand('pnpm', ['run', 'prisma:migrate:deploy'], {
        cwd: workspaceRoot,
        env: {
          ...process.env,
          DATABASE_URL: connectionString,
        },
      });
      await prisma.appointment.create({
        data: {
          id: 'apt-001',
          status: 'scheduled',
        },
      });

      const repository = new PrismaAppointmentRepository(prisma);

      await expect(repository.findById('apt-001')).resolves.toMatchObject({
        id: 'apt-001',
        status: 'scheduled',
      });
      await expect(repository.findById('apt-999')).resolves.toBeNull();
    } finally {
      await prisma.$disconnect();
      await container.stop();
    }
  });
});
