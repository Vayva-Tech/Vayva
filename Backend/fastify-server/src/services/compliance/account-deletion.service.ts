import { prisma, type PayoutStatus } from '@vayva/db';
import { addDays, format } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '@vayva/shared';
import { getRedis } from '@vayva/redis';

interface DeletionEmailService {
  sendScheduledEmail(email: string, data: { storeName: string; scheduledDate: string; cancelUrl: string }): Promise<void>;
  sendCompletedEmail(email: string, data: { storeName: string }): Promise<void>;
}

// Placeholder for email service - will use existing implementation
const deletionEmailService: DeletionEmailService = {
  async sendScheduledEmail(email: string, data: { storeName: string; scheduledDate: string; cancelUrl: string }) {
    // TODO: Integrate with ResendEmailService from frontend
    logger.info('[DELETION] Would send scheduled deletion email', { email, ...data });
  },
  async sendCompletedEmail(email: string, data: { storeName: string }) {
    // TODO: Integrate with ResendEmailService from frontend
    logger.info('[DELETION] Would send completion email', { email, ...data });
  },
};

export class AccountDeletionService {
  /**
   * Request account deletion for a store
   */
  async requestDeletion(storeId: string, userId: string, reason?: string) {
    try {
      // Check for blockers
      const blockers = await this.checkBlockers(storeId);
      if (blockers.length > 0) {
        return { 
          success: false, 
          error: 'Cannot delete account yet.',
          blockers 
        };
      }

      // Get store info
      const store = await prisma.store.findUnique({
        where: { id: storeId },
        select: { name: true },
      });

      if (!store) {
        return { success: false, error: 'Store not found' };
      }

      // Schedule deletion for 7 days from now
      const scheduledFor = addDays(new Date(), 7);
      const confirmationToken = uuidv4();

      // Create deletion request
      await prisma.accountDeletionRequest.create({
        data: {
          storeId,
          requestedByUserId: userId,
          status: 'SCHEDULED',
          scheduledFor,
          reason: reason || null,
          confirmationMeta: { 
            token: confirmationToken, 
            expiresAt: addDays(new Date(), 1) 
          },
        },
      });

      // Get user email and send notification
      const user = await prisma.user.findUnique({ 
        where: { id: userId },
        select: { email: true }
      });

      if (user?.email) {
        try {
          await deletionEmailService.sendScheduledEmail(user.email, {
            storeName: store.name,
            scheduledDate: format(scheduledFor, 'MMMM do, yyyy'),
            cancelUrl: `${process.env.NEXT_PUBLIC_MERCHANT_ADMIN_URL}/settings/account?cancelDeletion=true`,
          });
          logger.info('[DELETION] Confirmation email sent', { userId, storeId });
        } catch (emailError) {
          logger.error('[DELETION] Failed to send confirmation email', { 
            userId, 
            storeId, 
            error: emailError 
          });
          // Don't fail the request if email fails
        }
      }

      return { 
        success: true, 
        scheduledFor,
        message: 'Deletion scheduled. You will receive a confirmation email.'
      };
    } catch (error) {
      logger.error('[DELETION] Failed to request deletion', { 
        storeId, 
        userId, 
        error 
      });
      throw error;
    }
  }

  /**
   * Cancel pending deletion request
   */
  async cancelDeletion(storeId: string) {
    try {
      const activeRequest = await prisma.accountDeletionRequest.findFirst({
        where: { 
          storeId, 
          status: 'SCHEDULED' 
        },
      });

      if (!activeRequest) {
        return { 
          success: false, 
          error: 'No active deletion request found.' 
        };
      }

      await prisma.accountDeletionRequest.update({
        where: { id: activeRequest.id },
        data: { status: 'CANCELED' },
      });

      logger.info('[DELETION] Deletion request canceled', { storeId });
      return { success: true, message: 'Deletion canceled successfully' };
    } catch (error) {
      logger.error('[DELETION] Failed to cancel deletion', { storeId, error });
      throw error;
    }
  }

