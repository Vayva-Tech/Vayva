#!/usr/bin/env tsx
/**
 * Database User Wipe Script
 * 
 * This script wipes all user data from the database.
 * Run with: npx tsx scripts/wipe-users.ts
 */

import { prisma } from '../src/client';

async function wipeUsers() {
  console.log('🚨 Starting database user wipe...\n');

  try {
    // Delete child tables first (respecting foreign key constraints)
    
    console.log('1. Deleting PasswordResetTokens...');
    const passwordResetTokens = await prisma.passwordResetToken.deleteMany();
    console.log(`   ✅ Deleted ${passwordResetTokens.count} password reset tokens`);

    console.log('2. Deleting MerchantSessions...');
    const merchantSessions = await prisma.merchantSession.deleteMany();
    console.log(`   ✅ Deleted ${merchantSessions.count} merchant sessions`);

    console.log('3. Deleting UserSessions...');
    const userSessions = await prisma.userSession.deleteMany();
    console.log(`   ✅ Deleted ${userSessions.count} user sessions`);

    console.log('4. Deleting Memberships...');
    const memberships = await prisma.membership.deleteMany();
    console.log(`   ✅ Deleted ${memberships.count} memberships`);

    console.log('5. Deleting TenantMemberships...');
    const tenantMemberships = await prisma.tenantMembership.deleteMany();
    console.log(`   ✅ Deleted ${tenantMemberships.count} tenant memberships`);

    console.log('6. Deleting RaffleEntries (user relation)...');
    const raffleEntries = await prisma.raffleEntry.deleteMany();
    console.log(`   ✅ Deleted ${raffleEntries.count} raffle entries`);

    console.log('7. Deleting Carts (user relation)...');
    const carts = await prisma.cart.deleteMany();
    console.log(`   ✅ Deleted ${carts.count} carts`);

    console.log('8. Deleting SourcingRequests (user relation)...');
    const sourcingRequests = await prisma.sourcingRequest.deleteMany();
    console.log(`   ✅ Deleted ${sourcingRequests.count} sourcing requests`);

    console.log('9. Deleting Uploads (user relation)...');
    const uploads = await prisma.upload.deleteMany();
    console.log(`   ✅ Deleted ${uploads.count} uploads`);

    console.log('10. Deleting Feedback (user relation)...');
    const feedback = await prisma.feedback.deleteMany();
    console.log(`   ✅ Deleted ${feedback.count} feedback entries`);

    console.log('11. Deleting SupportMessages (user relation)...');
    const supportMessages = await prisma.supportMessage.deleteMany();
    console.log(`   ✅ Deleted ${supportMessages.count} support messages`);

    console.log('12. Deleting SupportTickets (assigned user)...');
    const supportTickets = await prisma.supportTicket.deleteMany();
    console.log(`   ✅ Deleted ${supportTickets.count} support tickets`);

    console.log('13. Deleting SupportTicketFeedback...');
    const ticketFeedback = await prisma.supportTicketFeedback.deleteMany();
    console.log(`   ✅ Deleted ${ticketFeedback.count} support ticket feedback`);

    console.log('14. Deleting CartItems...');
    const cartItems = await prisma.cartItem.deleteMany();
    console.log(`   ✅ Deleted ${cartItems.count} cart items`);

    console.log('15. Deleting LegalAcceptance...');
    const legalAcceptance = await prisma.legalAcceptance.deleteMany();
    console.log(`   ✅ Deleted ${legalAcceptance.count} legal acceptance records`);

    console.log('16. Deleting AnalyticsEvents (user relation)...');
    const analyticsEvents = await prisma.analyticsEvent.deleteMany();
    console.log(`   ✅ Deleted ${analyticsEvents.count} analytics events`);

    console.log('17. Deleting TelemetryEvents (user relation)...');
    const telemetryEvents = await prisma.telemetryEvent.deleteMany();
    console.log(`   ✅ Deleted ${telemetryEvents.count} telemetry events`);

    console.log('18. Deleting AuditEvents (user relation)...');
    const auditEvents = await prisma.auditEvent.deleteMany();
    console.log(`   ✅ Deleted ${auditEvents.count} audit events`);

    console.log('19. Deleting ExportJobs (user relation)...');
    const exportJobs = await prisma.exportJob.deleteMany();
    console.log(`   ✅ Deleted ${exportJobs.count} export jobs`);

    console.log('20. Deleting ApprovalExecutionLogs...');
    const approvalLogs = await prisma.approvalExecutionLog.deleteMany();
    console.log(`   ✅ Deleted ${approvalLogs.count} approval execution logs`);

    console.log('21. Deleting Approvals...');
    const approvals = await prisma.approval.deleteMany();
    console.log(`   ✅ Deleted ${approvals.count} approvals`);

    // Finally delete the main User table
    console.log('22. Deleting Users...');
    const users = await prisma.user.deleteMany();
    console.log(`   ✅ Deleted ${users.count} users`);

    console.log('\n🎉 Database user wipe completed successfully!');
    console.log('\nSummary:');
    console.log(`- ${users.count} users deleted`);
    console.log(`- ${memberships.count} memberships deleted`);
    console.log(`- ${merchantSessions.count} merchant sessions deleted`);
    console.log(`- ${userSessions.count} user sessions deleted`);
    console.log(`- ${passwordResetTokens.count} password reset tokens deleted`);
    console.log(`- ${tenantMemberships.count} tenant memberships deleted`);
    console.log(`- ${raffleEntries.count} raffle entries deleted`);
    console.log(`- ${carts.count} carts deleted`);
    console.log(`- ${cartItems.count} cart items deleted`);
    console.log(`- And ${approvalLogs.count + approvals.count + legalAcceptance.count + supportTickets.count + ticketFeedback.count + uploads.count + feedback.count + supportMessages.count + sourcingRequests.count + analyticsEvents.count + telemetryEvents.count + auditEvents.count + exportJobs.count} other related records deleted`);

  } catch (error) {
    console.error('\n❌ Error during user wipe:', error);
    throw error;
  }
}

// Run the wipe function
wipeUsers()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
