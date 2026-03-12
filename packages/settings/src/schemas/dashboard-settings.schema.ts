import { z } from 'zod';

/**
 * Dashboard Settings Schema
 * 
 * Controls dashboard layout, widget visibility, refresh rates,
 * and overall user experience.
 */

// ============================================================================
// WIDGET CONFIGURATION
// ============================================================================

export const widgetConfigSchema = z.object({
  // Widget Identification
  id: z.string(),
  type: z.string(), // e.g., 'revenue-chart', 'kpi-card', 'recent-orders'
  
  // Visibility & Position
  visible: z.boolean().default(true),
  position: z.object({
    x: z.number().int().default(0),
    y: z.number().int().default(0),
    w: z.number().int().min(1).max(12).default(6), // Width (1-12 columns)
    h: z.number().int().min(1).max(8).default(3), // Height (rows)
  }),
  
  // Customization
  title: z.string().optional(),
  customTitle: z.boolean().default(false),
  colorScheme: z.enum(['default', 'primary', 'secondary', 'custom']).default('default'),
  customColors: z.object({
    background: z.string().optional(),
    text: z.string().optional(),
    accent: z.string().optional(),
  }).optional(),
  
  // Data Configuration
  dataSource: z.string().optional(), // API endpoint or data source ID
  refreshInterval: z.number().min(0).max(3600).default(300), // Seconds (0 = manual only)
  dateRange: z.object({
    type: z.enum(['today', 'yesterday', 'last-7-days', 'last-30-days', 'mtd', 'qtd', 'ytd', 'custom']),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
  }).default({ type: 'last-7-days' }),
  
  // Display Options
  showTrend: z.boolean().default(true),
  showComparison: z.boolean().default(false),
  comparisonPeriod: z.enum(['previous-period', 'same-period-last-year']).default('previous-period'),
  chartType: z.enum(['line', 'bar', 'area', 'pie', 'donut', 'table']).optional(),
  
  // Filters
  filters: z.array(z.object({
    field: z.string(),
    operator: z.enum(['equals', 'not-equals', 'contains', 'greater-than', 'less-than', 'between']),
    value: z.any(),
  })).optional(),
  
  // Actions
  enableDrillDown: z.boolean().default(true),
  clickAction: z.object({
    type: z.enum(['navigate', 'open-modal', 'run-report']),
    target: z.string(), // URL, modal ID, or report ID
  }).optional(),
});

export type WidgetConfig = z.infer<typeof widgetConfigSchema>;

// ============================================================================
// LAYOUT PRESETS
// ============================================================================

export const layoutPresetSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  icon: z.string().optional(),
  
  // Layout for different screen sizes
  layouts: z.object({
    desktop: z.array(z.object({
      x: z.number().default(0),
      y: z.number().default(0),
      w: z.number().default(1),
      h: z.number().default(1)
    })),
    tablet: z.array(z.object({
      x: z.number().default(0),
      y: z.number().default(0),
      w: z.number().default(1),
      h: z.number().default(1)
    })).optional(),
    mobile: z.array(z.object({
      x: z.number().default(0),
      y: z.number().default(0),
      w: z.number().default(1),
      h: z.number().default(1)
    })).optional(),
  }),
  
  // Widgets included in this preset
  widgets: z.array(z.string()), // Widget IDs
  
  // Metadata
  isDefault: z.boolean().default(false),
  industry: z.string().optional(),
  role: z.string().optional(), // e.g., 'admin', 'manager', 'staff'
});

export type LayoutPreset = z.infer<typeof layoutPresetSchema>;

// ============================================================================
// REFRESH CONFIGURATION
// ============================================================================

export const refreshConfigSchema = z.object({
  // Global Refresh Settings
  autoRefreshEnabled: z.boolean().default(true),
  globalRefreshInterval: z.number().min(30).max(3600).default(300), // Seconds
  
  // Real-time Updates
  realTimeUpdates: z.boolean().default(false),
  websocketEnabled: z.boolean().default(false),
  
  // Performance Mode
  performanceMode: z.boolean().default(false), // Reduces refresh rate to save resources
  performanceModeInterval: z.number().min(60).max(1800).default(900), // 15 minutes
  
  // Background Refresh
  backgroundRefresh: z.boolean().default(true),
  prefetchEnabled: z.boolean().default(true),
  
  // Data Caching
  enableCaching: z.boolean().default(true),
  cacheExpirationSeconds: z.number().min(0).max(3600).default(300),
  
  // Battery Saver
  batterySaverMode: z.boolean().default(false),
  batterySaverThreshold: z.number().min(5).max(50).default(20), // Percentage
  
  // Network Awareness
  reduceRefreshOnSlowNetwork: z.boolean().default(true),
  slowNetworkThresholdMbps: z.number().min(0.1).max(10).default(1),
});

