import type { DashboardEngineConfig, WidgetDefinition } from '../types';

// Firm Overview Widgets
const ACTIVE_MATTERS_WIDGET: WidgetDefinition = {
  id: 'active-matters',
  type: 'kpi-card',
  title: 'Active Matters',
  industry: 'professional',
  dataSource: {
    type: 'analytics',
    query: 'matters.active',
  },
  refreshInterval: 300,
};

const UTILIZATION_RATE_WIDGET: WidgetDefinition = {
  id: 'utilization-rate',
  type: 'gauge',
  title: 'Utilization Rate',
  industry: 'professional',
  dataSource: {
    type: 'analytics',
    query: 'billing.utilizationRate',
  },
  visualization: {
    type: 'gauge',
    options: { min: 0, max: 100, unit: '%', thresholds: [60, 80] },
  },
  refreshInterval: 300,
};

const REVENUE_MTD_WIDGET: WidgetDefinition = {
  id: 'revenue-mtd',
  type: 'kpi-card',
  title: 'Revenue MTD',
  industry: 'professional',
  dataSource: {
    type: 'analytics',
    query: 'billing.revenueMTD',
  },
  refreshInterval: 300,
};

// Matter Pipeline Widgets
const MATTERS_BY_PRACTICE_AREA_WIDGET: WidgetDefinition = {
  id: 'matters-by-practice-area',
  type: 'chart-bar',
  title: 'Matters by Practice Area',
  industry: 'professional',
  dataSource: {
    type: 'analytics',
    query: 'matters.byPracticeArea',
  },
  visualization: {
    type: 'horizontal-bar',
    options: { maxItems: 5 },
  },
  refreshInterval: 3600,
};

const PENDING_CONFLICTS_WIDGET: WidgetDefinition = {
  id: 'pending-conflicts',
  type: 'kpi-card',
  title: 'Pending Conflicts',
  industry: 'professional',
  dataSource: {
    type: 'analytics',
    query: 'conflicts.pending',
  },
  refreshInterval: 300,
};

// Client Portfolio Widgets
const CLIENT_OVERVIEW_WIDGET: WidgetDefinition = {
  id: 'client-overview',
  type: 'table',
  title: 'Client Overview',
  industry: 'professional',
  dataSource: {
    type: 'analytics',
    query: 'clients.overview',
  },
  visualization: {
    type: 'table',
    options: { 
      columns: ['clientName', 'mattersCount', 'revenueYTD', 'retentionRate'],
      sortable: true,
      searchable: true
    },
  },
  refreshInterval: 1800,
};

// Time & Billing Widgets
const MONTHLY_HOURS_WIDGET: WidgetDefinition = {
  id: 'monthly-hours',
  type: 'chart-line',
  title: 'Monthly Hours Summary',
  industry: 'professional',
  dataSource: {
    type: 'analytics',
    query: 'billing.monthlyHours',
  },
  visualization: {
    type: 'line',
    options: { smooth: true },
  },
  refreshInterval: 3600,
};

const COLLECTION_RATE_WIDGET: WidgetDefinition = {
  id: 'collection-rate',
  type: 'kpi-card',
  title: 'Collection Rate',
  industry: 'professional',
  dataSource: {
    type: 'analytics',
    query: 'billing.collectionRate',
  },
  refreshInterval: 300,
};

const REALIZATION_RATE_WIDGET: WidgetDefinition = {
  id: 'realization-rate',
  type: 'kpi-card',
  title: 'Realization Rate',
  industry: 'professional',
  dataSource: {
    type: 'analytics',
    query: 'billing.realizationRate',
  },
  refreshInterval: 300,
};

// Document Status Widgets
const DOCUMENT_PIPELINE_WIDGET: WidgetDefinition = {
  id: 'document-pipeline',
  type: 'chart-pie',
  title: 'Document Pipeline',
  industry: 'professional',
  dataSource: {
    type: 'analytics',
    query: 'documents.pipeline',
  },
  visualization: {
    type: 'donut',
  },
  refreshInterval: 1800,
};

const PENDING_SIGNATURES_WIDGET: WidgetDefinition = {
  id: 'pending-signatures',
  type: 'kpi-card',
  title: 'Pending Signatures',
  industry: 'professional',
  dataSource: {
    type: 'analytics',
    query: 'documents.pendingSignatures',
  },
  refreshInterval: 300,
};

// Accounts Receivable Widgets
const OUTSTANDING_INVOICES_WIDGET: WidgetDefinition = {
  id: 'outstanding-invoices',
  type: 'chart-bar',
  title: 'Outstanding Invoices by Aging',
  industry: 'professional',
  dataSource: {
    type: 'analytics',
    query: 'billing.arAging',
  },
  visualization: {
    type: 'vertical-bar',
    options: { stacked: true },
  },
  refreshInterval: 1800,
};

