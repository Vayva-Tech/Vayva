interface PredictivePrepProps {
    designCategory?: string;
    industry?: string;
    planTier?: string;
}
/**
 * PredictivePrep Component
 *
 * AI-powered prep recommendations based on:
 * - Historical sales data
 * - Weather forecasts
 * - Local events
 * - Day of week patterns
 * - Seasonal trends
 */
export declare function PredictivePrep({ designCategory, industry, planTier }: PredictivePrepProps): import("react/jsx-runtime").JSX.Element;
export {};
