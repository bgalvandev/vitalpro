-- Support the appointments collection endpoint, which always orders by start
-- time ascending (libs/appointments PrismaAppointmentRepository.list).
CREATE INDEX "appointments_starts_at_idx" ON "appointments" ("starts_at");
