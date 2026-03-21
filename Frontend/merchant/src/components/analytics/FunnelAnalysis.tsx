/**
 * Funnel Analysis Dashboard Component
 * Displays conversion funnels with drop-off analysis
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Filter, TrendingDown, Lightbulb, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';

interface FunnelStep {
    name: string;
    users: number;
    conversion: number;
    dropOff: number;
}

interface FunnelReport {
    funnelType: string;
    period: { start: string; end: string };
    totalUsers: number;
    steps: FunnelStep[];
    overallConversion: number;
    biggestDropOff: {
        fromStep: string;
        toStep: string;
        dropOffCount: number;
        dropOffRate: number;
    } | null;
    recommendations: string[];
}

interface FunnelAnalysisProps {
    storeId: string;
    className?: string;
}

const FUNNEL_TYPES = [
    { value: 'product_view_to_purchase', label: 'Product View → Purchase' },
    { value: 'ai_conversation_to_sale', label: 'AI Conversation → Sale' },
    { value: 'cart_to_checkout', label: 'Cart → Checkout' },
    { value: 'checkout_to_payment', label: 'Checkout → Payment' },
];

export function FunnelAnalysis({ storeId, className }: FunnelAnalysisProps) {
    const [report, setReport] = useState<FunnelReport | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [funnelType, setFunnelType] = useState('product_view_to_purchase');
    const [days, setDays] = useState('30');

    useEffect(() => {
        fetchFunnelData();
    }, [storeId, funnelType, days]);

    const fetchFunnelData = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch(
                `/api/v1/analytics/funnel?type=${funnelType}&days=${days}`
            );

            if (!response.ok) {
                throw new Error('Failed to fetch funnel data');
            }

            const data = await response.json();
            setReport(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <Card className={className}>
                <CardHeader>
                    <Skeleton className="h-6 w-48" />
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <Skeleton className="h-16 w-full" />
                        <Skeleton className="h-16 w-full" />
                        <Skeleton className="h-16 w-full" />
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (error) {
        return (
            <Card className={className}>
                <CardContent className="pt-6">
                    <div className="text-center text-red-500">
                        <p>{error}</p>
                        <Button onClick={fetchFunnelData} variant="outline" className="mt-2">
                            Retry
                        </Button>
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (!report || report.steps.length === 0) {
        return (
            <Card className={className}>
                <CardContent className="pt-6">
                    <div className="text-center text-gray-500">
                        <Filter className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p>No funnel data available</p>
                        <p className="text-sm">Start receiving traffic to see conversion data</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className={className}>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Filter className="h-5 w-5" />
                        Funnel Analysis
                    </CardTitle>
                    <p className="text-sm text-gray-500 mt-1">
                        {FUNNEL_TYPES.find(t => t.value === funnelType)?.label}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Select value={days} onValueChange={setDays}>
                        <SelectTrigger className="w-28">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="7">Last 7 days</SelectItem>
                            <SelectItem value="30">Last 30 days</SelectItem>
                            <SelectItem value="90">Last 90 days</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select value={funnelType} onValueChange={setFunnelType}>
                        <SelectTrigger className="w-48">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {FUNNEL_TYPES.map(type => (
                                <SelectItem key={type.value} value={type.value}>
                                    {type.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Button variant="outline" size="icon" onClick={fetchFunnelData}>
                        <RefreshCw className="h-4 w-4" />
                    </Button>
                </div>
            </CardHeader>

            <CardContent className="space-y-6">
                {/* Funnel Visualization */}
                <div className="space-y-3">
                    {report.steps.map((step, idx) => {
                        const isLast = idx === report.steps.length - 1;
                        const prevStep = idx > 0 ? report.steps[idx - 1] : null;
                        const isBiggestDropOff = report.biggestDropOff &&
                            prevStep?.name === report.biggestDropOff.fromStep &&
                            step.name === report.biggestDropOff.toStep;

                        return (
                            <div key={idx} className="relative">
                                <div
                                    className={cn(
                                        'p-4 rounded-lg border transition-all',
                                        isBiggestDropOff
                                            ? 'border-red-300 bg-red-50'
                                            : 'border-gray-100 bg-white hover:bg-green-50'
                                    )}
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-medium">{step.name}</span>
                                            {isBiggestDropOff && (
                                                <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                                                    <TrendingDown className="h-3 w-3" />
                                                    Biggest Drop-off
                                                </span>
                                            )}
                                        </div>
                                        <span className="text-sm font-semibold">
                                            {step.users.toLocaleString()} users
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        <Progress
                                            value={step.conversion}
                                            className="flex-1 h-2"
                                        />
                                        <span className={cn(
                                            'text-xs font-medium w-16 text-right',
                                            step.conversion < 30 ? 'text-red-600' :
                                                step.conversion < 60 ? 'text-yellow-600' :
                                                    'text-green-600'
                                        )}>
                                            {step.conversion.toFixed(1)}%
                                        </span>
                                    </div>

                                    {idx > 0 && step.dropOff > 0 && (
                                        <p className="text-xs text-gray-500 mt-1">
                                            {step.dropOff.toLocaleString()} users dropped off
                                            ({((step.dropOff / (prevStep?.users || 1)) * 100).toFixed(1)}%)
                                        </p>
                                    )}
                                </div>

                                {!isLast && (
                                    <div className="flex justify-center py-1">
                                        <div className="w-0.5 h-4 bg-border" />
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Summary Stats */}
                <div className="grid grid-cols-2 gap-4 p-4 bg-gray-100 rounded-lg">
                    <div>
                        <p className="text-sm text-gray-500">Overall Conversion</p>
                        <p className={cn(
                            'text-2xl font-bold',
                            report.overallConversion < 1 ? 'text-red-600' :
                                report.overallConversion < 5 ? 'text-yellow-600' :
                                    'text-green-600'
                        )}>
                            {report.overallConversion.toFixed(2)}%
                        </p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Total Users</p>
                        <p className="text-2xl font-bold">
                            {report.totalUsers.toLocaleString()}
                        </p>
                    </div>
                </div>

                {/* Recommendations */}
                {report.recommendations.length > 0 && (
                    <div className="space-y-2">
                        <h4 className="text-sm font-medium flex items-center gap-2">
                            <Lightbulb className="h-4 w-4 text-yellow-500" />
                            Recommendations
                        </h4>
                        <ul className="space-y-1">
                            {report.recommendations.map((rec, idx) => (
                                <li
                                    key={idx}
                                    className="text-sm text-gray-500 flex items-start gap-2"
                                >
                                    <span className="text-green-500">•</span>
                                    {rec}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
