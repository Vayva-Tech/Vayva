export interface WidgetConfig {
  id: string;
  type: 'metric' | 'chart' | 'table' | 'alert' | 'form' | 'calendar' | 'kanban' | 'map' | 'feed' | 'custom';
  title: string;
  description?: string;
  width: number;
  height: number;
  permissions?: string[];
  dataSource: {
    type: 'entity' | 'service' | 'api' | 'analytics' | 'custom';
    entity?: string;
    service?: string;
    query?: Record<string, unknown>;
    refreshInterval?: number;
  };
  visualization?: {
    type: string;
    trend?: boolean;
    comparisonPeriod?: string;
  };
  columns?: Array<{ key: string; label: string; format?: string }>;
  conditions?: Array<{
    field: string;
    operator: string;
    value: string | number;
    severity: 'critical' | 'warning' | 'info';
  }>;
  chartType?: string;
}

// Active Subscriptions Widget
export const ACTIVE_SUBSCRIPTIONS_WIDGET: WidgetConfig = {
  id: 'active-subscriptions',
  type: 'metric',
  title: 'Active Subscriptions',
  width: 3,
  height: 2,
  dataSource: {
    type: 'entity',
    entity: 'subscriptions',
    query: {
      where: { status: 'active' },
      count: true
    }
  },
  visualization: {
    type: 'number',
    trend: true,
    comparisonPeriod: 'last_month'
  }
};

// Revenue Churn Widget
export const REVENUE_CHURN_WIDGET: WidgetConfig = {
  id: 'revenue-churn',
  type: 'metric',
  title: 'Monthly Revenue Churn',
  width: 3,
  height: 2,
  dataSource: {
    type: 'analytics',
    query: { metric: 'monthly_revenue_churn' }
  },
  visualization: {
    type: 'percentage',
    trend: true
  }
};

// Subscription Plans Widget
export const SUBSCRIPTION_PLANS_WIDGET: WidgetConfig = {
  id: 'subscription-plans',
  type: 'chart',
  title: 'Subscriptions by Plan',
  chartType: 'pie',
  width: 4,
  height: 3,
  dataSource: {
    type: 'analytics',
    query: { metric: 'subscriptions_by_plan' }
  }
};

// Upcoming Renewals Widget
export const UPCOMING_RENEWALS_WIDGET: WidgetConfig = {
  id: 'upcoming-renewals',
  type: 'table',
  title: 'Upcoming Renewals',
  width: 5,
  height: 4,
  dataSource: {
    type: 'entity',
    entity: 'subscriptions',
    query: {
      where: { 
        status: 'active',
        nextBillingDate: {
          gte: new Date(),
          lte: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000) // Next 7 days
        }
      },
      orderBy: { nextBillingDate: 'asc' }
    }
  },
  columns: [
    { key: 'customer.name', label: 'Customer' },
    { key: 'plan.name', label: 'Plan' },
    { key: 'nextBillingDate', label: 'Renewal Date', format: 'date' },
    { key: 'amount', label: 'Amount', format: 'currency' }
  ]
};

// Trial Conversions Widget
export const TRIAL_CONVERSIONS_WIDGET: WidgetConfig = {
  id: 'trial-conversions',
  type: 'chart',
  title: 'Trial to Paid Conversion',
  chartType: 'line',
  width: 4,
  height: 3,
  dataSource: {
    type: 'analytics',
    query: { metric: 'trial_conversion_rate' }
  }
};

// Cancellation Reasons Widget
export const CANCELLATION_REASONS_WIDGET: WidgetConfig = {
  id: 'cancellation-reasons',
  type: 'chart',
  title: 'Top Cancellation Reasons',
  chartType: 'bar',
  width: 4,
  height: 3,
  dataSource: {
    type: 'analytics',
    query: { metric: 'cancellation_reasons' }
  }
};

export const SUBSCRIPTION_WIDGETS = {
  'active-subscriptions': ACTIVE_SUBSCRIPTIONS_WIDGET,
  'revenue-churn': REVENUE_CHURN_WIDGET,
  'subscription-plans': SUBSCRIPTION_PLANS_WIDGET,
  'upcoming-renewals': UPCOMING_RENEWALS_WIDGET,
  'trial-conversions': TRIAL_CONVERSIONS_WIDGET,
  'cancellation-reasons': CANCELLATION_REASONS_WIDGET
};