const TOP_DEBTORS_WIDGET: WidgetDefinition = {
  id: 'top-debtors',
  type: 'table',
  title: 'Top Debtors',
  industry: 'professional',
  dataSource: {
    type: 'analytics',
    query: 'billing.topDebtors',
  },
  visualization: {
    type: 'table',
    options: { 
      columns: ['clientName', 'amount', 'daysOverdue'],
      sortable: true
    },
  },
  refreshInterval: 3600,
};

// Court Dates & Deadlines Widgets
const TODAY_COURT_CALENDAR_WIDGET: WidgetDefinition = {
  id: 'today-court-calendar',
  type: 'list',
  title: 'Today\'s Court Calendar',
  industry: 'professional',
  dataSource: {
    type: 'analytics',
    query: 'calendar.courtToday',
  },
  visualization: {
    type: 'list',
    options: { itemDisplay: 'event' },
  },
  refreshInterval: 300,
};

const UPCOMING_DEADLINES_WIDGET: WidgetDefinition = {
  id: 'upcoming-deadlines',
  type: 'calendar',
  title: 'Upcoming Deadlines',
  industry: 'professional',
  dataSource: {
    type: 'analytics',
    query: 'calendar.upcomingDeadlines',
  },
  visualization: {
    type: 'calendar',
    options: { view: 'week' },
  },
  refreshInterval: 1800,
};

// Task Management Widgets
const TASK_QUEUE_WIDGET: WidgetDefinition = {
  id: 'task-queue',
  type: 'kanban',
  title: 'Task Queue',
  industry: 'professional',
  dataSource: {
    type: 'analytics',
    query: 'tasks.queue',
  },
  visualization: {
    type: 'kanban',
    options: { columns: ['high_priority', 'due_today', 'overdue'] },
  },
  refreshInterval: 300,
};

// Compliance & Conflicts Widgets
const CONFLICTS_CHECK_QUEUE_WIDGET: WidgetDefinition = {
  id: 'conflicts-check-queue',
  type: 'kpi-card',
  title: 'Conflicts Check Queue',
  industry: 'professional',
  dataSource: {
    type: 'analytics',
    query: 'conflicts.queue',
  },
  refreshInterval: 300,
};

const CLE_COMPLIANCE_WIDGET: WidgetDefinition = {
  id: 'cle-compliance',
  type: 'table',
  title: 'CLE Compliance Tracker',
  industry: 'professional',
  dataSource: {
    type: 'analytics',
    query: 'compliance.cleTracking',
  },
  visualization: {
    type: 'table',
    options: { 
      columns: ['attorneyName', 'creditsEarned', 'creditsRequired', 'status'],
      sortable: true
    },
  },
  refreshInterval: 3600,
};

// Business Development Widgets
const PIPELINE_OPPORTUNITIES_WIDGET: WidgetDefinition = {
  id: 'pipeline-opportunities',
  type: 'kpi-card',
  title: 'Pipeline Opportunities',
  industry: 'professional',
  dataSource: {
    type: 'analytics',
    query: 'businessDevelopment.pipeline',
  },
  refreshInterval: 1800,
};

const WIN_RATE_WIDGET: WidgetDefinition = {
  id: 'win-rate',
  type: 'gauge',
  title: 'Win Rate',
  industry: 'professional',
  dataSource: {
    type: 'analytics',
    query: 'businessDevelopment.winRate',
  },
  visualization: {
    type: 'gauge',
    options: { min: 0, max: 100, unit: '%', thresholds: [30, 50] },
  },
  refreshInterval: 3600,
};

