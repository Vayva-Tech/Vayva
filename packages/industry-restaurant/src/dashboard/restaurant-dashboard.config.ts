/**
 * Restaurant Industry Dashboard Configuration
 * Implements the dashboard specification from VAYVA V2 Master Plan
 */

import type { DashboardEngineConfig } from '@vayva/industry-core';

export const RESTAURANT_DASHBOARD_CONFIG: DashboardEngineConfig = {
  industry: 'restaurant',

  widgets: [
    // Kitchen Display System (KDS) Preview
    {
      id: 'kds-preview',
      type: 'custom',
      title: 'Live Kitchen Queue',
      industry: 'restaurant',
      component: 'KDSWidget',
      refreshInterval: 5000, // 5 seconds
      dataSource: {
        type: 'realtime',
        channel: 'kitchen-orders',
      },
    },

    // Table Map
    {
      id: 'table-map',
      type: 'custom',
      title: 'Floor Plan',
      industry: 'restaurant',
      component: 'TableMapWidget',
      dataSource: {
        type: 'realtime',
        channel: 'table-status',
      },
    },

    // Course Timing
    {
      id: 'course-timing',
      type: 'timeline',
      title: 'Course Timing',
      industry: 'restaurant',
      dataSource: {
        type: 'realtime',
        channel: 'course-progress',
      },
    },

    // 86 List (Sold Out Items)
    {
      id: 'eighty-six-list',
      type: 'list',
      title: '86 List',
      industry: 'restaurant',
      dataSource: {
        type: 'entity',
        entity: 'menu-item',
        filter: { status: 'sold_out' },
      },
    },

    // Recipe Costing
    {
      id: 'recipe-costs',
      type: 'table',
      title: 'Live Recipe Margins',
      industry: 'restaurant',
      dataSource: {
        type: 'analytics',
        query: 'recipe-margin-analysis',
      },
    },

    // Table Turn Rate
    {
      id: 'table-turns',
      type: 'gauge',
      title: 'Avg Table Turn (min)',
      industry: 'restaurant',
      dataSource: {
        type: 'analytics',
        query: 'avg-table-turn-time',
      },
    },

    // Waitlist
    {
      id: 'waitlist',
      type: 'list',
      title: 'Waitlist',
      industry: 'restaurant',
      dataSource: {
        type: 'entity',
        entity: 'waitlist-entry',
        filter: { status: 'waiting' },
      },
    },

    // Phase 4: Labor Optimization Widgets
    {
      id: 'labor-cost-gauge',
      type: 'gauge',
      title: 'Labor Cost %',
      industry: 'restaurant',
      dataSource: {
        type: 'analytics',
        query: 'current-labor-cost-percent',
      },
      refreshInterval: 300000, // 5 minutes
    },
    {
      id: 'staff-on-shift',
      type: 'list',
      title: 'Currently On Shift',
      industry: 'restaurant',
      dataSource: {
        type: 'realtime',
        channel: 'staff-clock-in',
      },
      refreshInterval: 60000, // 1 minute
    },
    {
      id: 'shift-swap-board',
      type: 'kanban',
      title: 'Shift Swaps',
      industry: 'restaurant',
      component: 'ShiftSwapWidget',
      dataSource: {
        type: 'entity',
        entity: 'shift-swap-request',
        filter: { status: 'pending' },
        sort: { field: 'requestedAt', direction: 'asc' },
      },
    },
    {
      id: 'labor-forecast-chart',
      type: 'chart-line',
      title: '7-Day Labor Forecast',
      industry: 'restaurant',
      dataSource: {
        type: 'analytics',
        query: 'labor-demand-forecast',
      },
      refreshInterval: 3600000, // 1 hour
    },
    {
      id: 'schedule-optimizer',
      type: 'custom',
      title: 'Schedule Optimizer',
      industry: 'restaurant',
      component: 'ScheduleOptimizerWidget',
      dataSource: {
        type: 'analytics',
        query: 'schedule-optimization-suggestions',
      },
    },
    {
      id: 'late-clock-ins',
      type: 'table',
      title: 'Late Arrivals Today',
      industry: 'restaurant',
      dataSource: {
        type: 'entity',
        entity: 'time-clock-entry',
        filter: { 
          event: 'clock_in',
          isLate: true,
          date: 'today'
        },
      },
    },

    // Kitchen Performance Chart
    {
      id: 'kitchen-performance',
      type: 'chart-line',
      title: 'Kitchen Performance',
      industry: 'restaurant',
      dataSource: {
        type: 'analytics',
        query: 'kitchen-performance-by-hour',
      },
    },

    // Menu Engineering Matrix
    {
      id: 'menu-engineering',
      type: 'custom',
      title: 'Menu Engineering Matrix',
      industry: 'restaurant',
      component: 'MenuEngineeringWidget',
      dataSource: {
        type: 'analytics',
        query: 'menu-engineering-data',
      },
    },

    // Active Reservations
    {
      id: 'active-reservations',
      type: 'table',
      title: 'Active Tables',
      industry: 'restaurant',
      dataSource: {
        type: 'entity',
        entity: 'table-reservation',
        filter: { status: ['seated', 'ordered', 'eating', 'dessert'] },
      },
    },

    // Ingredient Price Alerts
    {
      id: 'ingredient-alerts',
      type: 'list',
      title: 'Price Alerts',
      industry: 'restaurant',
      dataSource: {
        type: 'analytics',
        query: 'ingredient-price-alerts',
      },
    },
  ],

  kpiCards: [
    {
      id: 'avg-prep-time',
      label: 'Avg Prep Time',
      format: 'duration',
    },
    {
      id: 'orders-in-queue',
      label: 'Orders in Queue',
      format: 'number',
    },
    {
      id: 'table-turn-rate',
      label: 'Table Turns/Hour',
      format: 'number',
    },
    {
      id: 'food-cost-percentage',
      label: 'Food Cost %',
      format: 'percent',
    },
    {
      id: 'active-86s',
      label: 'Active 86s',
      format: 'number',
    },
    {
      id: 'waitlist-count',
      label: 'Waitlist',
      format: 'number',
    },
    {
      id: 'avg-party-size',
      label: 'Avg Party Size',
      format: 'number',
    },
    {
      id: 'kitchen-backlog',
      label: 'Kitchen Backlog',
      format: 'number',
    },
    // Phase 4: Labor KPIs
    {
      id: 'labor-cost-percent',
      label: 'Labor Cost %',
      format: 'percent',
      alertThreshold: 35,
    },
    {
      id: 'staff-on-shift-count',
      label: 'Staff On Shift',
      format: 'number',
    },
    {
      id: 'pending-swaps',
      label: 'Pending Swaps',
      format: 'number',
    },
    {
      id: 'late-arrivals-today',
      label: 'Late Arrivals',
      format: 'number',
      invert: true,
    },
  ],

  alertRules: [
    {
      id: 'kitchen-backlog',
      name: 'Kitchen Backlog Alert',
      condition: { metric: 'orders-in-queue', operator: 'gt', value: 10 },
      severity: 'critical',
      message: 'Kitchen backlog detected - {value} orders waiting',
    },
    {
      id: 'prep-time-spike',
      name: 'Prep Time Spike Alert',
      condition: { metric: 'avg-prep-time', operator: 'gt', value: 20 },
      severity: 'warning',
      message: 'Prep time exceeding 20 minutes',
    },
    {
      id: 'high-food-cost',
      name: 'High Food Cost Alert',
      condition: { metric: 'food-cost-percentage', operator: 'gt', value: 35 },
      severity: 'warning',
      message: 'Food cost percentage above target: {value}%',
    },
    {
      id: 'long-table-turn',
      name: 'Long Table Turn Alert',
      condition: { metric: 'avg-table-turn', operator: 'gt', value: 90 },
      severity: 'warning',
      message: 'Table turn time exceeding 90 minutes',
    },
    {
      id: 'waitlist-long',
      name: 'Long Waitlist Alert',
      condition: { metric: 'waitlist-count', operator: 'gt', value: 5 },
      severity: 'info',
      message: '{value} parties waiting',
    },
    {
      id: 'overdue-orders',
      name: 'Overdue Orders Alert',
      condition: { metric: 'overdue-orders', operator: 'gt', value: 3 },
      severity: 'critical',
      message: '{value} orders overdue',
    },
    {
      id: 'low-margin-items',
      name: 'Low Margin Items Alert',
      condition: { metric: 'low-margin-count', operator: 'gt', value: 5 },
      severity: 'warning',
      message: '{value} items with negative margin',
    },
  ],

  actions: [
    {
      id: '86-item',
      label: '86 Item',
      icon: 'CircleOff',
      href: '/menu/86',
    },
    {
      id: 'fire-course',
      label: 'Fire Course',
      icon: 'Flame',
      href: '/kitchen/fire',
    },
    {
      id: 'split-check',
      label: 'Split Check',
      icon: 'Split',
      href: '/pos/split',
    },
    {
      id: 'add-to-waitlist',
      label: 'Add to Waitlist',
      icon: 'Users',
      href: '/waitlist/add',
    },
    {
      id: 'seat-table',
      label: 'Seat Table',
      icon: 'Chair',
      href: '/tables/seat',
    },
    {
      id: 'view-kds',
      label: 'View KDS',
      icon: 'Monitor',
      href: '/kitchen/display',
    },
    {
      id: 'recipe-costs',
      label: 'Recipe Costs',
      icon: 'Calculator',
      href: '/menu/recipes',
    },
    {
      id: 'menu-engineering',
      label: 'Menu Engineering',
      icon: 'ChartPie',
      href: '/menu/engineering',
    },
  ],
};

