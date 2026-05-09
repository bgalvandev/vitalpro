import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { runCommand, startCoreApiServer, stopProcess } from './core-api-runner.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const workspaceRoot = path.resolve(__dirname, '..', '..');

const port = Number(process.env.POSTMAN_API_PORT ?? 3300);
const token = process.env.POSTMAN_TOKEN ?? 'local-test-token';
const baseUrl = `http://127.0.0.1:${port}`;
const collectionPath = path.resolve(
  workspaceRoot,
  'postman/collections/core-appointments.postman_collection.json',
);
const environmentPath = path.resolve(
  workspaceRoot,
  'postman/environments/local.postman_environment.json',
);

let server;

try {
  server = await startCoreApiServer({ port, token });

  await runCommand(path.resolve(workspaceRoot, 'node_modules/.bin/newman'), [
    'run',
    collectionPath,
    '-e',
    environmentPath,
    '--env-var',
    `baseUrl=${baseUrl}`,
    '--env-var',
    `token=${token}`,
    '--bail',
  ]);
} finally {
  await stopProcess(server);
}
