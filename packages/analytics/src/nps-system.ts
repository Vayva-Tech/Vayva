/**
 * NPS (Net Promoter Score) System
 * Manages customer satisfaction surveys and metrics
 */

import type { NpsMetrics } from './index';

export interface NpsResponse {
    id: string;
    storeId: string;
    score: number;
    feedback?: string;
    category: 'promoter' | 'passive' | 'detractor';
    createdAt: Date;
}

export class NpsSystem {
    private cache = new Map<string, { data: NpsMetrics; timestamp: number }>();
    private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

    /**
     * Get NPS metrics for a store
     */
    async getMetrics(storeId: string): Promise<NpsMetrics> {
        const cached = this.cache.get(storeId);
        if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
            return cached.data;
        }

        // Simulated metrics - would integrate with actual database
        const responsesCount = Math.floor(Math.random() * 500) + 100;
        const promoters = Math.floor(responsesCount * 0.6);
        const passives = Math.floor(responsesCount * 0.25);
        const detractors = responsesCount - promoters - passives;

        const score = Math.round(
            ((promoters - detractors) / responsesCount) * 100
        );

        const metrics: NpsMetrics = {
            score,
            promoters,
            passives,
            detractors,
            responsesCount,
        };

        this.cache.set(storeId, {
            data: metrics,
            timestamp: Date.now(),
        });

        return metrics;
    }

    /**
     * Get NPS trend over time
     */
    async getNpsTrend(storeId: string, months: number = 6) {
        const trend = [];
        const now = new Date();

        for (let i = months - 1; i >= 0; i--) {
            const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const period = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

            trend.push({
                period,
                score: Math.floor(Math.random() * 40) + 40, // Score between 40-80
                responsesCount: Math.floor(Math.random() * 200) + 50,
            });
        }

        return trend;
    }

    /**
     * Record an NPS response
     */
    async recordResponse(
        storeId: string,
        score: number,
        feedback?: string
    ): Promise<NpsResponse> {
        // Determine category
        let category: 'promoter' | 'passive' | 'detractor';
        if (score >= 9) {
            category = 'promoter';
        } else if (score >= 7) {
            category = 'passive';
        } else {
            category = 'detractor';
        }

        const response: NpsResponse = {
            id: `nps-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            storeId,
            score,
            feedback,
            category,
            createdAt: new Date(),
        };

        // Clear cache to force recalculation of metrics
        this.cache.delete(storeId);

        return response;
    }

    /**
     * Send NPS survey to customers
     */
    async sendSurvey(storeId: string) {
        // Would integrate with email/SMS service to send surveys
        return {
            success: true,
            message: 'Survey sent successfully',
            recipientsCount: Math.floor(Math.random() * 100) + 50,
        };
    }

    /**
     * Get platform-wide NPS metrics
     */
    async getPlatformMetrics() {
        const stores = Math.floor(Math.random() * 100) + 50;
        const totalResponses = Math.floor(Math.random() * 10000) + 5000;
        const avgScore = Math.floor(Math.random() * 30) + 50;

        return {
            averageScore: avgScore,
            totalResponses,
            activeStores: stores,
            trend: 'stable',
        };
    }
}

// Export singleton instance
export const npsSystem = new NpsSystem();
