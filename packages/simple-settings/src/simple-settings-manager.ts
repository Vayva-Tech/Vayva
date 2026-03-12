/**
 * Simple Settings Manager for Dashboard Integration
 * Minimal implementation focusing on dashboard settings
 */

export interface WidgetPosition {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface WidgetConfig {
  id: string;
  type: string;
  visible: boolean;
  position: WidgetPosition;
  customTitle: boolean;
  colorScheme: 'default' | 'primary' | 'secondary' | 'custom';
  title: string;
  dataSource: string;
  refreshInterval: number;
  dateRange: {
    type: 'today' | 'yesterday' | 'last-7-days' | 'last-30-days' | 'mtd' | 'qtd' | 'ytd' | 'custom';
  };
  showTrend: boolean;
  showComparison: boolean;
  comparisonPeriod: 'previous-period' | 'same-period-last-year';
  chartType: 'line' | 'bar' | 'area' | 'pie' | 'donut' | 'table';
  enableDrillDown: boolean;
}

export interface DashboardSettings {
  layout: {
    activePreset: string;
    locked: boolean;
  };
  widgets: {
    registry: WidgetConfig[];
    hiddenWidgets: string[];
  };
  refresh: {
    autoRefreshEnabled: boolean;
    globalRefreshInterval: number;
  };
  behavior: {
    grid: {
      columns: number;
      rowHeight: number;
      margin: number;
    };
  };
  dateRanges: {
    defaultRange: 'today' | 'yesterday' | 'last-7-days' | 'last-30-days' | 'mtd' | 'qtd' | 'ytd' | 'custom';
  };
  user: {
    allowCustomization: boolean;
  };
  mobile: {
    separateMobileLayout: boolean;
  };
}

export interface SimpleSettings {
  dashboard: DashboardSettings;
}

export class SimpleSettingsManager {
  private settings: SimpleSettings;

  constructor() {
    this.settings = this.getDefaultSettings();
  }

  private getDefaultSettings(): SimpleSettings {
    return {
      dashboard: {
        layout: {
          activePreset: 'default',
          locked: false
        },
        widgets: {
          registry: [
            {
              id: 'revenue-card',
              type: 'metric-card',
              visible: true,
              position: { x: 0, y: 0, w: 3, h: 3 },
              customTitle: false,
              colorScheme: 'default',
              title: 'Revenue',
              dataSource: 'revenue',
              refreshInterval: 300,
              dateRange: { type: 'last-7-days' },
              showTrend: true,
              showComparison: true,
              comparisonPeriod: 'previous-period',
              chartType: 'line',
              enableDrillDown: true
            },
            {
              id: 'orders-card',
              type: 'metric-card',
              visible: true,
              position: { x: 3, y: 0, w: 3, h: 3 },
              customTitle: false,
              colorScheme: 'default',
              title: 'Orders',
              dataSource: 'orders',
              refreshInterval: 300,
              dateRange: { type: 'last-7-days' },
              showTrend: true,
              showComparison: true,
              comparisonPeriod: 'previous-period',
              chartType: 'line',
              enableDrillDown: true
            },
            {
              id: 'customers-card',
              type: 'metric-card',
              visible: true,
              position: { x: 6, y: 0, w: 3, h: 3 },
              customTitle: false,
              colorScheme: 'default',
              title: 'Customers',
              dataSource: 'customers',
              refreshInterval: 300,
              dateRange: { type: 'last-7-days' },
              showTrend: true,
              showComparison: true,
              comparisonPeriod: 'previous-period',
              chartType: 'line',
              enableDrillDown: true
            },
            {
              id: 'conversion-card',
              type: 'metric-card',
              visible: true,
              position: { x: 9, y: 0, w: 3, h: 3 },
              customTitle: false,
              colorScheme: 'default',
              title: 'Conversion Rate',
              dataSource: 'conversion_rate',
              refreshInterval: 300,
              dateRange: { type: 'last-7-days' },
              showTrend: true,
              showComparison: true,
              comparisonPeriod: 'previous-period',
              chartType: 'line',
              enableDrillDown: true
            }
          ],
          hiddenWidgets: []
        },
        refresh: {
          autoRefreshEnabled: true,
          globalRefreshInterval: 300
        },
        behavior: {
          grid: {
            columns: 12,
            rowHeight: 100,
            margin: 16
          }
        },
        dateRanges: {
          defaultRange: 'last-7-days'
        },
        user: {
          allowCustomization: true
        },
        mobile: {
          separateMobileLayout: true
        }
      }
    };
  }

  getDashboardSettings(): DashboardSettings {
    return this.settings.dashboard;
  }

  updateDashboardSettings(updates: Partial<DashboardSettings>): void {
    this.settings.dashboard = {
      ...this.settings.dashboard,
      ...updates
    };
  }

  getWidgets(): WidgetConfig[] {
    return this.settings.dashboard.widgets.registry.filter((w: WidgetConfig) => w.visible);
  }

  updateWidgetPosition(widgetId: string, position: WidgetPosition): void {
    const widget = this.settings.dashboard.widgets.registry.find((w: WidgetConfig) => w.id === widgetId);
    if (widget) {
      widget.position = position;
    }
  }

  toggleWidgetVisibility(widgetId: string): void {
    const widget = this.settings.dashboard.widgets.registry.find((w: WidgetConfig) => w.id === widgetId);
    if (widget) {
      widget.visible = !widget.visible;
    }
  }

  setLayoutLocked(locked: boolean): void {
    this.settings.dashboard.layout.locked = locked;
  }

  setRefreshInterval(interval: number): void {
    this.settings.dashboard.refresh.globalRefreshInterval = interval;
  }

  isAutoRefreshEnabled(): boolean {
    return this.settings.dashboard.refresh.autoRefreshEnabled;
  }

  getRefreshInterval(): number {
    return this.settings.dashboard.refresh.globalRefreshInterval;
  }
}

// Singleton instance
let settingsManager: SimpleSettingsManager | null = null;

export function getSimpleSettingsManager(): SimpleSettingsManager {
  if (!settingsManager) {
    settingsManager = new SimpleSettingsManager();
  }
  return settingsManager;
}

export function initializeSimpleSettingsManager(manager: SimpleSettingsManager): void {
  settingsManager = manager;
}