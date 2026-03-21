import type { DesignCategory } from '@/components/vayva-ui/VayvaThemeProvider';
interface AIPoweredInsightsProps {
    industry: string;
    designCategory: DesignCategory;
    planTier: string;
    loading?: boolean;
    className?: string;
    onRefresh?: () => void;
}
/**
 * AIPoweredInsights - Advanced AI-powered business insights panel
 * Provides intelligent recommendations and predictions based on business data
 */
export declare function AIPoweredInsights({ industry, _designCategory, _planTier, loading, className, onRefresh }: AIPoweredInsightsProps): import("react/jsx-runtime").JSX.Element;
export {};
