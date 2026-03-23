// @ts-nocheck
// ============================================================================
// SaaS Industry Dashboard Main Component
// ============================================================================

'use client';

import React from 'react';
import type { 
  UniversalDashboardProps,
  IndustrySlug 
} from '@vayva/industry-core';
import { 
  useUniversalDashboard,
  UniversalMetricCard,
  UniversalSectionHeader,
  UniversalChartContainer
} from '@vayva/ui';
import { 
  TrendingUp,
  Users,
  DollarSign,
  Activity,
  BarChart3,
  PieChart,
  AlertTriangle,
  RefreshCw,
  UserPlus,
  UserMinus,
  HeartHandshake
} from 'lucide-react';

import type {
  MRRWaterfallProps,
  TenantHealthProps,
  ChurnAnalyticsProps,
  UsageTrendsProps,
  AtRiskTenantsProps,
  RevenueMetricsProps,
  TenantSegmentationProps,
  ExpansionOpportunitiesProps
} from './components';

import {
  formatCurrency,
  formatPercentage,
  formatNumber,
  getRiskColor,
  getHealthColor,
  getPlanBadgeColor
} from './components';

// ---------------------------------------------------------------------------
// Main Dashboard Component
// ---------------------------------------------------------------------------

export function SaaSDashboard({
  industry,
  variant,
  userId,
  businessId,
  className = '',
  onConfigChange,
  onError
}: UniversalDashboardProps) {
  const {
    data: dashboardData,
    config,
    loading,
    error,
    lastUpdated,
    refresh,
    isValidating
  } = useUniversalDashboard({
    industry: industry as IndustrySlug,
    variant,
    userId,
    businessId
  });

  if (error) {
    onError?.({
      code: 'DASHBOARD_ERROR',
      message: error.message,
      retryable: true
    });
    return null;
  }

  return (
    <div className={`space-y-8 ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-blue-800">SaaS Dashboard</h1>
          <p className="text-blue-600 mt-1">
            Track MRR, tenant health, churn, and growth metrics
          </p>
        </div>
        <button
          onClick={refresh}
          disabled={isValidating}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
        >
          {isValidating ? 'Refreshing...' : 'Refresh Data'}
        </button>
      </div>

      {/* Key Metrics Grid */}
      <section>
        <UniversalSectionHeader
          title="Key Performance Indicators"
          subtitle="Track your most important SaaS metrics"
          icon={<TrendingUp className="h-5 w-5 text-blue-600" />}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
          <UniversalMetricCard
            title="Total MRR"
            value="$127.5K"
            change={{ value: 12, isPositive: true }}
            icon={<DollarSign className="h-6 w-6 text-green-600" />}
            loading={loading}
          />
          
          <UniversalMetricCard
            title="Active Tenants"
            value="847"
            change={{ value: 8, isPositive: true }}
            icon={<Users className="h-6 w-6 text-blue-600" />}
            loading={loading}
          />
          
          <UniversalMetricCard
            title="Churn Rate"
            value="3.2%"
            change={{ value: -0.5, isPositive: true }}
            icon={<UserMinus className="h-6 w-6 text-red-600" />}
            loading={loading}
          />
          
          <UniversalMetricCard
            title="Customer LTV"
            value="$12.4K"
            change={{ value: 15, isPositive: true }}
            icon={<Activity className="h-6 w-6 text-purple-600" />}
            loading={loading}
          />
        </div>
      </section>

      {/* MRR Waterfall & Tenant Health */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <MRRWaterfallSection 
          data={{
            startingMRR: 115000,
            newBusiness: 18500,
            expansion: 8200,
            contraction: -3200,
            churn: -11000,
            endingMRR: 127500
          }}
          loading={loading}
        />
        
        <TenantHealthSection 
          distribution={{
            healthy: 68,
            atRisk: 22,
            critical: 10
          }}
          tenants={[
            { id: '1', name: 'Acme Corp', healthScore: 92, plan: 'enterprise', mrr: 2400 },
            { id: '2', name: 'TechStart Inc', healthScore: 87, plan: 'professional', mrr: 890 },
            { id: '3', name: 'GrowthCo', healthScore: 45, plan: 'starter', mrr: 290 },
            { id: '4', name: 'InnovateLabs', healthScore: 38, plan: 'professional', mrr: 750 }
          ]}
          loading={loading}
        />
      </div>

      {/* Churn Analytics */}
      <ChurnAnalyticsSection 
        data={{
          churnRate: 3.2,
          previousChurnRate: 3.7,
          churnedTenants: 12,
          churnedMRR: 11000,
          reasons: {
            price: 35,
            features: 25,
            competitor: 20,
            support: 10,
            other: 10
          },
          recentChurns: [
            { id: '1', tenantName: 'FailedStartup', mrr: 1200, date: '2026-03-08', reason: 'budget' },
            { id: '2', tenantName: 'OldCorp', mrr: 890, date: '2026-03-05', reason: 'competitor' },
            { id: '3', tenantName: 'SmallBiz', mrr: 290, date: '2026-03-01', reason: 'features' }
          ]
        }}
        loading={loading}
      />

      {/* Usage Trends & Revenue Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <UsageTrendsSection 
          data={{
            apiCalls: [125000, 142000, 138000, 156000, 168000],
            activeUsers: [2847, 2923, 3105, 3287, 3456],
            storageUsed: 45.2,
            featureAdoption: {
              'Dashboard': 92,
              'Analytics': 78,
              'API': 65,
              'Integrations': 45,
              'Automation': 32
            }
          }}
          loading={loading}
        />
        
        <RevenueMetricsSection 
          data={{
            arr: 1530000,
            mrrGrowth: 12,
            ltv: 12400,
            cac: 2800,
            paybackPeriod: 8,
            netRevenueRetention: 108,
            grossMargin: 82
          }}
          loading={loading}
        />
      </div>

      {/* At-Risk Tenants & Expansion Opportunities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <AtRiskTenantsSection 
          tenants={[
            { id: '1', name: 'StrugglingCo', healthScore: 32, usageScore: 28, mrr: 890, riskFactors: ['Low usage', 'No login in 14d'] },
            { id: '2', name: 'DeclineInc', healthScore: 41, usageScore: 35, mrr: 1200, riskFactors: ['Support tickets up', 'Usage declining'] },
            { id: '3', name: 'AtRiskLLC', healthScore: 38, usageScore: 42, mrr: 650, riskFactors: ['Trial ending soon', 'Low adoption'] }
          ]}
          totalAtRisk={47}
          loading={loading}
        />
        
        <ExpansionOpportunitiesSection 
          opportunities={[
            { id: '1', tenantName: 'GrowthKing', currentPlan: 'professional', suggestedPlan: 'enterprise', mrrIncrease: 1500, confidence: 87 },
            { id: '2', tenantName: 'ScaleUp', currentPlan: 'starter', suggestedPlan: 'professional', mrrIncrease: 600, confidence: 92 },
            { id: '3', tenantName: 'EnterpriseReady', currentPlan: 'professional', suggestedPlan: 'enterprise', mrrIncrease: 2100, confidence: 78 }
          ]}
          totalOpportunities={23}
          loading={loading}
        />
      </div>

      {/* Tenant Segmentation */}
      <TenantSegmentationSection 
        segments={[
          { segment: 'Enterprise', count: 45, mrr: 54000, avgMRR: 1200, churnRate: 2.1, healthScore: 88 },
          { segment: 'Professional', count: 312, mrr: 56400, avgMRR: 181, churnRate: 3.5, healthScore: 76 },
          { segment: 'Starter', count: 490, mrr: 17100, avgMRR: 35, churnRate: 5.2, healthScore: 68 }
        ]}
        loading={loading}
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Section Components
// ---------------------------------------------------------------------------

function MRRWaterfallSection({ data, loading }: MRRWaterfallProps) {
  return (
    <section className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <UniversalSectionHeader
        title="MRR Waterfall"
        subtitle="Monthly recurring revenue movement"
        icon={<BarChart3 className="h-5 w-5 text-green-600" />}
      />
      
      <div className="mt-6 space-y-4">
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <span className="text-sm font-medium text-gray-700">Starting MRR</span>
          <span className="text-lg font-bold text-gray-900">{formatCurrency(data.startingMRR)}</span>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center gap-2">
              <UserPlus className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-900">New Business</span>
            </div>
            <span className="text-lg font-bold text-green-600">+{formatCurrency(data.newBusiness)}</span>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-900">Expansion</span>
            </div>
            <span className="text-lg font-bold text-green-600">+{formatCurrency(data.expansion)}</span>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-red-600 rotate-[-45deg]" />
              <span className="text-sm font-medium text-red-900">Contraction</span>
            </div>
            <span className="text-lg font-bold text-red-600">{formatCurrency(data.contraction)}</span>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
            <div className="flex items-center gap-2">
              <UserMinus className="h-4 w-4 text-red-600" />
              <span className="text-sm font-medium text-red-900">Churn</span>
            </div>
            <span className="text-lg font-bold text-red-600">{formatCurrency(data.churn)}</span>
          </div>
        </div>
        
        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border-2 border-green-300">
          <span className="text-base font-bold text-gray-900">Ending MRR</span>
          <span className="text-2xl font-black text-green-600">{formatCurrency(data.endingMRR)}</span>
        </div>
      </div>
    </section>
  );
}

function TenantHealthSection({ distribution, tenants, loading }: TenantHealthProps) {
  return (
    <section className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <UniversalSectionHeader
        title="Tenant Health Distribution"
        subtitle="Overall portfolio health"
        icon={<PieChart className="h-5 w-5 text-blue-600" />}
      />
      
      <div className="mt-6 space-y-6">
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600 mb-1">{distribution.healthy}%</div>
            <p className="text-xs text-gray-600">Healthy</p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-amber-600 mb-1">{distribution.atRisk}%</div>
            <p className="text-xs text-gray-600">At Risk</p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-red-600 mb-1">{distribution.critical}%</div>
            <p className="text-xs text-gray-600">Critical</p>
          </div>
        </div>
        
        <div className="flex h-4 gap-1 rounded-full overflow-hidden">
          <div className="bg-green-500" style={{ width: `${distribution.healthy}%` }} />
          <div className="bg-amber-500" style={{ width: `${distribution.atRisk}%` }} />
          <div className="bg-red-500" style={{ width: `${distribution.critical}%` }} />
        </div>
        
        <div>
          <h4 className="font-medium text-gray-900 mb-3">Sample Tenants</h4>
          <div className="space-y-2">
            {tenants.map((tenant) => (
              <div key={tenant.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{tenant.name}</p>
                  <p className="text-xs text-gray-500 capitalize">{tenant.plan} • {formatCurrency(tenant.mrr)}/mo</p>
                </div>
                <div className="flex items-center gap-2">
                  <div 
                    className={`w-3 h-3 rounded-full ${getHealthColor(tenant.healthScore)}`}
                    title={`Health: ${tenant.healthScore}`}
                  />
                  <span className={`text-sm font-bold ${
                    tenant.healthScore >= 80 ? 'text-green-600' : 
                    tenant.healthScore >= 50 ? 'text-amber-600' : 'text-red-600'
                  }`}>
                    {tenant.healthScore}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function ChurnAnalyticsSection({ data, loading }: ChurnAnalyticsProps) {
  return (
    <section className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <UniversalSectionHeader
        title="Churn Analytics"
        subtitle="Customer retention insights"
        icon={<UserMinus className="h-5 w-5 text-red-600" />}
      />
      
      <div className="mt-6 space-y-6">
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-sm text-gray-600">Churn Rate</p>
            <p className={`text-2xl font-bold ${data.churnRate < data.previousChurnRate ? 'text-green-600' : 'text-red-600'}`}>
              {formatPercentage(data.churnRate)}
            </p>
            <p className="text-xs text-gray-500">Prev: {formatPercentage(data.previousChurnRate)}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600">Churned Tenants</p>
            <p className="text-2xl font-bold text-gray-900">{data.churnedTenants}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600">Churned MRR</p>
            <p className="text-2xl font-bold text-red-600">{formatCurrency(data.churnedMRR)}</p>
          </div>
        </div>
        
        <div>
          <h4 className="font-medium text-gray-900 mb-3">Churn Reasons</h4>
          <div className="space-y-2">
            {Object.entries(data.reasons).map(([reason, percentage]) => (
              <div key={reason} className="flex items-center justify-between">
                <span className="text-sm text-gray-700 capitalize">{reason}</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-red-500 h-2 rounded-full"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-900 w-10 text-right">{percentage}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div>
          <h4 className="font-medium text-gray-900 mb-3">Recent Churns</h4>
          <div className="space-y-2">
            {data.recentChurns.slice(0, 3).map((churn) => (
              <div key={churn.id} className="flex justify-between items-center p-2 bg-red-50 rounded-lg">
                <div>
                  <p className="font-medium text-red-900">{churn.tenantName}</p>
                  <p className="text-xs text-red-700">{churn.reason} • {churn.date}</p>
                </div>
                <span className="text-sm font-bold text-red-600">{formatCurrency(churn.mrr)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function UsageTrendsSection({ data, loading }: UsageTrendsProps) {
  return (
    <section className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <UniversalSectionHeader
        title="Usage Trends"
        subtitle="Product adoption and engagement"
        icon={<Activity className="h-5 w-5 text-purple-600" />}
      />
      
      <div className="mt-6 space-y-6">
        <div>
          <h4 className="font-medium text-gray-900 mb-4">API Calls (Last 5 Months)</h4>
          <div className="h-32 flex items-end space-x-2">
            {data.apiCalls.map((calls, index) => (
              <div 
                key={index}
                className="flex-1 bg-purple-200 rounded-t hover:bg-purple-300 transition-colors"
                style={{ height: `${(calls / Math.max(...data.apiCalls)) * 100}%` }}
              />
            ))}
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-2">
            <span>Jan</span>
            <span>Feb</span>
            <span>Mar</span>
            <span>Apr</span>
            <span>May</span>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-blue-50 rounded-lg p-4 text-center">
            <p className="text-sm text-blue-700">Active Users</p>
            <p className="text-2xl font-bold text-blue-900">{formatNumber(data.activeUsers[data.activeUsers.length - 1])}</p>
          </div>
          <div className="bg-green-50 rounded-lg p-4 text-center">
            <p className="text-sm text-green-700">Storage Used</p>
            <p className="text-2xl font-bold text-green-900">{data.storageUsed} GB</p>
          </div>
        </div>
        
        <div>
          <h4 className="font-medium text-gray-900 mb-3">Feature Adoption</h4>
          <div className="space-y-2">
            {Object.entries(data.featureAdoption).map(([feature, adoption]) => (
              <div key={feature} className="flex items-center justify-between">
                <span className="text-sm text-gray-700">{feature}</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-purple-500 h-2 rounded-full"
                      style={{ width: `${adoption}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-900 w-10 text-right">{adoption}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function RevenueMetricsSection({ data, loading }: RevenueMetricsProps) {
  return (
    <section className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-100">
      <UniversalSectionHeader
        title="Revenue Metrics"
        subtitle="Financial performance indicators"
        icon={<DollarSign className="h-5 w-5 text-green-600" />}
      />
      
      <div className="mt-6 grid grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg p-4 text-center">
          <p className="text-sm text-gray-600">ARR</p>
          <p className="text-xl font-bold text-gray-900 mt-1">{formatCurrency(data.arr)}</p>
        </div>
        <div className="bg-white rounded-lg p-4 text-center">
          <p className="text-sm text-gray-600">MRR Growth</p>
          <p className={`text-xl font-bold ${data.mrrGrowth > 0 ? 'text-green-600' : 'text-red-600'}`}>
            +{formatPercentage(data.mrrGrowth)}
          </p>
        </div>
        <div className="bg-white rounded-lg p-4 text-center">
          <p className="text-sm text-gray-600">LTV</p>
          <p className="text-xl font-bold text-gray-900 mt-1">{formatCurrency(data.ltv)}</p>
        </div>
        <div className="bg-white rounded-lg p-4 text-center">
          <p className="text-sm text-gray-600">CAC</p>
          <p className="text-xl font-bold text-gray-900 mt-1">{formatCurrency(data.cac)}</p>
        </div>
        <div className="bg-white rounded-lg p-4 text-center">
          <p className="text-sm text-gray-600">Payback</p>
          <p className="text-xl font-bold text-gray-900 mt-1">{data.paybackPeriod} mo</p>
        </div>
        <div className="bg-white rounded-lg p-4 text-center">
          <p className="text-sm text-gray-600">NRR</p>
          <p className={`text-xl font-bold ${data.netRevenueRetention >= 100 ? 'text-green-600' : 'text-amber-600'}`}>
            {data.netRevenueRetention}%
          </p>
        </div>
      </div>
    </section>
  );
}

function AtRiskTenantsSection({ tenants, totalAtRisk, loading }: AtRiskTenantsProps) {
  return (
    <section className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <UniversalSectionHeader
        title="At-Risk Tenants"
        subtitle="Accounts showing churn signals"
        icon={<AlertTriangle className="h-5 w-5 text-red-600" />}
      />
      
      <div className="mt-6 space-y-6">
        <div className="bg-red-50 rounded-lg p-4 text-center">
          <p className="text-sm text-red-700">Total At-Risk Tenants</p>
          <p className="text-3xl font-bold text-red-900">{totalAtRisk}</p>
        </div>
        
        <div>
          <h4 className="font-medium text-gray-900 mb-3">High Priority</h4>
          <div className="space-y-3">
            {tenants.map((tenant) => (
              <div key={tenant.id} className="p-4 bg-red-50 rounded-lg border border-red-200">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-bold text-red-900">{tenant.name}</p>
                    <p className="text-sm text-red-700">{formatCurrency(tenant.mrr)}/mo • Health: {tenant.healthScore}</p>
                  </div>
                  <span className="px-2 py-1 text-xs font-bold rounded-full bg-red-200 text-red-800">
                    {tenant.healthScore < 40 ? 'Critical' : 'At Risk'}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {tenant.riskFactors.map((factor, idx) => (
                    <span key={idx} className="text-xs px-2 py-1 bg-white rounded border border-red-300 text-red-700">
                      {factor}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function ExpansionOpportunitiesSection({ opportunities, totalOpportunities, loading }: ExpansionOpportunitiesProps) {
  return (
    <section className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <UniversalSectionHeader
        title="Expansion Opportunities"
        subtitle="Upsell and upgrade potential"
        icon={<TrendingUp className="h-5 w-5 text-green-600" />}
      />
      
      <div className="mt-6 space-y-6">
        <div className="bg-green-50 rounded-lg p-4 text-center">
          <p className="text-sm text-green-700">Total Opportunities</p>
          <p className="text-3xl font-bold text-green-900">{totalOpportunities}</p>
        </div>
        
        <div>
          <h4 className="font-medium text-gray-900 mb-3">Top Opportunities</h4>
          <div className="space-y-3">
            {opportunities.map((opp) => (
              <div key={opp.id} className="p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-bold text-green-900">{opp.tenantName}</p>
                    <p className="text-sm text-green-700 capitalize">
                      {opp.currentPlan} → {opp.suggestedPlan}
                    </p>
                  </div>
                  <span className="text-lg font-bold text-green-600">
                    +{formatCurrency(opp.mrrIncrease)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full"
                      style={{ width: `${opp.confidence}%` }}
                    />
                  </div>
                  <span className="text-xs font-medium text-gray-700">{opp.confidence}% confidence</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function TenantSegmentationSection({ segments, loading }: TenantSegmentationProps) {
  return (
    <section className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <UniversalSectionHeader
        title="Tenant Segmentation"
        subtitle="Performance by plan tier"
        icon={<PieChart className="h-5 w-5 text-indigo-600" />}
      />
      
      <div className="mt-6 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Segment</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Count</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total MRR</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg MRR</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Churn</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Health</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {segments.map((segment) => (
              <tr key={segment.segment} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm font-bold text-gray-900">{segment.segment}</td>
                <td className="px-4 py-3 text-sm text-gray-900">{segment.count}</td>
                <td className="px-4 py-3 text-sm font-medium text-gray-900">{formatCurrency(segment.mrr)}</td>
                <td className="px-4 py-3 text-sm text-gray-900">{formatCurrency(segment.avgMRR)}</td>
                <td className="px-4 py-3 text-sm">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    segment.churnRate < 3 ? 'bg-green-100 text-green-800' :
                    segment.churnRate < 5 ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {formatPercentage(segment.churnRate)}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm">
                  <div className="flex items-center gap-2">
                    <div 
                      className={`w-3 h-3 rounded-full ${getHealthColor(segment.healthScore)}`}
                      title={`Health: ${segment.healthScore}`}
                    />
                    <span className={`font-medium ${
                      segment.healthScore >= 80 ? 'text-green-600' : 
                      segment.healthScore >= 60 ? 'text-amber-600' : 'text-red-600'
                    }`}>
                      {segment.healthScore}
                    </span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
