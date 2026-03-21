'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Lightbulb, TrendingUp, AlertTriangle, CheckCircle2, RefreshCw, Sparkles, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
/**
 * AIPoweredInsights - Advanced AI-powered business insights panel
 * Provides intelligent recommendations and predictions based on business data
 */
export function AIPoweredInsights({ industry, _designCategory, _planTier, loading = false, className, onRefresh }) {
    const [insights, setInsights] = useState([]);
    const [isRefreshing, setIsRefreshing] = useState(false);
    // Mock insights data - would come from AI service in production
    useEffect(() => {
        if (!loading) {
            const mockInsights = [
                {
                    id: '1',
                    type: 'opportunity',
                    title: 'Peak Sales Window Identified',
                    description: 'Your conversion rate spikes 45% during 2-4 PM. Consider increasing marketing budget during this window.',
                    confidence: 87,
                    priority: 'high',
                    suggestedAction: 'Boost ad spend 2-4 PM',
                    impactScore: 92,
                    timeframe: 'Today'
                },
                {
                    id: '2',
                    type: 'optimization',
                    title: 'Inventory Optimization Opportunity',
                    description: '3 products are consistently overstocked while similar items are frequently out of stock.',
                    confidence: 92,
                    priority: 'medium',
                    suggestedAction: 'Rebalance inventory allocation',
                    impactScore: 78,
                    timeframe: 'This week'
                },
                {
                    id: '3',
                    type: 'confirmation',
                    title: 'Successful Marketing Campaign',
                    description: 'Your email campaign from yesterday is performing 23% above average engagement rates.',
                    confidence: 95,
                    priority: 'low',
                    impactScore: 85,
                    timeframe: 'Yesterday'
                },
                {
                    id: '4',
                    type: 'risk',
                    title: 'Potential Supply Chain Delay',
                    description: 'Weather conditions may affect delivery schedules for 3 key suppliers next week.',
                    confidence: 78,
                    priority: 'high',
                    suggestedAction: 'Contact suppliers proactively',
                    impactScore: 88,
                    timeframe: 'Next week'
                }
            ];
            setInsights(mockInsights);
        }
    }, [loading, industry]);
    const handleRefresh = async () => {
        setIsRefreshing(true);
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1500));
            onRefresh?.();
        }
        finally {
            setIsRefreshing(false);
        }
    };
    const getTypeConfig = (type) => {
        const configs = {
            opportunity: {
                icon: _jsx(TrendingUp, { className: "h-4 w-4" }),
                label: 'Opportunity',
                badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-200'
            },
            risk: {
                icon: _jsx(AlertTriangle, { className: "h-4 w-4" }),
                label: 'Risk',
                badgeClass: 'bg-rose-100 text-rose-800 border-rose-200'
            },
            optimization: {
                icon: _jsx(Zap, { className: "h-4 w-4" }),
                label: 'Optimization',
                badgeClass: 'bg-blue-100 text-blue-800 border-blue-200'
            },
            confirmation: {
                icon: _jsx(CheckCircle2, { className: "h-4 w-4" }),
                label: 'Confirmation',
                badgeClass: 'bg-purple-100 text-purple-800 border-purple-200'
            }
        };
        return configs[type];
    };
    const getPriorityBadge = (priority) => {
        const priorities = {
            high: 'bg-red-100 text-red-800',
            medium: 'bg-yellow-100 text-yellow-800',
            low: 'bg-green-100 text-green-800'
        };
        return priorities[priority];
    };
    if (loading) {
        return (_jsxs(Card, { className: cn("rounded-[28px] border border-border/60", className), children: [_jsxs(CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-2 p-6", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Skeleton, { className: "h-5 w-5 rounded-full" }), _jsx(Skeleton, { className: "h-6 w-32" })] }), _jsx(Skeleton, { className: "h-8 w-8 rounded-full" })] }), _jsx(CardContent, { className: "p-6 space-y-4", children: [...Array(3)].map((_, i) => (_jsxs("div", { className: "space-y-2", children: [_jsx(Skeleton, { className: "h-4 w-48" }), _jsx(Skeleton, { className: "h-3 w-full" }), _jsx(Skeleton, { className: "h-3 w-3/4" })] }, i))) })] }));
    }
    return (_jsxs(Card, { className: cn("rounded-[28px] border border-border/60", className), children: [_jsxs(CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-2 p-6", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("div", { className: "p-2 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 text-white", children: _jsx(Sparkles, { className: "h-5 w-5" }) }), _jsx(CardTitle, { className: "text-lg font-bold", children: "AI-Powered Insights" })] }), _jsx(Button, { variant: "ghost", size: "sm", onClick: handleRefresh, disabled: isRefreshing, children: _jsx(RefreshCw, { className: cn("h-4 w-4", isRefreshing && "animate-spin") }) })] }), _jsxs(CardContent, { className: "p-6", children: [_jsx("div", { className: "space-y-4", children: insights.map((insight) => {
                            const typeConfig = getTypeConfig(insight.type);
                            return (_jsxs("div", { className: "p-4 rounded-xl border border-border/40 hover:border-border/60 transition-colors group", children: [_jsxs("div", { className: "flex items-start justify-between mb-3", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsxs(Badge, { variant: "secondary", className: cn("text-xs font-medium", typeConfig.badgeClass), children: [typeConfig.icon, _jsx("span", { className: "ml-1", children: typeConfig.label })] }), _jsxs(Badge, { variant: "secondary", className: cn("text-xs", getPriorityBadge(insight.priority)), children: [insight.priority, " priority"] })] }), _jsxs("div", { className: "flex items-center gap-2 text-xs text-text-secondary", children: [_jsxs("span", { children: [insight.confidence, "% confidence"] }), _jsx("span", { children: "\u2022" }), _jsx("span", { children: insight.timeframe })] })] }), _jsx("h3", { className: "font-semibold text-text-primary mb-2 group-hover:text-primary transition-colors", children: insight.title }), _jsx("p", { className: "text-sm text-text-secondary mb-3", children: insight.description }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-4", children: [insight.suggestedAction && (_jsx(Button, { variant: "outline", size: "sm", className: "text-xs", children: insight.suggestedAction })), _jsxs("div", { className: "flex items-center gap-1 text-xs", children: [_jsx("span", { className: "text-text-secondary", children: "Impact:" }), _jsxs("span", { className: "font-medium text-text-primary", children: [insight.impactScore, "/100"] })] })] }), _jsxs("div", { className: "flex items-center gap-1 text-xs text-text-secondary", children: [_jsx(Lightbulb, { className: "h-3 w-3" }), _jsx("span", { children: "AI Generated" })] })] })] }, insight.id));
                        }) }), insights.length === 0 && (_jsxs("div", { className: "text-center py-8", children: [_jsx(Lightbulb, { className: "h-12 w-12 mx-auto text-text-tertiary mb-3" }), _jsx("p", { className: "text-text-secondary", children: "No insights available at this time" }), _jsx("p", { className: "text-xs text-text-tertiary mt-1", children: "Check back later for AI-powered recommendations" })] }))] })] }));
}
