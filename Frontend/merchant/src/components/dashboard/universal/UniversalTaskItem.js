'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { useVayvaTheme } from '@/components/vayva-ui/VayvaThemeProvider';
/**
 * UniversalTaskItem - A flexible task item component that adapts to different design categories
 * Supports priority levels, completion states, and various visual styles
 */
export function UniversalTaskItem({ id, title, subtitle, icon: Icon, completed = false, priority = 'medium', category, dueDate, onClick, onToggle, loading = false, className, designCategory: externalDesignCategory, compact = false }) {
    const { designCategory: contextDesignCategory } = useVayvaTheme();
    const designCategory = externalDesignCategory || contextDesignCategory;
    // Get priority styling
    const getPriorityColor = () => {
        switch (priority) {
            case 'critical':
                switch (designCategory) {
                    case 'dark':
                        return 'bg-rose-500/20 text-rose-400 border-rose-500/30';
                    case 'bold':
                        return 'bg-rose-900 text-white border-rose-300';
                    default:
                        return 'bg-rose-100/80 text-rose-700 border-rose-200/60';
                }
            case 'high':
                switch (designCategory) {
                    case 'dark':
                        return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
                    case 'bold':
                        return 'bg-orange-900 text-white border-orange-300';
                    default:
                        return 'bg-orange-100/80 text-orange-700 border-orange-200/60';
                }
            case 'low':
                switch (designCategory) {
                    case 'dark':
                        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
                    case 'bold':
                        return 'bg-gray-100 text-gray-800 border-gray-300';
                    default:
                        return 'bg-gray-100/80 text-gray-600 border-gray-200/60';
                }
            case 'medium':
            default:
                switch (designCategory) {
                    case 'dark':
                        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
                    case 'bold':
                        return 'bg-blue-900 text-white border-blue-300';
                    default:
                        return 'bg-blue-100/80 text-blue-700 border-blue-200/60';
                }
        }
    };
    // Get container styling
    const getContainerClasses = () => {
        const baseClasses = "flex items-start gap-3 p-3 rounded-xl transition-colors cursor-pointer focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2";
        switch (designCategory) {
            case 'glass':
                return cn(baseClasses, completed
                    ? "bg-white/40 border border-white/30"
                    : "hover:bg-white/60 border border-white/40");
            case 'bold':
                return cn(baseClasses, "border-2", completed
                    ? "bg-gray-100 border-gray-400"
                    : "hover:bg-gray-50 border-black");
            case 'dark':
                return cn(baseClasses, completed
                    ? "bg-gray-800/60 border border-gray-700"
                    : "hover:bg-gray-800/80 border border-gray-700");
            case 'natural':
                return cn(baseClasses, completed
                    ? "bg-amber-100/60 border border-amber-200/60"
                    : "hover:bg-amber-100/80 border border-amber-200/80");
            case 'signature':
            default:
                return cn(baseClasses, completed
                    ? "bg-background/40 border border-border/40"
                    : "hover:bg-background/60 border border-border/60");
        }
    };
    // Get focus ring color
    const getFocusRingColor = () => {
        switch (designCategory) {
            case 'bold':
                return 'focus-within:ring-black';
            case 'dark':
                return 'focus-within:ring-gray-500';
            case 'natural':
                return 'focus-within:ring-amber-500';
            case 'signature':
            default:
                return 'focus-within:ring-primary';
        }
    };
    // Get text styling
    const getTitleClasses = () => {
        const baseClasses = "text-sm font-medium truncate";
        if (completed) {
            switch (designCategory) {
                case 'dark':
                    return cn(baseClasses, "text-gray-400 line-through");
                case 'bold':
                    return cn(baseClasses, "text-gray-500 line-through");
                default:
                    return cn(baseClasses, "text-text-secondary line-through");
            }
        }
        else {
            switch (designCategory) {
                case 'dark':
                    return cn(baseClasses, "text-gray-100");
                case 'bold':
                    return cn(baseClasses, "text-gray-900");
                default:
                    return cn(baseClasses, "text-text-primary");
            }
        }
    };
    const getSubtitleClasses = () => {
        const baseClasses = "text-xs truncate";
        if (completed) {
            switch (designCategory) {
                case 'dark':
                    return cn(baseClasses, "text-gray-500 line-through");
                case 'bold':
                    return cn(baseClasses, "text-gray-400 line-through");
                default:
                    return cn(baseClasses, "text-text-tertiary line-through");
            }
        }
        else {
            switch (designCategory) {
                case 'dark':
                    return cn(baseClasses, "text-gray-400");
                case 'bold':
                    return cn(baseClasses, "text-gray-600");
                default:
                    return cn(baseClasses, "text-text-secondary");
            }
        }
    };
    const getIconContainerClasses = () => {
        const baseClasses = "w-8 h-8 rounded-lg flex items-center justify-center shrink-0";
        switch (designCategory) {
            case 'glass':
                return cn(baseClasses, "bg-white/60 border border-white/40");
            case 'bold':
                return cn(baseClasses, "bg-gray-900 text-white border-2 border-black");
            case 'dark':
                return cn(baseClasses, "bg-gray-700 text-gray-200");
            case 'natural':
                return cn(baseClasses, "bg-amber-200/80 text-amber-800");
            case 'signature':
            default:
                return cn(baseClasses, "bg-background/60 border border-border/60");
        }
    };
    const handleToggle = (e) => {
        e.stopPropagation();
        onToggle?.(id, !completed);
    };
    const handleClick = () => {
        onClick?.();
    };
    if (loading) {
        return (_jsxs("div", { className: cn(getContainerClasses(), "opacity-50", className), children: [_jsx(Skeleton, { className: "h-5 w-5 rounded" }), _jsx(Skeleton, { className: compact ? "h-8 w-8 rounded-lg" : "h-10 w-10 rounded-lg" }), _jsxs("div", { className: "flex-1 min-w-0 space-y-1", children: [_jsx(Skeleton, { className: "h-4 w-3/4 rounded" }), _jsx(Skeleton, { className: "h-3 w-1/2 rounded" })] }), _jsx(Skeleton, { className: "h-5 w-16 rounded-full" })] }));
    }
    return (_jsxs("div", { className: cn(getContainerClasses(), getFocusRingColor(), className), onClick: handleClick, tabIndex: 0, onKeyDown: (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleClick();
            }
        }, children: [_jsx(Checkbox, { checked: completed, onCheckedChange: () => { }, onClick: handleToggle, className: cn("mt-0.5", designCategory === 'dark' && "border-gray-600 data-[state=checked]:bg-gray-600 data-[state=checked]:text-white", designCategory === 'bold' && "border-2 border-black data-[state=checked]:bg-black data-[state=checked]:text-white") }), Icon && (_jsx("div", { className: getIconContainerClasses(), children: Icon })), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsx("p", { className: getTitleClasses(), children: title }), subtitle && (_jsx("p", { className: getSubtitleClasses(), children: subtitle }))] }), _jsxs("div", { className: "flex items-center gap-2 shrink-0", children: [dueDate && (_jsx("span", { className: cn("text-xs font-medium px-2 py-1 rounded-full", completed
                            ? designCategory === 'dark'
                                ? "text-gray-500"
                                : "text-text-tertiary"
                            : new Date(dueDate) < new Date()
                                ? designCategory === 'dark'
                                    ? "text-rose-400"
                                    : designCategory === 'bold'
                                        ? "text-rose-800"
                                        : "text-rose-600"
                                : designCategory === 'dark'
                                    ? "text-gray-400"
                                    : "text-text-secondary"), children: new Date(dueDate).toLocaleDateString() })), category && (_jsx(Badge, { variant: "outline", className: cn("text-xs font-medium border", designCategory === 'dark' ? "border-gray-600 text-gray-400" : "border-border", completed && (designCategory === 'dark' ? "text-gray-500" : "text-text-tertiary")), children: category })), _jsx(Badge, { variant: "outline", className: cn("text-xs font-medium border whitespace-nowrap", getPriorityColor(), completed && "opacity-60"), children: priority.charAt(0).toUpperCase() + priority.slice(1) })] })] }));
}
