-- ============================================
-- VAYVA AI CREDIT MODEL UPDATE - MIGRATION V2
-- ============================================
-- This migration updates the AI credit system to support:
-- 1. Multi-currency top-up packages (NGN, USD, EUR, GBP, KES, GHS, ZAR)
-- 2. Generous credit allocations (5,000 STARTER / 10,000 PRO)
-- 3. GPT-4o Mini as primary model
-- ============================================

-- BEGIN TRANSACTION
BEGIN;

-- 1. Add currency field to MerchantAiSubscription if not exists
DO $$ 
BEGIN 
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'MerchantAiSubscription' 
    AND column_name = 'currency'
  ) THEN
    ALTER TABLE "MerchantAiSubscription" 
    ADD COLUMN "currency" VARCHAR(3) NOT NULL DEFAULT 'NGN';
    
    RAISE NOTICE 'Added currency column to MerchantAiSubscription';
  ELSE
    RAISE NOTICE 'Column currency already exists in MerchantAiSubscription';
  END IF;
END $$;

-- 2. Update AiAddonPurchase to track currency and priceInCurrency
DO $$ 
BEGIN 
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'AiAddonPurchase' 
    AND column_name = 'currency'
  ) THEN
    ALTER TABLE "AiAddonPurchase" 
    ADD COLUMN "currency" VARCHAR(3) NOT NULL DEFAULT 'NGN',
    ADD COLUMN "priceInCurrency" DOUBLE PRECISION NOT NULL DEFAULT 0;
    
    RAISE NOTICE 'Added currency and priceInCurrency columns to AiAddonPurchase';
  ELSE
    RAISE NOTICE 'Columns already exist in AiAddonPurchase';
  END IF;
END $$;

-- 3. Create index on currency for faster queries
DO $$ 
BEGIN 
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE tablename = 'MerchantAiSubscription' 
    AND indexname = 'MerchantAiSubscription_currency_idx'
  ) THEN
    CREATE INDEX "MerchantAiSubscription_currency_idx" ON "MerchantAiSubscription"("currency");
    RAISE NOTICE 'Created index on MerchantAiSubscription.currency';
  END IF;
END $$;

-- 4. Create index on AiAddonPurchase currency
DO $$ 
BEGIN 
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE tablename = 'AiAddonPurchase' 
    AND indexname = 'AiAddonPurchase_currency_idx'
  ) THEN
    CREATE INDEX "AiAddonPurchase_currency_idx" ON "AiAddonPurchase"("currency");
    RAISE NOTICE 'Created index on AiAddonPurchase.currency';
  END IF;
END $$;

-- 5. Update existing records to default currency (NGN)
UPDATE "MerchantAiSubscription" 
SET currency = 'NGN' 
WHERE currency IS NULL OR currency = '';

UPDATE "AiAddonPurchase" 
SET currency = 'NGN' 
WHERE currency IS NULL OR currency = '';

RAISE NOTICE 'Updated existing records to default currency NGN';

-- COMMIT TRANSACTION
COMMIT;

-- ============================================
-- VERIFICATION QUERIES
-- ============================================
-- Run these after migration to verify success:

-- Check MerchantAiSubscription schema
-- SELECT column_name, data_type, column_default 
-- FROM information_schema.columns 
-- WHERE table_name = 'MerchantAiSubscription' 
-- ORDER BY ordinal_position;

-- Check AiAddonPurchase schema
-- SELECT column_name, data_type, column_default 
-- FROM information_schema.columns 
-- WHERE table_name = 'AiAddonPurchase' 
-- ORDER BY ordinal_position;

-- Count affected records
-- SELECT 
--   'MerchantAiSubscription' as table_name,
--   COUNT(*) as total_records,
--   COUNT(DISTINCT currency) as currencies_in_use
-- FROM "MerchantAiSubscription"
-- UNION ALL
-- SELECT 
--   'AiAddonPurchase' as table_name,
--   COUNT(*) as total_records,
--   COUNT(DISTINCT currency) as currencies_in_use
-- FROM "AiAddonPurchase";
