import React from 'react';
import type { DesignCategory } from '@/components/vayva-ui/VayvaThemeProvider';
interface UniversalMetricCardProps {
    title: string;
    value: string | number;
    change?: {
        value: number;
        isPositive: boolean;
        label?: string;
    };
    icon?: React.ReactNode;
    trend?: 'up' | 'down' | 'neutral';
    loading?: boolean;
    className?: string;
    designCategory?: DesignCategory;
    onClick?: () => void;
    status?: 'default' | 'success' | 'warning' | 'error';
    'aria-label'?: string;
}
/**
 * UniversalMetricCard - A flexible metric card component that adapts to different design categories
 * Supports all 5 design categories: signature, glass, bold, dark, natural
 */
export declare function UniversalMetricCard({ title, value, change, icon: _Icon, trend, loading, className, designCategory: externalDesignCategory, onClick, status, 'aria-label': ariaLabel }: UniversalMetricCardProps): import("react/jsx-runtime").JSX.Element;
export {};
