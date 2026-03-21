'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  TrendingUp, 
  TrendingDown, 
  Activity,
  Calendar,
  DollarSign,
  Users,
  ShoppingCart,
  BarChart3
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { DesignCategory } from '@/components/vayva-ui/VayvaThemeProvider';

interface Prediction {
  id: string;
  metric: string;
  currentValue: number;
  predictedValue: number;
  confidence: number;
  timeframe: string;
  trend: 'up' | 'down' | 'stable';
  factors: string[];
  recommendation?: string;
}

interface PredictiveAnalyticsProps {
  industry: string;
  designCategory: DesignCategory;
  planTier: string;
  loading?: boolean;
  className?: string;
}

/**
 * PredictiveAnalytics - Advanced forecasting and trend prediction
 * Uses machine learning to predict future business metrics
 */
export function PredictiveAnalytics({
  industry,
  designCategory,
  planTier,
  loading = false,
  className
}: PredictiveAnalyticsProps) {
  const [predictions, setPredictions] = useState<Prediction[]>([]);

  // Mock prediction data - would come from ML service in production
  useEffect(() => {
    if (!loading) {
      const mockPredictions: Prediction[] = [
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

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const getMetricIcon = (metric: string) => {
    const icons: Record<string, React.ReactNode> = {
      Revenue: <DollarSign className="h-4 w-4" />,
      'Customer Acquisition': <Users className="h-4 w-4" />,
      'Churn Rate': <Activity className="h-4 w-4" />,
      'Average Order Value': <ShoppingCart className="h-4 w-4" />
    };
    return icons[metric] || <BarChart3 className="h-4 w-4" />;
  };

  const getTrendColor = (trend: Prediction['trend'], isPositive: boolean) => {
    if (trend === 'stable') return 'text-blue-600';
    return isPositive ? 'text-green-600' : 'text-red-600';
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 85) return 'bg-green-500';
    if (confidence >= 70) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  if (loading) {
    return (
      <Card className={cn("rounded-2xl border border-gray-100", className)}>
        <CardHeader className="pb-2 p-6">
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="flex justify-between">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-16" />
              </div>
              <Skeleton className="h-2 w-full rounded-full" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("rounded-2xl border border-gray-100", className)}>
      <CardHeader className="pb-2 p-6">
        <CardTitle className="text-lg font-bold flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-green-500" />
          Predictive Analytics
        </CardTitle>
        <p className="text-sm text-gray-500 mt-1">
          AI-powered forecasts for key business metrics
        </p>
      </CardHeader>
      
      <CardContent className="p-6">
        <div className="space-y-6">
          {predictions.map((prediction) => {
            const isImprovement = prediction.trend === 'up' || 
              (prediction.trend === 'down' && prediction.metric.includes('Rate'));
            const changePercent = ((prediction.predictedValue - prediction.currentValue) / prediction.currentValue) * 100;
            const absoluteChange = Math.abs(changePercent);
            
            return (
              <div key={prediction.id} className="border-b border-gray-100 pb-6 last:border-b-0 last:pb-0">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-green-500/10 text-green-500">
                      {getMetricIcon(prediction.metric)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{prediction.metric}</h3>
                      <p className="text-xs text-gray-500 flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {prediction.timeframe}
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="flex items-center gap-1">
                      <span className={cn(
                        "text-sm font-medium",
                        getTrendColor(prediction.trend, isImprovement)
                      )}>
                        {isImprovement ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                        {absoluteChange.toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <Progress 
                        value={prediction.confidence} 
                        className="w-16 h-1.5"
                      />
                      <span className="text-xs text-gray-500">
                        {prediction.confidence}% confidence
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-3 text-sm">
                  <div>
                    <p className="text-gray-500">Current</p>
                    <p className="font-semibold text-gray-900">
                      {prediction.metric.includes('Rate') || prediction.metric.includes('$') 
                        ? `${prediction.currentValue}${prediction.metric.includes('Rate') ? '%' : ''}`
                        : prediction.metric.includes('Revenue') 
                          ? formatCurrency(prediction.currentValue)
                          : prediction.currentValue.toLocaleString()
                      }
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Predicted</p>
                    <p className="font-semibold text-gray-900">
                      {prediction.metric.includes('Rate') || prediction.metric.includes('$')
                        ? `${prediction.predictedValue}${prediction.metric.includes('Rate') ? '%' : ''}`
                        : prediction.metric.includes('Revenue')
                          ? formatCurrency(prediction.predictedValue)
                          : prediction.predictedValue.toLocaleString()
                      }
                    </p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <p className="text-xs text-gray-500">
                    <span className="font-medium">Key factors:</span> {prediction.factors.join(', ')}
                  </p>
                  
                  {prediction.recommendation && (
                    <Badge 
                      variant="secondary" 
                      className="text-xs bg-blue-50 text-blue-700 border-blue-200"
                    >
                      Recommendation: {prediction.recommendation}
                    </Badge>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        
        {predictions.length === 0 && (
          <div className="text-center py-8">
            <Activity className="h-12 w-12 mx-auto text-gray-400 mb-3" />
            <p className="text-gray-500">No predictions available</p>
            <p className="text-xs text-gray-400 mt-1">
              Predictive analytics will appear here when data is available
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}