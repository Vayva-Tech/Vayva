import React from 'react';
import type { DesignCategory } from '@/components/vayva-ui/VayvaThemeProvider';
interface UniversalTaskItemProps {
    id: string;
    title: string;
    subtitle?: string;
    icon?: React.ReactNode;
    completed?: boolean;
    priority?: 'low' | 'medium' | 'high' | 'critical';
    category?: string;
    dueDate?: string;
    onClick?: () => void;
    onToggle?: (id: string, completed: boolean) => void;
    loading?: boolean;
    className?: string;
    designCategory?: DesignCategory;
    compact?: boolean;
}
/**
 * UniversalTaskItem - A flexible task item component that adapts to different design categories
 * Supports priority levels, completion states, and various visual styles
 */
export declare function UniversalTaskItem({ id, title, subtitle, icon: Icon, completed, priority, category, dueDate, onClick, onToggle, loading, className, designCategory: externalDesignCategory, compact }: UniversalTaskItemProps): import("react/jsx-runtime").JSX.Element;
export {};
