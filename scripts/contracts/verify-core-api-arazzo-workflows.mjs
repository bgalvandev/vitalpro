import path from 'node:path';
import { promises as fs } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { runCommand, startCoreApiServer, stopProcess } from '../testing/core-api-runner.mjs';
import { parse, stringify } from 'yaml';

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
const workflowRuntimePath = path.resolve(
  workspaceRoot,
  'tmp/arazzo/appointments-retrieval.runtime.arazzo.yaml',
);
const redoclyCli = path.resolve(workspaceRoot, 'node_modules/.bin/redocly');

async function prepareRespectCompatibleWorkflowSource() {
  const workflowRaw = await fs.readFile(workflowPath, 'utf8');
  const workflowDoc = parse(workflowRaw);

  if (workflowDoc && typeof workflowDoc === 'object' && workflowDoc.arazzo === '1.1.0') {
    workflowDoc.arazzo = '1.0.1';
  }

  if (workflowDoc && typeof workflowDoc === 'object' && Array.isArray(workflowDoc.sourceDescriptions)) {
    for (const sourceDescription of workflowDoc.sourceDescriptions) {
      if (
        sourceDescription &&
        typeof sourceDescription === 'object' &&
        sourceDescription.type === 'openapi' &&
        typeof sourceDescription.url === 'string'
      ) {
        sourceDescription.url = path.resolve(path.dirname(workflowPath), sourceDescription.url);
      }
    }
  }

  await fs.mkdir(path.dirname(workflowRuntimePath), { recursive: true });
  await fs.writeFile(workflowRuntimePath, stringify(workflowDoc), 'utf8');
}

let server;

try {
  await prepareRespectCompatibleWorkflowSource();
  server = await startCoreApiServer({ port, token });

  await runCommand(redoclyCli, [
    'respect',
    workflowRuntimePath,
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
    workflowRuntimePath,
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
