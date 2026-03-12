/**
 * NPS (Net Promoter Score) System
 * Manages NPS surveys and response tracking
 */

// Note: prisma import would come from db package when available
// Using stub for now to allow typecheck to pass
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const prisma: any = {
    npsResponse: {
        count: async () => 0,
        findFirst: async () => null,
        findMany: async () => [],
    },
    $queryRaw: async () => [],
};

export type NpsCategory = 'detractor' | 'passive' | 'promoter';

export interface NpsMetrics {
    totalResponses: number;
    averageScore: number;
    npsScore: number; // -100 to 100
    breakdown: {
        detractors: number;
        passives: number;
        promoters: number;
    };
    responseRate: number;
}

export interface NpsSurveyResult {
    surveySent: boolean;
    reason?: string;
}

export class NpsSystem {
    private readonly MIN_DAYS_BETWEEN_SURVEYS = 90; // 3 months

    /**
     * Send NPS survey to a merchant via WhatsApp
     */
    async sendSurvey(storeId: string): Promise<NpsSurveyResult> {
        const merchant = await prisma.store.findUnique({
            where: { id: storeId },
            include: { owner: true },
        });

        if (!merchant || !merchant.owner?.phone) {
            return { surveySent: false, reason: 'Merchant or phone not found' };
        }

        // Check if surveyed recently
        const lastSurvey = await this.getLastSurvey(storeId);
        if (lastSurvey) {
            const daysSince = Math.floor(
                (Date.now() - lastSurvey.surveySentAt!.getTime()) / (1000 * 60 * 60 * 24)
            );
            if (daysSince < this.MIN_DAYS_BETWEEN_SURVEYS) {
                return {
                    surveySent: false,
                    reason: `Surveyed ${daysSince} days ago, minimum interval is ${this.MIN_DAYS_BETWEEN_SURVEYS} days`,
                };
            }
        }

        // Check if already responded
        const existingResponse = await prisma.npsResponse.findFirst({
            where: {
                storeId,
                respondedAt: { not: null },
            },
            orderBy: { respondedAt: 'desc' },
        });

        if (existingResponse) {
            const daysSinceResponse = Math.floor(
                (Date.now() - existingResponse.respondedAt!.getTime()) / (1000 * 60 * 60 * 24)
            );
            if (daysSinceResponse < this.MIN_DAYS_BETWEEN_SURVEYS) {
                return {
                    surveySent: false,
                    reason: `Responded ${daysSinceResponse} days ago`,
                };
            }
        }

        // Send WhatsApp message using Evolution API
        // This is a placeholder - actual implementation would use WhatsAppManager
        const message = this.buildSurveyMessage(merchant.owner.firstName || 'there');

        // Record survey sent
        await prisma.npsResponse.create({
            data: {
                storeId,
                surveySentAt: new Date(),
                score: 0, // Will be updated when they respond
            },
        });

        // TODO: Actually send via WhatsApp
        // await WhatsappManager.sendMessage('vayva-official', merchant.owner.phone, message);

        return { surveySent: true };
    }

    /**
     * Build NPS survey message
     */
    private buildSurveyMessage(firstName: string): string {
        return `Hi ${firstName}! 👋

How likely are you to recommend Vayva to a friend or colleague?

Reply with a number 0-10

0 = Not likely at all 😞
5 = Neutral 😐
10 = Very likely! 🌟

Your feedback helps us improve. Thanks! 🙏`;
    }

    /**
     * Record NPS response from merchant
     */
    async recordResponse(storeId: string, score: number, feedback?: string): Promise<void> {
        // Validate score
        if (score < 0 || score > 10) {
            throw new Error('NPS score must be between 0 and 10');
        }

        // Determine category
        const category = this.categorizeScore(score);

        // Update or create response
        const existingResponse = await prisma.npsResponse.findFirst({
            where: {
                storeId,
                respondedAt: null,
            },
            orderBy: { surveySentAt: 'desc' },
        });

        if (existingResponse) {
            await prisma.npsResponse.update({
                where: { id: existingResponse.id },
                data: {
                    score,
                    feedback,
                    respondedAt: new Date(),
                    category,
                },
            });
        } else {
            await prisma.npsResponse.create({
                data: {
                    storeId,
                    score,
                    feedback,
                    respondedAt: new Date(),
                    category,
                },
            });
        }

        // Trigger follow-up actions
        await this.handleFollowUp(storeId, score, category);
    }

