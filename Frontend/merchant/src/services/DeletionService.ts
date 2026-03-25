import { prisma, type PayoutStatus } from "@vayva/db";
import { addDays, format } from "date-fns";
import { v4 as uuidv4 } from "uuid";
import { logger } from "@vayva/shared";
import { getRedis } from "@vayva/redis";
import { ResendEmailService } from "@/lib/email/resend";
import { wrapEmail } from "@/lib/email/layout";

// Email notification functions for account deletion
const sendAccountDeletionScheduled = async (email: string, data: { storeName: string; scheduledDate: string; cancelUrl: string }) => {
  try {
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
        "Account Deletion Scheduled"
      ),
    });
    logger.info("[DELETION] Scheduled deletion email sent successfully", { email });
  } catch (error) {
    logger.error("[DELETION] Failed to send scheduled deletion email", { email, error });
    throw error;
  }
};

const sendAccountDeletionCompleted = async (email: string, data: { storeName: string }) => {
  try {
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
        "Account Deletion Completed"
      ),
    });
    logger.info("[DELETION] Completion email sent successfully", { email });
  } catch (error) {
    logger.error("[DELETION] Failed to send completion email", { email, error });
    throw error;
  }
};

export class DeletionService {
    static async requestDeletion(storeId: string, userId: string, reason: unknown) {
        const blockers = await this.checkBlockers(storeId);
        if (blockers.length > 0) {
            return { success: false, error: "Cannot delete account yet.", blockers };
        }

        const store = await prisma.store.findUnique({
            where: { id: storeId },
            select: { name: true }
        });

        const scheduledFor = addDays(new Date(), 7);
        const confirmationToken = uuidv4();
        await prisma.accountDeletionRequest.create({
            data: {
                storeId,
                requestedByUserId: userId,
                status: "SCHEDULED",
                scheduledFor,
                reason: reason as string,
                confirmationMeta: { token: confirmationToken, expiresAt: addDays(new Date(), 1) }
            },
        });

        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (user?.email) {
            try {
                await sendAccountDeletionScheduled(user.email, {
                    storeName: store?.name || "Your store",
                    scheduledDate: format(scheduledFor, "MMMM do, yyyy"),
                    cancelUrl: `${process?.env?.NEXT_PUBLIC_MERCHANT_ADMIN_URL}/settings/account?cancelDeletion=true`,
                });
                logger.info("[DELETION] Confirmation email sent", { userId, storeId });
            } catch (emailError) {
                logger.error("[DELETION] Failed to send confirmation email", { userId, storeId, error: emailError });
            }
        }

        return { success: true, scheduledFor };
    }

    static async cancelDeletion(storeId: string) {
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

    static async getStatus(storeId: string) {
        return await prisma.accountDeletionRequest.findFirst({
            where: { storeId, status: "SCHEDULED" },
            orderBy: { createdAt: "desc" },
        });
    }

    static async executeDeletion(requestId: string) {
        const request = await prisma.accountDeletionRequest.findUnique({
            where: { id: requestId },
            include: { store: true },
        });
        if (!request || request.status !== "SCHEDULED") return;

        await prisma.$transaction([
            prisma.store.update({
                where: { id: request.storeId },
                data: { isLive: false },
            }),
            prisma.accountDeletionRequest.update({
                where: { id: request.id },
                data: { status: "EXECUTED" },
            }),
        ]);

        const owner = await prisma.user.findFirst({
            where: {
                memberships: {
                    some: { storeId: request.storeId, role_enum: "OWNER" },
                },
            },
        });
        if (owner?.email) {
            try {
                await sendAccountDeletionCompleted(owner.email, {
                    storeName: request.store?.name || "Your store",
                });
            } catch (emailError) {
                logger.error("[DELETION] Failed to send completion email", { ownerId: owner.id, error: emailError });
            }
        }

        await this.invalidateStoreSessions(request.storeId);
        logger.info("[DELETION] Store deletion executed", { storeId: request.storeId, requestId });
    }

    static async invalidateStoreSessions(storeId: string) {
        try {
            const redis = getRedis();
            const memberships = await prisma.membership.findMany({
                where: { storeId },
                select: { userId: true }
            });

            const userIds = memberships.map((m) => m.userId);
            const pipeline = redis.pipeline();
            for (const userId of userIds) {
                pipeline.set(`session:invalidate:${userId}`, storeId, "EX", 86400);
            }
            await pipeline.exec();

            await prisma.user.updateMany({
                where: { id: { in: userIds } },
                data: { sessionVersion: { increment: 1 } }
            });

            logger.info("[DELETION] Sessions invalidated", { storeId, userCount: userIds.length });
        } catch (error) {
            logger.error("[DELETION] Failed to invalidate sessions", { storeId, error });
        }
    }

    static async checkBlockers(storeId: string) {
        const blockers: string[] = [];
        const pendingStatuses: PayoutStatus[] = ["PENDING"];
        const pendingPayouts = await prisma.payout.count({
            where: { storeId, status: { in: pendingStatuses } },
        });
        if (pendingPayouts > 0) blockers.push("You have pending payouts processing.");
        return blockers;
    }
}
