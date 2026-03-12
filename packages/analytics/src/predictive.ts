/**
 * Predictive Analytics Service
 * Uses AI and statistical models to predict future outcomes
 */

// Note: prisma import would come from db package when available
// Using stub for now to allow typecheck to pass
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const prisma: any = {
    store: { findUnique: async () => null },
    merchantSession: { findFirst: async () => null },
    order: { findMany: async () => [], count: async () => 0, aggregate: async () => ({ _sum: { total: 0 } }) },
    supportTicket: { count: async () => 0 },
    conversation: { count: async () => 0 },
    product: { count: async () => 0 },
    discountRule: { count: async () => 0 },
    customDomain: { count: async () => 0 },
    storeTemplateSelection: { count: async () => 0 },
    deliveryProfile: { count: async () => 0 },
    paymentAccount: { count: async () => 0 },
    orderItem: { aggregate: async () => ({ _sum: { quantity: 0 } }) },
    predictiveInsight: { create: async () => ({}), findMany: async () => [], update: async () => ({}) },
};
// Note: groq import would come from ai-agent package when available
// For now, using placeholder that accepts the expected parameters
const groq = {
    chat: {
        completions: {
            create: async (_params: unknown) => ({
                choices: [{ message: { content: '{"riskScore": 50, "riskLevel": "medium", "factors": [], "recommendedAction": ""}' } }]
            })
        }
    }
};

export type InsightType = 'churn_risk' | 'inventory_forecast' | 'revenue_prediction' | 'demand_forecast';

export interface ChurnRiskPrediction {
    riskScore: number; // 0-100
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
    factors: Array<{
        factor: string;
        impact: 'positive' | 'negative';
        weight: number;
    }>;
    recommendedAction: string;
}

export interface InventoryForecast {
    productId: string;
    productName: string;
    currentStock: number;
    predictedDemand: number;
    daysUntilStockout: number | null;
    recommendedReorderQuantity: number;
    confidence: number;
}

export interface RevenuePrediction {
    predictedRevenue: number;
    confidenceInterval: { low: number; high: number };
    growthRate: number;
    factors: string[];
}

export class PredictiveAnalytics {
    /**
     * Predict churn risk for a merchant
     */
    async predictChurnRisk(storeId: string): Promise<ChurnRiskPrediction> {
        // Gather merchant metrics
        const features = await this.extractChurnFeatures(storeId);

        // Use Groq for lightweight prediction
        const prediction = await groq.chat.completions.create({
            model: 'llama-3.1-8b-instant',
            messages: [
                {
                    role: 'system',
                    content: `You are a churn prediction expert. Analyze the merchant data and return a JSON response with:
                    {
                        "riskScore": number (0-100),
                        "riskLevel": "low" | "medium" | "high" | "critical",
                        "factors": [{"factor": string, "impact": "positive" | "negative", "weight": number}],
                        "recommendedAction": string
                    }
                    
                    Risk score interpretation:
                    - 0-25: low (healthy merchant)
                    - 26-50: medium (some concerns)
                    - 51-75: high (at risk)
                    - 76-100: critical (likely to churn soon)`
                },
                {
                    role: 'user',
                    content: `Analyze this merchant for churn risk:
                    - Days since last login: ${features.daysSinceLogin}
                    - Days since last order: ${features.daysSinceLastOrder}
                    - Order trend (last 30 days): ${features.orderTrend > 0 ? '+' : ''}${(features.orderTrend * 100).toFixed(1)}%
                    - Total orders: ${features.totalOrders}
                    - Support tickets (last 30 days): ${features.supportTickets}
                    - AI usage (last 30 days): ${features.aiUsage} conversations
                    - Feature adoption rate: ${(features.featureAdoption * 100).toFixed(1)}%
                    - Days since signup: ${features.daysSinceSignup}`
                }
            ],
            response_format: { type: 'json_object' },
        });

        const result = JSON.parse(prediction.choices[0].message.content || '{}');

        // Save prediction to database
        await this.savePrediction(storeId, 'churn_risk', result);

        return result as ChurnRiskPrediction;
    }

