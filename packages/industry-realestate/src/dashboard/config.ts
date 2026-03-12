/**
 * Real Estate Dashboard Configuration
 * Dashboard widgets and layout for real estate industry
 */

// Dashboard configuration types
export interface DashboardEngineConfig {
  industry: string;
  widgets: WidgetConfig[];
  kpiCards: KPICardConfig[];
  actions: QuickActionConfig[];
  defaultLayout: LayoutConfig;
}

export interface WidgetConfig {
  id: string;
  type: 'kanban' | 'calendar' | 'table' | 'timeline' | 'map' | 'stat' | 'custom' | 'chart';
  title: string;
  component?: string;
  dataSource: DataSourceConfig;
}

export interface DataSourceConfig {
  type: 'entity' | 'analytics' | 'geo' | 'count' | 'sum' | 'avg' | 'percentage' | 'event';
  entity?: string;
  query?: string;
  field?: string;
  filter?: Record<string, unknown>;
  groupBy?: string;
  sort?: { field: string; direction: 'asc' | 'desc' };
  limit?: number;
}

export interface KPICardConfig {
  id: string;
  label: string;
  format: 'number' | 'currency' | 'percent';
}

export interface QuickActionConfig {
  id: string;
  label: string;
  icon: string;
  href: string;
}

export interface LayoutConfig {
  columns: number;
  rows: LayoutRow[];
}

export interface LayoutRow {
  height: string;
  widgets: Array<{ id: string; width: number }>;
}

// Define widget configurations
const widgets: WidgetConfig[] = [
  // Pipeline Board
  {
    id: 'pipeline-board',
    type: 'kanban',
    title: 'Deal Pipeline',
    dataSource: {
      type: 'entity',
      entity: 'property-listing',
      groupBy: 'status',
    },
  },
  
  // CMA Generator
  {
    id: 'cma-quick',
    type: 'custom',
    title: 'Quick CMA',
    component: 'CMAWidget',
    dataSource: {
      type: 'analytics',
      query: 'cma-generator',
    },
  },
  
  // Showing Calendar
  {
    id: 'showing-calendar',
    type: 'calendar',
    title: 'Showings & Open Houses',
    dataSource: {
      type: 'event',
      entity: 'property-showing',
    },
  },
  
  // Lead Scoring
  {
    id: 'lead-scores',
    type: 'table',
    title: 'Hot Leads',
    dataSource: {
      type: 'analytics',
      query: 'lead-scoring',
      sort: { field: 'score', direction: 'desc' },
      limit: 10,
    },
  },
  
  // Transaction Timeline
  {
    id: 'transaction-timeline',
    type: 'timeline',
    title: 'Contract to Close',
    dataSource: {
      type: 'entity',
      entity: 'transaction',
      filter: { status: 'active' },
    },
  },
  
  // Market Activity Map
  {
    id: 'market-map',
    type: 'map',
    title: 'Market Activity',
    dataSource: {
      type: 'geo',
      query: 'recent-sales-and-listings',
    },
  },
  
  // Active Listings Count
  {
    id: 'active-listings-count',
    type: 'stat',
    title: 'Active Listings',
    dataSource: {
      type: 'count',
      entity: 'property-listing',
      filter: { status: 'active' },
    },
  },
  
  // Pipeline Value
  {
    id: 'pipeline-value',
    type: 'stat',
    title: 'Pipeline Value',
    dataSource: {
      type: 'sum',
      entity: 'property-listing',
      field: 'listPrice',
      filter: { status: ['active', 'pending'] },
    },
  },
  
  // Average Days on Market
  {
    id: 'avg-dom',
    type: 'stat',
    title: 'Avg DOM',
    dataSource: {
      type: 'avg',
      entity: 'property-listing',
      field: 'daysOnMarket',
      filter: { status: 'active' },
    },
  },
  
  // Showing Conversion Rate
  {
    id: 'showing-conversion',
    type: 'stat',
    title: 'Showing to Offer %',
    dataSource: {
      type: 'percentage',
      query: 'showing-conversion-rate',
    },
  },

  // Phase 4: Document Management Widgets
  {
    id: 'document-status-board',
    type: 'kanban',
    title: 'Document Status',
    dataSource: {
      type: 'entity',
      entity: 'transaction-document',
      filter: { status: ['draft', 'pending_signature', 'partially_signed', 'fully_signed'] },
      sort: { field: 'updatedAt', direction: 'desc' },
      limit: 20,
    },
  },
  {
    id: 'pending-signatures',
    type: 'table',
    title: 'Pending Signatures',
    dataSource: {
      type: 'entity',
      entity: 'transaction-document',
      filter: { status: ['pending_signature', 'partially_signed'] },
      sort: { field: 'dueDate', direction: 'asc' },
      limit: 10,
    },
  },
  {
    id: 'checklist-progress',
    type: 'chart',
    title: 'Transaction Checklist Progress',
    dataSource: {
      type: 'analytics',
      query: 'checklist-completion-by-phase',
    },
  },
  {
    id: 'vendor-schedule',
    type: 'calendar',
    title: 'Vendor Appointments',
    dataSource: {
      type: 'entity',
      entity: 'vendor-assignment',
      filter: { status: ['scheduled', 'in_progress'] },
    },
  },
  {
    id: 'document-bottlenecks',
    type: 'table',
    title: 'Signature Bottlenecks',
    component: 'DocumentBottleneckWidget',
    dataSource: {
      type: 'analytics',
      query: 'document-analytics-bottlenecks',
    },
  },
];

