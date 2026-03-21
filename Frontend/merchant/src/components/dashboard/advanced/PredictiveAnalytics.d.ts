import type { DesignCategory } from '@/components/vayva-ui/VayvaThemeProvider';
interface PredictiveAnalyticsProps {
    industry: string;
    designCategory: DesignCategory;
    planTier: string;
    loading?: boolean;
    className?: string;
}
/**
 * PredictiveAnalytics - Advanced forecasting and trend prediction
 * Uses machine learning to predict future business metrics
 */
export declare function PredictiveAnalytics({ industry, designCategory, planTier, loading, className }: PredictiveAnalyticsProps): import("react/jsx-runtime").JSX.Element;
export {};
