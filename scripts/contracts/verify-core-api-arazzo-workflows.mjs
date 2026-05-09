import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { runCommand, startCoreApiServer, stopProcess } from '../testing/core-api-runner.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const workspaceRoot = path.resolve(__dirname, '..', '..');

const port = Number(process.env.ARAZZO_PROVIDER_PORT ?? 3302);
const token = process.env.ARAZZO_PROVIDER_TOKEN ?? 'local-test-token';
const providerBaseUrl = `http://127.0.0.1:${port}`;
const workflowPath = path.resolve(
  workspaceRoot,
  'contracts/arazzo/core/appointments-retrieval.arazzo.yaml',
);
const redoclyCli = path.resolve(workspaceRoot, 'node_modules/.bin/redocly');

let server;

try {
  server = await startCoreApiServer({ port, token });

  await runCommand(redoclyCli, [
    'respect',
    workflowPath,
    '--workflow',
    'getExistingAppointment',
    '--server',
    `coreAppointmentsApi=${providerBaseUrl}`,
    '--input',
    `token=${token}`,
    '--input',
    'appointmentId=apt-001',
  ]);

  await runCommand(redoclyCli, [
    'respect',
    workflowPath,
    '--workflow',
    'getMissingAppointment',
    '--server',
    `coreAppointmentsApi=${providerBaseUrl}`,
    '--input',
    `token=${token}`,
    '--input',
    'appointmentId=apt-999',
  ]);
} finally {
  await stopProcess(server);
}
