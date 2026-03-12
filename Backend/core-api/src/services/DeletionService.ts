import { prisma } from "@vayva/db";
import { addDays } from "date-fns";
import { v4 as uuidv4 } from "uuid";
import { timingSafeEqual } from "crypto";
import { logger } from "@vayva/shared";
import { getRedis } from "@vayva/redis";

function safeTokenEqual(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  if (left.length !== right.length) {
    return false;
  }
  return timingSafeEqual(left, right);
}
export class DeletionService {
  /**
   * Request Account Deletion (Owner Only)
   * - Enforces Grace Period (7 days)
   * - Checks for Blockers
   */
  static async requestDeletion(
    storeId: string,
    userId: string,
    reason: string,
  ) {
    const activeRequest = await prisma.accountDeletionRequest.findFirst({
      where: { storeId, status: "SCHEDULED" },
      orderBy: { createdAt: "desc" },
    });
    if (activeRequest) {
      return {
        success: false,
        error: "Deletion request already scheduled.",
        blockers: [],
        scheduledFor: activeRequest.scheduledFor,
      };
    }

    // 1. Check ownership
    // Assuming middleware covers it.
    // 2. Check Blockers
    const blockers = await this.checkBlockers(storeId);
    if (blockers.length > 0) {
      return { success: false, error: "Cannot delete account yet.", blockers };
    }
    // 3. Create Request
    const scheduledFor = addDays(new Date(), 7); // 7 Day Grace Period
    const requestId = uuidv4();
    const tokenSecret = uuidv4();
    await prisma.accountDeletionRequest.create({
      data: {
        id: requestId,
        storeId,
        requestedByUserId: userId,
        status: "SCHEDULED",
        scheduledFor,
        reason,
        confirmationMeta: {
          tokenId: requestId,
          tokenSecret,
          expiresAt: addDays(new Date(), 1),
        },
      },
    });
    // 4. Send Confirmation Email (Pendingbed for now)
    logger.info("[DELETION] Confirmation token generated", {
      userId,
      storeId,
      requestId,
    });
    // await EmailService.sendDeletionScheduled(...)
    return {
      success: true,
      scheduledFor,
      confirmationToken: `${requestId}.${tokenSecret}`,
    };
  }
  /**
   * Confirm Deletion with Token
   */
  static async confirmDeletion(token: string) {
    const cleanToken = token.trim();
    if (!cleanToken) {
      return { success: false, error: "Confirmation token is required." };
    }

    const [tokenId, providedTokenSecret, ...remainder] = cleanToken.split(".");
    if (!tokenId || !providedTokenSecret || remainder.length > 0) {
      return { success: false, error: "Invalid confirmation token." };
    }

    const request = await prisma.accountDeletionRequest.findUnique({
      where: { id: tokenId },
    });

    if (!request || request.status !== "SCHEDULED") {
      return { success: false, error: "Invalid confirmation token." };
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

    if (!meta.tokenSecret || !safeTokenEqual(meta.tokenSecret, providedTokenSecret)) {
      return { success: false, error: "Invalid confirmation token." };
    }

    const expiresAt =
      typeof meta.expiresAt === "string" || meta.expiresAt instanceof Date
        ? new Date(meta.expiresAt)
        : null;

    if (expiresAt && !Number.isNaN(expiresAt.getTime()) && expiresAt < new Date()) {
      return { success: false, error: "Confirmation token has expired." };
    }

    if (meta.confirmedAt) {
      return {
        success: true,
        alreadyConfirmed: true,
        scheduledFor: request.scheduledFor,
      };
    }

    await prisma.accountDeletionRequest.update({
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
   * Cancel Pending Deletion
   */
  static async cancelDeletion(storeId: string, _userId: string) {
    const activeRequest = await prisma.accountDeletionRequest.findFirst({
      where: { storeId, status: "SCHEDULED" },
    });
    if (!activeRequest) {
      return { success: false, error: "No active deletion request found." };
    }
    await prisma.accountDeletionRequest.update({
      where: { id: activeRequest.id },
      data: { status: "CANCELED" },
    });
    return { success: true };
  }
  /**
   * Get Current Deletion Status
   */
  static async getStatus(storeId: string) {
    return await prisma.accountDeletionRequest.findFirst({
      where: { storeId, status: "SCHEDULED" },
      orderBy: { createdAt: "desc" },
    });
  }
  /**
   * Execute Logic (To be called by Job Worker)
   */
  static async executeDeletion(requestId: string) {
    const request = await prisma.accountDeletionRequest.findUnique({
      where: { id: requestId },
      include: { store: true },
    });
    if (!request || request.status !== "SCHEDULED") return;
    // Soft Delete / Deactivate
    await prisma.$transaction([
      // 1. Mark Store as offline
      prisma.store.update({
        where: { id: request.storeId },
        data: { isLive: false },
      }),
      // 2. Mark Request as Executed
      prisma.accountDeletionRequest.update({
        where: { id: request.id },
        data: { status: "EXECUTED" },
      }),
    ]);
    // 3. Invalidate Sessions via Redis
    try {
      const redis = await getRedis();
      const sessionKeys = await redis.keys(`session:store:${request.storeId}:*`);
      if (sessionKeys.length > 0) {
        await redis.del(...sessionKeys);
        logger.info("[DELETION] Invalidated store sessions", {
          storeId: request.storeId,
          count: sessionKeys.length,
        });
      }
      // Also clear user sessions
      const userSessionKeys = await redis.keys(`session:user:*:store:${request.storeId}`);
      if (userSessionKeys.length > 0) {
        await redis.del(...userSessionKeys);
        logger.info("[DELETION] Invalidated user sessions", {
          storeId: request.storeId,
          count: userSessionKeys.length,
        });
      }
    } catch (err) {
      logger.error("[DELETION] Failed to invalidate sessions", {
        error: err instanceof Error ? err.message : String(err),
        storeId: request.storeId,
      });
    }
  }
  static async checkBlockers(storeId: string) {
    const blockers = [];
    // Check 1: Pending Payouts
    const pendingPayouts = await prisma.payout.count({
      where: { storeId, status: { in: ["PENDING"] } },
    });
    if (pendingPayouts > 0)
      blockers.push("You have pending payouts processing.");
    return blockers;
  }
}
