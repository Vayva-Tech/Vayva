import React from 'react';
import type { DesignCategory } from '@/components/vayva-ui/VayvaThemeProvider';
interface UniversalChartContainerProps {
    title?: string;
    subtitle?: string;
    children: React.ReactNode;
    loading?: boolean;
    error?: string | null;
    emptyState?: {
        icon?: React.ReactNode;
        title: string;
        description?: string;
        action?: React.ReactNode;
    };
    height?: number | string;
    className?: string;
    designCategory?: DesignCategory;
    showHeader?: boolean;
    actions?: React.ReactNode;
}
/**
 * UniversalChartContainer - A flexible chart container that wraps Recharts components
 * Provides consistent styling and handling for loading, error, and empty states
 */
export declare function UniversalChartContainer({ title, subtitle, children, loading, error, emptyState, height, className, designCategory: externalDesignCategory, showHeader, actions }: UniversalChartContainerProps): import("react/jsx-runtime").JSX.Element;
export declare function useChartData<T>(fetchData: () => Promise<T>, deps?: React.DependencyList): {
    data: T | null;
    loading: boolean;
    error: string | null;
    retry: () => void;
};
export declare const ChartEmptyStates: {
    noData: {
        title: string;
        description: string;
        icon: string;
    };
    noSales: {
        title: string;
        description: string;
        icon: string;
    };
    noTraffic: {
        title: string;
        description: string;
        icon: string;
    };
    comingSoon: {
        title: string;
        description: string;
        icon: string;
    };
};
export {};
