/**
 * Analytics Dashboard Configuration
 */

import type { DashboardEngineConfig } from "@vayva/industry-core";

const ANALYTICS_INDUSTRY = "analytics" as const;

export const ANALYTICS_DASHBOARD_CONFIG: DashboardEngineConfig = {
  industry: ANALYTICS_INDUSTRY,
  title: "Analytics & Insights",
  subtitle: "Data-driven decision making",
  primaryObjectLabel: "Metric",
  defaultTimeHorizon: "today",
  sections: [
    "primary_object_health",
    "live_operations",
    "decision_kpis",
    "bottlenecks_alerts",
    "suggested_actions",
  ],
  layouts: [],
  kpiCards: [],
  alertRules: [],
  actions: [],
  failureModes: [],
  widgets: [
    {
      id: "key-metrics",
      type: "metric",
      title: "Key Metrics",
      industry: ANALYTICS_INDUSTRY,
      dataSource: { type: "analytics", query: "keyMetrics" },
    },
    {
      id: "trend-chart",
      type: "chart",
      title: "Performance Trends",
      industry: ANALYTICS_INDUSTRY,
      dataSource: { type: "analytics", query: "trends" },
    },
    {
      id: "kpi-tracker",
      type: "list",
      title: "KPI Status",
      industry: ANALYTICS_INDUSTRY,
      dataSource: { type: "insights", query: "kpis" },
    },
    {
      id: "revenue-breakdown",
      type: "chart",
      title: "Revenue Analysis",
      industry: ANALYTICS_INDUSTRY,
      dataSource: { type: "finance", query: "revenueBreakdown" },
    },
    {
      id: "insights-feed",
      type: "feed",
      title: "AI Insights",
      industry: ANALYTICS_INDUSTRY,
      dataSource: { type: "insights", query: "recommendations" },
    },
    {
      id: "forecast-preview",
      type: "metric",
      title: "Predictions",
      industry: ANALYTICS_INDUSTRY,
      dataSource: { type: "predictive", query: "forecasts" },
    },
  ],
};
