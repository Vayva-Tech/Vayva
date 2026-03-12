-- Customer Success Platform Schema
-- Phase 3 Implementation

-- ============================================================================
-- NPS Survey Table
-- ============================================================================

CREATE TABLE IF NOT EXISTS "nps_survey" (
    "id" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'sent',
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "respondedAt" TIMESTAMP(3),
    "score" INTEGER,
    "feedback" TEXT,
    "surveyType" TEXT NOT NULL DEFAULT 'scheduled',
    "followUpAction" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "nps_survey_pkey" PRIMARY KEY ("id")
);

-- Create indexes for NPS surveys
CREATE INDEX IF NOT EXISTS "nps_survey_storeId_idx" ON "nps_survey"("storeId");
CREATE INDEX IF NOT EXISTS "nps_survey_status_idx" ON "nps_survey"("status");
CREATE INDEX IF NOT EXISTS "nps_survey_sentAt_idx" ON "nps_survey"("sentAt");
CREATE INDEX IF NOT EXISTS "nps_survey_storeId_status_idx" ON "nps_survey"("storeId", "status");

-- Add foreign key constraint
ALTER TABLE "nps_survey" ADD CONSTRAINT "nps_survey_storeId_fkey" 
    FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ============================================================================
-- Playbook Execution Table
-- ============================================================================

CREATE TABLE IF NOT EXISTS "playbook_execution" (
    "id" TEXT NOT NULL,
    "playbookId" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "actionsExecuted" JSONB NOT NULL DEFAULT '[]',
    "error" TEXT,
    "triggerData" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "playbook_execution_pkey" PRIMARY KEY ("id")
);

-- Create indexes for playbook executions
CREATE INDEX IF NOT EXISTS "playbook_execution_storeId_idx" ON "playbook_execution"("storeId");
CREATE INDEX IF NOT EXISTS "playbook_execution_playbookId_idx" ON "playbook_execution"("playbookId");
CREATE INDEX IF NOT EXISTS "playbook_execution_status_idx" ON "playbook_execution"("status");
CREATE INDEX IF NOT EXISTS "playbook_execution_startedAt_idx" ON "playbook_execution"("startedAt");
CREATE INDEX IF NOT EXISTS "playbook_execution_storeId_playbookId_idx" ON "playbook_execution"("storeId", "playbookId");
CREATE INDEX IF NOT EXISTS "playbook_execution_storeId_startedAt_idx" ON "playbook_execution"("storeId", "startedAt");

-- Add foreign key constraint
ALTER TABLE "playbook_execution" ADD CONSTRAINT "playbook_execution_storeId_fkey" 
    FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ============================================================================
-- Health Score Enhancements (if not already present)
-- ============================================================================

-- Ensure HealthScore has proper indexes
CREATE INDEX IF NOT EXISTS "HealthScore_storeId_date_idx" ON "HealthScore"("storeId", "date" DESC);
CREATE INDEX IF NOT EXISTS "HealthScore_score_idx" ON "HealthScore"("score");

-- ============================================================================
-- Customer Success Tasks Table (for CSM task management)
-- ============================================================================

CREATE TABLE IF NOT EXISTS "customer_success_task" (
    "id" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "assigneeId" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "priority" TEXT NOT NULL DEFAULT 'medium',
    "status" TEXT NOT NULL DEFAULT 'open',
    "dueDate" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "completedById" TEXT,
    "playbookExecutionId" TEXT,
    "source" TEXT,
    "metadata" JSONB DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "customer_success_task_pkey" PRIMARY KEY ("id")
);

-- Create indexes for CS tasks
CREATE INDEX IF NOT EXISTS "customer_success_task_storeId_idx" ON "customer_success_task"("storeId");
CREATE INDEX IF NOT EXISTS "customer_success_task_assigneeId_idx" ON "customer_success_task"("assigneeId");
CREATE INDEX IF NOT EXISTS "customer_success_task_status_idx" ON "customer_success_task"("status");
CREATE INDEX IF NOT EXISTS "customer_success_task_priority_idx" ON "customer_success_task"("priority");
CREATE INDEX IF NOT EXISTS "customer_success_task_dueDate_idx" ON "customer_success_task"("dueDate");
CREATE INDEX IF NOT EXISTS "customer_success_task_storeId_status_idx" ON "customer_success_task"("storeId", "status");

-- Add foreign key constraints
ALTER TABLE "customer_success_task" ADD CONSTRAINT "customer_success_task_storeId_fkey" 
    FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "customer_success_task" ADD CONSTRAINT "customer_success_task_assigneeId_fkey" 
    FOREIGN KEY ("assigneeId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "customer_success_task" ADD CONSTRAINT "customer_success_task_completedById_fkey" 
    FOREIGN KEY ("completedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "customer_success_task" ADD CONSTRAINT "customer_success_task_playbookExecutionId_fkey" 
    FOREIGN KEY ("playbookExecutionId") REFERENCES "playbook_execution"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- ============================================================================
-- Customer Success Notes (for CSM interactions)
-- ============================================================================

CREATE TABLE IF NOT EXISTS "customer_success_note" (
    "id" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "category" TEXT DEFAULT 'general',
    "isPinned" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "customer_success_note_pkey" PRIMARY KEY ("id")
);

-- Create indexes for CS notes
CREATE INDEX IF NOT EXISTS "customer_success_note_storeId_idx" ON "customer_success_note"("storeId");
CREATE INDEX IF NOT EXISTS "customer_success_note_authorId_idx" ON "customer_success_note"("authorId");
CREATE INDEX IF NOT EXISTS "customer_success_note_createdAt_idx" ON "customer_success_note"("createdAt" DESC);
CREATE INDEX IF NOT EXISTS "customer_success_note_isPinned_idx" ON "customer_success_note"("isPinned");

-- Add foreign key constraints
ALTER TABLE "customer_success_note" ADD CONSTRAINT "customer_success_note_storeId_fkey" 
    FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "customer_success_note" ADD CONSTRAINT "customer_success_note_authorId_fkey" 
    FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
