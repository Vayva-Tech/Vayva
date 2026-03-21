// @ts-nocheck
// ============================================================================
// Universal AI Insights Panel
// ============================================================================
// Industry-agnostic AI insights component with predictive analytics
// Supports demand forecasting, anomaly detection, and smart recommendations
// ============================================================================

'use client';

import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  Lightbulb,
  Target,
  Zap,
  Brain,
  RefreshCcw,
  ChevronDown,
  ChevronUp,
  ArrowRight
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { apiJson } from '@/lib/api-client-shared';

// ============================================================================
// Types
// ============================================================================

export interface AIInsight {
  id: string;
  type: 'opportunity' | 'warning' | 'info' | 'prediction' | 'recommendation';
  title: string;
  description: string;
  confidence: number; // 0-1
  impact: 'low' | 'medium' | 'high' | 'critical';
  category: 'revenue' | 'inventory' | 'customer' | 'operations' | 'marketing';
  details?: string;
  recommendation?: string;
  predictedImpact?: string;
  actions?: Array<{ label: string; action: () => void; icon?: React.ReactNode }>;
  expiresAt?: Date;
  metadata?: Record<string, unknown>;
}

export interface PredictiveForecast {
  metric: string;
  currentValue: number;
  predictedValue: number;
  changePercent: number;
  confidenceInterval: { low: number; high: number };
  timeframe: string;
  factors: string[];
}

interface AIInsightsPanelProps {
  industry: string;
  storeId: string;
  planTier?: 'basic' | 'standard' | 'advanced' | 'pro';
  onInsightAction?: (insight: AIInsight, action: string) => void;
  className?: string;
}

// ============================================================================
// Main Component
// ============================================================================

