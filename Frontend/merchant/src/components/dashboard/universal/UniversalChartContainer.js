'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { useVayvaTheme } from '@/components/vayva-ui/VayvaThemeProvider';
/**
 * UniversalChartContainer - A flexible chart container that wraps Recharts components
 * Provides consistent styling and handling for loading, error, and empty states
 */
export function UniversalChartContainer({ title, subtitle, children, loading = false, error = null, emptyState, height = 350, className, designCategory: externalDesignCategory, showHeader = true, actions }) {
    const { designCategory: contextDesignCategory } = useVayvaTheme();
    const designCategory = externalDesignCategory || contextDesignCategory;
    // Get card styling classes
    const getCardClasses = () => {
        const baseClasses = "rounded-[28px] border border-border/60 backdrop-blur-xl shadow-card overflow-hidden";
        switch (designCategory) {
            case 'glass':
                return cn(baseClasses, "bg-white/80 border-white/40");
            case 'bold':
                return cn(baseClasses, "bg-white border-2 border-black");
            case 'dark':
                return cn(baseClasses, "bg-gray-900/90 border-gray-700");
            case 'natural':
                return cn(baseClasses, "bg-amber-50/80 border-amber-200/60");
            case 'signature':
            default:
                return cn(baseClasses, "bg-background/70");
        }
    };
    const getHeaderClasses = () => {
        const baseClasses = "bg-background/60 p-6 border-b border-border/60";
        switch (designCategory) {
            case 'dark':
                return cn(baseClasses, "bg-gray-800/60 border-gray-700");
            case 'bold':
                return cn(baseClasses, "bg-gray-50 border-gray-300");
            default:
                return baseClasses;
        }
    };
    const getTitleClasses = () => {
        const baseClasses = "text-lg font-bold";
        switch (designCategory) {
            case 'dark':
                return cn(baseClasses, "text-white");
            case 'bold':
                return cn(baseClasses, "text-gray-900");
            default:
                return cn(baseClasses, "text-text-primary");
        }
    };
    const getSubtitleClasses = () => {
        const baseClasses = "text-sm";
        switch (designCategory) {
            case 'dark':
                return cn(baseClasses, "text-gray-300");
            case 'bold':
                return cn(baseClasses, "text-gray-700");
            default:
                return cn(baseClasses, "text-text-secondary");
        }
    };
    const getContentClasses = () => {
        const baseClasses = "p-6";
        switch (designCategory) {
            case 'dark':
                return cn(baseClasses, "bg-gray-900/50");
            case 'bold':
                return cn(baseClasses, "bg-gray-50");
            default:
                return baseClasses;
        }
    };
    // Handle loading state
    if (loading) {
        return (_jsxs(Card, { className: getCardClasses(), children: [showHeader && (_jsx(CardHeader, { className: getHeaderClasses(), children: _jsxs("div", { className: "space-y-2", children: [_jsx(Skeleton, { className: "h-6 w-48 rounded" }), _jsx(Skeleton, { className: "h-4 w-64 rounded" })] }) })), _jsx(CardContent, { className: getContentClasses(), children: _jsx("div", { className: "w-full rounded-2xl flex items-center justify-center", style: { height }, children: _jsx(Skeleton, { className: "h-full w-full rounded-2xl" }) }) })] }));
    }
    // Handle error state
    if (error) {
        return (_jsxs(Card, { className: getCardClasses(), children: [showHeader && (_jsx(CardHeader, { className: getHeaderClasses(), children: _jsxs("div", { className: "space-y-2", children: [title && _jsx(CardTitle, { className: getTitleClasses(), children: title }), subtitle && _jsx("p", { className: getSubtitleClasses(), children: subtitle })] }) })), _jsxs(CardContent, { className: cn(getContentClasses(), "flex flex-col items-center justify-center text-center gap-4"), children: [_jsx("div", { className: "text-5xl", children: "\u26A0\uFE0F" }), _jsxs("div", { children: [_jsx("h3", { className: cn("text-lg font-semibold mb-2", designCategory === 'dark' ? "text-white" : "text-text-primary"), children: "Something went wrong" }), _jsx("p", { className: cn("text-sm max-w-md", designCategory === 'dark' ? "text-gray-300" : "text-text-secondary"), children: error })] }), _jsx("button", { onClick: () => window.location.reload(), className: cn("px-4 py-2 rounded-lg font-medium transition-colors", designCategory === 'dark'
                                ? "bg-gray-800 text-white hover:bg-gray-700"
                                : designCategory === 'bold'
                                    ? "bg-black text-white hover:bg-gray-800"
                                    : "bg-primary text-primary-foreground hover:bg-primary/90"), children: "Try Again" })] })] }));
    }
    // Handle empty state
    if (emptyState) {
        return (_jsxs(Card, { className: getCardClasses(), children: [showHeader && (_jsx(CardHeader, { className: getHeaderClasses(), children: _jsxs("div", { className: "space-y-2", children: [title && _jsx(CardTitle, { className: getTitleClasses(), children: title }), subtitle && _jsx("p", { className: getSubtitleClasses(), children: subtitle })] }) })), _jsxs(CardContent, { className: cn(getContentClasses(), "flex flex-col items-center justify-center text-center gap-4"), children: [_jsx("div", { className: "text-5xl opacity-50", children: emptyState.icon || '📊' }), _jsxs("div", { children: [_jsx("h3", { className: cn("text-lg font-semibold mb-2", designCategory === 'dark' ? "text-white" : "text-text-primary"), children: emptyState.title }), emptyState.description && (_jsx("p", { className: cn("text-sm max-w-md", designCategory === 'dark' ? "text-gray-300" : "text-text-secondary"), children: emptyState.description }))] }), emptyState.action] })] }));
    }
    // Render chart content
    return (_jsxs(Card, { className: cn(getCardClasses(), className), children: [(showHeader || actions) && (_jsxs(CardHeader, { className: cn(getHeaderClasses(), "flex flex-row items-center justify-between"), children: [_jsxs("div", { className: "space-y-1", children: [title && _jsx(CardTitle, { className: getTitleClasses(), children: title }), subtitle && _jsx("p", { className: getSubtitleClasses(), children: subtitle })] }), actions && _jsx("div", { children: actions })] })), _jsx(CardContent, { className: getContentClasses(), children: _jsx("div", { style: { height }, children: children }) })] }));
}
// Helper hook for chart data management
export function useChartData(fetchData, deps = []) {
    const [data, setData] = React.useState(null);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState(null);
    React.useEffect(() => {
        let isMounted = true;
        const loadData = async () => {
            try {
                setLoading(true);
                setError(null);
                const result = await fetchData();
                if (isMounted) {
                    setData(result);
                }
            }
            catch (err) {
                if (isMounted) {
                    setError(err instanceof Error ? err.message : 'Failed to load data');
                }
            }
            finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };
        loadData();
        return () => {
            isMounted = false;
        };
    }, deps);
    const retry = React.useCallback(() => {
        setLoading(true);
        setError(null);
        fetchData()
            .then(setData)
            .catch(err => setError(err instanceof Error ? err.message : 'Failed to load data'))
            .finally(() => setLoading(false));
    }, [fetchData]);
    return { data, loading, error, retry };
}
// Predefined empty states
export const ChartEmptyStates = {
    noData: {
        title: "No data available",
        description: "There's no data to display for the selected period",
        icon: "📉"
    },
    noSales: {
        title: "No sales yet",
        description: "Start selling to see your sales performance here",
        icon: "💰"
    },
    noTraffic: {
        title: "No traffic data",
        description: "Connect your analytics to see website traffic",
        icon: "🌐"
    },
    comingSoon: {
        title: "Coming soon",
        description: "This chart will be available in the next update",
        icon: "🚀"
    }
};
