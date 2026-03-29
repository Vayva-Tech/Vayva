-- Rename plan keys: STARTER (Free) → FREE, GROWTH (Starter paid) → STARTER
-- This migration is safe to run multiple times (idempotent)

-- 1. Rename old STARTER (Free plan) → FREE
UPDATE "Store" SET plan = 'FREE' WHERE plan = 'STARTER';

-- 2. Rename old GROWTH (Starter paid plan) → STARTER
UPDATE "Store" SET plan = 'STARTER' WHERE plan = 'GROWTH';

-- 3. Update AI subscription plan keys
UPDATE "MerchantAiSubscription" SET "planKey" = 'FREE' WHERE "planKey" = 'STARTER';
UPDATE "MerchantAiSubscription" SET "planKey" = 'STARTER' WHERE "planKey" = 'GROWTH';

-- 4. Update AI plan names (seed data)
UPDATE "AiPlan" SET name = 'FREE' WHERE name = 'STARTER';
UPDATE "AiPlan" SET name = 'STARTER' WHERE name = 'GROWTH';
