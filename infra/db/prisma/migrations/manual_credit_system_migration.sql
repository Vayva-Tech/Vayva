-- Credit System & Trial Management Migration
-- Run this manually on local database

-- Create CreditAllocation table
CREATE TABLE IF NOT EXISTS "CreditAllocation" (
    "id" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "plan" TEXT NOT NULL,
    "monthlyCredits" INTEGER NOT NULL,
    "usedCredits" INTEGER NOT NULL DEFAULT 0,
    "resetDate" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CreditAllocation_pkey" PRIMARY KEY ("id")
);

-- Create CreditUsageLog table
CREATE TABLE IF NOT EXISTS "CreditUsageLog" (
    "id" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "feature" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CreditUsageLog_pkey" PRIMARY KEY ("id")
);

-- Add trial fields to Store table
ALTER TABLE "Store" 
ADD COLUMN IF NOT EXISTS "trialStartDate" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "trialEndDate" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "trialExpired" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS "ownedTemplates" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- Create unique index for CreditAllocation
CREATE UNIQUE INDEX IF NOT EXISTS "CreditAllocation_storeId_key" ON "CreditAllocation"("storeId");

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS "CreditAllocation_plan_idx" ON "CreditAllocation"("plan");
CREATE INDEX IF NOT EXISTS "CreditAllocation_resetDate_idx" ON "CreditAllocation"("resetDate");
CREATE INDEX IF NOT EXISTS "CreditUsageLog_storeId_idx" ON "CreditUsageLog"("storeId");
CREATE INDEX IF NOT EXISTS "CreditUsageLog_feature_idx" ON "CreditUsageLog"("feature");
CREATE INDEX IF NOT EXISTS "CreditUsageLog_createdAt_idx" ON "CreditUsageLog"("createdAt");

-- Add foreign key constraints
ALTER TABLE "CreditAllocation" 
ADD CONSTRAINT "CreditAllocation_storeId_fkey" 
FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "CreditUsageLog" 
ADD CONSTRAINT "CreditUsageLog_storeId_fkey" 
FOREIGN KEY ("storeId") REFERENCES "CreditAllocation"("storeId") ON DELETE CASCADE ON UPDATE CASCADE;
