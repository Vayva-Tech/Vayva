import { prisma } from '@vayva/db';
import { addDays } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';
import { timingSafeEqual } from 'crypto';
import { logger } from '../../lib/logger';

interface DeletionRequestResult {
  success: boolean;
  error?: string;
  scheduledFor?: Date;
  confirmationToken?: string;
  blockers?: string[];
}

export class DeletionService {
  constructor(private readonly db = prisma) {}

  /**
   * Safely compare two tokens to prevent timing attacks
   */
  private safeTokenEqual(a: string, b: string): boolean {
    const left = Buffer.from(a);
    const right = Buffer.from(b);
    if (left.length !== right.length) {
      return false;
    }
    return timingSafeEqual(left, right);
  }

  /**
   * Request account deletion for a store (owner only)
   * Enforces 7-day grace period and checks for blockers
   */
  async requestDeletion(
    storeId: string,
    userId: string,
    reason: string,
  ): Promise<DeletionRequestResult> {
    const activeRequest = await this.db.accountDeletionRequest.findFirst({
      where: { storeId, status: 'SCHEDULED' },
      orderBy: { createdAt: 'desc' },
    });

    if (activeRequest) {
      return {
        success: false,
        error: 'Deletion request already scheduled.',
        blockers: [],
        scheduledFor: activeRequest.scheduledFor,
      };
    }

    // Check blockers
    const blockers = await this.checkBlockers(storeId);
    if (blockers.length > 0) {
      return { success: false, error: 'Cannot delete account yet.', blockers };
    }

    // Create deletion request with 7-day grace period
    const scheduledFor = addDays(new Date(), 7);
    const requestId = uuidv4();
    const tokenSecret = uuidv4();

    await this.db.accountDeletionRequest.create({
      data: {
        id: requestId,
        storeId,
        requestedByUserId: userId,
        status: 'SCHEDULED',
        scheduledFor,
        reason,
        confirmationMeta: {
          tokenId: requestId,
          tokenSecret,
          expiresAt: addDays(new Date(), 1),
        },
      },
    });

    logger.info('[DELETION] Confirmation token generated', {
      userId,
      storeId,
      requestId,
    });

    return {
      success: true,
      scheduledFor,
      confirmationToken: `${requestId}.${tokenSecret}`,
    };
  }

  /**
   * Confirm deletion request with token
   * Validates token format, signature, and expiration
   */
  async confirmDeletion(token: string): Promise<DeletionRequestResult> {
    const cleanToken = token.trim();
    if (!cleanToken) {
      return { success: false, error: 'Confirmation token is required.' };
    }

    const [tokenId, providedTokenSecret, ...remainder] = cleanToken.split('.');
    if (!tokenId || !providedTokenSecret || remainder.length > 0) {
      return { success: false, error: 'Invalid confirmation token.' };
    }

    const request = await this.db.accountDeletionRequest.findUnique({
      where: { id: tokenId },
    });

    if (!request || request.status !== 'SCHEDULED') {
      return { success: false, error: 'Invalid confirmation token.' };
    }

    const meta = (request.confirmationMeta as
      | {
          tokenId?: string;
          tokenSecret?: string;
          expiresAt?: string | Date;
          confirmedAt?: string;
        }
      | null
      | undefined) ?? { tokenId };

    if (
      !meta.tokenSecret ||
      !this.safeTokenEqual(meta.tokenSecret, providedTokenSecret)
    ) {
      return { success: false, error: 'Invalid confirmation token.' };
    }

    const expiresAt =
      typeof meta.expiresAt === 'string' || meta.expiresAt instanceof Date
        ? new Date(meta.expiresAt)
        : null;

    if (expiresAt && !Number.isNaN(expiresAt.getTime()) && expiresAt < new Date()) {
      return { success: false, error: 'Confirmation token has expired.' };
    }

    if (meta.confirmedAt) {
      return {
        success: true,
        alreadyConfirmed: true,
        scheduledFor: request.scheduledFor,
      };
    }

    await this.db.accountDeletionRequest.update({
      where: { id: request.id },
      data: {
        confirmationMeta: {
          ...meta,
          confirmedAt: new Date().toISOString(),
        },
      },
    });

    return { success: true, scheduledFor: request.scheduledFor };
  }

  /**
   * Cancel pending deletion request
   */
  async cancelDeletion(storeId: string, userId: string): Promise<{ success: boolean; error?: string }> {
    const activeRequest = await this.db.accountDeletionRequest.findFirst({
      where: { storeId, status: 'SCHEDULED' },
    });

    if (!activeRequest) {
      return { success: false, error: 'No active deletion request found.' };
    }

    await this.db.accountDeletionRequest.update({
      where: { id: activeRequest.id },
      data: { status: 'CANCELED' },
    });

    return { success: true };
  }

  /**
   * Get current deletion status for a store
   */
  async getStatus(storeId: string) {
    return await this.db.accountDeletionRequest.findFirst({
      where: { storeId, status: 'SCHEDULED' },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Execute deletion logic (called by job worker)
   * Marks store offline and invalidates sessions
   */
  async executeDeletion(requestId: string): Promise<void> {
    const request = await this.db.accountDeletionRequest.findUnique({
      where: { id: requestId },
      include: { store: true },
    });

    if (!request || request.status !== 'SCHEDULED') return;

    // Soft delete / deactivate
    await this.db.$transaction([
      // Mark store as offline
      this.db.store.update({
        where: { id: request.storeId },
        data: { isLive: false },
      }),
      // Mark request as executed
      this.db.accountDeletionRequest.update({
        where: { id: request.id },
        data: { status: 'EXECUTED' },
      }),
    ]);

    // Invalidate sessions via Redis
    try {
      const redis = await this.getRedisClient();
      const sessionKeys = await redis.keys(`session:store:${request.storeId}:*`);
      if (sessionKeys.length > 0) {
        await redis.del(...sessionKeys);
        logger.info('[DELETION] Invalidated store sessions', {
          storeId: request.storeId,
          count: sessionKeys.length,
        });
      }

      // Also clear user sessions
      const userSessionKeys = await redis.keys(
        `session:user:*:store:${request.storeId}`,
      );
      if (userSessionKeys.length > 0) {
        await redis.del(...userSessionKeys);
        logger.info('[DELETION] Invalidated user sessions', {
          storeId: request.storeId,
          count: userSessionKeys.length,
        });
      }
    } catch (err) {
      logger.error('[DELETION] Failed to invalidate sessions', {
        error: err instanceof Error ? err.message : String(err),
        storeId: request.storeId,
      });
    }
  }

  /**
   * Check for blockers that prevent account deletion
   */
  async checkBlockers(storeId: string): Promise<string[]> {
    const blockers: string[] = [];

    // Check for pending payouts
    const pendingPayouts = await this.db.payout.count({
      where: { storeId, status: { in: ['PENDING'] } },
    });

    if (pendingPayouts > 0) {
      blockers.push('You have pending payouts processing.');
    }

    return blockers;
  }

  /**
   * Get Redis client (lazy initialization)
   */
  private async getRedisClient() {
    const { getRedis } = await import('@vayva/redis');
    return getRedis();
  }
}