    /**
     * Extract features for churn prediction
     */
    private async extractChurnFeatures(storeId: string) {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const sixtyDaysAgo = new Date();
        sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

        // Get store info
        const store = await prisma.store.findUnique({
            where: { id: storeId },
            include: {
                owner: true,
            },
        });

        if (!store) throw new Error('Store not found');

        // Get last login
        const lastSession = await prisma.merchantSession.findFirst({
            where: { storeId },
            orderBy: { createdAt: 'desc' },
        });

        // Get order stats
        const recentOrders = await prisma.order.findMany({
            where: {
                storeId,
                createdAt: { gte: thirtyDaysAgo },
            },
        });

        const previousOrders = await prisma.order.findMany({
            where: {
                storeId,
                createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo },
            },
        });

        const lastOrder = await prisma.order.findFirst({
            where: { storeId },
            orderBy: { createdAt: 'desc' },
        });

        // Get support tickets
        const supportTickets = await prisma.supportTicket.count({
            where: {
                storeId,
                createdAt: { gte: thirtyDaysAgo },
            },
        });

        // Get AI usage
        const aiUsage = await prisma.conversation.count({
            where: {
                storeId,
                createdAt: { gte: thirtyDaysAgo },
            },
        });

        // Calculate order trend
        const orderTrend = previousOrders.length > 0
            ? (recentOrders.length - previousOrders.length) / previousOrders.length
            : 0;

        // Calculate days since last login
        const daysSinceLogin = lastSession
            ? Math.floor((Date.now() - lastSession.createdAt.getTime()) / (1000 * 60 * 60 * 24))
            : 999;

        // Calculate days since last order
        const daysSinceLastOrder = lastOrder
            ? Math.floor((Date.now() - lastOrder.createdAt.getTime()) / (1000 * 60 * 60 * 24))
            : 999;

        // Calculate days since signup
        const daysSinceSignup = Math.floor(
            (Date.now() - store.createdAt.getTime()) / (1000 * 60 * 60 * 24)
        );

        // Estimate feature adoption (simplified)
        const featureAdoption = await this.calculateFeatureAdoption(storeId);