// Define KPI cards
const kpiCards: KPICardConfig[] = [
  { id: 'active-listings', label: 'Active Listings', format: 'number' },
  { id: 'pipeline-value', label: 'Pipeline Value', format: 'currency' },
  { id: 'avg-days-on-market', label: 'Avg DOM', format: 'number' },
  { id: 'showing-conversion', label: 'Showing to Offer %', format: 'percent' },
  // Phase 4: Document management KPIs
  { id: 'pending-signatures', label: 'Pending Signatures', format: 'number' },
  { id: 'checklist-completion', label: 'Checklist Completion', format: 'percent' },
  { id: 'overdue-documents', label: 'Overdue Docs', format: 'number' },
];

// Define quick actions
const actions: QuickActionConfig[] = [
  { id: 'generate-cma', label: 'Generate CMA', icon: 'FileText', href: '/cma/new' },
  { id: 'schedule-showing', label: 'Schedule Showing', icon: 'Calendar', href: '/showings/new' },
  { id: 'create-listing', label: 'New Listing', icon: 'Home', href: '/listings/new' },
  // Phase 4: Document management actions
  { id: 'new-document', label: 'Create Document', icon: 'FilePlus', href: '/documents/new' },
  { id: 'send-for-signature', label: 'Send for Signature', icon: 'PenLine', href: '/documents/sign' },
  { id: 'manage-vendors', label: 'Vendor Directory', icon: 'Users', href: '/vendors' },
  { id: 'view-checklist', label: 'Transaction Checklist', icon: 'CheckSquare', href: '/checklists' },
];

// Default layout configuration
const defaultLayout = {
  columns: 12,
  rows: [
    // Row 1: KPI Cards
    {
      height: 'auto',
      widgets: [
        { id: 'active-listings-count', width: 3 },
        { id: 'pipeline-value', width: 3 },
        { id: 'avg-dom', width: 3 },
        { id: 'showing-conversion', width: 3 },
      ],
    },
    // Row 2: Main widgets
    {
      height: '400px',
      widgets: [
        { id: 'pipeline-board', width: 6 },
        { id: 'showing-calendar', width: 6 },
      ],
    },
    // Row 3: Secondary widgets
    {
      height: '400px',
      widgets: [
        { id: 'lead-scores', width: 4 },
        { id: 'transaction-timeline', width: 4 },
        { id: 'cma-quick', width: 4 },
      ],
    },
    // Row 4: Map
    {
      height: '500px',
      widgets: [
        { id: 'market-map', width: 12 },
      ],
    },
    // Row 5: Phase 4 - Document management
    {
      height: '400px',
      widgets: [
        { id: 'document-status-board', width: 6 },
        { id: 'pending-signatures', width: 6 },
      ],
    },
    // Row 6: Checklist + Vendor schedule
    {
      height: '400px',
      widgets: [
        { id: 'checklist-progress', width: 4 },
        { id: 'vendor-schedule', width: 4 },
        { id: 'document-bottlenecks', width: 4 },
      ],
    },
  ],
};

/**
 * Real Estate Dashboard Configuration
 */
export const REALESTATE_DASHBOARD_CONFIG: DashboardEngineConfig = {
  industry: 'real_estate',
  widgets,
  kpiCards,
  actions,
  defaultLayout,
};

// Note: All type definitions are at the top of the file

// Export individual widget configs for reference
export const REALESTATE_WIDGETS = {
  pipelineBoard: widgets.find(w => w.id === 'pipeline-board'),
  cmaQuick: widgets.find(w => w.id === 'cma-quick'),
  showingCalendar: widgets.find(w => w.id === 'showing-calendar'),
  leadScores: widgets.find(w => w.id === 'lead-scores'),
  transactionTimeline: widgets.find(w => w.id === 'transaction-timeline'),
  marketMap: widgets.find(w => w.id === 'market-map'),
};

// Export KPI configs
export const REALESTATE_KPIS = {
  activeListings: kpiCards.find(k => k.id === 'active-listings'),
  pipelineValue: kpiCards.find(k => k.id === 'pipeline-value'),
  avgDaysOnMarket: kpiCards.find(k => k.id === 'avg-days-on-market'),
  showingConversion: kpiCards.find(k => k.id === 'showing-conversion'),
};

// Export action configs
export const REALESTATE_ACTIONS = {
  generateCMA: actions.find(a => a.id === 'generate-cma'),
  scheduleShowing: actions.find(a => a.id === 'schedule-showing'),
  createListing: actions.find(a => a.id === 'create-listing'),
};
