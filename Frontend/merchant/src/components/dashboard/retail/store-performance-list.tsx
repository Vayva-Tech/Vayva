'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StorePerformance {
  id: string;
  name: string;
  revenue: number;
  growth: number;
  performancePercent: number;
}

interface StorePerformanceListProps {
  stores: StorePerformance[];
  className?: string;
}

export function StorePerformanceList({ stores, className }: StorePerformanceListProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Store Performance</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {stores.map((store) => (
          <div key={store.id} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="font-medium">{store.name}</div>
              <div className="flex items-center gap-2">
                {store.growth >= 0 ? (
                  <TrendingUp className="w-4 h-4 text-green-600" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-red-600" />
                )}
                <span className={`text-sm font-medium ${store.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {(store.growth * 100).toFixed(1)}%
                </span>
              </div>
            </div>
            
            <div className="flex items-center justify-between text-sm text-gray-500">
              <span>{formatCurrency(store.revenue)}</span>
              <span>{store.performancePercent.toFixed(0)}% of target</span>
            </div>
            
            <Progress value={store.performancePercent} className="h-2" />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
