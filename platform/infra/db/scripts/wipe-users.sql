-- Database User Wipe SQL Script
-- Run this on the VPS PostgreSQL server
-- WARNING: This will permanently delete ALL user data

-- Start transaction
BEGIN;

-- Delete child records first (respecting foreign key constraints)
DELETE FROM "password_reset_token";
DELETE FROM "merchant_session";
DELETE FROM "user_session";
DELETE FROM "membership";
DELETE FROM "tenant_membership";
DELETE FROM "raffle_entry";
DELETE FROM "cart_item";
DELETE FROM "cart";
DELETE FROM "sourcing_request";
DELETE FROM "upload" WHERE "createdByUserId" IS NOT NULL;
DELETE FROM "feedback";
DELETE FROM "support_message";
DELETE FROM "support_ticket_feedback";
DELETE FROM "ticket_message";
DELETE FROM "handoff_event";
DELETE FROM "support_ticket";
DELETE FROM "support_bot_feedback";
DELETE FROM "support_telemetry_event";
DELETE FROM "legal_acceptance";
DELETE FROM "analytics_events";
DELETE FROM "telemetry_event";
DELETE FROM "audit_event";
DELETE FROM "export_job";
DELETE FROM "approval_execution_log";
DELETE FROM "approval_request";

-- Finally delete the main User table
DELETE FROM "user";

-- Commit transaction
COMMIT;

-- Verify deletion
SELECT 'Users remaining: ' || COUNT(*)::text AS verification FROM "user";
