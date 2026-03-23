// @ts-nocheck
'use client';

/**
 * TicketSalesTracker Widget
 *
 * Real-time tracking of ticket sales with progress visualization,
 * sales velocity, and tier breakdown.
 */

import { useState, useEffect } from 'react';
import { BaseWidget } from '@vayva/industry-core';
import type { WidgetDefinition } from '@vayva/industry-core';
import type { TicketTier } from '../types';

export interface SalesVelocity {
  ticketsPerHour: number;
  projectedSellout?: Date;
  trend: 'increasing' | 'stable' | 'decreasing';
}

export interface TicketSalesTrackerWidgetProps {
  widget: WidgetDefinition;
  data?: any;
  isLoading?: boolean;
  error?: Error;
  onRefresh?: () => void;
  eventId: string;
  totalCapacity: number;
  ticketsSold: number;
  tiers?: TicketTier[];
  salesVelocity?: SalesVelocity;
  showProgress?: boolean;
  showTiers?: boolean;
}

interface TierBreakdown {
  name: string;
  sold: number;
  total: number;
  percentage: number;
  revenue: number;
}

/**
 * TicketSalesTrackerWidget Component
 */
export function TicketSalesTrackerWidget({
  widget,
  isLoading,
  error,
  eventId,
  totalCapacity,
  ticketsSold,
  tiers = [],
  salesVelocity,
  showProgress = true,
  showTiers = true,
}: TicketSalesTrackerWidgetProps) {
  const [tierBreakdown, setTierBreakdown] = useState<TierBreakdown[]>([]);

  useEffect(() => {
    if (tiers.length > 0) {
      const breakdown = tiers.map((tier) => ({
        name: tier.name,
        sold: tier.quantitySold,
        total: tier.quantity,
        percentage: Math.round((tier.quantitySold / tier.quantity) * 100),
        revenue: tier.quantitySold * tier.price,
      }));
      setTierBreakdown(breakdown);
    }
  }, [tiers]);

  const overallPercentage = Math.min(100, Math.round((ticketsSold / totalCapacity) * 100));
  const remainingTickets = totalCapacity - ticketsSold;
  const isSoldOut = ticketsSold >= totalCapacity;

  const getProgressColor = () => {
    if (isSoldOut) return 'from-green-500 to-emerald-600';
    if (overallPercentage >= 80) return 'from-orange-500 to-red-600';
    if (overallPercentage >= 50) return 'from-yellow-500 to-orange-600';
    return 'from-blue-500 to-cyan-600';
  };

  const getVelocityBadge = () => {
    if (!salesVelocity) return null;

    const trendColors = {
      increasing: 'bg-green-100 text-green-700',
      stable: 'bg-yellow-100 text-yellow-700',
      decreasing: 'bg-red-100 text-red-700',
    };

    const trendIcons = {
      increasing: '↑',
      stable: '→',
      decreasing: '↓',
    };

    return (
      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${trendColors[salesVelocity.trend]}`}>
        <span>{trendIcons[salesVelocity.trend]}</span>
        <span>{salesVelocity.ticketsPerHour} tickets/hr</span>
      </div>
    );
  };

  return (
    <BaseWidget
      widget={widget}
      isLoading={isLoading}
      error={error}
      className="ticket-sales-tracker-widget"
    >
      <div className="space-y-6">
        {/* Header Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg">
            <p className="text-xs text-gray-600 uppercase tracking-wide">Total Sold</p>
            <p className="text-2xl font-bold text-gray-900">{ticketsSold.toLocaleString()}</p>
          </div>
          
          <div className="text-center p-3 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg">
            <p className="text-xs text-gray-600 uppercase tracking-wide">Capacity</p>
            <p className="text-2xl font-bold text-gray-900">{totalCapacity.toLocaleString()}</p>
          </div>
          
          <div className="text-center p-3 bg-gradient-to-br from-orange-50 to-red-50 rounded-lg">
            <p className="text-xs text-gray-600 uppercase tracking-wide">Remaining</p>
            <p className="text-2xl font-bold text-gray-900">{remainingTickets.toLocaleString()}</p>
          </div>
          
          <div className="text-center p-3 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg">
            <p className="text-xs text-gray-600 uppercase tracking-wide">Fill Rate</p>
            <p className="text-2xl font-bold text-gray-900">{overallPercentage}%</p>
          </div>
        </div>

        {/* Progress Bar */}
        {showProgress && (
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">Sales Progress</span>
              {salesVelocity && getVelocityBadge()}
            </div>
            
            <div className="h-4 w-full bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-full bg-gradient-to-r ${getProgressColor()} transition-all duration-500 ease-out`}
                style={{ width: `${overallPercentage}%` }}
              >
                {overallPercentage >= 10 && (
                  <span className="block text-center text-xs font-bold text-white h-full leading-4">
                    {overallPercentage}%
                  </span>
                )}
              </div>
            </div>
            
            {salesVelocity?.projectedSellout && !isSoldOut && (
              <p className="text-xs text-gray-600 mt-2">
                Projected sellout:{' '}
                <span className="font-semibold">
                  {salesVelocity.projectedSellout.toLocaleDateString()}
                </span>
              </p>
            )}
            
            {isSoldOut && (
              <p className="text-sm font-bold text-green-600 mt-2 flex items-center gap-2">
                <span>🎉</span> EVENT SOLD OUT!
              </p>
            )}
          </div>
        )}

        {/* Tier Breakdown */}
        {showTiers && tierBreakdown.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-gray-700">Ticket Tiers</h4>
            
            <div className="space-y-2">
              {tierBreakdown.map((tier) => (
                <div
                  key={tier.name}
                  className="p-3 bg-gray-50 rounded-lg border border-gray-200"
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-900">{tier.name}</span>
                    <span className="text-sm text-gray-600">
                      {tier.sold}/{tier.total}
                    </span>
                  </div>
                  
                  <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-300"
                      style={{ width: `${tier.percentage}%` }}
                    />
                  </div>
                  
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-xs text-gray-600">{tier.percentage}% filled</span>
                    <span className="text-xs font-semibold text-gray-700">
                      ₦{tier.revenue.toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Revenue Summary */}
        {tierBreakdown.length > 0 && (
          <div className="pt-4 border-t border-gray-200">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">Total Revenue</span>
              <span className="text-xl font-bold text-green-600">
                ₦{tierBreakdown.reduce((sum, tier) => sum + tier.revenue, 0).toLocaleString()}
              </span>
            </div>
          </div>
        )}
      </div>
    </BaseWidget>
  );
}

TicketSalesTrackerWidget.displayName = 'TicketSalesTrackerWidget';

export default TicketSalesTrackerWidget;
