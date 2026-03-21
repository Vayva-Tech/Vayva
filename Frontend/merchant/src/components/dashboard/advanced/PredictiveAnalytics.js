'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { TrendingUp, TrendingDown, Activity, Calendar, DollarSign, Users, ShoppingCart, BarChart3 } from 'lucide-react';
import { cn } from '@/lib/utils';
/**
 * PredictiveAnalytics - Advanced forecasting and trend prediction
 * Uses machine learning to predict future business metrics
 */
export function PredictiveAnalytics({ industry, designCategory, planTier, loading = false, className }) {
    const [predictions, setPredictions] = useState([]);
    // Mock prediction data - would come from ML service in production
    useEffect(() => {
        if (!loading) {
            const mockPredictions = [
                {
                    id: '1',
                    metric: 'Revenue',
                    currentValue: 125000,
                    predictedValue: 142000,
                    confidence: 87,
                    timeframe: 'Next 30 days',
                    trend: 'up',
                    factors: ['Seasonal demand increase', 'Marketing campaign effectiveness'],
                    recommendation: 'Increase inventory by 15%'
                },
                {
                    id: '2',
                    metric: 'Customer Acquisition',
                    currentValue: 1200,
                    predictedValue: 1450,
                    confidence: 78,
                    timeframe: 'Next quarter',
                    trend: 'up',
                    factors: ['Improved website conversion', 'Social media growth'],
                    recommendation: 'Scale customer service team'
                },
                {
                    id: '3',
                    metric: 'Churn Rate',
                    currentValue: 8.2,
                    predictedValue: 6.8,
                    confidence: 92,
                    timeframe: 'Next month',
                    trend: 'down',
                    factors: ['Enhanced customer support', 'Product improvements'],
                    recommendation: 'Maintain current retention strategies'
                },
                {
                    id: '4',
                    metric: 'Average Order Value',
                    currentValue: 85.50,
                    predictedValue: 78.25,
                    confidence: 65,
                    timeframe: 'Next 60 days',
                    trend: 'down',
                    factors: ['Market price sensitivity', 'Competitor pricing'],
                    recommendation: 'Review pricing strategy'
                }
            ];
            setPredictions(mockPredictions);
        }
    }, [loading, industry]);
    const formatCurrency = (value) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(value);
    };
    const getMetricIcon = (metric) => {
        const icons = {
            Revenue: _jsx(DollarSign, { className: "h-4 w-4" }),
            'Customer Acquisition': _jsx(Users, { className: "h-4 w-4" }),
            'Churn Rate': _jsx(Activity, { className: "h-4 w-4" }),
            'Average Order Value': _jsx(ShoppingCart, { className: "h-4 w-4" })
        };
        return icons[metric] || _jsx(BarChart3, { className: "h-4 w-4" });
    };
    const getTrendColor = (trend, isPositive) => {
        if (trend === 'stable')
            return 'text-blue-600';
        return isPositive ? 'text-emerald-600' : 'text-rose-600';
    };
    const getConfidenceColor = (confidence) => {
        if (confidence >= 85)
            return 'bg-emerald-500';
        if (confidence >= 70)
            return 'bg-yellow-500';
        return 'bg-rose-500';
    };
    if (loading) {
        return (_jsxs(Card, { className: cn("rounded-[28px] border border-border/60", className), children: [_jsx(CardHeader, { className: "pb-2 p-6", children: _jsx(Skeleton, { className: "h-6 w-48" }) }), _jsx(CardContent, { className: "p-6 space-y-4", children: [...Array(4)].map((_, i) => (_jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex justify-between", children: [_jsx(Skeleton, { className: "h-4 w-24" }), _jsx(Skeleton, { className: "h-4 w-16" })] }), _jsx(Skeleton, { className: "h-2 w-full rounded-full" })] }, i))) })] }));
    }
    return (_jsxs(Card, { className: cn("rounded-[28px] border border-border/60", className), children: [_jsxs(CardHeader, { className: "pb-2 p-6", children: [_jsxs(CardTitle, { className: "text-lg font-bold flex items-center gap-2", children: [_jsx(TrendingUp, { className: "h-5 w-5 text-primary" }), "Predictive Analytics"] }), _jsx("p", { className: "text-sm text-text-secondary mt-1", children: "AI-powered forecasts for key business metrics" })] }), _jsxs(CardContent, { className: "p-6", children: [_jsx("div", { className: "space-y-6", children: predictions.map((prediction) => {
                            const isImprovement = prediction.trend === 'up' ||
                                (prediction.trend === 'down' && prediction.metric.includes('Rate'));
                            const changePercent = ((prediction.predictedValue - prediction.currentValue) / prediction.currentValue) * 100;
                            const absoluteChange = Math.abs(changePercent);
                            return (_jsxs("div", { className: "border-b border-border/40 pb-6 last:border-b-0 last:pb-0", children: [_jsxs("div", { className: "flex items-start justify-between mb-3", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("div", { className: "p-2 rounded-lg bg-primary/10 text-primary", children: getMetricIcon(prediction.metric) }), _jsxs("div", { children: [_jsx("h3", { className: "font-semibold text-text-primary", children: prediction.metric }), _jsxs("p", { className: "text-xs text-text-secondary flex items-center gap-1", children: [_jsx(Calendar, { className: "h-3 w-3" }), prediction.timeframe] })] })] }), _jsxs("div", { className: "text-right", children: [_jsx("div", { className: "flex items-center gap-1", children: _jsxs("span", { className: cn("text-sm font-medium", getTrendColor(prediction.trend, isImprovement)), children: [isImprovement ? _jsx(TrendingUp, { className: "h-4 w-4" }) : _jsx(TrendingDown, { className: "h-4 w-4" }), absoluteChange.toFixed(1), "%"] }) }), _jsxs("div", { className: "flex items-center gap-2 mt-1", children: [_jsx(Progress, { value: prediction.confidence, className: "w-16 h-1.5" }), _jsxs("span", { className: "text-xs text-text-secondary", children: [prediction.confidence, "% confidence"] })] })] })] }), _jsxs("div", { className: "grid grid-cols-2 gap-4 mb-3 text-sm", children: [_jsxs("div", { children: [_jsx("p", { className: "text-text-secondary", children: "Current" }), _jsx("p", { className: "font-semibold text-text-primary", children: prediction.metric.includes('Rate') || prediction.metric.includes('$')
                                                            ? `${prediction.currentValue}${prediction.metric.includes('Rate') ? '%' : ''}`
                                                            : prediction.metric.includes('Revenue')
                                                                ? formatCurrency(prediction.currentValue)
                                                                : prediction.currentValue.toLocaleString() })] }), _jsxs("div", { children: [_jsx("p", { className: "text-text-secondary", children: "Predicted" }), _jsx("p", { className: "font-semibold text-text-primary", children: prediction.metric.includes('Rate') || prediction.metric.includes('$')
                                                            ? `${prediction.predictedValue}${prediction.metric.includes('Rate') ? '%' : ''}`
                                                            : prediction.metric.includes('Revenue')
                                                                ? formatCurrency(prediction.predictedValue)
                                                                : prediction.predictedValue.toLocaleString() })] })] }), _jsxs("div", { className: "space-y-2", children: [_jsxs("p", { className: "text-xs text-text-secondary", children: [_jsx("span", { className: "font-medium", children: "Key factors:" }), " ", prediction.factors.join(', ')] }), prediction.recommendation && (_jsxs(Badge, { variant: "secondary", className: "text-xs bg-blue-50 text-blue-700 border-blue-200", children: ["Recommendation: ", prediction.recommendation] }))] })] }, prediction.id));
                        }) }), predictions.length === 0 && (_jsxs("div", { className: "text-center py-8", children: [_jsx(Activity, { className: "h-12 w-12 mx-auto text-text-tertiary mb-3" }), _jsx("p", { className: "text-text-secondary", children: "No predictions available" }), _jsx("p", { className: "text-xs text-text-tertiary mt-1", children: "Predictive analytics will appear here when data is available" })] }))] })] }));
}
