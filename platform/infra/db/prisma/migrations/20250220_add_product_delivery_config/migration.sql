-- Migration: Add deliveryConfig to Product model
-- Created: Feb 20, 2026

-- Add deliveryConfig column as nullable JSONB
ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "deliveryConfig" JSONB;

-- Create index for stores that filter by delivery type
CREATE INDEX IF NOT EXISTS "Product_deliveryConfig_idx" ON "Product" (("deliveryConfig"->>'type'));

COMMENT ON COLUMN "Product"."deliveryConfig" IS 'Per-product delivery configuration: {type: "free"|"flat"|"calculated", fee?: number, zones?: string[], requiresDelivery?: boolean}';
