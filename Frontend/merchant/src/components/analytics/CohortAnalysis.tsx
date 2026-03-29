/**
 * Cohort Analysis Dashboard Component
 * Displays retention and revenue cohorts in a heatmap
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Users, TrendingUp, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';

interface CohortData {
    cohortMonth: string;
    initialUsers: number;
    weeks: (number | null)[];
}

interface CohortReport {
    metricType: 'retention' | 'revenue' | 'orders' | 'ltv';
    cohorts: CohortData[];
    averageRetention: number[];
}

interface CohortAnalysisProps {
    storeId: string;
    className?: string;
}

function getRetentionColor(value: number | null): string {
    if (value === null) return 'bg-gray-100';
    if (value >= 80) return 'bg-green-500 text-white';
    if (value >= 60) return 'bg-green-400 text-white';
    if (value >= 40) return 'bg-yellow-400 text-black';
    if (value >= 20) return 'bg-orange-400 text-white';
    return 'bg-red-400 text-white';
}

function formatPercentage(value: number | null): string {
    if (value === null) return '-';
    return `${value.toFixed(1)}%`;
}

export function CohortAnalysis({ storeId, className }: CohortAnalysisProps) {
    const [report, setReport] = useState<CohortReport | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [metricType, setMetricType] = useState<'retention' | 'revenue'>('retention');

    useEffect(() => {
        fetchCohortData();
    }, [storeId, metricType]);

    const fetchCohortData = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch(
                `/api/v1/analytics/cohort?type=${metricType}&months=6`
            );

            if (!response.ok) {
                throw new Error('Failed to fetch cohort data');
            }

            const data = await response.json();
            setReport(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    const handleRecalculate = async () => {
        try {
            setLoading(true);

            const response = await fetch('/v1/analytics/cohort', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type: metricType, months: 6 }),
            });

            if (!response.ok) {
                throw new Error('Failed to recalculate cohort data');
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
                    <div className="space-y-2">
                        <Skeleton className="h-8 w-full" />
                        <Skeleton className="h-8 w-full" />
                        <Skeleton className="h-8 w-full" />
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
                        <Button onClick={fetchCohortData} variant="outline" className="mt-2">
                            Retry
                        </Button>
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (!report || report.cohorts.length === 0) {
        return (
            <Card className={className}>
                <CardContent className="pt-6">
                    <div className="text-center text-gray-500">
                        <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p>No cohort data available yet</p>
                        <p className="text-sm">Data will appear as customers make repeat purchases</p>
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
                        <Users className="h-5 w-5" />
                        Cohort Analysis
                    </CardTitle>
                    <p className="text-sm text-gray-500 mt-1">
                        Track customer {metricType} over time
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Select value={metricType} onValueChange={(v) => setMetricType(v as typeof metricType)}>
                        <SelectTrigger className="w-32">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="retention">Retention</SelectItem>
                            <SelectItem value="revenue">Revenue</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button variant="outline" size="sm" onClick={handleRecalculate}>
                        <TrendingUp className="h-4 w-4 mr-1" />
                        Refresh
                    </Button>
                </div>
            </CardHeader>

            <CardContent>
                {/* Cohort Heatmap */}
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr>
                                <th className="text-left p-2 font-medium">Cohort</th>
                                <th className="text-center p-2 font-medium">Users</th>
                                {Array.from({ length: 13 }, (_, i) => (
                                    <th key={i} className="text-center p-2 font-medium w-12">
                                        W{i}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {report.cohorts.map((cohort, idx) => (
                                <tr key={idx} className="border-t">
                                    <td className="p-2 font-medium">
                                        <div className="flex items-center gap-1">
                                            <Calendar className="h-3 w-3" />
                                            {new Date(cohort.cohortMonth).toLocaleDateString('en-US', {
                                                month: 'short',
                                                year: '2-digit',
                                            })}
                                        </div>
                                    </td>
                                    <td className="text-center p-2 text-gray-500">
                                        {cohort.initialUsers}
                                    </td>
                                    {cohort.weeks.map((week, weekIdx) => (
                                        <td
                                            key={weekIdx}
                                            className={cn(
                                                'p-2 text-center text-xs font-medium',
                                                getRetentionColor(week)
                                            )}
                                        >
                                            {formatPercentage(week)}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                        <tfoot className="border-t-2">
                            <tr>
                                <td className="p-2 font-medium" colSpan={2}>
                                    Average
                                </td>
                                {report.averageRetention.map((avg, idx) => (
                                    <td
                                        key={idx}
                                        className={cn(
                                            'p-2 text-center text-xs font-medium',
                                            getRetentionColor(avg)
                                        )}
                                    >
                                        {formatPercentage(avg)}
                                    </td>
                                ))}
                            </tr>
                        </tfoot>
                    </table>
                </div>

                {/* Legend */}
                <div className="flex items-center gap-4 mt-4 text-xs">
                    <span className="text-gray-500">Retention:</span>
                    <div className="flex items-center gap-1">
                        <div className="w-4 h-4 bg-red-400 rounded" />
                        <span>&lt;20%</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="w-4 h-4 bg-orange-400 rounded" />
                        <span>20-40%</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="w-4 h-4 bg-yellow-400 rounded" />
                        <span>40-60%</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="w-4 h-4 bg-green-400 rounded" />
                        <span>60-80%</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="w-4 h-4 bg-green-500 rounded" />
                        <span>80%+</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
