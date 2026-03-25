export interface AnalyticsEvent {
    eventName: string;
    properties?: Record<string, unknown>;
    userId?: string;
    storeId?: string;
}

export const AnalyticsProvider = {
    track: (event: AnalyticsEvent) => {
        if (typeof window !== 'undefined') {
            // Todo: Send to backend / Mixpanel / PostHog
        }
    },

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    identify: (userId: string, traits?: any) => {
    }
};

// Export type definitions
export type CohortMetricType = 'retention' | 'revenue' | 'orders' | 'ltv';
export type FunnelType = 
    | 'product_view_to_purchase'
    | 'cart_to_checkout'
    | 'checkout_to_payment'
    | 'visitor_to_signup'
    | 'signup_to_first_order'
    | 'ai_conversation_to_sale';

export interface CohortReport {
    cohorts: Array<{
        period: string;
        size: number;
        metrics: number[];
    }>;
    metricType: CohortMetricType;
    generatedAt: Date;
}

export interface FunnelReport {
    funnelType: FunnelType;
    steps: Array<{
        name: string;
        count: number;
        conversionRate: number;
    }>;
    totalConversions: number;
    overallConversionRate: number;
}

export interface NpsMetrics {
    score: number;
    promoters: number;
    passives: number;
    detractors: number;
    responsesCount: number;
}

// Re-export analyzer instances
export { cohortAnalyzer, CohortAnalyzer } from './cohort-analyzer';
export { funnelAnalyzer, FunnelAnalyzer } from './funnel-analyzer';
export { npsSystem, NpsSystem } from './nps-system';
export { predictiveAnalytics, PredictiveAnalytics, InsightType } from './predictive-analytics';

// Also export from legacy file names for backwards compatibility
export { cohortAnalyzer as cohortAnalyzerLegacy } from './cohort';
export { funnelAnalyzer as funnelAnalyzerLegacy } from './funnel';
export { npsSystem as npsSystemLegacy } from './nps';
export { predictiveAnalytics as predictiveAnalyticsLegacy } from './predictive';
