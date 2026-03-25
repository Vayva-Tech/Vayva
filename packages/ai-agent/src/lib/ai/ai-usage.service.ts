import { prisma } from "@vayva/db";
import { logger } from "../logger";

type LogUsageParams = {
    storeId: string;
    model: string;
    inputTokens: number;
    outputTokens: number;
    channel?: string;
    requestId?: string;
    conversationId?: string;
};

type CheckLimitsResult = {
    allowed: boolean;
    reason?: string;
    usage: {
        messagesUsed: number;
        messageLimit: number;
        isOverLimit: boolean;
        status: string;
        conversationMessagesUsed: number;
    };
};

/**
 * AI Usage & Metering Service (V3 - Message Centric & Addon Aware)
 */
export class AiUsageService {
    /**
     * Record an AI message interaction
     */
    static async logUsage(params: LogUsageParams): Promise<void> {
        const { storeId, model, inputTokens, outputTokens, channel = "WHATSAPP", requestId, conversationId } = params;
        try {
            // 1. Create ledger entry (Detailed audit)
            await prisma.aiUsageEvent?.create({
                data: {
                    storeId,
                    channel,
                    model,
                    inputTokens,
                    outputTokens,
                    requestId,
                    conversationId,
                    costEstimateKobo: BigInt(Math.floor((inputTokens + outputTokens) * 0.005)),
                },
            });
            // 2. Update Subscription Counters (Main billing source)
            await prisma.merchantAiSubscription?.updateMany({
                where: {
                    storeId,
                    status: {
                        in: ["TRIAL_ACTIVE", "TRIAL_EXPIRED_GRACE", "UPGRADED_ACTIVE"],
                    },
                },
                data: {
                    monthMessagesUsed: { increment: 1 },
                    monthTokensUsed: { increment: inputTokens + outputTokens },
                },
            });
            // 3. Update Daily Aggregate (For Charts)
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            await prisma.aiUsageDaily?.upsert({
                where: { storeId_date: { storeId, date: today } },
                update: {
                    requestsCount: { increment: 1 },
                    tokensCount: { increment: inputTokens + outputTokens },
                },
                create: {
                    storeId,
                    date: today,
                    requestsCount: 1,
                    tokensCount: inputTokens + outputTokens,
                },
            });
        }
        catch (error: unknown) {
            logger.error("[AiUsageService] Log failure", error, { storeId });
        }
    }
    /**
     * Check if a merchant is within their message limits (including add-ons)
     */
    static async checkLimits(storeId: string, conversationId?: string): Promise<CheckLimitsResult> {
        let conversationMessagesUsed = 0;
        if (conversationId) {
            try {
                conversationMessagesUsed = await prisma.aiUsageEvent?.count({
                    where: { storeId, conversationId },
                });
            }
            catch (error: unknown) {
                logger.error("[AiUsageService] Conversation usage lookup failed", error, { storeId, conversationId });
            }
        }
        const sub = await prisma.merchantAiSubscription?.findUnique({
            where: { storeId },
            include: { plan: true, addonPurchases: true },
        });
        if (!sub)
            return {
                allowed: false,
                reason: "No active AI subscription found.",
                usage: {
                    messagesUsed: 0,
                    messageLimit: 0,
                    isOverLimit: true,
                    status: "NONE",
                    conversationMessagesUsed,
                },
            };
        // 1. Hard closure (Abuse or explicit closure)
        if ((sub as any).status === "SOFT_CLOSED" || (sub as any).status === "BLOCKED") {
            const reason = (sub as any).status === "BLOCKED"
                ? "Account blocked for abuse."
                : "AI Agent Closed. Upgrade to reactivate.";
            return {
                allowed: false,
                reason,
                usage: {
                    messagesUsed: sub.monthMessagesUsed,
                    messageLimit: 0,
                    isOverLimit: true,
                    status: (sub as any).status,
                    conversationMessagesUsed,
                },
            };
        }
        // 2. Trial Expiry (Time-based or Grace-based)
        const now = new Date();
        if ((sub as any).status === "TRIAL_EXPIRED_GRACE" ||
            (sub.planKey === "STARTER" && sub.trialExpiresAt < now)) {
            return {
                allowed: false,
                reason: "Trial period has ended. Please upgrade to a Starter plan.",
                usage: {
                    messagesUsed: sub.monthMessagesUsed,
                    messageLimit: 0,
                    isOverLimit: true,
                    status: (sub as any).status,
                    conversationMessagesUsed,
                },
            };
        }
        // 3. Calculate dynamic limit: Plan Limit + All Addon Packs
        const planLimit = sub.planKey === "STARTER" ? 20 : sub.plan?.monthlyRequestLimit;
        const addonMessages = sub.addonPurchases?.reduce(
            (sum: number, addon) => sum + Number((addon as { creditsAdded?: number }).creditsAdded ?? 0),
            0,
        );
        const totalLimit = planLimit + addonMessages;
        const isOverLimit = sub.monthMessagesUsed >= totalLimit;
        const usage = {
            messagesUsed: sub.monthMessagesUsed,
            messageLimit: totalLimit,
            isOverLimit,
            status: (sub as any).status,
            conversationMessagesUsed,
        };
        if (isOverLimit) {
            const reason = sub.planKey === "STARTER"
                ? "Trial complete! Upgrade to Growth to keep selling on autopilot."
                : "Monthly limit reached. Buy an extra pack to continue.";
            return { allowed: false, reason, usage };
        }
        return { allowed: true, usage };
    }
    /**
     * Get usage statistics for the last N days
     */
    static async getUsageStats(storeId: string, days = 14) {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        startDate.setHours(0, 0, 0, 0);
        const dailyStats = await prisma.aiUsageDaily?.findMany({
            where: {
                storeId,
                date: { gte: startDate },
            },
            orderBy: { date: "asc" },
            select: {
                date: true,
                requestsCount: true,
                tokensCount: true,
            },
        });
        return dailyStats.map((stat) => ({
            date: stat.date?.toISOString().split("T")[0],
            totalRequests: stat.requestsCount,
            totalTokens: stat.tokensCount,
            totalCost: Math.floor(stat.tokensCount * 0.005), // Estimate in kobo
        }));
    }
}
