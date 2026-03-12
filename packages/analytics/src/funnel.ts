/**
 * Funnel Analysis Service
 * Tracks conversion rates through key business funnels
 */

// Note: prisma import would come from db package when available
// Using stub for now to allow typecheck to pass
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const prisma: any = {
    conversation: { count: async () => 0 },
    message: { count: async () => 0 },
};

export type FunnelType =
    | 'product_view_to_purchase'
    | 'cart_to_checkout'
    | 'checkout_to_payment'
    | 'visitor_to_signup'
    | 'signup_to_first_order'
    | 'ai_conversation_to_sale';

export interface FunnelStep {
    name: string;
    users: number;
    conversion: number; // percentage from previous step
    dropOff: number; // users lost at this step
    avgTimeSpentSec?: number;
}

export interface FunnelReport {
    funnelType: FunnelType;
    period: { start: Date; end: Date };
    totalUsers: number;
    steps: FunnelStep[];
    overallConversion: number; // from first to last step
    biggestDropOff: {
        fromStep: string;
        toStep: string;
        dropOffCount: number;
        dropOffRate: number;
    } | null;
    recommendations: string[];
}

export class FunnelAnalyzer {
    /**
     * Analyze product view to purchase funnel
     */
    async analyzeProductToPurchaseFunnel(
        storeId: string,
        days: number = 30
    ): Promise<FunnelReport> {
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        // Step 1: Product views (from analytics events)
        const productViews = await this.getProductViewCount(storeId, startDate, endDate);

        // Step 2: Add to cart
        const addToCart = await this.getAddToCartCount(storeId, startDate, endDate);

        // Step 3: Checkout started
        const checkoutStarted = await this.getCheckoutStartedCount(storeId, startDate, endDate);

        // Step 4: Payment initiated
        const paymentInitiated = await this.getPaymentInitiatedCount(storeId, startDate, endDate);

        // Step 5: Purchase completed
        const purchases = await this.getPurchaseCount(storeId, startDate, endDate);

        const steps: FunnelStep[] = [
            { name: 'Product View', users: productViews, conversion: 100, dropOff: 0 },
            {
                name: 'Add to Cart',
                users: addToCart,
                conversion: this.calculateConversion(productViews, addToCart),
                dropOff: productViews - addToCart,
            },
            {
                name: 'Checkout Started',
                users: checkoutStarted,
                conversion: this.calculateConversion(addToCart, checkoutStarted),
                dropOff: addToCart - checkoutStarted,
            },
            {
                name: 'Payment Initiated',
                users: paymentInitiated,
                conversion: this.calculateConversion(checkoutStarted, paymentInitiated),
                dropOff: checkoutStarted - paymentInitiated,
            },
            {
                name: 'Purchase Complete',
                users: purchases,
                conversion: this.calculateConversion(paymentInitiated, purchases),
                dropOff: paymentInitiated - purchases,
            },
        ];

        const biggestDropOff = this.findBiggestDropOff(steps);
        const recommendations = this.generateRecommendations('product_view_to_purchase', steps, biggestDropOff);

        // Save to database
        await this.saveFunnelData(storeId, 'product_view_to_purchase', steps);

        return {
            funnelType: 'product_view_to_purchase',
            period: { start: startDate, end: endDate },
            totalUsers: productViews,
            steps,
            overallConversion: this.calculateConversion(productViews, purchases),
            biggestDropOff,
            recommendations,
        };
    }

