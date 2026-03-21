'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Gift, DollarSign, TrendingUp, CreditCard } from 'lucide-react';

interface GiftCardSale {
  id: string;
  amount: number;
  soldAt: string;
  channel: string;
}

interface GiftCardStats {
  totalBalance: number;
  issuedToday: number;
  redeemedToday: number;
  activeCards: number;
  totalSales: number;
  averageCardValue: number;
  redemptionRate: number;
}

interface GiftCardsWidgetProps {
  stats: GiftCardStats;
  recentSales?: GiftCardSale[];
  className?: string;
}

export function GiftCardsWidget({ stats, recentSales = [], className }: GiftCardsWidgetProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const timeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-semibold">Gift Cards</CardTitle>
        <Button variant="ghost" size="sm">Manage</Button>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 border rounded-lg bg-gradient-to-br from-blue-50 to-blue-100">
            <div className="flex items-center gap-2 mb-2">
              <Gift className="w-4 h-4 text-blue-600" />
              <span className="text-xs font-medium">Total Balance</span>
            </div>
            <div className="text-xl font-bold text-blue-900">
              {formatCurrency(stats.totalBalance)}
            </div>
            <div className="text-xs text-blue-700 mt-1">
              Outstanding liability
            </div>
          </div>

          <div className="p-3 border rounded-lg bg-gradient-to-br from-green-50 to-green-100">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-4 h-4 text-green-600" />
              <span className="text-xs font-medium">Today's Sales</span>
            </div>
            <div className="text-xl font-bold text-green-900">
              {formatCurrency(stats.issuedToday)}
            </div>
            <div className="text-xs text-green-700 mt-1">
              {stats.redeemedToday > 0 ? `${formatCurrency(stats.redeemedToday)} redeemed` : 'No redemptions'}
            </div>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium">Active Cards</span>
            </div>
            <span className="text-lg font-bold">{stats.activeCards}</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium">Avg Card Value</span>
            </div>
            <span className="text-lg font-bold">{formatCurrency(stats.averageCardValue)}</span>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Redemption Rate</span>
              <span className="text-sm font-bold text-green-600">
                {(stats.redemptionRate * 100).toFixed(1)}%
              </span>
            </div>
            <Progress value={stats.redemptionRate * 100} className="h-2" />
          </div>
        </div>

        {/* Recent Sales */}
        {recentSales.length > 0 && (
          <div className="space-y-2">
            <h3 className="font-semibold text-sm">Recent Sales</h3>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {recentSales.slice(0, 5).map((sale) => (
                <div
                  key={sale.id}
                  className="flex items-center justify-between p-2 border rounded hover:bg-green-50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Gift className="w-4 h-4 text-green-500" />
                    <div>
                      <div className="text-sm font-medium">{formatCurrency(sale.amount)}</div>
                      <div className="text-xs text-gray-500">
                        {sale.channel} • {timeAgo(sale.soldAt)}
                      </div>
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    Sold
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="pt-3 border-t">
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" size="sm">
              Issue Card
            </Button>
            <Button variant="outline" size="sm">
              View Report
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
