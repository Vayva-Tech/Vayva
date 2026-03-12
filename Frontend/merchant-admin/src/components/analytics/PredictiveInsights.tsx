/**
 * Predictive Insights Dashboard Component
 * Displays AI-powered predictions for churn, inventory, and revenue
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Brain, AlertTriangle, Package, TrendingUp, CheckCircle, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface ChurnPrediction {
    riskScore: number;
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
    factors: Array<{
        factor: string;
        impact: 'positive' | 'negative';
        weight: number;
    }>;
    recommendedAction: string;
}

interface InventoryForecast {
    productId: string;
    productName: string;
    currentStock: number;
    predictedDemand: number;
    daysUntilStockout: number | null;
    recommendedReorderQuantity: number;
    confidence: number;
}

interface RevenuePrediction {
    predictedRevenue: number;
    confidenceInterval: { low: number; high: number };
    growthRate: number;
    factors: string[];
}

interface PredictiveInsightsProps {
    storeId: string;
    className?: string;
}

function getRiskColor(level: string): string {
    switch (level) {
        case 'low': return 'bg-green-100 text-green-700 border-green-200';
        case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
        case 'high': return 'bg-orange-100 text-orange-700 border-orange-200';
        case 'critical': return 'bg-red-100 text-red-700 border-red-200';
        default: return 'bg-gray-100 text-gray-700';
    }
}

function getRiskIcon(level: string) {
    switch (level) {
        case 'low': return <CheckCircle className="h-4 w-4 text-green-600" />;
        case 'medium': return <Clock className="h-4 w-4 text-yellow-600" />;
        case 'high':
        case 'critical': return <AlertTriangle className="h-4 w-4 text-red-600" />;
        default: return null;
    }
}

export function PredictiveInsights({ storeId, className }: PredictiveInsightsProps) {
    const [churnPrediction, setChurnPrediction] = useState<ChurnPrediction | null>(null);
    const [inventoryForecasts, setInventoryForecasts] = useState<InventoryForecast[]>([]);
    const [revenuePrediction, setRevenuePrediction] = useState<RevenuePrediction | null>(null);
    const [loading, setLoading] = useState({
        churn: false,
        inventory: false,
        revenue: false,
    });

    const fetchChurnPrediction = async () => {
        try {
            setLoading(prev => ({ ...prev, churn: true }));
            const response = await fetch('/api/v1/analytics/predictive/churn', {
                method: 'POST',
            });
            if (response.ok) {
                const data = await response.json();
                setChurnPrediction(data);
            }
        } finally {
            setLoading(prev => ({ ...prev, churn: false }));
        }
    };

    const fetchInventoryForecasts = async () => {
        try {
            setLoading(prev => ({ ...prev, inventory: true }));
            const response = await fetch('/api/v1/analytics/predictive/inventory', {
                method: 'POST',
            });
            if (response.ok) {
                const data = await response.json();
                setInventoryForecasts(data.forecasts.slice(0, 5)); // Top 5 urgent
            }
        } finally {
            setLoading(prev => ({ ...prev, inventory: false }));
        }
    };

    const fetchRevenuePrediction = async () => {
        try {
            setLoading(prev => ({ ...prev, revenue: true }));
            const response = await fetch('/api/v1/analytics/predictive/revenue', {
                method: 'POST',
            });
            if (response.ok) {
                const data = await response.json();
                setRevenuePrediction(data);
            }
        } finally {
            setLoading(prev => ({ ...prev, revenue: false }));
        }
    };

    useEffect(() => {
        fetchChurnPrediction();
        fetchInventoryForecasts();
        fetchRevenuePrediction();
    }, [storeId]);

    return (
        <Card className={className}>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Brain className="h-5 w-5 text-purple-500" />
                        AI Predictions
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                        Smart insights powered by machine learning
                    </p>
                </div>
            </CardHeader>

            <CardContent>
                <Tabs defaultValue="churn" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="churn">Churn Risk</TabsTrigger>
                        <TabsTrigger value="inventory">Inventory</TabsTrigger>
                        <TabsTrigger value="revenue">Revenue</TabsTrigger>
                    </TabsList>

                    {/* Churn Risk Tab */}
                    <TabsContent value="churn" className="space-y-4">
                        {loading.churn ? (
                            <div className="space-y-2">
                                <Skeleton className="h-20 w-full" />
                                <Skeleton className="h-16 w-full" />
                            </div>
                        ) : churnPrediction ? (
                            <>
                                <div className={cn(
                                    'p-4 rounded-lg border',
                                    getRiskColor(churnPrediction.riskLevel)
                                )}>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium">Churn Risk</p>
                                            <p className="text-2xl font-bold">
                                                {churnPrediction.riskScore}/100
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {getRiskIcon(churnPrediction.riskLevel)}
                                            <Badge variant="outline" className="capitalize">
                                                {churnPrediction.riskLevel}
                                            </Badge>
                                        </div>
                                    </div>
                                </div>

                                {churnPrediction.factors.length > 0 && (
                                    <div className="space-y-2">
                                        <h4 className="text-sm font-medium">Key Factors</h4>
                                        <div className="space-y-1">
                                            {churnPrediction.factors.map((factor, idx) => (
                                                <div
                                                    key={idx}
                                                    className="flex items-center justify-between text-sm"
                                                >
                                                    <span className="flex items-center gap-2">
                                                        <span className={cn(
                                                            'h-2 w-2 rounded-full',
                                                            factor.impact === 'negative'
                                                                ? 'text-red-500'
                                                                : 'text-green-500'
                                                        )}>
                                                            {factor.impact === 'negative' ? '↓' : '↑'}
                                                        </span>
                                                        {factor.factor}
                                                    </span>
                                                    <span className="text-muted-foreground">
                                                        {(factor.weight * 100).toFixed(0)}%
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {churnPrediction.recommendedAction && (
                                    <div className="p-3 bg-muted rounded-lg">
                                        <p className="text-sm font-medium mb-1">Recommended Action</p>
                                        <p className="text-sm text-muted-foreground">
                                            {churnPrediction.recommendedAction}
                                        </p>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="text-center py-8 text-muted-foreground">
                                <Brain className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                <p>No churn prediction available</p>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={fetchChurnPrediction}
                                    className="mt-2"
                                >
                                    Generate Prediction
                                </Button>
                            </div>
                        )}
                    </TabsContent>

                    {/* Inventory Tab */}
                    <TabsContent value="inventory" className="space-y-4">
                        {loading.inventory ? (
                            <div className="space-y-2">
                                <Skeleton className="h-16 w-full" />
                                <Skeleton className="h-16 w-full" />
                                <Skeleton className="h-16 w-full" />
                            </div>
                        ) : inventoryForecasts.length > 0 ? (
                            <div className="space-y-3">
                                {inventoryForecasts.map((forecast) => (
                                    <div
                                        key={forecast.productId}
                                        className={cn(
                                            'p-3 rounded-lg border',
                                            forecast.daysUntilStockout !== null &&
                                                forecast.daysUntilStockout <= 7
                                                ? 'border-red-200 bg-red-50'
                                                : 'border-border'
                                        )}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <Package className="h-4 w-4 text-muted-foreground" />
                                                <span className="font-medium text-sm truncate max-w-[150px]">
                                                    {forecast.productName}
                                                </span>
                                            </div>
                                            {forecast.daysUntilStockout !== null &&
                                                forecast.daysUntilStockout <= 7 && (
                                                <Badge variant="destructive" className="text-xs">
                                                    {forecast.daysUntilStockout} days left
                                                </Badge>
                                            )}
                                        </div>
                                        <div className="flex items-center justify-between mt-2 text-sm">
                                            <span className="text-muted-foreground">
                                                Stock: {forecast.currentStock}
                                            </span>
                                            <span className="text-muted-foreground">
                                                Demand: {forecast.predictedDemand}
                                            </span>
                                        </div>
                                        <div className="mt-2 text-xs text-muted-foreground">
                                            Reorder: {forecast.recommendedReorderQuantity} units
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-muted-foreground">
                                <Package className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                <p>No inventory forecasts available</p>
                            </div>
                        )}
                    </TabsContent>

                    {/* Revenue Tab */}
                    <TabsContent value="revenue" className="space-y-4">
                        {loading.revenue ? (
                            <div className="space-y-2">
                                <Skeleton className="h-20 w-full" />
                                <Skeleton className="h-16 w-full" />
                            </div>
                        ) : revenuePrediction ? (
                            <>
                                <div className="p-4 bg-muted rounded-lg">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-muted-foreground">
                                                Predicted Revenue (Next Month)
                                            </p>
                                            <p className="text-2xl font-bold">
                                                ₦{revenuePrediction.predictedRevenue.toLocaleString()}
                                            </p>
                                        </div>
                                        <div className={cn(
                                            'flex items-center gap-1',
                                            revenuePrediction.growthRate >= 0
                                                ? 'text-green-600'
                                                : 'text-red-600'
                                        )}>
                                            <TrendingUp className="h-4 w-4" />
                                            <span className="font-medium">
                                                {revenuePrediction.growthRate >= 0 ? '+' : ''}
                                                {(revenuePrediction.growthRate * 100).toFixed(1)}%
                                            </span>
                                        </div>
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-2">
                                        Confidence: ₦{revenuePrediction.confidenceInterval.low.toLocaleString()} - ₦
                                        {revenuePrediction.confidenceInterval.high.toLocaleString()}
                                    </p>
                                </div>

                                {revenuePrediction.factors.length > 0 && (
                                    <div className="space-y-2">
                                        <h4 className="text-sm font-medium">Contributing Factors</h4>
                                        <ul className="space-y-1">
                                            {revenuePrediction.factors.map((factor, idx) => (
                                                <li
                                                    key={idx}
                                                    className="text-sm text-muted-foreground flex items-start gap-2"
                                                >
                                                    <span className="text-primary">•</span>
                                                    {factor}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="text-center py-8 text-muted-foreground">
                                <TrendingUp className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                <p>No revenue prediction available</p>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={fetchRevenuePrediction}
                                    className="mt-2"
                                >
                                    Generate Prediction
                                </Button>
                            </div>
                        )}
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    );
}
