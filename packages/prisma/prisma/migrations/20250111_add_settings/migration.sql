-- CreateTable
CREATE TABLE IF NOT EXISTS "Settings" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "business" JSONB NOT NULL DEFAULT '{}',
    "industry" JSONB NOT NULL DEFAULT '{}',
    "dashboard" JSONB NOT NULL DEFAULT '{}',
    "ai" JSONB NOT NULL DEFAULT '{}',
    "notifications" JSONB NOT NULL DEFAULT '{}',
    "user" JSONB NOT NULL DEFAULT '{}',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Settings_active_idx" ON "Settings"("active");

-- CreateIndex
CREATE INDEX "Settings_updatedAt_idx" ON "Settings"("updatedAt");
