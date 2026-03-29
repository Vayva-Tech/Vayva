/**
 * Account Management Service
 *
 * Handles account deletion requests, scheduling, and execution
 * Ensures proper cleanup and data retention compliance
 */

import { prisma } from "@vayva/db";
import { logger } from "../../lib/logger";
import { addDays, format } from "date-fns";
import { v4 as uuidv4 } from "uuid";
import { getRedis } from "@vayva/redis";
import { ResendEmailService } from "@vayva/emails";
import { wrapEmail } from "@vayva/emails";

interface DeletionRequest {
  storeId: string;
  userId: string;
  reason?: string;
}

interface DeletionStatus {
  id: string;
  status: "SCHEDULED" | "CANCELED" | "EXECUTED";
  scheduledFor: Date;
  createdAt: Date;
}

export class AccountManagementService {
  /**
   * Request account deletion for a store
   * Schedules deletion for 7 days from now
   */
  static async requestDeletion({ storeId, userId, reason }: DeletionRequest) {
    try {
      // Check for blockers (pending payouts, etc.)
      const blockers = await this.checkBlockers(storeId);
      if (blockers.length > 0) {
        logger.warn("[AccountManagement] Deletion request blocked", {
          storeId,
          userId,
          blockers,
        });
        return {
          success: false,
          error: "Cannot delete account yet.",
          blockers,
        };
      }

      // Get store details
      const store = await prisma.store.findUnique({
        where: { id: storeId },
        select: { name: true },
      });

      // Schedule deletion for 7 days from now
      const scheduledFor = addDays(new Date(), 7);
      const confirmationToken = uuidv4();

      // Create deletion request
      const deletionRequest = await prisma.accountDeletionRequest.create({
        data: {
          storeId,
          requestedByUserId: userId,
          status: "SCHEDULED",
          scheduledFor,
          reason: reason || null,
          confirmationMeta: {
            token: confirmationToken,
            expiresAt: addDays(new Date(), 1),
          },
        },
      });

      // Send confirmation email to store owner
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { email: true },
      });

      if (user?.email) {
        try {
          await this.sendDeletionScheduledEmail(user.email, {
            storeName: store?.name || "Your store",
            scheduledDate: format(scheduledFor, "MMMM do, yyyy"),
            cancelUrl: `${process.env.NEXT_PUBLIC_MERCHANT_ADMIN_URL}/settings/account?cancelDeletion=true`,
          });
          logger.info("[AccountManagement] Deletion confirmation email sent", {
            userId,
            storeId,
          });
        } catch (emailError) {
          logger.error(
            "[AccountManagement] Failed to send confirmation email",
            {
              userId,
              storeId,
              error: emailError,
            },
          );
          // Don't fail the request if email fails
        }
      }

      logger.info("[AccountManagement] Deletion request created", {
        requestId: deletionRequest.id,
        storeId,
        userId,
        scheduledFor,
      });