  /**
   * Get current deletion status for a store
   */
  async getStatus(storeId: string) {
    try {
      const deletionRequest = await prisma.accountDeletionRequest.findFirst({
        where: { storeId, status: 'SCHEDULED' },
        orderBy: { createdAt: 'desc' },
        include: {
          store: {
            select: {
              name: true,
            },
          },
        },
      });

      return {
        hasPendingDeletion: !!deletionRequest,
        scheduledFor: deletionRequest?.scheduledFor,
        storeName: deletionRequest?.store.name,
      };
    } catch (error) {
      logger.error('[DELETION] Failed to get deletion status', { storeId, error });
      throw error;
    }
  }

  /**
   * Execute deletion (background job)
   */
  async executeDeletion(requestId: string) {
    try {
      const request = await prisma.accountDeletionRequest.findUnique({
        where: { id: requestId },
        include: { store: true },
      });

      if (!request || request.status !== 'SCHEDULED') {
        logger.warn('[DELETION] Invalid deletion request', { requestId });
        return;
      }

      // Transaction to mark store as deleted and update request status
      await prisma.$transaction([
        prisma.store.update({
          where: { id: request.storeId },
          data: { isLive: false },
        }),
        prisma.accountDeletionRequest.update({
          where: { id: request.id },
          data: { status: 'EXECUTED' },
        }),
      ]);

      // Get owner email for completion notification
      const owner = await prisma.user.findFirst({
        where: {
          memberships: {
            some: { 
              storeId: request.storeId, 
              role_enum: 'OWNER' 
            },
          },
        },
        select: { email: true },
      });

      if (owner?.email) {
        try {
          await deletionEmailService.sendCompletedEmail(owner.email, {
            storeName: request.store?.name || 'Your store',
          });
        } catch (emailError) {
          logger.error('[DELETION] Failed to send completion email', { 
            ownerId: owner.id, 
            error: emailError 
          });
        }
      }

      // Invalidate all sessions
      await this.invalidateSessions(request.storeId);

      logger.info('[DELETION] Store deletion executed', { 
        storeId: request.storeId, 
        requestId 
      });
    } catch (error) {
      logger.error('[DELETION] Failed to execute deletion', { requestId, error });
      throw error;
    }
  }

  /**
   * Invalidate all user sessions for a store
   */
  private async invalidateSessions(storeId: string) {
    try {
      const redis = getRedis();
      
      const memberships = await prisma.membership.findMany({
        where: { storeId },
        select: { userId: true },
      });

      const userIds = memberships.map((m) => m.userId);
      
      if (userIds.length === 0) {
        return;
      }

      // Set invalidation flags in Redis
      const pipeline = redis.pipeline();
      for (const userId of userIds) {
        pipeline.set(`session:invalidate:${userId}`, storeId, 'EX', 86400);
      }
      await pipeline.exec();

      // Increment session versions to force re-authentication
      await prisma.user.updateMany({
        where: { id: { in: userIds } },
        data: { sessionVersion: { increment: 1 } },
      });

      logger.info('[DELETION] Sessions invalidated', { 
        storeId, 
        userCount: userIds.length 
      });
    } catch (error) {
      logger.error('[DELETION] Failed to invalidate sessions', { storeId, error });
      // Don't throw - session invalidation failure shouldn't block deletion
    }
  }

  /**
   * Check for blockers that prevent deletion
   */
  private async checkBlockers(storeId: string): Promise<string[]> {
    const blockers: string[] = [];

    try {
      // Check for pending payouts
      const pendingStatuses: PayoutStatus[] = ['PENDING'];
      const pendingPayouts = await prisma.payout.count({
        where: { 
          storeId, 
          status: { in: pendingStatuses } 
        },
      });

      if (pendingPayouts > 0) {
        blockers.push('You have pending payouts processing.');
      }

      // Additional checks can be added here:
      // - Active subscriptions
      // - Pending orders
      // - Outstanding balances
    } catch (error) {
      logger.error('[DELETION] Failed to check blockers', { storeId, error });
      // Don't block deletion if blocker check fails
    }

    return blockers;
  }
}
