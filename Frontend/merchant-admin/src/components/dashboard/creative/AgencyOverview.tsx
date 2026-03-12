'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Briefcase, TrendingUp, DollarSign, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AgencyOverviewProps {
  activeProjects: number;
  utilizationRate: number;
  revenueMTD: number;
  projectsTrend?: 'up' | 'down';
  utilizationTrend?: 'up' | 'down';
  revenueTrend?: 'up' | 'down';
  className?: string;
}

/**
 * AgencyOverview - Displays key agency metrics at a glance
 */
export const AgencyOverview: React.FC<AgencyOverviewProps> = ({
  activeProjects,
  utilizationRate,
  revenueMTD,
  projectsTrend = 'up',
  utilizationTrend = 'up',
  revenueTrend = 'up',
  className,
}) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      notation: 'compact',
      maximumFractionDigits: 1,
    }).format(value);
  };

  return (
    <div className={cn('grid grid-cols-1 md:grid-cols-3 gap-4', className)}>
      {/* Active Projects */}
      <Card className="relative overflow-hidden bg-card/90 backdrop-blur-sm border-white/20 shadow-lg">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Active Projects</p>
              <p className="text-3xl font-bold text-foreground">{activeProjects}</p>
              <div className="flex items-center gap-2">
                {projectsTrend === 'up' ? (
                  <ArrowUpRight className="h-4 w-4 text-green-500" />
                ) : (
                  <ArrowDownRight className="h-4 w-4 text-red-500" />
                )}
                <span className={cn(
                  "text-xs",
                  projectsTrend === 'up' ? "text-green-500" : "text-red-500"
                )}>
                  {projectsTrend === 'up' ? '+3' : '-2'} this week
                </span>
              </div>
            </div>
            <div className="p-3 rounded-full bg-primary/10">
              <Briefcase className="h-6 w-6 text-primary" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Utilization Rate */}
      <Card className="relative overflow-hidden bg-card/90 backdrop-blur-sm border-white/20 shadow-lg">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Utilization Rate</p>
              <p className="text-3xl font-bold text-foreground">{utilizationRate}%</p>
              <div className="flex items-center gap-2">
                {utilizationTrend === 'up' ? (
                  <ArrowUpRight className="h-4 w-4 text-green-500" />
                ) : (
                  <ArrowDownRight className="h-4 w-4 text-red-500" />
                )}
                <span className={cn(
                  "text-xs",
                  utilizationTrend === 'up' ? "text-green-500" : "text-red-500"
                )}>
                  {utilizationTrend === 'up' ? '+8%' : '-5%'} vs last month
                </span>
              </div>
              <p className="text-xs text-muted-foreground">Target: 80%</p>
            </div>
            <div className="p-3 rounded-full bg-primary/10">
              <TrendingUp className="h-6 w-6 text-primary" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Revenue MTD */}
      <Card className="relative overflow-hidden bg-card/90 backdrop-blur-sm border-white/20 shadow-lg">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Revenue MTD</p>
              <p className="text-3xl font-bold text-foreground">{formatCurrency(revenueMTD)}</p>
              <div className="flex items-center gap-2">
                {revenueTrend === 'up' ? (
                  <ArrowUpRight className="h-4 w-4 text-green-500" />
                ) : (
                  <ArrowDownRight className="h-4 w-4 text-red-500" />
                )}
                <span className={cn(
                  "text-xs",
                  revenueTrend === 'up' ? "text-green-500" : "text-red-500"
                )}>
                  {revenueTrend === 'up' ? '+12%' : '-8%'} vs plan
                </span>
              </div>
            </div>
            <div className="p-3 rounded-full bg-primary/10">
              <DollarSign className="h-6 w-6 text-primary" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AgencyOverview;