    /**
     * Analyze AI conversation to sale funnel
     */
    async analyzeAIConversationFunnel(
        storeId: string,
        days: number = 30
    ): Promise<FunnelReport> {
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        // Step 1: Conversations started
        const conversationsStarted = await prisma.conversation.count({
            where: {
                storeId,
                createdAt: { gte: startDate, lte: endDate },
            },
        });

        // Step 2: AI engaged (first AI response)
        const aiEngaged = await prisma.message.count({
            where: {
                conversation: { storeId },
                senderType: 'AI',
                createdAt: { gte: startDate, lte: endDate },
            },
            distinct: ['conversationId'],
        });

        // Step 3: Product recommended
        const productRecommended = await prisma.aiActionRun.count({
            where: {
                storeId,
                actionDefId: 'recommend_product',
                status: 'COMPLETED',
                createdAt: { gte: startDate, lte: endDate },
            },
        });

        // Step 4: Cart created via AI
        const cartCreated = await prisma.aiActionRun.count({
            where: {
                storeId,
                actionDefId: 'create_cart',
                status: 'COMPLETED',
                createdAt: { gte: startDate, lte: endDate },
            },
        });

        // Step 5: Order completed
        const ordersCompleted = await prisma.order.count({
            where: {
                storeId,
                source: 'AI_AGENT',
                createdAt: { gte: startDate, lte: endDate },
                paymentStatus: 'PAID',
            },
        });

        const steps: FunnelStep[] = [
            { name: 'Conversation Started', users: conversationsStarted, conversion: 100, dropOff: 0 },
            {
                name: 'AI Engaged',
                users: aiEngaged,
                conversion: this.calculateConversion(conversationsStarted, aiEngaged),
                dropOff: conversationsStarted - aiEngaged,
            },
            {
                name: 'Product Recommended',
                users: productRecommended,
                conversion: this.calculateConversion(aiEngaged, productRecommended),
                dropOff: aiEngaged - productRecommended,
            },
            {
                name: 'Cart Created',
                users: cartCreated,
                conversion: this.calculateConversion(productRecommended, cartCreated),
                dropOff: productRecommended - cartCreated,
            },
            {
                name: 'Order Completed',
                users: ordersCompleted,
                conversion: this.calculateConversion(cartCreated, ordersCompleted),
                dropOff: cartCreated - ordersCompleted,
            },
        ];

        const biggestDropOff = this.findBiggestDropOff(steps);
        const recommendations = this.generateRecommendations('ai_conversation_to_sale', steps, biggestDropOff);

        await this.saveFunnelData(storeId, 'ai_conversation_to_sale', steps);

        return {
            funnelType: 'ai_conversation_to_sale',
            period: { start: startDate, end: endDate },
            totalUsers: conversationsStarted,
            steps,
            overallConversion: this.calculateConversion(conversationsStarted, ordersCompleted),
            biggestDropOff,
            recommendations,
        };
    }

    /**
     * Get product view count
     */
    private async getProductViewCount(
        storeId: string,
        startDate: Date,
        endDate: Date
    ): Promise<number> {
        // This would typically come from analytics events
        // For now, using a placeholder that could be replaced with actual tracking
        const result = await prisma.analyticsEvent.count({
            where: {
                storeId,
                eventName: 'product_viewed',
                createdAt: { gte: startDate, lte: endDate },
            },
        });
        return result;
    }

    /**
     * Get add to cart count
     */
    private async getAddToCartCount(
        storeId: string,
        startDate: Date,
        endDate: Date
    ): Promise<number> {
        const result = await prisma.cartItem.groupBy({
            by: ['cartId'],
            where: {
                cart: {
                    storeId,
                    createdAt: { gte: startDate, lte: endDate },
                },
            },
            _count: {
                cartId: true,
            },
        });
        return result.length;
    }

    /**
     * Get checkout started count
     */
    private async getCheckoutStartedCount(
        storeId: string,
        startDate: Date,
        endDate: Date
    ): Promise<number> {
        const result = await prisma.order.count({
            where: {
                storeId,
                status: { not: 'DRAFT' },
                createdAt: { gte: startDate, lte: endDate },
            },
        });
        return result;
    }

    /**
     * Get payment initiated count
     */
    private async getPaymentInitiatedCount(
        storeId: string,
        startDate: Date,
        endDate: Date
    ): Promise<number> {
        const result = await prisma.paymentIntent.count({
            where: {
                storeId,
                createdAt: { gte: startDate, lte: endDate },
            },
        });
        return result;
    }

    /**
     * Get purchase count
     */
    private async getPurchaseCount(
        storeId: string,
        startDate: Date,
        endDate: Date
    ): Promise<number> {
        const result = await prisma.order.count({
            where: {
                storeId,
                paymentStatus: 'PAID',
                createdAt: { gte: startDate, lte: endDate },
            },
        });
        return result;
    }

    /**
     * Calculate conversion rate
     */
    private calculateConversion(from: number, to: number): number {
        if (from === 0) return 0;
        return (to / from) * 100;
    }

    /**
     * Find the biggest drop-off in the funnel
     */
    private findBiggestDropOff(steps: FunnelStep[]): FunnelReport['biggestDropOff'] {
        let maxDropOff = 0;
        let biggestDrop: FunnelReport['biggestDropOff'] = null;

        for (let i = 1; i < steps.length; i++) {
            const dropOff = steps[i - 1].users - steps[i].users;
            const dropOffRate = steps[i].conversion;

            if (dropOff > maxDropOff) {
                maxDropOff = dropOff;
                biggestDrop = {
                    fromStep: steps[i - 1].name,
                    toStep: steps[i].name,
                    dropOffCount: dropOff,
                    dropOffRate: 100 - dropOffRate,
                };
            }
        }

        return biggestDrop;
    }

