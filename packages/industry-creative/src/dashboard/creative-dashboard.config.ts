import type { DashboardEngineConfig, WidgetDefinition } from '../types';

const CREATIVE_INDUSTRY = 'creative_portfolio' as const;

// Portfolio & Gallery Widgets
const PORTFOLIO_ITEMS_WIDGET: WidgetDefinition = {
  id: 'portfolio-items',
  type: 'gallery',
  title: 'Portfolio Gallery',
  industry: CREATIVE_INDUSTRY,
  dataSource: {
    type: 'analytics',
    query: 'portfolio.items',
  },
  refreshInterval: 600,
};

const RECENT_PROJECTS_WIDGET: WidgetDefinition = {
  id: 'recent-projects',
  type: 'list',
  title: 'Recent Projects',
  industry: CREATIVE_INDUSTRY,
  dataSource: {
    type: 'analytics',
    query: 'projects.recent',
  },
  visualization: {
    type: 'list',
    options: { maxItems: 5 },
  },
  refreshInterval: 300,
};

// Client Proofing Widgets
const PENDING_PROOFS_WIDGET: WidgetDefinition = {
  id: 'pending-proofs',
  type: 'kpi-card',
  title: 'Pending Client Proofs',
  industry: CREATIVE_INDUSTRY,
  dataSource: {
    type: 'analytics',
    query: 'proofs.pending',
  },
  refreshInterval: 300,
};

const REVISIONS_WIDGET: WidgetDefinition = {
  id: 'revisions',
  type: 'table',
  title: 'Active Revisions',
  industry: CREATIVE_INDUSTRY,
  dataSource: {
    type: 'analytics',
    query: 'revisions.active',
  },
  visualization: {
    type: 'table',
    options: {
      columns: ['project', 'version', 'status', 'clientFeedback'],
      sortable: true,
    },
  },
  refreshInterval: 300,
};

// Project Workflow Widgets
const PROJECT_STATUS_WIDGET: WidgetDefinition = {
  id: 'project-status',
  type: 'kanban',
  title: 'Project Workflow Board',
  industry: CREATIVE_INDUSTRY,
  dataSource: {
    type: 'analytics',
    query: 'projects.workflow',
  },
  visualization: {
    type: 'kanban',
    options: {
      columns: ['backlog', 'in-progress', 'review', 'approved', 'delivered'],
    },
  },
  refreshInterval: 300,
};

const TIME_TRACKING_WIDGET: WidgetDefinition = {
  id: 'time-tracking',
  type: 'chart-bar',
  title: 'Time Tracked This Week',
  industry: CREATIVE_INDUSTRY,
  dataSource: {
    type: 'analytics',
    query: 'time.weekly',
  },
  visualization: {
    type: 'bar',
    options: { groupBy: 'project' },
  },
  refreshInterval: 600,
};

// Asset Library Widgets
const ASSET_LIBRARY_WIDGET: WidgetDefinition = {
  id: 'asset-library',
  type: 'grid',
  title: 'Asset Library',
  industry: CREATIVE_INDUSTRY,
  dataSource: {
    type: 'entity',
    entity: 'assets',
  },
  visualization: {
    type: 'grid',
    options: { viewMode: 'thumbnail' },
  },
  refreshInterval: 900,
};

export const CREATIVE_DASHBOARD_CONFIG: DashboardEngineConfig = {
  industry: CREATIVE_INDUSTRY,
  title: 'Creative studio',
  subtitle: 'Portfolio, proofing, and delivery',
  primaryObjectLabel: 'Project',
  defaultTimeHorizon: 'week',
  sections: [
    'primary_object_health',
    'live_operations',
    'decision_kpis',
    'bottlenecks_alerts',
    'suggested_actions',
  ],
  layouts: [],
  kpiCards: [],
  alertRules: [],
  actions: [],
  failureModes: [],
  widgets: [
    // Portfolio & Gallery
    PORTFOLIO_ITEMS_WIDGET,
    RECENT_PROJECTS_WIDGET,

    // Client Proofing
    PENDING_PROOFS_WIDGET,
    REVISIONS_WIDGET,

    // Project Workflow
    PROJECT_STATUS_WIDGET,
    TIME_TRACKING_WIDGET,

    // Asset Library
    ASSET_LIBRARY_WIDGET,
  ],
};

export function getCreativeDashboardConfig(): DashboardEngineConfig {
  return CREATIVE_DASHBOARD_CONFIG;
}
