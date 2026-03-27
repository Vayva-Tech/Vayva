'use client';
import { Button } from "@vayva/ui";

import React, { useState, useMemo, useCallback } from 'react';
import { GlassPanel } from '@vayva/ui/fashion';
import { KPICard } from '../components/KPICard';
import { DashboardErrorBoundary } from '@/components/error-boundary/error-boundary-utils';
import { SizeCurveAnalysis } from '../components/SizeCurveAnalysis';
import { CollectionHealthMatrix } from '../components/CollectionHealthMatrix';
import { VisualMerchandisingBoard } from '../components/VisualMerchandisingBoard';
import { InventoryVariantHeatmap } from '../components/InventoryVariantHeatmap';
import { TrendForecastingWidget } from '../components/TrendForecastingWidget';
import { RecentActivityFeed } from '../components/RecentActivityFeed';
import { AIInsightsPanel } from '../components/AIInsightsPanel';
import type {
  FashionKPI,
  SizeCurveData,
  CollectionHealth,
  Lookbook,
  InventoryVariant,
  TrendData,
} from "../types";
import type { ActivityItem } from "./RecentActivityFeed";
import type { AIRecommendation } from "./AIInsightsPanel";

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
  const formattedKPIs = useMemo(() => 
    kpis.map(kpi => ({
      ...kpi,
      format: (kpi.name === 'revenue' || kpi.name === 'gmv') ? 'currency' as const : kpi.name === 'conversion' ? 'percent' as const : 'number' as const
    })),
    [kpis]
  );

  const handleNewCollection = useCallback(() => {
    // Implementation for new collection
  }, []);

  const handleExportReport = useCallback(() => {
    // Implementation for export
  }, []);

  return (
    <div className="min-h-screen bg-[#0F0F0F] pb-20">
      {/* Welcome Header */}
      <DashboardErrorBoundary serviceName="FashionDashboardHeader">
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
                <Button 
                  onClick={handleNewCollection}
                  className="px-4 py-2 bg-rose-400 hover:bg-rose-500 text-white text-sm font-medium rounded-lg transition-colors"
                  aria-label="Create new collection"
                >
                  + New Collection
                </Button>
                <Button 
                  onClick={handleExportReport}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-sm font-medium rounded-lg transition-colors border border-white/10"
                  aria-label="Export report"
                >
                  📊 Export Report
                </Button>
              </div>
            </div>
          </GlassPanel>
        </div>
      </DashboardErrorBoundary>

      {/* KPI Row */}
      <DashboardErrorBoundary serviceName="FashionDashboardKPIs">
        <div className="px-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {formattedKPIs.map((kpi) => (
              <KPICard
                key={kpi.id}
                id={kpi.id}
                label={kpi.name.charAt(0).toUpperCase() + kpi.name.slice(1)}
                value={kpi.value}
                change={kpi.change}
                sparklineData={kpi.sparklineData}
                format={kpi.format}
              />
            ))}
          </div>
        </div>
      </DashboardErrorBoundary>

      {/* Main Content Grid */}
      <div className="px-6 mb-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            <DashboardErrorBoundary serviceName="SizeCurveAnalysis">
              <SizeCurveAnalysis data={sizeCurveData} />
            </DashboardErrorBoundary>
            <DashboardErrorBoundary serviceName="VisualMerchandisingBoard">
              <VisualMerchandisingBoard
                lookbooks={lookbooks}
                onCreateLookbook={() => console.log('Create lookbook')}
                onManageAssets={() => console.log('Manage assets')}
              />
            </DashboardErrorBoundary>
            <DashboardErrorBoundary serviceName="InventoryVariantHeatmap">
              <InventoryVariantHeatmap variants={inventoryVariants} />
            </DashboardErrorBoundary>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <DashboardErrorBoundary serviceName="CollectionHealthMatrix">
              <CollectionHealthMatrix collections={collections} />
            </DashboardErrorBoundary>
            <DashboardErrorBoundary serviceName="TrendForecastingWidget">
              <TrendForecastingWidget trends={trends} />
            </DashboardErrorBoundary>
            <DashboardErrorBoundary serviceName="RecentActivityFeed">
              <RecentActivityFeed activities={activities} />
            </DashboardErrorBoundary>
          </div>
        </div>
      </div>

      {/* AI Insights Panel (Pro Tier Only) */}
      {isProTier && (
        <DashboardErrorBoundary serviceName="AIInsightsPanel">
          <div className="px-6 mb-6">
            <AIInsightsPanel recommendations={recommendations} isProTier={isProTier} />
          </div>
        </DashboardErrorBoundary>
      )}
    </div>
  );
};

export default FashionDashboard;

