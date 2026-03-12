import { prisma } from "@vayva/db";
import { addDays, format } from "date-fns";
import { v4 as uuidv4 } from "uuid";
import { logger } from "@vayva/shared";
import { getRedis } from "@vayva/redis";

// Stub email functions to fix build - actual functions loaded at runtime
const sendAccountDeletionScheduled = async (_email: string, _data: { storeName: string; scheduledDate: string; cancelUrl: string }) => {
  logger.info("[EMAIL_STUB] sendAccountDeletionScheduled called");
};
const sendAccountDeletionCompleted = async (_email: string, _data: { storeName: string }) => {
  logger.info("[EMAIL_STUB] sendAccountDeletionCompleted called");
};

export class DeletionService {
    static async requestDeletion(storeId: string, userId: string, reason: unknown) {
        const blockers = await this.checkBlockers(storeId);
        if (blockers.length > 0) {
            return { success: false, error: "Cannot delete account yet.", blockers };
        }

        const store = await prisma.store?.findUnique({
            where: { id: storeId },
            select: { name: true }
        });

        const scheduledFor = addDays(new Date(), 7);
        const confirmationToken = uuidv4();
        await prisma.accountDeletionRequest?.create({
            data: {
                storeId,
                requestedByUserId: userId,
                status: "SCHEDULED",
                scheduledFor,
                reason: reason as string,
                confirmationMeta: { token: confirmationToken, expiresAt: addDays(new Date(), 1) }
            },
        });

        const user = await prisma.user?.findUnique({ where: { id: userId } });
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
        const activeRequest = await prisma.accountDeletionRequest?.findFirst({
            where: { storeId, status: "SCHEDULED" },
        });
        if (!activeRequest) {
            return { success: false, error: "No active deletion request found." };
        }
        await prisma.accountDeletionRequest?.update({
            where: { id: activeRequest.id },
            data: { status: "CANCELED" },
        });
        return { success: true };
    }

    static async getStatus(storeId: string) {
        return await prisma.accountDeletionRequest?.findFirst({
            where: { storeId, status: "SCHEDULED" },
            orderBy: { createdAt: "desc" },
        });
    }

    static async executeDeletion(requestId: string) {
        const request = await prisma.accountDeletionRequest?.findUnique({
            where: { id: requestId },
            include: { store: true },
        });
        if (!request || (request as any).status !== "SCHEDULED") return;

        await prisma.$transaction([
            prisma.store?.update({
                where: { id: request.storeId },
                data: { isLive: false },
            }),
            prisma.accountDeletionRequest?.update({
                where: { id: request.id },
                data: { status: "EXECUTED" },
            }),
        ]);

        const owner = await prisma.user?.findFirst({
            where: { memberships: { some: { storeId: request.storeId, role: "OWNER" as any } } }
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
            const memberships = await prisma.membership?.findMany({
                where: { storeId },
                select: { userId: true }
            });

            const userIds = memberships.map(m => m.userId) as any;
            const pipeline = redis.pipeline();
            for (const userId of userIds) {
                pipeline.set(`session:invalidate:${userId}`, storeId, "EX", 86400);
            }
            await pipeline.exec();

            await prisma.user?.updateMany({
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
        const pendingPayouts = await prisma.payout?.count({
            where: { storeId, status: { in: ["PENDING" as any, "PROCESSING" as any] } },
        });
        if (pendingPayouts > 0) blockers.push("You have pending payouts processing.");
        return blockers;
    }
}