/**
 * KDS-specific widget configuration
 */
export const KDS_WIDGET_CONFIG = {
  displayModes: ['queue', 'course', 'station'] as const,
  refreshInterval: 5000,
  soundAlerts: {
    newOrder: true,
    rushOrder: true,
    allergyAlert: true,
    overdueOrder: true,
  },
  colorCoding: {
    rush: '#ef4444', // red-500
    normal: '#3b82f6', // blue-500
    future: '#6b7280', // gray-500
    overdue: '#dc2626', // red-600
    ready: '#22c55e', // green-500
  },
  columns: {
    queue: ['orderNumber', 'items', 'course', 'time', 'actions'],
    course: ['course', 'orders', 'progress'],
    station: ['station', 'orders', 'status'],
  },
};

/**
 * Table map widget configuration
 */
export const TABLE_MAP_CONFIG = {
  showStatusColors: true,
  showServerAssignments: true,
  showReservationInfo: true,
  showTurnPredictions: true,
  statusColors: {
    available: '#22c55e', // green-500
    seated: '#3b82f6', // blue-500
    ordered: '#f59e0b', // amber-500
    eating: '#8b5cf6', // violet-500
    dessert: '#ec4899', // pink-500
    check_dropped: '#f97316', // orange-500
    paid: '#ef4444', // red-500
    cleaning: '#6b7280', // gray-500
    reserved: '#6366f1', // indigo-500
  },
};

/**
 * Menu engineering widget configuration
 */
export const MENU_ENGINEERING_CONFIG = {
  popularityThreshold: 50, // median
  profitabilityThreshold: 50, // median
  classificationColors: {
    star: '#22c55e', // green - high profit, high popularity
    puzzle: '#3b82f6', // blue - high profit, low popularity
    plowhorse: '#f59e0b', // amber - low profit, high popularity
    dog: '#6b7280', // gray - low profit, low popularity
  },
};

/**
 * Get dashboard configuration with optional overrides
 */
export function getRestaurantDashboardConfig(
  overrides?: Partial<DashboardEngineConfig>
): DashboardEngineConfig {
  return {
    ...RESTAURANT_DASHBOARD_CONFIG,
    ...overrides,
    widgets: overrides?.widgets || RESTAURANT_DASHBOARD_CONFIG.widgets,
    kpiCards: overrides?.kpiCards || RESTAURANT_DASHBOARD_CONFIG.kpiCards,
    alertRules: overrides?.alertRules || RESTAURANT_DASHBOARD_CONFIG.alertRules,
    actions: overrides?.actions || RESTAURANT_DASHBOARD_CONFIG.actions,
  };
}