        return {
            daysSinceLogin,
            daysSinceLastOrder,
            orderTrend,
            totalOrders: await prisma.order.count({ where: { storeId } }),
            supportTickets,
            aiUsage,
            featureAdoption,
            daysSinceSignup,
        };
    }

    /**
     * Calculate feature adoption rate
     */
    private async calculateFeatureAdoption(storeId: string): Promise<number> {
        // Check which features the merchant has used
        const features = {
            hasProducts: await prisma.product.count({ where: { storeId } }) > 0,
            hasOrders: await prisma.order.count({ where: { storeId } }) > 0,
            hasAI: await prisma.conversation.count({ where: { storeId } }) > 0,
            hasDiscounts: await prisma.discountRule.count({ where: { storeId } }) > 0,
            hasCustomDomain: await prisma.customDomain.count({ where: { storeId, status: 'active' } }) > 0,
            hasTemplates: await prisma.storeTemplateSelection.count({ where: { storeId } }) > 0,
            hasDeliverySetup: await prisma.deliveryProfile.count({ where: { storeId } }) > 0,
            hasPaymentSetup: await prisma.paymentAccount.count({ where: { storeId } }) > 0,
        };

        const usedFeatures = Object.values(features).filter(Boolean).length;
        const totalFeatures = Object.keys(features).length;

        return usedFeatures / totalFeatures;
    }

    /**
     * Predict inventory needs for a merchant
     */
    async predictInventoryNeeds(storeId: string): Promise<InventoryForecast[]> {
        const products = await prisma.product.findMany({
            where: {
                storeId,
                isActive: true,
            },
            include: {
                variants: {
                    include: {
                        inventoryItems: true,
                    },
                },
            },
        });

        const forecasts: InventoryForecast[] = [];

        for (const product of products) {
            for (const variant of product.variants) {
                const inventoryItem = variant.inventoryItems[0];
                if (!inventoryItem) continue;

                const currentStock = inventoryItem.quantity;

                // Get historical sales
                const sales = await this.getVariantSales(storeId, variant.id, 30);

                // Calculate average daily sales
                const avgDailySales = sales / 30;

                // Predict demand for next 30 days
                const predictedDemand = Math.ceil(avgDailySales * 30);

                // Calculate days until stockout
                const daysUntilStockout = avgDailySales > 0
                    ? Math.floor(currentStock / avgDailySales)
                    : null;

                // Calculate recommended reorder quantity
                const recommendedReorder = Math.max(
                    predictedDemand * 2 - currentStock, // 60 days supply
                    10 // Minimum order quantity
                );

                forecasts.push({
                    productId: product.id,
                    productName: product.name,
                    currentStock,
                    predictedDemand,
                    daysUntilStockout,
                    recommendedReorderQuantity: Math.ceil(recommendedReorder),
                    confidence: sales > 0 ? 0.8 : 0.5, // Higher confidence with more data
                });
            }
        }

        // Sort by urgency (days until stockout)
        forecasts.sort((a, b) => {
            if (a.daysUntilStockout === null) return 1;
            if (b.daysUntilStockout === null) return -1;
            return a.daysUntilStockout - b.daysUntilStockout;
        });

        return forecasts;
    }

    /**
     * Get sales for a variant over a period
     */
    private async getVariantSales(
        storeId: string,
        variantId: string,
        days: number
    ): Promise<number> {
        const since = new Date();
        since.setDate(since.getDate() - days);

        const result = await prisma.orderItem.aggregate({
            where: {
                variantId,
                order: {
                    storeId,
                    createdAt: { gte: since },
                    paymentStatus: 'PAID',
                },
            },
            _sum: {
                quantity: true,
            },
        });

        return result._sum.quantity || 0;
    }

    /**
     * Predict revenue for next month
     */
    async predictRevenue(storeId: string): Promise<RevenuePrediction> {
        // Get historical revenue data
        const last6Months = await this.getMonthlyRevenue(storeId, 6);

        if (last6Months.length < 3) {
            return {
                predictedRevenue: 0,
                confidenceInterval: { low: 0, high: 0 },
                growthRate: 0,
                factors: ['Insufficient historical data for prediction'],
            };
        }

        // Calculate trend
        const recentAvg = last6Months.slice(-3).reduce((a, b) => a + b, 0) / 3;
        const previousAvg = last6Months.slice(0, 3).reduce((a, b) => a + b, 0) / 3;
        const growthRate = previousAvg > 0 ? (recentAvg - previousAvg) / previousAvg : 0;

        // Simple linear projection
        const predictedRevenue = recentAvg * (1 + growthRate);

        // Calculate confidence interval (±20%)
        const confidenceInterval = {
            low: predictedRevenue * 0.8,
            high: predictedRevenue * 1.2,
        };

        // Identify factors
        const factors: string[] = [];
        if (growthRate > 0.1) factors.push('Strong growth trend');
        if (growthRate < -0.1) factors.push('Declining revenue trend');
        if (recentAvg > previousAvg * 1.5) factors.push('Recent spike in sales');

        const prediction: RevenuePrediction = {
            predictedRevenue: Math.round(predictedRevenue),
            confidenceInterval: {
                low: Math.round(confidenceInterval.low),
                high: Math.round(confidenceInterval.high),
            },
            growthRate: Math.round(growthRate * 100) / 100,
            factors,
        };

        await this.savePrediction(storeId, 'revenue_prediction', prediction);

        return prediction;
    }

    /**
     * Get monthly revenue for the last N months
     */
    private async getMonthlyRevenue(storeId: string, months: number): Promise<number[]> {
        const revenues: number[] = [];

        for (let i = months - 1; i >= 0; i--) {
            const startOfMonth = new Date();
            startOfMonth.setMonth(startOfMonth.getMonth() - i);
            startOfMonth.setDate(1);
            startOfMonth.setHours(0, 0, 0, 0);

            const endOfMonth = new Date(startOfMonth);
            endOfMonth.setMonth(endOfMonth.getMonth() + 1);

            const result = await prisma.order.aggregate({
                where: {
                    storeId,
                    createdAt: {
                        gte: startOfMonth,
                        lt: endOfMonth,
                    },
                    paymentStatus: 'PAID',
                },
                _sum: {
                    total: true,
                },
            });

            revenues.push(Number(result._sum.total || 0));
        }

        return revenues;
    }

    /**
     * Save prediction to database
     */
    private async savePrediction(
        storeId: string,
        insightType: InsightType,
        prediction: unknown
    ): Promise<void> {
        const validUntil = new Date();
        validUntil.setDate(validUntil.getDate() + 7); // Valid for 7 days

        await prisma.predictiveInsight.create({
            data: {
                storeId,
                insightType,
                prediction: prediction as Record<string, unknown>,
                confidenceScore: this.extractConfidence(prediction),
                factors: this.extractFactors(prediction),
                recommendedAction: this.extractRecommendation(prediction),
                validUntil,
            },
        });
    }

    /**
     * Extract confidence from prediction
     */
    private extractConfidence(prediction: unknown): number {
        if (typeof prediction === 'object' && prediction !== null) {
            const p = prediction as Record<string, unknown>;
            if (typeof p.confidence === 'number') return p.confidence;
            if (typeof p.riskScore === 'number') return p.riskScore / 100;
        }
        return 0.5;
    }

    /**
     * Extract factors from prediction
     */
    private extractFactors(prediction: unknown): Record<string, unknown> {
        if (typeof prediction === 'object' && prediction !== null) {
            const p = prediction as Record<string, unknown>;
            if (Array.isArray(p.factors)) {
                return { factors: p.factors };
            }
        }
        return {};
    }

    /**
     * Extract recommendation from prediction
     */
    private extractRecommendation(prediction: unknown): string | undefined {
        if (typeof prediction === 'object' && prediction !== null) {
            const p = prediction as Record<string, unknown>;
            if (typeof p.recommendedAction === 'string') {
                return p.recommendedAction;
            }
        }
        return undefined;
    }

    /**
     * Get active predictions for a store
     */
    async getActivePredictions(storeId: string): Promise<Array<{
        id: string;
        insightType: InsightType;
        prediction: unknown;
        confidenceScore: number;
        recommendedAction: string | null;
        createdAt: Date;
    }>> {
        const predictions = await prisma.predictiveInsight.findMany({
            where: {
                storeId,
                validUntil: { gte: new Date() },
                actedUpon: false,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        return predictions.map((p: {
            id: string;
            insightType: string;
            prediction: unknown;
            confidenceScore: number;
            recommendedAction: string | null;
            createdAt: Date;
        }) => ({
            id: p.id,
            insightType: p.insightType as InsightType,
            prediction: p.prediction,
            confidenceScore: p.confidenceScore,
            recommendedAction: p.recommendedAction,
            createdAt: p.createdAt,
        }));
    }

    /**
     * Mark prediction as acted upon
     */
    async markPredictionActed(
        predictionId: string,
        actionResult: unknown
    ): Promise<void> {
        await prisma.predictiveInsight.update({
            where: { id: predictionId },
            data: {
                actedUpon: true,
                actionResult: actionResult as Record<string, unknown>,
            },
        });
    }
}

// Singleton instance
export const predictiveAnalytics = new PredictiveAnalytics();
