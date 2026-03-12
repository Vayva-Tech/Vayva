-- Align audit_log table to match Prisma schema
-- The existing table has different column names than what the Prisma schema expects.
-- Strategy: Add the missing columns, then backfill from old columns where possible.

-- Add missing columns
ALTER TABLE "audit_log" ADD COLUMN IF NOT EXISTS "actorUserId" TEXT;
ALTER TABLE "audit_log" ADD COLUMN IF NOT EXISTS "actorEmail" TEXT;
ALTER TABLE "audit_log" ADD COLUMN IF NOT EXISTS "actorRole" TEXT;
ALTER TABLE "audit_log" ADD COLUMN IF NOT EXISTS "app" TEXT NOT NULL DEFAULT 'ops';
ALTER TABLE "audit_log" ADD COLUMN IF NOT EXISTS "targetType" TEXT NOT NULL DEFAULT 'system';
ALTER TABLE "audit_log" ADD COLUMN IF NOT EXISTS "targetId" TEXT NOT NULL DEFAULT '';
ALTER TABLE "audit_log" ADD COLUMN IF NOT EXISTS "targetStoreId" TEXT;
ALTER TABLE "audit_log" ADD COLUMN IF NOT EXISTS "severity" TEXT NOT NULL DEFAULT 'INFO';
ALTER TABLE "audit_log" ADD COLUMN IF NOT EXISTS "ip" TEXT;
ALTER TABLE "audit_log" ADD COLUMN IF NOT EXISTS "requestId" TEXT NOT NULL DEFAULT '';
ALTER TABLE "audit_log" ADD COLUMN IF NOT EXISTS "metadata" JSONB NOT NULL DEFAULT '{}';

-- Backfill from old columns where possible
UPDATE "audit_log" SET "actorUserId" = "actorId" WHERE "actorUserId" IS NULL AND "actorId" IS NOT NULL;
UPDATE "audit_log" SET "targetType" = "entityType" WHERE "entityType" IS NOT NULL AND "targetType" = 'system';
UPDATE "audit_log" SET "targetId" = "entityId" WHERE "entityId" IS NOT NULL AND "targetId" = '';
UPDATE "audit_log" SET "targetStoreId" = "storeId" WHERE "storeId" IS NOT NULL AND "targetStoreId" IS NULL;
UPDATE "audit_log" SET "ip" = "ipAddress" WHERE "ipAddress" IS NOT NULL AND "ip" IS NULL;
UPDATE "audit_log" SET "requestId" = "correlationId" WHERE "correlationId" IS NOT NULL AND "requestId" = '';
UPDATE "audit_log" SET "metadata" = COALESCE("beforeState", '{}') WHERE "metadata" = '{}' AND "beforeState" IS NOT NULL;

-- Create indexes to match Prisma schema
CREATE INDEX IF NOT EXISTS "audit_log_targetStoreId_createdAt_idx" ON "audit_log" ("targetStoreId", "createdAt");
CREATE INDEX IF NOT EXISTS "audit_log_actorUserId_createdAt_idx" ON "audit_log" ("actorUserId", "createdAt");
CREATE INDEX IF NOT EXISTS "audit_log_action_createdAt_idx" ON "audit_log" ("action", "createdAt");
CREATE UNIQUE INDEX IF NOT EXISTS "audit_log_requestId_action_targetId_key" ON "audit_log" ("requestId", "action", "targetId");
