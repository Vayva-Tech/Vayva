import React from 'react';
import type { DesignCategory } from '@/components/vayva-ui/VayvaThemeProvider';
interface UniversalSectionHeaderProps {
    title: string;
    subtitle?: string;
    icon?: React.ReactNode;
    action?: React.ReactNode;
    actionText?: string;
    onActionClick?: () => void;
    loading?: boolean;
    className?: string;
    designCategory?: DesignCategory;
    variant?: 'default' | 'compact' | 'minimal';
    'aria-label'?: string;
    'aria-describedby'?: string;
}
/**
 * UniversalSectionHeader - A flexible section header component that adapts to different design categories
 * Provides consistent section labeling with optional actions and icons
 */
export declare function UniversalSectionHeader({ title, subtitle, icon: Icon, action, actionText, onActionClick, loading, className, designCategory: externalDesignCategory, _variant, 'aria-label': ariaLabel, 'aria-describedby': ariaDescribedBy }: UniversalSectionHeaderProps): import("react/jsx-runtime").JSX.Element;
export {};
