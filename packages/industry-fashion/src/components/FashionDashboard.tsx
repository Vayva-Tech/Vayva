// @ts-nocheck
'use client';

import React, { useState } from 'react';
import { GlassPanel } from '@vayva/ui/components/fashion';
import { KPICard } from '../components/KPICard';
import { SizeCurveAnalysis } from '../components/SizeCurveAnalysis';
import { CollectionHealthMatrix } from '../components/CollectionHealthMatrix';
import { VisualMerchandisingBoard } from '../components/VisualMerchandisingBoard';
import { InventoryVariantHeatmap } from '../components/InventoryVariantHeatmap';
import { TrendForecastingWidget } from '../components/TrendForecastingWidget';
import { RecentActivityFeed } from '../components/RecentActivityFeed';
import { AIInsightsPanel } from '../components/AIInsightsPanel';
import type { FashionKPI, SizeCurveData, CollectionHealth, Lookbook, InventoryVariant, TrendData, ActivityItem, AIRecommendation } from '../types';

export interface FashionDashboardProps {
  kpis: FashionKPI[];
  sizeCurveData: SizeCurveData;
  collections: CollectionHealth[];
  lookbooks: Lookbook[];
  inventoryVariants: InventoryVariant[];
  trends: TrendData[];
  activities: ActivityItem[];
  recommendations?: AIRecommendation[];
  isProTier?: boolean;
}

export const FashionDashboard: React.FC<FashionDashboardProps> = ({
  kpis,
  sizeCurveData,
  collections,
  lookbooks,
  inventoryVariants,
  trends,
  activities,
  recommendations = [],
  isProTier = false,
}) => {
  return (
    <div className="min-h-screen bg-[#0F0F0F] pb-20">
      {/* Welcome Header */}
      <div className="px-6 py-8">
        <GlassPanel variant="elevated" className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white mb-1">
                Spring Collection Performance
              </h1>
              <p className="text-sm text-white/60">Last updated: 2 minutes ago</p>
            </div>
            <div className="flex gap-3">
              <button className="px-4 py-2 bg-rose-400 hover:bg-rose-500 text-white text-sm font-medium rounded-lg transition-colors">
                + New Collection
              </button>
              <button className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-sm font-medium rounded-lg transition-colors border border-white/10">
                📊 Export Report
              </button>
            </div>
          </div>
        </GlassPanel>
      </div>

      {/* KPI Row */}
      <div className="px-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {kpis.map((kpi) => (
            <KPICard
              key={kpi.id}
              id={kpi.id}
              label={kpi.name.charAt(0).toUpperCase() + kpi.name.slice(1)}
              value={kpi.value}
              change={kpi.change}
              sparklineData={kpi.sparklineData}
              format={kpi.name === 'revenue' || kpi.name === 'gmv' ? 'currency' : kpi.name === 'conversion' ? 'percent' : 'number'}
            />
          ))}
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="px-6 mb-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            <SizeCurveAnalysis data={sizeCurveData} />
            <VisualMerchandisingBoard
              lookbooks={lookbooks}
              onCreateLookbook={() => console.log('Create lookbook')}
              onManageAssets={() => console.log('Manage assets')}
            />
            <InventoryVariantHeatmap variants={inventoryVariants} />
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <CollectionHealthMatrix collections={collections} />
            <TrendForecastingWidget trends={trends} />
            <RecentActivityFeed activities={activities} />
          </div>
        </div>
      </div>

      {/* AI Insights Panel (Pro Tier Only) */}
      {isProTier && (
        <div className="px-6 mb-6">
          <AIInsightsPanel recommendations={recommendations} isProTier={isProTier} />
        </div>
      )}
    </div>
  );
};

export default FashionDashboard;
