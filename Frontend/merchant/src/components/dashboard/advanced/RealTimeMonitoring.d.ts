import type { DesignCategory } from '@/components/vayva-ui/VayvaThemeProvider';
interface RealTimeMonitoringProps {
    industry: string;
    designCategory: DesignCategory;
    planTier: string;
    loading?: boolean;
    className?: string;
}
/**
 * RealTimeMonitoring - Live system health and performance monitoring
 * Tracks infrastructure, APIs, and business-critical services
 */
export declare function RealTimeMonitoring({ industry, designCategory, planTier, loading, className }: RealTimeMonitoringProps): import("react/jsx-runtime").JSX.Element;
export {};
