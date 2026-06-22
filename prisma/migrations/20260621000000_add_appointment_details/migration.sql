-- Add denormalized view fields consumed by the appointments collection endpoint.
-- Columns are NOT NULL: migrations run against an empty table in CI/fresh envs,
-- and local development recreates the volume via `pnpm run db:reset:local`.
ALTER TABLE "appointments"
  ADD COLUMN "service_name" TEXT NOT NULL,
  ADD COLUMN "client_name" TEXT NOT NULL,
  ADD COLUMN "starts_at" TIMESTAMP(3) NOT NULL,
  ADD COLUMN "duration_minutes" INTEGER NOT NULL;