export type RefreshConfig = z.infer<typeof refreshConfigSchema>;

// ============================================================================
// DASHBOARD BEHAVIOR
// ============================================================================

export const dashboardBehaviorSchema = z.object({
  // Sidebar Behavior
  sidebar: z.object({
    collapsedByDefault: z.boolean().default(false),
    pinned: z.boolean().default(false),
    width: z.number().min(200).max(400).default(280),
    iconsOnly: z.boolean().default(false),
  }),
  
  // Header Behavior
  header: z.object({
    showBreadcrumbs: z.boolean().default(true),
    showSearch: z.boolean().default(true),
    showNotifications: z.boolean().default(true),
    showUserMenu: z.boolean().default(true),
    sticky: z.boolean().default(true),
  }),
  
  // Grid Behavior
  grid: z.object({
    columns: z.number().min(1).max(24).default(12),
    rowHeight: z.number().min(50).max(200).default(100), // Pixels
    margin: z.number().min(0).max(50).default(16),
    useCssGrid: z.boolean().default(true),
    resizableWidgets: z.boolean().default(true),
    draggableWidgets: z.boolean().default(true),
    preventCollision: z.boolean().default(true),
  }),
  
  // Animation
  animations: z.object({
    enabled: z.boolean().default(true),
    reducedMotion: z.boolean().default(false),
    transitionDuration: z.number().min(0).max(1000).default(300), // Milliseconds
  }),
});

// ============================================================================
// DATE RANGE DEFAULTS
// ============================================================================

export const dateRangeDefaultsSchema = z.object({
  // Default Date Range for Reports
  defaultRange: z.enum(['today', 'yesterday', 'last-7-days', 'last-30-days', 'mtd', 'qtd', 'ytd', 'custom']).default('last-7-days'),
  
  // Comparison Period
  compareWithPreviousPeriod: z.boolean().default(true),
  compareWithSamePeriodLastYear: z.boolean().default(false),
  
  // Fiscal Year
  fiscalYearStartMonth: z.number().min(0).max(11).default(0), // 0 = January
  useFiscalYear: z.boolean().default(false),
  
  // Timezone
  useBusinessTimezone: z.boolean().default(true),
  timezone: z.string().optional(),
});

// ============================================================================
// COMBINED DASHBOARD SETTINGS SCHEMA
// ============================================================================

export const dashboardSettingsSchema = z.object({
  // Layout & Structure
  layout: z.object({
    activePreset: z.string().default('default'),
    presets: z.array(layoutPresetSchema).optional(),
    locked: z.boolean().default(false), // Prevent layout changes
  }),
  
  // Widgets
  widgets: z.object({
    registry: z.array(widgetConfigSchema),
    hiddenWidgets: z.array(z.string()).optional(), // Widget IDs
    favoriteWidgets: z.array(z.string()).optional(),
  }),
  
  // Refresh & Performance
  refresh: refreshConfigSchema,
  
  // Behavior
  behavior: dashboardBehaviorSchema,
  
  // Date Ranges
  dateRanges: dateRangeDefaultsSchema,
  
  // User-Specific Settings
  user: z.object({
    allowCustomization: z.boolean().default(true),
    saveLayoutPerUser: z.boolean().default(true),
    resetLayoutOnLogout: z.boolean().default(false),
  }),
  
  // Mobile Responsive
  mobile: z.object({
    separateMobileLayout: z.boolean().default(true),
    mobileWidgets: z.array(z.string()).optional(), // Widget IDs shown on mobile
    collapsibleSections: z.boolean().default(true),
  }),
});

export type DashboardSettings = z.infer<typeof dashboardSettingsSchema>;