export const PROFESSIONAL_SERVICES_DASHBOARD_CONFIG: DashboardEngineConfig = {
  industry: 'professional',
  widgets: [
    // Firm Overview
    ACTIVE_MATTERS_WIDGET,
    UTILIZATION_RATE_WIDGET,
    REVENUE_MTD_WIDGET,
    
    // Matter Pipeline
    MATTERS_BY_PRACTICE_AREA_WIDGET,
    PENDING_CONFLICTS_WIDGET,
    
    // Client Portfolio
    CLIENT_OVERVIEW_WIDGET,
    
    // Time & Billing
    MONTHLY_HOURS_WIDGET,
    COLLECTION_RATE_WIDGET,
    REALIZATION_RATE_WIDGET,
    
    // Document Status
    DOCUMENT_PIPELINE_WIDGET,
    PENDING_SIGNATURES_WIDGET,
    
    // Accounts Receivable
    OUTSTANDING_INVOICES_WIDGET,
    TOP_DEBTORS_WIDGET,
    
    // Court Dates & Deadlines
    TODAY_COURT_CALENDAR_WIDGET,
    UPCOMING_DEADLINES_WIDGET,
    
    // Task Management
    TASK_QUEUE_WIDGET,
    
    // Compliance & Conflicts
    CONFLICTS_CHECK_QUEUE_WIDGET,
    CLE_COMPLIANCE_WIDGET,
    
    // Business Development
    PIPELINE_OPPORTUNITIES_WIDGET,
    WIN_RATE_WIDGET,
  ],
  layouts: [
    {
      id: 'default',
      name: 'Professional Services Overview',
      breakpoints: {
        lg: [
          // Row 1
          { i: 'active-matters', x: 0, y: 0, w: 3, h: 2 },
          { i: 'utilization-rate', x: 3, y: 0, w: 3, h: 4 },
          { i: 'revenue-mtd', x: 6, y: 0, w: 3, h: 2 },
          { i: 'pending-conflicts', x: 9, y: 0, w: 3, h: 2 },
          
          // Row 2
          { i: 'matters-by-practice-area', x: 0, y: 2, w: 6, h: 4 },
          { i: 'revenue-mtd', x: 6, y: 2, w: 3, h: 2 },
          { i: 'pending-conflicts', x: 9, y: 2, w: 3, h: 2 },
          
          // Row 3
          { i: 'client-overview', x: 0, y: 6, w: 6, h: 5 },
          { i: 'monthly-hours', x: 6, y: 6, w: 6, h: 5 },
          
          // Row 4
          { i: 'collection-rate', x: 0, y: 11, w: 3, h: 2 },
          { i: 'realization-rate', x: 3, y: 11, w: 3, h: 2 },
          { i: 'document-pipeline', x: 6, y: 11, w: 3, h: 4 },
          { i: 'pending-signatures', x: 9, y: 11, w: 3, h: 2 },
          
          // Row 5
          { i: 'outstanding-invoices', x: 0, y: 13, w: 6, h: 5 },
          { i: 'pending-signatures', x: 9, y: 13, w: 3, h: 2 },
          
          // Row 6
          { i: 'top-debtors', x: 0, y: 18, w: 6, h: 4 },
          { i: 'today-court-calendar', x: 6, y: 18, w: 3, h: 4 },
          { i: 'upcoming-deadlines', x: 9, y: 18, w: 3, h: 4 },
          
          // Row 7
          { i: 'task-queue', x: 0, y: 22, w: 6, h: 5 },
          { i: 'conflicts-check-queue', x: 6, y: 22, w: 3, h: 2 },
          { i: 'cle-compliance', x: 9, y: 22, w: 3, h: 5 },
          
          // Row 8
          { i: 'pipeline-opportunities', x: 0, y: 27, w: 3, h: 2 },
          { i: 'win-rate', x: 3, y: 27, w: 3, h: 4 },
        ],
      },
    },
  ],
  kpiCards: [
    { id: 'active-matters', label: 'Active Matters', format: 'number' },
    { id: 'utilization-rate', label: 'Utilization %', format: 'percent' },
    { id: 'revenue-mtd', label: 'Revenue MTD', format: 'currency' },
    { id: 'pending-conflicts', label: 'Pending Conflicts', format: 'number' },
    { id: 'collection-rate', label: 'Collection %', format: 'percent' },
    { id: 'realization-rate', label: 'Realization %', format: 'percent' },
    { id: 'pending-signatures', label: 'Pending Signatures', format: 'number' },
    { id: 'conflicts-check-queue', label: 'Conflicts Queue', format: 'number' },
    { id: 'pipeline-opportunities', label: 'Pipeline Opps', format: 'number' },
    { id: 'win-rate', label: 'Win Rate %', format: 'percent' },
  ],
  alertRules: [
    {
      id: 'low-utilization',
      condition: 'billing.utilizationRate < threshold',
      threshold: 60,
      action: 'notify:management',
    },
    {
      id: 'high-dso',
      condition: 'billing.dso > threshold',
      threshold: 45,
      action: 'notify:billing',
    },
    {
      id: 'pending-conflicts',
      condition: 'conflicts.pending > threshold',
      threshold: 3,
      action: 'notify:compliance',
    },
    {
      id: 'overdue-invoices',
      condition: 'billing.overdueInvoices > threshold',
      threshold: 5,
      action: 'notify:billing',
    },
  ],
  actions: [
    { id: 'new-matter', label: 'New Matter', icon: 'briefcase-plus', action: 'navigate:/matters/new' },
    { id: 'new-client', label: 'New Client', icon: 'user-plus', action: 'navigate:/clients/new' },
    { id: 'log-time', label: 'Log Time', icon: 'clock-plus', action: 'navigate:/time/log' },
    { id: 'create-invoice', label: 'Create Invoice', icon: 'file-invoice', action: 'navigate:/billing/invoices/new' },
    { id: 'view-calendar', label: 'Calendar', icon: 'calendar', action: 'navigate:/calendar' },
    { id: 'conflicts-check', label: 'Run Conflicts Check', icon: 'shield-check', action: 'modal:conflicts-check' },
  ],
};

export function getProfessionalServicesDashboardConfig(): DashboardEngineConfig {
  return PROFESSIONAL_SERVICES_DASHBOARD_CONFIG;
}