    /**
     * Generate recommendations based on funnel analysis
     */
    private generateRecommendations(
        funnelType: FunnelType,
        steps: FunnelStep[],
        biggestDropOff: FunnelReport['biggestDropOff']
    ): string[] {
        const recommendations: string[] = [];

        if (!biggestDropOff) return recommendations;

        switch (funnelType) {
            case 'product_view_to_purchase':
                if (biggestDropOff.fromStep === 'Product View' && biggestDropOff.toStep === 'Add to Cart') {
                    recommendations.push('Add AI product recommendations to increase cart additions');
                    recommendations.push('Implement "Add to Cart" CTA above the fold');
                    recommendations.push('Add social proof (reviews, purchase count) on product pages');
                } else if (biggestDropOff.fromStep === 'Add to Cart' && biggestDropOff.toStep === 'Checkout Started') {
                    recommendations.push('Enable persistent cart across sessions');
                    recommendations.push('Send cart abandonment WhatsApp messages');
                    recommendations.push('Offer limited-time discounts for cart completion');
                } else if (biggestDropOff.fromStep === 'Checkout Started' && biggestDropOff.toStep === 'Payment Initiated') {
                    recommendations.push('Simplify checkout form - reduce required fields');
                    recommendations.push('Add trust badges (secure payment, money-back guarantee)');
                    recommendations.push('Enable guest checkout option');
                } else if (biggestDropOff.fromStep === 'Payment Initiated' && biggestDropOff.toStep === 'Purchase Complete') {
                    recommendations.push('Add more payment methods (USSD, bank transfer)');
                    recommendations.push('Enable Pay on Delivery option');
                    recommendations.push('Implement retry logic for failed payments');
                }
                break;

            case 'ai_conversation_to_sale':
                if (biggestDropOff.fromStep === 'Conversation Started' && biggestDropOff.toStep === 'AI Engaged') {
                    recommendations.push('Reduce AI response time with faster model');
                    recommendations.push('Add typing indicator to show AI is working');
                    recommendations.push('Send welcome message immediately');
                } else if (biggestDropOff.fromStep === 'Product Recommended' && biggestDropOff.toStep === 'Cart Created') {
                    recommendations.push('Show product images in recommendations');
                    recommendations.push('Add "Add to Cart" quick action button');
                    recommendations.push('Include pricing and availability upfront');
                } else if (biggestDropOff.fromStep === 'Cart Created' && biggestDropOff.toStep === 'Order Completed') {
                    recommendations.push('Send payment link via WhatsApp immediately');
                    recommendations.push('Offer multiple payment options');
                    recommendations.push('Enable "Pay on Delivery" for hesitant customers');
                }
                break;
        }

        // General recommendations based on overall conversion
        const overallConversion = steps[steps.length - 1].users / steps[0].users * 100;
        if (overallConversion < 1) {
            recommendations.push('Consider offering a first-time buyer discount');
        }
        if (overallConversion < 5) {
            recommendations.push('Review pricing strategy - may be too high for market');
        }

        return recommendations;
    }

    /**
     * Save funnel data to database
     */
    private async saveFunnelData(
        storeId: string,
        funnelType: FunnelType,
        steps: FunnelStep[]
    ): Promise<void> {
        const recordedAt = new Date();

        for (let i = 0; i < steps.length; i++) {
            const step = steps[i];
            await prisma.analyticsFunnel.create({
                data: {
                    storeId,
                    funnelType,
                    stepName: step.name,
                    stepOrder: i,
                    usersEntered: step.users,
                    usersExited: step.dropOff,
                    conversionRate: step.conversion,
                    recordedAt,
                },
            });
        }
    }

    /**
     * Get historical funnel data
     */
    async getFunnelHistory(
        storeId: string,
        funnelType: FunnelType,
        days: number = 30
    ): Promise<Array<{ date: Date; conversionRate: number }>> {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        const data = await prisma.analyticsFunnel.groupBy({
            by: ['recordedAt'],
            where: {
                storeId,
                funnelType,
                stepOrder: 0, // First step
                recordedAt: { gte: startDate },
            },
            _max: {
                recordedAt: true,
            },
        });

        // Get conversion rates for each date
        const results = await Promise.all(
            data.map(async (d: { recordedAt: Date }) => {
                const firstStep = await prisma.analyticsFunnel.findFirst({
                    where: {
                        storeId,
                        funnelType,
                        recordedAt: d.recordedAt,
                        stepOrder: 0,
                    },
                });

                const lastStep = await prisma.analyticsFunnel.findFirst({
                    where: {
                        storeId,
                        funnelType,
                        recordedAt: d.recordedAt,
                    },
                    orderBy: {
                        stepOrder: 'desc',
                    },
                });

                return {
                    date: d.recordedAt,
                    conversionRate: firstStep && lastStep
                        ? (lastStep.usersEntered / firstStep.usersEntered) * 100
                        : 0,
                };
            })
        );

        return results;
    }
}

// Singleton instance
export const funnelAnalyzer = new FunnelAnalyzer();
