-- AlterTable
ALTER TABLE "subprocessors" ADD COLUMN IF NOT EXISTS "id" TEXT DEFAULT cuid();

-- CreateTable
CREATE TABLE IF NOT EXISTS "subprocessor_audit_logs" (
    "id" TEXT NOT NULL DEFAULT cuid(),
    "subprocessor_id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "performed_by" TEXT NOT NULL,
    "performed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "changes" JSONB,

    CONSTRAINT "subprocessor_audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "cookie_consent_events" (
    "id" TEXT NOT NULL DEFAULT cuid(),
    "event_id" TEXT NOT NULL,
    "choice" TEXT NOT NULL,
    "functional" BOOLEAN NOT NULL DEFAULT false,
    "analytics" BOOLEAN NOT NULL DEFAULT false,
    "marketing" BOOLEAN NOT NULL DEFAULT false,
    "region" TEXT,
    "user_agent" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cookie_consent_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "accessibility_issues" (
    "id" TEXT NOT NULL DEFAULT cuid(),
    "issue_number" TEXT NOT NULL,
    "title" VARCHAR(500) NOT NULL,
    "category" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'reported',
    "wcag_criteria" VARCHAR(50),
    "description" TEXT NOT NULL,
    "workarounds" TEXT,
    "reported_by" VARCHAR(255),
    "reported_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "assigned_to" VARCHAR(255),
    "target_date" TIMESTAMP(3) NOT NULL,
    "resolved_date" TIMESTAMP(3),

    CONSTRAINT "accessibility_issues_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "issue_updates" (
    "id" TEXT NOT NULL DEFAULT cuid(),
    "issue_id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "author" VARCHAR(255) NOT NULL,
    "comment" TEXT NOT NULL,

    CONSTRAINT "issue_updates_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "subprocessor_audit_logs_subprocessor_id_idx" ON "subprocessor_audit_logs"("subprocessor_id");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "subprocessor_audit_logs_performed_at_idx" ON "subprocessor_audit_logs"("performed_at");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "cookie_consent_events_event_id_key" ON "cookie_consent_events"("event_id");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "cookie_consent_events_timestamp_idx" ON "cookie_consent_events"("timestamp");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "cookie_consent_events_choice_timestamp_idx" ON "cookie_consent_events"("choice", "timestamp");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "cookie_consent_events_region_timestamp_idx" ON "cookie_consent_events"("region", "timestamp");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "accessibility_issues_status_idx" ON "accessibility_issues"("status");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "accessibility_issues_severity_idx" ON "accessibility_issues"("severity");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "accessibility_issues_target_date_idx" ON "accessibility_issues"("target_date");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "accessibility_issues_category_idx" ON "accessibility_issues"("category");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "accessibility_issues_issue_number_idx" ON "accessibility_issues"("issue_number");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "issue_updates_issue_id_idx" ON "issue_updates"("issue_id");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "issue_updates_date_idx" ON "issue_updates"("date");

-- AddForeignKey
ALTER TABLE "subprocessor_audit_logs" ADD CONSTRAINT "subprocessor_audit_logs_subprocessor_id_fkey" FOREIGN KEY ("subprocessor_id") REFERENCES "subprocessors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "issue_updates" ADD CONSTRAINT "issue_updates_issue_id_fkey" FOREIGN KEY ("issue_id") REFERENCES "accessibility_issues"("id") ON DELETE CASCADE ON UPDATE CASCADE;
