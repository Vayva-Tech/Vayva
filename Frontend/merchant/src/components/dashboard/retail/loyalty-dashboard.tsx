'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ArrowRight, Users, Gift, TrendingUp, Crown } from 'lucide-react';

interface LoyaltyMember {
  id: string;
  name: string;
  email: string;
  points: number;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  lifetimeValue: number;
  lastPurchase: string;
}

interface LoyaltyStats {
  totalMembers: number;
  activeMembers: number;
  pointsIssued: number;
  pointsRedeemed: number;
  redemptionRate: number;
  averagePointsPerMember: number;
}

interface LoyaltyDashboardProps {
  stats: LoyaltyStats;
  topMembers?: LoyaltyMember[];
  className?: string;
}

export function LoyaltyDashboard({ stats, topMembers = [], className }: LoyaltyDashboardProps) {
  const getTierBadgeColor = (tier: string) => {
    switch (tier) {
      case 'platinum': return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'gold': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'silver': return 'bg-gray-100 text-gray-800 border-gray-300';
      case 'bronze': return 'bg-orange-100 text-orange-800 border-orange-300';
    }
  };

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'platinum': return <Crown className="w-3 h-3" />;
      case 'gold': return <TrendingUp className="w-3 h-3" />;
      default: return <Users className="w-3 h-3" />;
    }
  };

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
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-semibold">Loyalty Program</CardTitle>
        <Button variant="ghost" size="sm">
          View All <ArrowRight className="w-4 h-4 ml-1" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 border rounded-lg bg-green-50">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-4 h-4 text-green-500" />
              <span className="text-sm font-medium">Total Members</span>
            </div>
            <div className="text-2xl font-bold">{stats.totalMembers.toLocaleString()}</div>
            <div className="text-xs text-gray-500 mt-1">
              {stats.activeMembers.toLocaleString()} active
            </div>
          </div>

          <div className="p-3 border rounded-lg bg-green-50">
            <div className="flex items-center gap-2 mb-2">
              <Gift className="w-4 h-4 text-green-500" />
              <span className="text-sm font-medium">Points Issued</span>
            </div>
            <div className="text-2xl font-bold">{stats.pointsIssued.toLocaleString()}</div>
            <div className="text-xs text-gray-500 mt-1">
              {stats.pointsRedeemed.toLocaleString()} redeemed
            </div>
          </div>
        </div>

        {/* Redemption Rate */}
        <div className="p-4 border rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Redemption Rate</span>
            <span className="text-lg font-bold text-green-600">
              {(stats.redemptionRate * 100).toFixed(1)}%
            </span>
          </div>
          <Progress value={stats.redemptionRate * 100} className="h-2" />
          <div className="text-xs text-gray-500 mt-2">
            Avg. {stats.averagePointsPerMember.toLocaleString()} points/member
          </div>
        </div>

        {/* Top Members List */}
        <div className="space-y-3">
          <h3 className="font-semibold text-sm">Top Members</h3>
          {topMembers.slice(0, 5).map((member, index) => (
            <div
              key={member.id}
              className="flex items-center justify-between p-3 border rounded-lg hover:bg-green-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-6 h-6 rounded-full bg-green-500/10 text-green-500 font-semibold text-sm">
                  {index + 1}
                </div>
                <div>
                  <div className="font-medium">{member.name}</div>
                  <div className="text-xs text-gray-500">{member.email}</div>
                </div>
              </div>

              <div className="text-right">
                <div className="flex items-center gap-2 mb-1">
                  <Badge className={`${getTierBadgeColor(member.tier)} flex items-center gap-1`}>
                    {getTierIcon(member.tier)}
                    <span className="capitalize">{member.tier}</span>
                  </Badge>
                </div>
                <div className="text-sm font-medium">{member.points.toLocaleString()} pts</div>
                <div className="text-xs text-gray-500">
                  {formatCurrency(member.lifetimeValue)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
