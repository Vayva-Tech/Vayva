// @ts-nocheck
// ============================================================================
// SaaS Industry Dashboard Configuration
// ============================================================================

import type { DashboardEngineConfig, WidgetDefinition } from '../types';

const TOTAL_MRR_WIDGET: WidgetDefinition = {
  id: 'total-mrr',
  type: 'kpi-card',
  title: 'Total MRR',
  industry: 'saas',
  dataSource: {
    type: 'analytics',
    query: 'revenue.totalMRR',
  },
  refreshInterval: 3600,
};

const ACTIVE_TENANTS_WIDGET: WidgetDefinition = {
  id: 'active-tenants',
  type: 'kpi-card',
  title: 'Active Tenants',
  industry: 'saas',
  dataSource: {
    type: 'analytics',
    query: 'tenants.active',
  },
  refreshInterval: 300,
};

const CHURN_RATE_WIDGET: WidgetDefinition = {
  id: 'churn-rate',
  type: 'kpi-card',
  title: 'Churn Rate',
  industry: 'saas',
  dataSource: {
    type: 'analytics',
    query: 'churn.rate',
  },
  refreshInterval: 3600,
};

const LTV_WIDGET: WidgetDefinition = {
  id: 'ltv',
  type: 'kpi-card',
  title: 'Customer LTV',
  industry: 'saas',
  dataSource: {
    type: 'analytics',
    query: 'revenue.ltv',
  },
  refreshInterval: 86400,
};

const MRR_WATERFALL_WIDGET: WidgetDefinition = {
  id: 'mrr-waterfall',
  type: 'chart-bar',
  title: 'MRR Waterfall',
  industry: 'saas',
  dataSource: {
    type: 'analytics',
    query: 'revenue.mrrMovement',
  },
  visualization: {
    type: 'waterfall',
    options: { currency: true },
  },
  refreshInterval: 3600,
};

const TENANT_HEALTH_WIDGET: WidgetDefinition = {
  id: 'tenant-health',
  type: 'chart-pie',
  title: 'Tenant Health Distribution',
  industry: 'saas',
  dataSource: {
    type: 'analytics',
    query: 'tenants.healthDistribution',
  },
  visualization: {
    type: 'donut',
  },
  refreshInterval: 1800,
};

const USAGE_TREND_WIDGET: WidgetDefinition = {
  id: 'usage-trend',
  type: 'chart-line',
  title: 'Usage Trend',
  industry: 'saas',
  dataSource: {
    type: 'analytics',
    query: 'usage.trend',
  },
  visualization: {
    type: 'line',
    options: { smooth: true },
  },
  refreshInterval: 600,
};

const AT_RISK_TENANTS_WIDGET: WidgetDefinition = {
  id: 'at-risk-tenants',
  type: 'table',
  title: 'At-Risk Tenants',
  industry: 'saas',
  dataSource: {
    type: 'analytics',
    query: 'tenants.atRisk',
  },
  refreshInterval: 300,
};

export const SAAS_DASHBOARD_CONFIG: DashboardEngineConfig = {
  industry: 'saas',
  widgets: [
    TOTAL_MRR_WIDGET,
    ACTIVE_TENANTS_WIDGET,
    CHURN_RATE_WIDGET,
    LTV_WIDGET,
    MRR_WATERFALL_WIDGET,
    TENANT_HEALTH_WIDGET,
    USAGE_TREND_WIDGET,
    AT_RISK_TENANTS_WIDGET,
  ],
  layouts: [
    {
      id: 'default',
      name: 'SaaS Overview',
      breakpoints: {
        lg: [
          { i: 'total-mrr', x: 0, y: 0, w: 3, h: 2 },
          { i: 'active-tenants', x: 3, y: 0, w: 3, h: 2 },
          { i: 'churn-rate', x: 6, y: 0, w: 3, h: 2 },
          { i: 'ltv', x: 9, y: 0, w: 3, h: 2 },
          { i: 'mrr-waterfall', x: 0, y: 2, w: 8, h: 4 },
          { i: 'tenant-health', x: 8, y: 2, w: 4, h: 4 },
          { i: 'usage-trend', x: 0, y: 6, w: 8, h: 4 },
          { i: 'at-risk-tenants', x: 8, y: 6, w: 4, h: 4 },
        ],
      },
    },
  ],
  kpiCards: [
    { id: 'total-mrr', label: 'Total MRR', format: 'currency' },
    { id: 'active-tenants', label: 'Active Tenants', format: 'number' },
    { id: 'churn-rate', label: 'Churn Rate', format: 'percent' },
    { id: 'ltv', label: 'Customer LTV', format: 'currency' },
  ],
  alertRules: [
    {
      id: 'high-churn',
      condition: 'churn.rate > threshold',
      threshold: 5,
      action: 'notify:admin',
    },
    {
      id: 'mrr-decline',
      condition: 'revenue.mrrGrowth < -threshold',
      threshold: 5,
      action: 'notify:admin',
    },
  ],
  actions: [
    { id: 'new-tenant', label: 'Add Tenant', icon: 'user-plus', action: 'navigate:/tenants/new' },
    { id: 'upgrade-tenant', label: 'Upgrade Plan', icon: 'trending-up', action: 'navigate:/subscriptions/upgrade' },
    { id: 'review-churn', label: 'Review Churn', icon: 'user-minus', action: 'navigate:/analytics/churn' },
  ],
};

export function getSaaSDashboardConfig(): DashboardEngineConfig {
  return SAAS_DASHBOARD_CONFIG;
}
