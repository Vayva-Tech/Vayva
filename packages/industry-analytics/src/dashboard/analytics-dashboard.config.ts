// @ts-nocheck
/**
 * Analytics Dashboard Configuration
 */

import type { DashboardEngineConfig } from '@vayva/industry-core';

export const ANALYTICS_DASHBOARD_CONFIG: DashboardEngineConfig = {
  industry: 'analytics',
  title: 'Analytics & Insights',
  subtitle: 'Data-driven decision making',
  primaryObjectLabel: 'Metric',
  defaultTimeHorizon: 'today',
  
  widgets: [
    {
      id: 'key-metrics',
      type: 'metric',
      title: 'Key Metrics',
      dataSource: { type: 'analytics', query: 'keyMetrics' },
    },
    {
      id: 'trend-chart',
      type: 'chart',
      title: 'Performance Trends',
      dataSource: { type: 'analytics', query: 'trends' },
    },
    {
      id: 'kpi-tracker',
      type: 'list',
      title: 'KPI Status',
      dataSource: { type: 'insights', query: 'kpis' },
    },
    {
      id: 'revenue-breakdown',
      type: 'chart',
      title: 'Revenue Analysis',
      dataSource: { type: 'finance', query: 'revenueBreakdown' },
    },
    {
      id: 'insights-feed',
      type: 'feed',
      title: 'AI Insights',
      dataSource: { type: 'insights', query: 'recommendations' },
    },
    {
      id: 'forecast-preview',
      type: 'metric',
      title: 'Predictions',
      dataSource: { type: 'predictive', query: 'forecasts' },
    },
  ],
};
