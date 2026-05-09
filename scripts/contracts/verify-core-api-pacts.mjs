import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { Verifier } from '@pact-foundation/pact';

import { startCoreApiServer, stopProcess } from '../testing/core-api-runner.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const workspaceRoot = path.resolve(__dirname, '..', '..');

const port = Number(process.env.PACT_PROVIDER_PORT ?? 3301);
const token = process.env.PACT_PROVIDER_TOKEN ?? 'local-test-token';
const providerBaseUrl = `http://127.0.0.1:${port}`;
const pactPath = path.resolve(
  workspaceRoot,
  'contracts/pact/scheduling-client-vitalpro-core-api.json',
);

let server;

try {
  server = await startCoreApiServer({ port, token });

  const verifier = new Verifier({
    provider: 'VitalProCoreApi',
    providerBaseUrl,
    pactUrls: [pactPath],
    stateHandlers: {
      'appointment apt-001 exists': async () => undefined,
    },
  });

  await verifier.verifyProvider();
} finally {
  await stopProcess(server);
}
