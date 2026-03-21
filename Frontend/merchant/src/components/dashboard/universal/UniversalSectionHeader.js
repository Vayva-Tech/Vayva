'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { useVayvaTheme } from '@/components/vayva-ui/VayvaThemeProvider';
/**
 * UniversalSectionHeader - A flexible section header component that adapts to different design categories
 * Provides consistent section labeling with optional actions and icons
 */
export function UniversalSectionHeader({ title, subtitle, icon: Icon, action, actionText, onActionClick, loading = false, className, designCategory: externalDesignCategory, _variant = 'default', 'aria-label': ariaLabel, 'aria-describedby': ariaDescribedBy }) {
    const { designCategory: contextDesignCategory } = useVayvaTheme();
    const designCategory = externalDesignCategory || contextDesignCategory;
    const getContainerClasses = () => {
        return "flex items-center justify-between mb-4";
    };
    const getTitleClasses = () => {
        const baseClasses = "font-semibold text-text-primary";
        switch (designCategory) {
            case 'dark':
                return cn(baseClasses, "text-white");
            case 'bold':
                return cn(baseClasses, "text-gray-900");
            default:
                return baseClasses;
        }
    };
    const getSubtitleClasses = () => {
        const baseClasses = "text-text-secondary ml-2";
        switch (designCategory) {
            case 'dark':
                return cn(baseClasses, "text-gray-300");
            case 'bold':
                return cn(baseClasses, "text-gray-700");
            default:
                return baseClasses;
        }
    };
    const getIconClasses = () => {
        const baseClasses = "text-text-tertiary";
        switch (designCategory) {
            case 'dark':
                return cn(baseClasses, "text-gray-300");
            case 'bold':
                return cn(baseClasses, "text-gray-700");
            default:
                return baseClasses;
        }
    };
    if (loading) {
        return (_jsxs("div", { className: cn(getContainerClasses(), className), children: [_jsxs("div", { className: getTextContainerClasses(), children: [_jsx(Skeleton, { className: "h-6 w-48 rounded" }), _jsx(Skeleton, { className: "h-4 w-64 mt-1 rounded" })] }), _jsx(Skeleton, { className: "h-10 w-24 rounded-lg" })] }));
    }
    const headerAriaLabel = ariaLabel || `${title}${subtitle ? `: ${subtitle}` : ''}`;
    return (_jsxs("div", { className: cn(getContainerClasses(), className), role: "region", "aria-label": headerAriaLabel, "aria-describedby": ariaDescribedBy, children: [_jsxs("div", { className: "flex items-center gap-2", children: [Icon && (_jsx("div", { className: getIconClasses(), "aria-hidden": "true", children: Icon })), _jsx("h3", { className: getTitleClasses(), children: title }), subtitle && (_jsx("span", { className: getSubtitleClasses(), children: subtitle }))] }), action && (_jsx("div", { className: "shrink-0", children: action })), actionText && onActionClick && (_jsx(Button, { onClick: onActionClick, size: "sm", _variant: "outline", "aria-label": `Action for ${title}: ${actionText}`, children: actionText }))] }));
}
