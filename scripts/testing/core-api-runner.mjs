import { spawn } from 'node:child_process';
import { setTimeout as wait } from 'node:timers/promises';

const DEFAULT_HOST = '127.0.0.1';

async function waitForCoreApiReady({ host, port, token, timeoutMs }) {
  const start = Date.now();
  const url = `http://${host}:${port}/api/v1/appointments/apt-001`;

  while (Date.now() - start < timeoutMs) {
    try {
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 200) {
        return;
      }
    } catch {
      // API not ready yet.
    }

    await wait(250);
  }

  throw new Error(`Timed out waiting for Core API on ${url}`);
}

export async function startCoreApiServer({
  port = 3300,
  token = 'local-test-token',
  timeoutMs = 20000,
} = {}) {
  const child = spawn('node', ['-r', '@swc-node/register', 'apps/core-api/src/main.ts'], {
    stdio: ['ignore', 'pipe', 'pipe'],
    env: {
      ...process.env,
      NODE_ENV: 'development',
      PORT: String(port),
    },
  });

  child.stdout.on('data', (chunk) => {
    process.stdout.write(`[core-api] ${chunk}`);
  });

  child.stderr.on('data', (chunk) => {
    process.stderr.write(`[core-api] ${chunk}`);
  });

  await waitForCoreApiReady({
    host: DEFAULT_HOST,
    port,
    token,
    timeoutMs,
  });

  return child;
}

export async function stopProcess(child) {
  if (!child || child.exitCode !== null) {
    return;
  }

  child.kill('SIGTERM');
  await wait(1000);

  if (child.exitCode === null) {
    child.kill('SIGKILL');
  }
}

export function runCommand(command, args, options = {}) {
  return new Promise((resolve, reject) => {
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