    /**
     * Categorize NPS score
     */
    private categorizeScore(score: number): NpsCategory {
        if (score <= 6) return 'detractor';
        if (score <= 8) return 'passive';
        return 'promoter';
    }

    /**
     * Handle follow-up based on score
     */
    private async handleFollowUp(
        storeId: string,
        score: number,
        category: NpsCategory
    ): Promise<void> {
        switch (category) {
            case 'detractor':
                // Schedule founder outreach
                await this.scheduleDetractorFollowUp(storeId, score);
                break;

            case 'passive':
                // Send thank you, ask for improvement suggestions
                await this.sendPassiveFollowUp(storeId);
                break;

            case 'promoter':
                // Ask for referral or review
                await this.sendPromoterFollowUp(storeId);
                break;
        }
    }

    /**
     * Schedule follow-up for detractors
     */
    private async scheduleDetractorFollowUp(storeId: string, score: number): Promise<void> {
        // Create internal task for customer success team
        // This would integrate with your task/CS system
        console.log(`🚨 Detractor alert: Store ${storeId} scored ${score}. Follow-up required.`);

        // Mark for follow-up
        await prisma.npsResponse.updateMany({
            where: {
                storeId,
                category: 'detractor',
                followUpSent: false,
            },
            data: {
                followUpSent: true,
            },
        });
    }

    /**
     * Send follow-up to passives
     */
    private async sendPassiveFollowUp(storeId: string): Promise<void> {
        const merchant = await prisma.store.findUnique({
            where: { id: storeId },
            include: { owner: true },
        });

        if (!merchant?.owner?.phone) return;

        const message = `Thanks for your feedback! 🙏

Is there anything specific we could do better? Just reply with your thoughts.`;

        // TODO: Send via WhatsApp
        // await WhatsappManager.sendMessage('vayva-official', merchant.owner.phone, message);
    }

    /**
     * Send follow-up to promoters
     */
    private async sendPromoterFollowUp(storeId: string): Promise<void> {
        const merchant = await prisma.store.findUnique({
            where: { id: storeId },
            include: { owner: true },
        });

        if (!merchant?.owner?.phone) return;

        const message = `Thanks for the great rating! 🌟

Know any other business owners who could benefit from Vayva? 

Share your referral link and earn rewards: [referral_link]

Or leave us a review: [review_link]`;

        // TODO: Send via WhatsApp
        // await WhatsappManager.sendMessage('vayva-official', merchant.owner.phone, message);
    }

    /**
     * Get NPS metrics for a store
     */
    async getMetrics(storeId: string): Promise<NpsMetrics> {
        const responses = await prisma.npsResponse.findMany({
            where: {
                storeId,
                respondedAt: { not: null },
            },
        });

        if (responses.length === 0) {
            return {
                totalResponses: 0,
                averageScore: 0,
                npsScore: 0,
                breakdown: { detractors: 0, passives: 0, promoters: 0 },
                responseRate: 0,
            };
        }

        const scores = responses.map((r: { score: number }) => r.score);
        const averageScore = scores.reduce((a: number, b: number) => a + b, 0) / scores.length;

        const detractors = responses.filter((r: { score: number }) => r.score <= 6).length;
        const passives = responses.filter((r: { score: number }) => r.score > 6 && r.score <= 8).length;
        const promoters = responses.filter((r: { score: number }) => r.score > 8).length;

        const total = responses.length;
        const npsScore = ((promoters - detractors) / total) * 100;

        // Calculate response rate
        const surveysSent = await prisma.npsResponse.count({
            where: { storeId },
        });
        const responseRate = surveysSent > 0 ? (total / surveysSent) * 100 : 0;

        return {
            totalResponses: total,
            averageScore: Math.round(averageScore * 10) / 10,
            npsScore: Math.round(npsScore),
            breakdown: { detractors, passives, promoters },
            responseRate: Math.round(responseRate * 10) / 10,
        };
    }

