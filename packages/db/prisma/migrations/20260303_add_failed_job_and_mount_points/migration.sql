-- CreateEnum
CREATE TYPE "JobStatus" AS ENUM ('FAILED', 'RETRIED', 'RESOLVED');

-- CreateTable
CREATE TABLE "failed_job" (
    "id" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "jobName" TEXT NOT NULL,
    "queueName" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "stack" TEXT,
    "data" TEXT NOT NULL,
    "attemptsMade" INTEGER NOT NULL,
    "status" "JobStatus" NOT NULL DEFAULT 'FAILED',
    "failedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "retriedAt" TIMESTAMP(3),
    "resolvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "failed_job_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "addon_mount_point" (
    "id" TEXT NOT NULL,
    "addOnId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "required" BOOLEAN NOT NULL DEFAULT false,
    "multiple" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "addon_mount_point_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "failed_job_status_failedAt_idx" ON "failed_job"("status", "failedAt");

-- CreateIndex
CREATE INDEX "failed_job_queueName_status_idx" ON "failed_job"("queueName", "status");

-- CreateIndex
CREATE INDEX "failed_job_jobName_status_idx" ON "failed_job"("jobName", "status");

-- CreateIndex
CREATE INDEX "addon_mount_point_addOnId_idx" ON "addon_mount_point"("addOnId");
