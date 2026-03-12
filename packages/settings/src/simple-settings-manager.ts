/**
 * Simple Settings Manager for Dashboard Integration
 * Minimal implementation focusing on dashboard settings
 */

import type { DashboardSettings, WidgetConfig } from './schemas/dashboard-settings.schema.js';

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
          globalRefreshInterval: 300,
          realTimeUpdates: false,
          websocketEnabled: false,
          performanceMode: false,
          performanceModeInterval: 900,
          backgroundRefresh: true,
          prefetchEnabled: true,
          enableCaching: true,
          cacheExpirationSeconds: 300,
          batterySaverMode: false,
          batterySaverThreshold: 20,
          reduceRefreshOnSlowNetwork: true,
          slowNetworkThresholdMbps: 1
        },
        behavior: {
          sidebar: {
            collapsedByDefault: false,
            pinned: false,
            width: 280,
            iconsOnly: false
          },
          header: {
            showBreadcrumbs: true,
            showSearch: true,
            showNotifications: true,
            showUserMenu: true,
            sticky: true
          },
          grid: {
            columns: 12,
            rowHeight: 100,
            margin: 16,
            useCssGrid: true,
            resizableWidgets: true,
            draggableWidgets: true,
            preventCollision: true
          },
          animations: {
            enabled: true,
            reducedMotion: false,
            transitionDuration: 300
          }
        },
        dateRanges: {
          defaultRange: 'last-7-days',
          compareWithPreviousPeriod: true,
          compareWithSamePeriodLastYear: false,
          fiscalYearStartMonth: 0,
          useFiscalYear: false,
          useBusinessTimezone: true
        },
        user: {
          allowCustomization: true,
          saveLayoutPerUser: true,
          resetLayoutOnLogout: false
        },
        mobile: {
          separateMobileLayout: true,
          collapsibleSections: true
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
    return this.settings.dashboard.widgets.registry.filter(w => w.visible);
  }

  updateWidgetPosition(widgetId: string, position: { x: number; y: number; w: number; h: number }): void {
    const widget = this.settings.dashboard.widgets.registry.find(w => w.id === widgetId);
    if (widget) {
      widget.position = position;
    }
  }

  toggleWidgetVisibility(widgetId: string): void {
    const widget = this.settings.dashboard.widgets.registry.find(w => w.id === widgetId);
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