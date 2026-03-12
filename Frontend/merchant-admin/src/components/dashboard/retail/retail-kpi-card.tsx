'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RetailKpiCardProps {
  title: string;
  value: string | number;
  change?: number;
  trend?: 'up' | 'down' | 'neutral';
  icon?: React.ReactNode;
  chartData?: number[];
  format?: 'currency' | 'number' | 'percent';
  className?: string;
}

export function RetailKpiCard({
  title,
  value,
  change,
  trend = 'neutral',
  icon,
  chartData,
  format = 'number',
  className,
}: RetailKpiCardProps) {
  const formatValue = (val: number) => {
    switch (format) {
      case 'currency':
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        }).format(val);
      case 'percent':
        return `${(val * 100).toFixed(1)}%`;
      default:
        return val.toLocaleString();
    }
  };

  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : null;
  
  return (
    <Card className={cn('retail-kpi-card', className)}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-muted-foreground">{title}</span>
          {icon && <div className="text-muted-foreground">{icon}</div>}
        </div>
        
        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-2xl font-bold">{formatValue(Number(value))}</span>
          {change !== undefined && (
            <div className={cn(
              'flex items-center text-xs font-medium',
              trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-gray-500'
            )}>
              {TrendIcon && <TrendIcon className="w-3 h-3 mr-1" />}
              {trend === 'up' ? '+' : ''}{(change * 100).toFixed(1)}%
            </div>
          )}
        </div>

        {chartData && chartData.length > 0 && (
          <div className="h-8 flex items-end gap-1">
            {chartData.map((point, i) => (
              <div
                key={i}
                className="flex-1 bg-primary/20 rounded-t"
                style={{ height: `${(point / Math.max(...chartData)) * 100}%` }}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