      return {
        success: true,
        scheduledFor,
        requestId: deletionRequest.id,
      };
    } catch (error) {
      logger.error("[AccountManagement] Failed to request deletion", {
        storeId,
        userId,
        error,
      });
      throw error;
    }
  }

  /**
   * Cancel a scheduled deletion
   */
  static async cancelDeletion(storeId: string) {
    try {
      const activeRequest = await prisma.accountDeletionRequest.findFirst({
        where: {
          storeId,
          status: "SCHEDULED",
        },
      });

      if (!activeRequest) {
        logger.warn("[AccountManagement] No active deletion request found", {
          storeId,
        });
        return {
          success: false,
          error: "No active deletion request found",
        };
      }

      await prisma.accountDeletionRequest.update({
        where: { id: activeRequest.id },
        data: { status: "CANCELED" },
      });

      logger.info("[AccountManagement] Deletion canceled", {
        storeId,
        requestId: activeRequest.id,
      });

      return { success: true };
    } catch (error) {
      logger.error("[AccountManagement] Failed to cancel deletion", {
        storeId,
        error,
      });
      throw error;
    }
  }

  /**
   * Get current deletion status for a store
   */
  static async getStatus(storeId: string): Promise<DeletionStatus | null> {
    try {
      const deletionRequest = await prisma.accountDeletionRequest.findFirst({
        where: {
          storeId,
          status: "SCHEDULED",
        },
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          status: true,
          scheduledFor: true,
          createdAt: true,
        },
      });

      return deletionRequest;
    } catch (error) {
      logger.error("[AccountManagement] Failed to get deletion status", {
        storeId,
        error,
      });
      throw error;
    }
  }

  /**
   * Execute scheduled deletion
   * Called by cron job or worker when scheduledFor date is reached
   */
  static async executeDeletion(requestId: string) {
    try {
      const request = await prisma.accountDeletionRequest.findUnique({
        where: { id: requestId },
        include: { store: true },
      });

      if (!request || request.status !== "SCHEDULED") {
        logger.warn(
          "[AccountManagement] Invalid deletion request for execution",
          {
            requestId,
          },
        );
        return;
      }

      // Unpublish store
      await prisma.store.update({
        where: { id: request.storeId },
        data: { isLive: false },
      });

      // Mark as executed
      await prisma.accountDeletionRequest.update({
        where: { id: request.id },
        data: { status: "EXECUTED" },
      });

      // Find store owner
      const owner = await prisma.user.findFirst({
        where: {
          memberships: {
            some: {
              storeId: request.storeId,
              role_enum: "OWNER",
            },
          },
        },
        select: { email: true, id: true },
      });

      // Send completion email
      if (owner?.email) {
        try {
          await this.sendDeletionCompletedEmail(owner.email, {
            storeName: request.store?.name || "Your store",
          });
          logger.info("[AccountManagement] Completion email sent", {
            ownerId: owner.id,
          });
        } catch (emailError) {
          logger.error("[AccountManagement] Failed to send completion email", {
            ownerId: owner.id,
            error: emailError,
          });
        }
      }

      // Invalidate all user sessions for this store
      await this.invalidateStoreSessions(request.storeId);

      logger.info("[AccountManagement] Store deletion executed successfully", {
        storeId: request.storeId,
        requestId,
      });
    } catch (error) {
      logger.error("[AccountManagement] Failed to execute deletion", {
        requestId,
        error,
      });
      throw error;
    }
  }

  /**
   * Invalidate Redis sessions and bump session version
   */
  static async invalidateStoreSessions(storeId: string) {
    try {
      const redis = getRedis();

      // Get all users with access to this store
      const memberships = await prisma.membership.findMany({
        where: { storeId },
        select: { userId: true },
      });

      const userIds = memberships.map((m) => m.userId);

      // Invalidate Redis sessions
      const pipeline = redis.pipeline();
      for (const userId of userIds) {
        pipeline.set(
          `session:invalidate:${userId}`,
          storeId,
          "EX",
          86400, // 24 hours
        );
      }
      await pipeline.exec();

      // Bump session version in database
      await prisma.user.updateMany({
        where: {
          id: { in: userIds },
        },
        data: {
          sessionVersion: { increment: 1 },
        },
      });

      logger.info("[AccountManagement] Sessions invalidated", {
        storeId,
        userCount: userIds.length,
      });
    } catch (error) {
      logger.error("[AccountManagement] Failed to invalidate sessions", {
        storeId,
        error,
      });
      // Don't throw - session invalidation failure shouldn't block deletion
    }
  }

  /**
   * Check for deletion blockers
   */
  static async checkBlockers(storeId: string): Promise<string[]> {
    try {
      const blockers: string[] = [];

      // Check for pending payouts
      const pendingPayouts = await prisma.payout.count({
        where: {
          storeId,
          status: { in: ["PENDING"] },
        },
      });

      if (pendingPayouts > 0) {
        blockers.push("You have pending payouts processing.");
      }

      // TODO: Add more blockers as needed
      // - Pending orders that haven't been fulfilled
      // - Outstanding balances or fees
      // - Active subscriptions with unpaid invoices

      logger.debug("[AccountManagement] Blockers checked", {
        storeId,
        blockerCount: blockers.length,
      });

      return blockers;
    } catch (error) {
      logger.error("[AccountManagement] Failed to check blockers", {
        storeId,
        error,
      });
      return [];
    }
  }

  /**
   * Email: Deletion Scheduled
   */
  private static async sendDeletionScheduledEmail(
    email: string,
    data: {
      storeName: string;
      scheduledDate: string;
      cancelUrl: string;
    },
  ) {
    await ResendEmailService.sendTransactionalEmail({
      to: email,
      subject: `Account Deletion Scheduled - ${data.storeName}`,
      html: wrapEmail(
        `
          <p>Hello,</p>
          <p>Your account deletion request for <strong>${data.storeName}</strong> has been scheduled.</p>
          <p><strong>Scheduled Date:</strong> ${data.scheduledDate}</p>
          <p>If you change your mind, you can cancel the deletion before this date:</p>
          <p><a href="${data.cancelUrl}" style="background-color: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 16px 0;">Cancel Deletion</a></p>
          <p>After this date, all your store data will be permanently deleted and cannot be recovered.</p>
          <p>If you didn't request this deletion, please contact our support team immediately.</p>
          <p>Best regards,<br/>The Vayva Team</p>
        `,
        "Account Deletion Scheduled",
      ),
    });
  }

  /**
   * Email: Deletion Completed
   */
  private static async sendDeletionCompletedEmail(
    email: string,
    data: { storeName: string },
  ) {
    await ResendEmailService.sendTransactionalEmail({
      to: email,
      subject: `Account Deletion Completed - ${data.storeName}`,
      html: wrapEmail(
        `
          <p>Hello,</p>
          <p>Your account for <strong>${data.storeName}</strong> has been successfully deleted.</p>
          <p>All your store data, including products, orders, and customer information, has been permanently removed from our systems.</p>
          <p>If you have any questions or need assistance in the future, please don't hesitate to reach out to us.</p>
          <p>We hope to serve you again someday.</p>
          <p>Best regards,<br/>The Vayva Team</p>
        `,
        "Account Deletion Completed",
      ),
    });
  }
}
