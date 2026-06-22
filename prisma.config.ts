import 'dotenv/config';
import { defineConfig } from 'prisma/config';

// `DATABASE_URL` is read directly from the environment (loaded from `.env` via
// dotenv) instead of Prisma's eager `env()` helper. The eager helper throws when
// the variable is unset, which breaks `prisma generate` during `postinstall` on a
// fresh clone that has no `.env` yet. Commands that need a live connection
// (`migrate`, `studio`, `db seed`) still fail clearly when `DATABASE_URL` is unset.
export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'node prisma/seed.mjs',
  },
  datasource: {
    url: process.env.DATABASE_URL,
  },
});
