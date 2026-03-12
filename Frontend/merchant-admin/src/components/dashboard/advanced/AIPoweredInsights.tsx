'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Lightbulb, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2, 
  RefreshCw,
  Sparkles,
  Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { DesignCategory } from '@/components/vayva-ui/VayvaThemeProvider';

interface Insight {
  id: string;
  type: 'opportunity' | 'risk' | 'optimization' | 'confirmation';
  title: string;
  description: string;
  confidence: number;
  priority: 'high' | 'medium' | 'low';
  suggestedAction?: string;
  impactScore: number;
  timeframe?: string;
}

interface AIPoweredInsightsProps {
  industry: string;
  designCategory: DesignCategory;
  planTier: string;
  loading?: boolean;
  className?: string;
  onRefresh?: () => void;
}

/**
 * AIPoweredInsights - Advanced AI-powered business insights panel
 * Provides intelligent recommendations and predictions based on business data
 */
export function AIPoweredInsights({
  industry,
  designCategory,
  planTier,
  loading = false,
  className,
  onRefresh
}: AIPoweredInsightsProps) {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Mock insights data - would come from AI service in production
  useEffect(() => {
    if (!loading) {
      const mockInsights: Insight[] = [
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
    } finally {
      setIsRefreshing(false);
    }
  };

  const getTypeConfig = (type: Insight['type']) => {
    const configs = {
      opportunity: {
        icon: <TrendingUp className="h-4 w-4" />,
        label: 'Opportunity',
        badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-200'
      },
      risk: {
        icon: <AlertTriangle className="h-4 w-4" />,
        label: 'Risk',
        badgeClass: 'bg-rose-100 text-rose-800 border-rose-200'
      },
      optimization: {
        icon: <Zap className="h-4 w-4" />,
        label: 'Optimization',
        badgeClass: 'bg-blue-100 text-blue-800 border-blue-200'
      },
      confirmation: {
        icon: <CheckCircle2 className="h-4 w-4" />,
        label: 'Confirmation',
        badgeClass: 'bg-purple-100 text-purple-800 border-purple-200'
      }
    };
    return configs[type];
  };

  const getPriorityBadge = (priority: Insight['priority']) => {
    const priorities = {
      high: 'bg-red-100 text-red-800',
      medium: 'bg-yellow-100 text-yellow-800',
      low: 'bg-green-100 text-green-800'
    };
    return priorities[priority];
  };

  if (loading) {
    return (
      <Card className={cn("rounded-[28px] border border-border/60", className)}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-6">
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-5 rounded-full" />
            <Skeleton className="h-6 w-32" />
          </div>
          <Skeleton className="h-8 w-8 rounded-full" />
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-3/4" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("rounded-[28px] border border-border/60", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-6">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 text-white">
            <Sparkles className="h-5 w-5" />
          </div>
          <CardTitle className="text-lg font-bold">AI-Powered Insights</CardTitle>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleRefresh}
          disabled={isRefreshing}
        >
          <RefreshCw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
        </Button>
      </CardHeader>
      
      <CardContent className="p-6">
        <div className="space-y-4">
          {insights.map((insight) => {
            const typeConfig = getTypeConfig(insight.type);
            return (
              <div 
                key={insight.id}
                className="p-4 rounded-xl border border-border/40 hover:border-border/60 transition-colors group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant="secondary" 
                      className={cn("text-xs font-medium", typeConfig.badgeClass)}
                    >
                      {typeConfig.icon}
                      <span className="ml-1">{typeConfig.label}</span>
                    </Badge>
                    <Badge 
                      variant="secondary" 
                      className={cn("text-xs", getPriorityBadge(insight.priority))}
                    >
                      {insight.priority} priority
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-text-secondary">
                    <span>{insight.confidence}% confidence</span>
                    <span>•</span>
                    <span>{insight.timeframe}</span>
                  </div>
                </div>
                
                <h3 className="font-semibold text-text-primary mb-2 group-hover:text-primary transition-colors">
                  {insight.title}
                </h3>
                
                <p className="text-sm text-text-secondary mb-3">
                  {insight.description}
                </p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {insight.suggestedAction && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="text-xs"
                      >
                        {insight.suggestedAction}
                      </Button>
                    )}
                    <div className="flex items-center gap-1 text-xs">
                      <span className="text-text-secondary">Impact:</span>
                      <span className="font-medium text-text-primary">{insight.impactScore}/100</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1 text-xs text-text-secondary">
                    <Lightbulb className="h-3 w-3" />
                    <span>AI Generated</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        {insights.length === 0 && (
          <div className="text-center py-8">
            <Lightbulb className="h-12 w-12 mx-auto text-text-tertiary mb-3" />
            <p className="text-text-secondary">No insights available at this time</p>
            <p className="text-xs text-text-tertiary mt-1">
              Check back later for AI-powered recommendations
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}