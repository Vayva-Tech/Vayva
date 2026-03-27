/**
 * Promotion Performance Component - Grocery Industry
 * Tracks promotion ROI, redemption rates, and revenue impact
 */

import React from 'react';
import { TrendingUp, TrendingDown, DollarSign, Percent } from 'lucide-react';
import { Badge } from '@vayva/ui/components/ui/badge';
import { Progress } from '@vayva/ui/components/ui/progress';

export interface Promotion {
  id: string;
  name: string;
  type: 'bogo' | 'percentage' | 'fixed' | 'coupon' | 'flash-sale';
  itemsCount: number;
  liftPercentage: number;
  redemptionRate: number;
  startDate: string;
  endDate: string;
  status: 'active' | 'scheduled' | 'expired';
  revenue?: number;
  discountGiven?: number;
  unitsSold?: number;
}

export interface PromotionROI {
  revenue: number;
  discountGiven: number;
  roi: number;
}

export interface PromotionPerformanceProps {
  promotions: Promotion[];
  roi: PromotionROI;
}

export function PromotionPerformance({ promotions, roi }: Props) {
  const getPromotionTypeIcon = (type: Promotion['type']) => {
    switch (type) {
      case 'bogo': return '🎁';
      case 'percentage': return '%';
      case 'fixed': return '$';
      case 'coupon': return '🎫';
      case 'flash-sale': return '⚡';
    }
  };

  const getStatusColor = (status: Promotion['status']) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700';
      case 'scheduled': return 'bg-blue-100 text-blue-700';
      case 'expired': return 'bg-gray-100 text-gray-700';
    }
  };

  const activePromotions = promotions.filter(p => p.status === 'active');
  const totalRevenue = roi.revenue || 0;
  const totalDiscount = roi.discountGiven || 0;
  const overallROI = roi.roi || 0;

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <span>🏷️</span>
          Promotion Performance
        </h3>
        <Badge variant={activePromotions.length > 0 ? 'default' : 'secondary'}>
          {activePromotions.length} Active
        </Badge>
      </div>

      {/* ROI Summary */}
      <div className="grid grid-cols-3 gap-4 mb-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
        <div>
          <p className="text-xs text-gray-600 mb-1">Total Revenue</p>
          <p className="text-xl font-bold text-gray-900">${totalRevenue.toLocaleString()}</p>
          <div className="flex items-center gap-1 text-xs text-green-600">
            <DollarSign className="h-3 w-3" />
            <span>Generated</span>
          </div>
        </div>
        <div>
          <p className="text-xs text-gray-600 mb-1">Discount Given</p>
          <p className="text-xl font-bold text-gray-900">${totalDiscount.toLocaleString()}</p>
          <div className="flex items-center gap-1 text-xs text-orange-600">
            <Percent className="h-3 w-3" />
            <span>Invested</span>
          </div>
        </div>
        <div>
          <p className="text-xs text-gray-600 mb-1">Overall ROI</p>
          <p className={`text-xl font-bold ${overallROI >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {overallROI >= 0 ? '+' : ''}{overallROI.toFixed(1)}%
          </p>
          <div className="flex items-center gap-1 text-xs">
            {overallROI >= 0 ? (
              <TrendingUp className="h-3 w-3 text-green-600" />
            ) : (
              <TrendingDown className="h-3 w-3 text-red-600" />
            )}
            <span>Return</span>
          </div>
        </div>
      </div>

      {/* Promotions List */}
      <div className="space-y-3 max-h-64 overflow-y-auto">
        {promotions.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No active promotions</p>
            <p className="text-xs mt-1">Create a promotion to boost sales</p>
          </div>
        ) : (
          promotions.map((promo) => (
            <div key={promo.id} className="p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-100">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{getPromotionTypeIcon(promo.type)}</span>
                  <div>
                    <p className="font-semibold text-gray-900">{promo.name}</p>
                    <p className="text-xs text-gray-600">{promo.itemsCount} products • {promo.startDate} to {promo.endDate}</p>
                  </div>
                </div>
                <Badge className={getStatusColor(promo.status)}>
                  {promo.status}
                </Badge>
              </div>
              
              <div className="grid grid-cols-3 gap-2 mt-3">
                <div>
                  <p className="text-xs text-gray-600">Sales Lift</p>
                  <p className="text-sm font-bold text-green-600">+{promo.liftPercentage}%</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">Redemption</p>
                  <p className="text-sm font-bold text-blue-600">{promo.redemptionRate.toFixed(1)}%</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">Units Sold</p>
                  <p className="text-sm font-bold text-gray-900">{promo.unitsSold?.toLocaleString() || 0}</p>
                </div>
              </div>

              <div className="mt-2">
                <div className="flex justify-between text-xs text-gray-600 mb-1">
                  <span>Progress</span>
                  <span>{Math.min(100, promo.redemptionRate * 2).toFixed(0)}% complete</span>
                </div>
                <Progress value={Math.min(100, promo.redemptionRate * 2)} className="h-2" />
              </div>
            </div>
          ))
        )}
      </div>

      {/* Digital Coupons Summary */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">
            🎫 Digital Coupons: {promotions.filter(p => p.type === 'coupon').reduce((sum, p) => sum + (p.unitsSold || 0), 0)} uses
          </p>
          <p className="text-sm font-medium text-gray-900">
            Avg Redemption: {(promotions.reduce((sum, p) => sum + p.redemptionRate, 0) / (promotions.length || 1)).toFixed(1)}%
          </p>
        </div>
      </div>
    </div>
  );
}
