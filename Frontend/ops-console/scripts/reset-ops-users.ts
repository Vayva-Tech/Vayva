#!/usr/bin/env tsx
/**
 * Reset Ops Console Users
 * 
 * Deletes all users from the OpsUser table.
 * Run this script to clear all ops console accounts before rebuild/review.
 */

import { prisma } from "@vayva/db";

async function deleteAllOpsUsers() {
  try {
    // Delete all related sessions first (foreign key constraint)
    const sessionsDeleted = await prisma.opsSession.deleteMany({});
    console.log(`✓ Deleted ${sessionsDeleted.count} ops sessions`);

    // Delete all related audit events
    const auditEventsDeleted = await prisma.opsAuditEvent.deleteMany({});
    console.log(`✓ Deleted ${auditEventsDeleted.count} ops audit events`);

    // Delete all ops users
    const usersDeleted = await prisma.opsUser.deleteMany({});
    console.log(`✓ Deleted ${usersDeleted.count} ops users`);

    console.log("\n✅ All ops console users have been deleted.");
    console.log("You can now run the bootstrap to create a fresh owner account.");
  } catch (error) {
    console.error("❌ Error deleting ops users:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

deleteAllOpsUsers();