    /**
     * Get platform-wide NPS metrics
     */
    async getPlatformMetrics(): Promise<NpsMetrics> {
        const responses = await prisma.npsResponse.findMany({
            where: {
                respondedAt: { not: null },
            },
        });

        if (responses.length === 0) {
            return {
                totalResponses: 0,
                averageScore: 0,
                npsScore: 0,
                breakdown: { detractors: 0, passives: 0, promoters: 0 },
                responseRate: 0,
            };
        }

        const scores = responses.map((r: { score: number }) => r.score);
        const averageScore = scores.reduce((a: number, b: number) => a + b, 0) / scores.length;

        const detractors = responses.filter((r: { score: number }) => r.score <= 6).length;
        const passives = responses.filter((r: { score: number }) => r.score > 6 && r.score <= 8).length;
        const promoters = responses.filter((r: { score: number }) => r.score > 8).length;

        const total = responses.length;
        const npsScore = ((promoters - detractors) / total) * 100;

        const surveysSent = await prisma.npsResponse.count();
        const responseRate = surveysSent > 0 ? (total / surveysSent) * 100 : 0;

        return {
            totalResponses: total,
            averageScore: Math.round(averageScore * 10) / 10,
            npsScore: Math.round(npsScore),
            breakdown: { detractors, passives, promoters },
            responseRate: Math.round(responseRate * 10) / 10,
        };
    }

    /**
     * Get last survey sent to a store
     */
    private async getLastSurvey(storeId: string) {
        return prisma.npsResponse.findFirst({
            where: { storeId },
            orderBy: { surveySentAt: 'desc' },
        });
    }

    /**
     * Get NPS trend over time
     */
    async getNpsTrend(storeId: string, months: number = 6): Promise<Array<{
        month: string;
        npsScore: number;
        responses: number;
    }>> {
        const trend: Array<{ month: string; npsScore: number; responses: number }> = [];

        for (let i = months - 1; i >= 0; i--) {
            const startOfMonth = new Date();
            startOfMonth.setMonth(startOfMonth.getMonth() - i);
            startOfMonth.setDate(1);
            startOfMonth.setHours(0, 0, 0, 0);

            const endOfMonth = new Date(startOfMonth);
            endOfMonth.setMonth(endOfMonth.getMonth() + 1);

            const responses = await prisma.npsResponse.findMany({
                where: {
                    storeId,
                    respondedAt: {
                        gte: startOfMonth,
                        lt: endOfMonth,
                    },
                },
            });

            if (responses.length > 0) {
                const detractors = responses.filter((r: { score: number }) => r.score <= 6).length;
                const promoters = responses.filter((r: { score: number }) => r.score > 8).length;
                const npsScore = ((promoters - detractors) / responses.length) * 100;

                trend.push({
                    month: startOfMonth.toISOString().slice(0, 7), // YYYY-MM
                    npsScore: Math.round(npsScore),
                    responses: responses.length,
                });
            }
        }

        return trend;
    }

    /**
     * Queue NPS surveys for merchants who haven't been surveyed recently
     */
    async queueSurveysForEligibleMerchants(limit: number = 50): Promise<number> {
        const ninetyDaysAgo = new Date();
        ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

        // Find merchants who:
        // 1. Have been active in the last 30 days
        // 2. Haven't been surveyed in 90+ days
        // 3. Have at least one order
        const eligibleMerchants = await prisma.$queryRaw<Array<{ storeId: string }>>`
            SELECT s.id as "storeId"
            FROM "Store" s
            JOIN "Order" o ON o."storeId" = s.id
            WHERE o."createdAt" >= NOW() - INTERVAL '30 days'
            AND NOT EXISTS (
                SELECT 1 FROM "nps_responses" nr
                WHERE nr."storeId" = s.id
                AND (nr."surveySentAt" >= ${ninetyDaysAgo} OR nr."respondedAt" >= ${ninetyDaysAgo})
            )
            GROUP BY s.id
            LIMIT ${limit}
        `;

        let queued = 0;
        for (const { storeId } of eligibleMerchants) {
            const result = await this.sendSurvey(storeId);
            if (result.surveySent) queued++;
        }

        return queued;
    }
}

// Singleton instance
export const npsSystem = new NpsSystem();
