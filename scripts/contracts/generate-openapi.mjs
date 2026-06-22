import { writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

// Generates the external OpenAPI contract from the Zod schemas declared on the
// Fastify routes (single source of truth). Run after changing API behavior:
//   pnpm run openapi:generate
const require = createRequire(import.meta.url);
require('@swc-node/register');

const { createCoreApiApp } = require('../../apps/core-api/src/interface/http/create-core-api-app.ts');

const here = dirname(fileURLToPath(import.meta.url));
const outputPath = resolve(here, '../../contracts/openapi/core/appointments.openapi.yaml');

const app = await createCoreApiApp({
  // Auth and data are irrelevant here: swagger() reads route schemas only.
  serviceToken: 'contract-generation-token',
  appointmentRepository: {
    async findById() {
      return null;
    },
    async list() {
      return [];
    },
  },
});

try {
  const yaml = app.swagger({ yaml: true });
  writeFileSync(outputPath, yaml);
  console.log(`OpenAPI contract written to ${outputPath}`);
} finally {
  await app.close();
}
