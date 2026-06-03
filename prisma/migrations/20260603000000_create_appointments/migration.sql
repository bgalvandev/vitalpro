CREATE TYPE "appointment_status" AS ENUM ('scheduled', 'completed', 'cancelled');

CREATE TABLE "appointments" (
  "id" TEXT NOT NULL,
  "status" "appointment_status" NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "appointments_pkey" PRIMARY KEY ("id")
);
