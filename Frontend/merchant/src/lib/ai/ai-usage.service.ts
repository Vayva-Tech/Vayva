import { prisma } from "@vayva/db";
import { logger } from "@/lib/logger";
/**
 * AI Usage & Metering Service (V3 - Message Centric & Addon Aware)
 */
export class AiUsageService {
    /**
     * Record an AI message interaction
     */
    static async logUsage(params: { storeId: string; model: string; inputTokens: number; outputTokens: number; channel?: string; requestId?: string }) {
        const { storeId, model, inputTokens, outputTokens, channel = "WHATSAPP", requestId } = params;
        try {
            // 1. Create ledger entry (Detailed audit)
            await prisma.aiUsageEvent.create({
                data: {
                    storeId,
                    channel,
                    model,
                    inputTokens,
                    outputTokens,
                    requestId,
                    costEstimateKobo: BigInt(Math.floor((inputTokens + outputTokens) * 0.005)),
                },
            });
            // 2. Update Subscription Counters (Main billing source)
            await prisma.merchantAiSubscription.updateMany({
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
            await prisma.aiUsageDaily.upsert({
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
        catch (error) {
            logger.error("[AiUsageService] Log failure", error, { storeId });
        }
    }
    /**
     * Check if a merchant is within their message limits (including add-ons)
     */
    static async checkLimits(storeId: string) {
        const sub = await prisma.merchantAiSubscription.findUnique({
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
                    status: "NONE" as const,
                },
            };
        // 1. Hard closure (abuse or explicit closure)
        if (sub.status === "SOFT_CLOSED") {
            return {
                allowed: false,
                reason: "AI Agent Closed. Upgrade to reactivate.",
                usage: {
                    messagesUsed: sub.monthMessagesUsed,
                    messageLimit: 0,
                    isOverLimit: true,
                    status: sub.status,
                },
            };
        }
        // 2. Trial Expiry (Time-based or Grace-based)
        const now = new Date();
        if (sub.status === "TRIAL_EXPIRED_GRACE" ||
            (sub.planKey === "STARTER" && sub.trialExpiresAt < now)) {
            return {
                allowed: false,
                reason: "Trial period has ended. Please upgrade to a Starter plan.",
                usage: {
                    messagesUsed: sub.monthMessagesUsed,
                    messageLimit: 0,
                    isOverLimit: true,
                    status: sub.status,
                },
            };
        }
        // 3. Calculate dynamic limit: Plan Limit + add-on credits (packs extend capacity)
        const planLimit = sub.planKey === "STARTER" ? 20 : sub.plan?.monthlyRequestLimit ?? 0;
        const addonCredits = sub.addonPurchases.reduce(
            (sum, addon) => sum + addon.creditsAdded,
            0,
        );
        const totalLimit = planLimit + addonCredits;
        const isOverLimit = sub.monthMessagesUsed >= totalLimit;
        const usage = {
            messagesUsed: sub.monthMessagesUsed,
            messageLimit: totalLimit,
            isOverLimit,
            status: sub.status,
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
        const dailyStats = await prisma.aiUsageDaily.findMany({
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
            date: stat.date.toISOString().split("T")[0],
            totalRequests: stat.requestsCount,
            totalTokens: stat.tokensCount,
            totalCost: Math.floor(stat.tokensCount * 0.005), // Estimate in kobo
        }));
    }
}
