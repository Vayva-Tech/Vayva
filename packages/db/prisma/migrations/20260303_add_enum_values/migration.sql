-- Create the DispatchJobStatus enum type
CREATE TYPE "DispatchJobStatus" AS ENUM ('CREATED', 'REQUESTED', 'ACCEPTED', 'ASSIGNED', 'PICKED_UP', 'IN_TRANSIT', 'DELIVERED', 'FAILED', 'CANCELLED');

-- Drop the default constraint first
ALTER TABLE "Shipment" ALTER COLUMN status DROP DEFAULT;

-- Convert Shipment.status from text to enum
-- First, ensure all existing values are valid or map them to valid values
UPDATE "Shipment" SET status = 'CREATED' WHERE status IS NULL OR status = '';
UPDATE "Shipment" SET status = 'CANCELLED' WHERE status = 'CANCELED';

-- Alter column type (this validates existing values against the enum)
ALTER TABLE "Shipment" ALTER COLUMN status TYPE "DispatchJobStatus" USING status::"DispatchJobStatus";

-- Add the default back
ALTER TABLE "Shipment" ALTER COLUMN status SET DEFAULT 'CREATED';

-- Create the AuditApp enum if not exists (check first)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'AuditApp') THEN
        CREATE TYPE "AuditApp" AS ENUM ('ops', 'merchant', 'storefront', 'payments', 'worker');
    ELSE
        -- Add worker value if enum exists
        ALTER TYPE "AuditApp" ADD VALUE IF NOT EXISTS 'worker';
    END IF;
END $$;
