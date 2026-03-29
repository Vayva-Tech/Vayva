-- CreateEnum
CREATE TYPE "MerchantWorkflowStatus" AS ENUM ('draft', 'active', 'paused', 'archived');

-- CreateTable
CREATE TABLE "merchant_workflows" (
    "id" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "industry" TEXT NOT NULL,
    "trigger" JSONB NOT NULL,
    "nodes" JSONB NOT NULL,
    "edges" JSONB NOT NULL,
    "status" "MerchantWorkflowStatus" NOT NULL DEFAULT 'draft',
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT NOT NULL,
    "executionCount" INTEGER NOT NULL DEFAULT 0,
    "lastExecutedAt" TIMESTAMP(3),

    CONSTRAINT "merchant_workflows_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "merchant_workflows_storeId_idx" ON "merchant_workflows"("storeId");

-- CreateIndex
CREATE INDEX "merchant_workflows_storeId_status_idx" ON "merchant_workflows"("storeId", "status");

-- AddForeignKey
ALTER TABLE "merchant_workflows" ADD CONSTRAINT "merchant_workflows_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE CASCADE ON UPDATE CASCADE;
