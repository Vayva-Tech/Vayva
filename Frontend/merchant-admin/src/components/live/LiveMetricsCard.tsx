/**
 * Live Metrics Card Component
 * Displays real-time business metrics with trend indicators
 */

'use client';

import React from 'react';
import { TrendingUp, TrendingDown, Minus, DollarSign, ShoppingCart, MessageCircle, Users } from 'lucide-react';
import { useLiveMetrics } from '@vayva/realtime';
import { cn } from '@/lib/utils';

interface LiveMetricsCardProps {
    storeId: string;
    className?: string;
}

interface MetricItemProps {
    label: string;
    value: string | number;
    trend: number;
    icon: React.ReactNode;
    prefix?: string;
    suffix?: string;
}

function MetricItem({ label, value, trend, icon, prefix = '', suffix = '' }: MetricItemProps) {
    const TrendIcon = trend > 0 ? TrendingUp : trend < 0 ? TrendingDown : Minus;
    const trendColor = trend > 0 ? 'text-green-600' : trend < 0 ? 'text-red-600' : 'text-gray-500';

    return (
        <div className="flex items-center justify-between p-3 rounded-lg bg-card border">
            <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    {icon}
                </div>
                <div>
                    <p className="text-xs text-muted-foreground">{label}</p>
                    <p className="text-lg font-semibold">
                        {prefix}{value}{suffix}
                    </p>
                </div>
            </div>
            <div className={cn('flex items-center gap-1 text-xs font-medium', trendColor)}>
                <TrendIcon className="h-3 w-3" />
                {Math.abs(trend).toFixed(1)}%
            </div>
        </div>
    );
}

export function LiveMetricsCard({ storeId, className }: LiveMetricsCardProps) {
    const { metrics, isConnected, error, reconnect } = useLiveMetrics(storeId);

    if (error) {
        return (
            <div className={cn('p-6 text-center border rounded-lg bg-card', className)}>
                <p className="text-sm text-destructive mb-2">
                    Failed to load metrics
                </p>
                <button
                    onClick={reconnect}
                    className="text-xs text-primary hover:underline"
                >
                    Try again
                </button>
            </div>
        );
    }

    if (!metrics) {
        return (
            <div className={cn('p-6 text-center border rounded-lg bg-card', className)}>
                <div className="animate-pulse space-y-3">
                    <div className="h-4 bg-muted rounded w-3/4 mx-auto" />
                    <div className="h-16 bg-muted rounded" />
                    <div className="h-16 bg-muted rounded" />
                </div>
            </div>
        );
    }

    return (
        <div className={cn('space-y-4', className)}>
            {/* Header */}
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium">Live Metrics</h3>
                <div className="flex items-center gap-2">
                    <span
                        className={cn(
                            'h-2 w-2 rounded-full',
                            isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'
                        )}
                    />
                    <span className="text-xs text-muted-foreground">
                        {isConnected ? 'Live' : 'Disconnected'}
                    </span>
                </div>
            </div>

            {/* Metrics Grid */}
            <div className="space-y-3">
                <MetricItem
                    label="Orders (Last Hour)"
                    value={metrics.orders.lastHour}
                    trend={metrics.orders.trend}
                    icon={<ShoppingCart className="h-5 w-5 text-primary" />}
                />

                <MetricItem
                    label="Revenue (Last Hour)"
                    value={metrics.revenue.lastHour.toLocaleString()}
                    trend={metrics.revenue.trend}
                    icon={<DollarSign className="h-5 w-5 text-primary" />}
                    prefix="₦"
                />

                <MetricItem
                    label="Active Conversations"
                    value={metrics.conversations.active}
                    trend={0}
                    icon={<MessageCircle className="h-5 w-5 text-primary" />}
                />

                <MetricItem
                    label="Active Customers"
                    value={metrics.customers.active}
                    trend={0}
                    icon={<Users className="h-5 w-5 text-primary" />}
                />
            </div>

            {/* Total Summary */}
            <div className="pt-3 border-t">
                <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Today's Total Revenue</span>
                    <span className="font-semibold">₦{metrics.revenue.total.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between text-sm mt-1">
                    <span className="text-muted-foreground">Today's Total Orders</span>
                    <span className="font-semibold">{metrics.orders.total}</span>
                </div>
            </div>
        </div>
    );
}