export function AIInsightsPanel({
  industry,
  storeId,
  planTier = 'standard',
  onInsightAction,
  className,
}: AIInsightsPanelProps) {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [forecasts, setForecasts] = useState<PredictiveForecast[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [expandedInsight, setExpandedInsight] = useState<string | null>(null);

  // Load insights
  const loadInsights = async () => {
    try {
      const data = await apiJson(`/api/ai/insights?storeId=${storeId}&industry=${industry}`);

      if (data.success) {
        setInsights(data.insights || []);
        setForecasts(data.forecasts || []);
      }
    } catch (error) {
      console.error('Failed to load AI insights:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadInsights();
  }, [industry, storeId]);

  // Handle manual refresh
  const handleRefresh = () => {
    setRefreshing(true);
    loadInsights();
  };

  // Filter insights by category
  const filteredInsights = selectedCategory === 'all'
    ? insights
    : insights.filter(i => i.category === selectedCategory);

  // Get insight icon based on type
  const getInsightIcon = (type: AIInsight['type']) => {
    switch (type) {
      case 'opportunity':
        return <TrendingUp className="w-5 h-5 text-green-600" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      case 'info':
        return <Lightbulb className="w-5 h-5 text-blue-600" />;
      case 'prediction':
        return <Brain className="w-5 h-5 text-purple-600" />;
      case 'recommendation':
        return <Target className="w-5 h-5 text-orange-600" />;
    }
  };

  // Get impact badge color
  const getImpactBadge = (impact: AIInsight['impact']) => {
    const colors = {
      low: 'bg-blue-100 text-blue-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-orange-100 text-orange-800',
      critical: 'bg-red-100 text-red-800',
    };
    return colors[impact];
  };

  // Upgrade prompt for non-pro users
  if (planTier !== 'pro') {
    return (
      <Card className={`bg-gradient-to-r from-purple-950/30 to-green-950/30 border-purple-500/20 ${className}`}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <Sparkles className="w-6 h-6 text-purple-400 animate-pulse" />
              </div>
              <div>
                <CardTitle className="text-lg">AI-Powered Insights</CardTitle>
                <CardDescription className="text-purple-200/70">
                  Get predictive analytics and smart recommendations
                </CardDescription>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Alert className="bg-purple-900/20 border-purple-500/30 mb-4">
            <Sparkles className="h-4 w-4 text-purple-400" />
            <AlertDescription className="text-purple-200/80">
              Upgrade to Pro to unlock AI features including demand forecasting, 
              anomaly detection, and automated recommendations.
            </AlertDescription>
          </Alert>
          <Button variant="primary" className="w-full" onClick={() => window.location.href = '/dashboard/settings/subscription'}>
            Upgrade to Pro Plan
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Loading state
  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <Sparkles className="w-6 h-6 text-purple-400 animate-pulse" />
            </div>
            <div>
              <CardTitle>AI Insights</CardTitle>
              <CardDescription>
                Intelligent recommendations powered by machine learning
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={refreshing}
            >
              <RefreshCcw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="revenue">Revenue</TabsTrigger>
            <TabsTrigger value="inventory">Inventory</TabsTrigger>
            <TabsTrigger value="customer">Customers</TabsTrigger>
            <TabsTrigger value="operations">Operations</TabsTrigger>
            <TabsTrigger value="marketing">Marketing</TabsTrigger>
          </TabsList>

          <div className="mt-4 space-y-3">
            {filteredInsights.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Brain className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No insights available at the moment</p>
                <p className="text-sm mt-1">Check back later or refresh to generate new insights</p>
              </div>
            ) : (
              filteredInsights.map((insight) => (
                <div
                  key={insight.id}
                  className={`border rounded-lg transition-all hover:shadow-md ${
                    insight.type === 'warning'
                      ? 'bg-yellow-50 border-yellow-200'
                      : insight.type === 'opportunity'
                      ? 'bg-green-50 border-green-200'
                      : 'bg-white border-gray-200'
                  }`}
                >
                  {/* Insight Header */}
                  <div
                    className="p-4 cursor-pointer"
                    onClick={() => setExpandedInsight(expandedInsight === insight.id ? null : insight.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        {getInsightIcon(insight.type)}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold text-sm">{insight.title}</h4>
                            <Badge className={`${getImpactBadge(insight.impact)} text-xs`}>
                              {insight.impact} impact
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-500">{insight.description}</p>
                          
                          {/* Confidence Bar */}
                          <div className="flex items-center gap-2 mt-2">
                            <Progress value={insight.confidence * 100} className="h-1.5 flex-1" />
                            <span className="text-xs text-gray-500">
                              {(insight.confidence * 100).toFixed(0)}% confidence
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <Button variant="ghost" size="sm" className="ml-2">
                        {expandedInsight === insight.id ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {expandedInsight === insight.id && (
                    <div className="px-4 pb-4 border-t pt-3 space-y-3">
                      {insight.details && (
                        <div>
                          <h5 className="font-medium text-sm mb-1">Details</h5>
                          <p className="text-sm text-gray-500">{insight.details}</p>
                        </div>
                      )}
                      
                      {insight.recommendation && (
                        <div>
                          <h5 className="font-medium text-sm mb-1">Recommendation</h5>
                          <p className="text-sm text-gray-500">{insight.recommendation}</p>
                        </div>
                      )}
                      
                      {insight.predictedImpact && (
                        <div>
                          <h5 className="font-medium text-sm mb-1">Predicted Impact</h5>
                          <p className="text-sm font-medium text-green-500">{insight.predictedImpact}</p>
                        </div>
                      )}
                      
                      {insight.actions && insight.actions.length > 0 && (
                        <div className="flex gap-2 pt-2">
                          {insight.actions.map((action, idx) => (
                            <Button
                              key={idx}
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                action.action();
                                onInsightAction?.(insight, action.label);
                              }}
                            >
                              {action.icon}
                              <span className="ml-1">{action.label}</span>
                            </Button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </Tabs>

        {/* Predictive Forecasts Section */}
        {forecasts.length > 0 && (
          <>
            <div className="mt-6 pt-6 border-t">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Brain className="w-5 h-5 text-purple-600" />
                Predictive Forecasts
              </h3>
              
              <div className="grid gap-4 md:grid-cols-2">
                {forecasts.map((forecast) => (
                  <div key={forecast.metric} className="p-4 bg-gradient-to-br from-purple-50 to-green-50 rounded-lg border border-purple-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium capitalize">{forecast.metric}</span>
                      <Badge variant={forecast.changePercent >= 0 ? 'default' : 'destructive'}>
                        {forecast.changePercent >= 0 ? '+' : ''}{forecast.changePercent.toFixed(1)}%
                      </Badge>
                    </div>
                    
                    <div className="flex items-baseline gap-2 mb-2">
                      <span className="text-2xl font-bold">{forecast.currentValue.toLocaleString()}</span>
                      <ArrowRight className="w-4 h-4 text-gray-500" />
                      <span className="text-xl font-semibold text-purple-600">
                        {forecast.predictedValue.toLocaleString()}
                      </span>
                    </div>
                    
                    <p className="text-xs text-gray-500 mb-2">
                      Predicted for {forecast.timeframe}
                    </p>
                    
                    <div className="flex items-center gap-1 text-xs text-purple-600">
                      <Zap className="w-3 h-3" />
                      <span>{(forecast.confidenceInterval.high - forecast.confidenceInterval.low).toFixed(0)}% confidence range</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

export default AIInsightsPanel;
