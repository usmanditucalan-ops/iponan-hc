-- Add active-state flag to users
ALTER TABLE "users"
ADD COLUMN "isActive" BOOLEAN NOT NULL DEFAULT true;

-- Ensure there is at most one active doctor
CREATE UNIQUE INDEX IF NOT EXISTS "users_single_active_doctor_idx"
ON "users" ("role")
WHERE "role" = 'DOCTOR' AND "isActive" = true;

-- Ensure a doctor exists before enforcing non-null appointment doctor assignment
DO $$
DECLARE
  v_doctor_id TEXT;
  v_null_appointments BIGINT;
BEGIN
  SELECT COUNT(*)
  INTO v_null_appointments
  FROM "appointments"
  WHERE "doctorId" IS NULL;

  IF v_null_appointments = 0 THEN
    RETURN;
  END IF;

  SELECT "id"
  INTO v_doctor_id
  FROM "users"
  WHERE "role" = 'DOCTOR' AND "isActive" = true
  ORDER BY "createdAt" ASC
  LIMIT 1;

  IF v_doctor_id IS NULL THEN
    RAISE EXCEPTION 'Migration requires one active DOCTOR user before enforcing appointments.doctorId NOT NULL when appointments have NULL doctorId values';
  END IF;

  UPDATE "appointments"
  SET "doctorId" = v_doctor_id
  WHERE "doctorId" IS NULL;
END $$;

-- Update FK to required relationship
ALTER TABLE "appointments" DROP CONSTRAINT IF EXISTS "appointments_doctorId_fkey";
ALTER TABLE "appointments"
  ALTER COLUMN "doctorId" SET NOT NULL;
ALTER TABLE "appointments"
  ADD CONSTRAINT "appointments_doctorId_fkey"
  FOREIGN KEY ("doctorId")
  REFERENCES "users"("id")
  ON DELETE RESTRICT
  ON UPDATE CASCADE;

-- Create audit logs table
CREATE TABLE "audit_logs" (
  "id" TEXT NOT NULL,
  "userId" TEXT,
  "action" TEXT NOT NULL,
  "entity" TEXT,
  "entityId" TEXT,
  "status" TEXT NOT NULL DEFAULT 'SUCCESS',
  "ipAddress" TEXT,
  "userAgent" TEXT,
  "details" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "audit_logs_action_createdAt_idx" ON "audit_logs"("action", "createdAt");
CREATE INDEX "audit_logs_entity_entityId_idx" ON "audit_logs"("entity", "entityId");

ALTER TABLE "audit_logs"
  ADD CONSTRAINT "audit_logs_userId_fkey"
  FOREIGN KEY ("userId")
  REFERENCES "users"("id")
  ON DELETE SET NULL
  ON UPDATE CASCADE;
