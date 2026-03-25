// ============================================================================
// INDUSTRY DASHBOARD CONFIGURATION SYSTEM
// ============================================================================
// Maps industries to their dashboard configurations and KPI mappings
// ============================================================================

import type { IndustrySlug } from '@/lib/templates/types';
import type { 
  UniversalDashboardConfig, 
  DashboardVariant, 
  DashboardMetric,
  DashboardSection,
  PlanTierConfig
} from './dashboard-universal-types';
import { PLAN_TIER_FEATURES } from './dashboard-universal-types';
import { getIndustryDashboardDefinition } from './industry-dashboard-definitions';
import { getDesignCategoryForIndustry, getDefaultPresetForCategory } from './industry-design-categories';

// ---------------------------------------------------------------------------
// Industry KPI Mappings
// ---------------------------------------------------------------------------

const INDUSTRY_KPI_MAPPINGS: Record<string, Record<string, string>> = {
  analytics: {
    active_reports: 'active_reports',
    queries_today: 'queries_today',
    data_freshness: 'data_freshness_minutes',
    export_count: 'exports_count'
  },
  // Retail & E-commerce
  retail: {
    revenue: 'total_sales',
    orders: 'total_orders',
    customers: 'active_customers',
    avg_order_value: 'average_order_value'
  },
  fashion: {
    revenue: 'total_sales',
    orders: 'total_orders',
    customers: 'active_customers',
    conversion_rate: 'conversion_rate'
  },
  electronics: {
    revenue: 'total_sales',
    orders: 'total_orders',
    warranty_claims: 'warranty_claims',
    return_rate: 'return_rate'
  },
  beauty: {
    revenue: 'total_sales',
    appointments: 'bookings_count',
    products_sold: 'products_sold',
    customer_retention: 'customer_retention'
  },
  grocery: {
    revenue: 'total_sales',
    orders: 'total_orders',
    delivery_time: 'avg_delivery_time',
    perishable_waste: 'perishable_waste'
  },
  one_product: {
    revenue: 'total_sales',
    conversions: 'conversions',
    ad_spend: 'ad_spend',
    roas: 'roas'
  },

  // Food & Beverage
  food: {
    revenue: 'total_sales',
    orders: 'orders_count',
    avg_prep_time: 'avg_preparation_time',
    order_accuracy: 'order_accuracy'
  },
  "meal-kit": {
    revenue: 'total_subscriptions_value',
    subscriptions: 'active_subscriptions_count',
    meal_selections: 'weekly_meal_selections_rate',
    delivery_on_time: 'on_time_delivery_rate'
  },

  // Services
  services: {
    revenue: 'total_bookings_value',
    bookings: 'bookings_count',
    cancellations: 'cancellations_count',
    no_show_rate: 'no_show_rate'
  },
  real_estate: {
    revenue: 'total_commission',
    listings: 'active_listings',
    viewings: 'viewings_count',
    deals_closed: 'deals_closed'
  },
  automotive: {
    revenue: 'total_sales',
    test_drives: 'test_drives_count',
    inventory_turn: 'inventory_turnover',
    lead_conversion: 'lead_conversion_rate'
  },
  travel_hospitality: {
    revenue: 'total_bookings_value',
    occupancy: 'occupancy_rate',
    avg_daily_rate: 'average_daily_rate',
    guest_satisfaction: 'guest_satisfaction'
  },

  // B2B & Professional
  b2b: {
    revenue: 'total_sales',
    quotes: 'quotes_count',
    conversion_rate: 'quote_to_order_rate',
    accounts: 'active_accounts'
  },
  saas: {
    revenue: 'mrr',
    churn: 'churn_rate',
    arr: 'arr',
    ltv: 'customer_lifetime_value'
  },
  legal: {
    revenue: 'total_cases_value',
    cases: 'active_cases',
    billable_hours: 'billable_hours',
    client_retention: 'client_retention'
  },
  healthcare: {
    revenue: 'total_appointments_value',
    patients: 'patients_count',
    appointment_show: 'appointment_show_rate',
    patient_satisfaction: 'patient_satisfaction'
  },

  // Events & Entertainment
  events: {
    revenue: 'total_ticket_sales',
    attendees: 'attendees_count',
    ticket_sales: 'tickets_sold',
    venue_utilization: 'venue_utilization'
  },
  nightlife: {
    revenue: 'total_sales',
    cover_charges: 'cover_charges',
    bottle_service: 'bottle_service_sales',
    guest_count: 'guest_count'
  },

  // Digital & Creative
  digital: {
    revenue: 'total_sales',
    downloads: 'downloads_count',
    refund_rate: 'refund_rate',
    customer_rating: 'average_rating'
  },
  blog_media: {
    revenue: 'total_sales',
    posts: 'posts_count',
    subscribers: 'subscribers_count',
    engagement: 'engagement_rate'
  },
  creative_portfolio: {
    revenue: 'revenue_mtd',
    active_projects: 'active_projects_count',
    utilization_rate: 'utilization_rate',
    hours_billed: 'hours_billed_weekly',
    project_margin: 'avg_project_margin',
    team_workload: 'team_utilization'
  },

  // Social Impact
  nonprofit: {
    revenue: 'total_donations',
    donors: 'active_donors',
    campaigns: 'active_campaigns',
    donor_retention: 'donor_retention_rate',
    recurring_donations: 'recurring_donation_percentage',
    average_gift: 'average_gift_amount',
    major_donors: 'major_donors_count',
    grants_awarded: 'grants_awarded_total'
  },
  education: {
    revenue: 'total_enrollments_value',
    students: 'students_count',
    courses: 'courses_count',
    completion_rate: 'completion_rate'
  },

  // Marketplace & Platforms
  marketplace: {
    gmv: 'gross_merchandise_value',
    sellers: 'active_sellers',
    transactions: 'transactions_count',
    dispute_rate: 'dispute_rate'
  },
  jobs: {
    revenue: 'total_placements_value',
    placements: 'placements_count',
    candidates: 'candidates_count',
    time_to_fill: 'avg_time_to_fill'
  },
  
  // Missing industries from INDUSTRY_SLUG_MAP
  restaurant: {
    revenue: 'total_sales',
    orders: 'orders_count',
    table_turn: 'table_turnover_rate',
    avg_bill: 'average_bill_amount'
  },
  catering: {
    revenue: 'total_event_sales',
    events: 'events_count',
    client_satisfaction: 'client_satisfaction',
    repeat_business: 'repeat_client_rate'
  },
  salon: {
    revenue: 'total_service_sales',
    appointments: 'appointments_count',
    client_retention: 'client_retention',
    service_completion: 'service_completion_rate'
  },
  spa: {
    revenue: 'total_treatment_sales',
    treatments: 'treatments_count',
    guest_satisfaction: 'guest_satisfaction',
    therapist_utilization: 'therapist_utilization'
  },
  hotel: {
    revenue: 'total_room_sales',
    occupancy: 'occupancy_rate',
    room_nights: 'room_nights_sold',
    guest_satisfaction: 'guest_satisfaction'
  },
  wholesale: {
    revenue: 'total_wholesale_sales',
    bulk_orders: 'bulk_orders_count',
    supplier_performance: 'supplier_performance',
    inventory_turn: 'inventory_turnover'
  },
  fitness: {
    revenue: 'total_membership_sales',
    members: 'active_members',
    class_attendance: 'class_attendance_rate',
    member_retention: 'member_retention'
  },
  petcare: {
    revenue: 'total_bookings_value',
    appointments: 'appointments_count',
    customers: 'active_customers',
    no_show_rate: 'no_show_rate'
  },
  wellness: {
    revenue: 'total_bookings_value',
    bookings: 'bookings_count',
    cancellations: 'cancellations_count',
    customer_retention: 'client_retention'
  },
  specialized: {
    revenue: 'total_sales',
    orders: 'total_orders',
    customers: 'active_customers',
    conversion_rate: 'conversion_rate'
  },
  default: {
    revenue: 'total_sales',
    orders: 'total_orders',
    customers: 'active_customers',
    conversion_rate: 'conversion_rate',
  },
};

const INDUSTRY_SECTION_RULES: Record<
  string,
  Partial<Record<string, boolean>>
> = {
  analytics: {
    primary_object_health: true,
    live_operations: true,
    decision_kpis: true,
    bottlenecks_alerts: true,
    suggested_actions: true
  },
  retail: {
    primary_object_health: true,
    live_operations: true,
    decision_kpis: true,
    bottlenecks_alerts: true,
    suggested_actions: true
  },
  food: {
    primary_object_health: true,
    live_operations: true,
    decision_kpis: true,
    bottlenecks_alerts: true,
    suggested_actions: true
  },
  "meal-kit": {
    primary_object_health: true,
    live_operations: true,
    decision_kpis: true,
    bottlenecks_alerts: true,
    suggested_actions: true
  },
  services: {
    primary_object_health: true,
    live_operations: true,
    decision_kpis: true,
    bottlenecks_alerts: true,
    suggested_actions: true
  },
  restaurant: {
    primary_object_health: true,
    live_operations: true,
    decision_kpis: true,
    bottlenecks_alerts: true,
    suggested_actions: true
  },
  catering: {
    primary_object_health: true,
    live_operations: true,
    decision_kpis: true,
    bottlenecks_alerts: true,
    suggested_actions: true
  },
  salon: {
    primary_object_health: true,
    live_operations: true,
    decision_kpis: true,
    bottlenecks_alerts: true,
    suggested_actions: true
  },
  spa: {
    primary_object_health: true,
    live_operations: true,
    decision_kpis: true,
    bottlenecks_alerts: true,
    suggested_actions: true
  },
  real_estate: {
    primary_object_health: true,
    live_operations: true,
    decision_kpis: true,
    bottlenecks_alerts: true,
    suggested_actions: true
  },
  automotive: {
    primary_object_health: true,
    live_operations: true,
    decision_kpis: true,
    bottlenecks_alerts: true,
    suggested_actions: true
  },
  travel_hospitality: {
    primary_object_health: true,
    live_operations: true,
    decision_kpis: true,
    bottlenecks_alerts: true,
    suggested_actions: true
  },
  hotel: {
    primary_object_health: true,
    live_operations: true,
    decision_kpis: true,
    bottlenecks_alerts: true,
    suggested_actions: true
  },
  digital: {
    primary_object_health: true,
    live_operations: true,
    decision_kpis: true,
    bottlenecks_alerts: true,
    suggested_actions: true
  },
  events: {
    primary_object_health: true,
    live_operations: true,
    decision_kpis: true,
    bottlenecks_alerts: true,
    suggested_actions: true
  },
  blog_media: {
    primary_object_health: true,
    live_operations: true,
    decision_kpis: true,
    bottlenecks_alerts: true,
    suggested_actions: true
  },
  creative_portfolio: {
    primary_object_health: true,
    live_operations: true,
    decision_kpis: true,
    bottlenecks_alerts: true,
    suggested_actions: true
  },
  education: {
    primary_object_health: true,
    live_operations: true,
    decision_kpis: true,
    bottlenecks_alerts: true,
    suggested_actions: true
  },
  nonprofit: {
    primary_object_health: true,
    live_operations: true,
    decision_kpis: true,
    bottlenecks_alerts: true,
    suggested_actions: true
  },
  nightlife: {
    primary_object_health: true,
    live_operations: true,
    decision_kpis: true,
    bottlenecks_alerts: true,
    suggested_actions: true
  },
  saas: {
    primary_object_health: true,
    live_operations: true,
    decision_kpis: true,
    bottlenecks_alerts: true,
    suggested_actions: true
  },
  marketplace: {
    primary_object_health: true,
    live_operations: true,
    decision_kpis: true,
    bottlenecks_alerts: true,
    suggested_actions: true
  },
  fitness: {
    primary_object_health: true,
    live_operations: true,
    decision_kpis: true,
    bottlenecks_alerts: true,
    suggested_actions: true
  },
  healthcare: {
    primary_object_health: true,
    live_operations: true,
    decision_kpis: true,
    bottlenecks_alerts: true,
    suggested_actions: true
  },
  legal: {
    primary_object_health: true,
    live_operations: true,
    decision_kpis: true,
    bottlenecks_alerts: true,
    suggested_actions: true
  },
  jobs: {
    primary_object_health: true,
    live_operations: true,
    decision_kpis: true,
    bottlenecks_alerts: true,
    suggested_actions: true
  },
  petcare: {
    primary_object_health: true,
    live_operations: true,
    decision_kpis: true,
    bottlenecks_alerts: true,
    suggested_actions: true
  },
  wellness: {
    primary_object_health: true,
    live_operations: true,
    decision_kpis: true,
    bottlenecks_alerts: true,
    suggested_actions: true
  },
  specialized: {
    primary_object_health: true,
    live_operations: true,
    decision_kpis: true,
    bottlenecks_alerts: true,
    suggested_actions: true
  },
  fashion: {
    primary_object_health: true,
    live_operations: true,
    decision_kpis: true,
    bottlenecks_alerts: true,
    suggested_actions: true
  },
  electronics: {
    primary_object_health: true,
    live_operations: true,
    decision_kpis: true,
    bottlenecks_alerts: true,
    suggested_actions: true
  },
  beauty: {
    primary_object_health: true,
    live_operations: true,
    decision_kpis: true,
    bottlenecks_alerts: true,
    suggested_actions: true
  },
  grocery: {
    primary_object_health: true,
    live_operations: true,
    decision_kpis: true,
    bottlenecks_alerts: true,
    suggested_actions: true
  },
  one_product: {
    primary_object_health: true,
    live_operations: true,
    decision_kpis: true,
    bottlenecks_alerts: true,
    suggested_actions: true
  },
  b2b: {
    primary_object_health: true,
    live_operations: true,
    decision_kpis: true,
    bottlenecks_alerts: true,
    suggested_actions: true
  },
  wholesale: {
    primary_object_health: true,
    live_operations: true,
    decision_kpis: true,
    bottlenecks_alerts: true,
    suggested_actions: true
  },
  // Default for all other industries
  default: {
    primary_object_health: true,
    live_operations: true,
    decision_kpis: true,
    bottlenecks_alerts: true,
    suggested_actions: true
  }
};

// ---------------------------------------------------------------------------
// Configuration Generator Functions
// ---------------------------------------------------------------------------

/**
 * Generate dashboard configuration for a specific industry and plan tier
 */
export function generateDashboardConfig(
  industry: IndustrySlug,
  variant: DashboardVariant
): UniversalDashboardConfig {
  const definition = getIndustryDashboardDefinition(industry);
  const designCategory = getDesignCategoryForIndustry(industry);
  const planConfig = PLAN_TIER_FEATURES[variant];

  if (!definition) {
    throw new Error(`No dashboard definition found for industry: ${industry}`);
  }

  const kpiMapping =
    INDUSTRY_KPI_MAPPINGS[industry] ?? INDUSTRY_KPI_MAPPINGS.default;
  const metrics: DashboardMetric[] = Object.entries(kpiMapping)
    .slice(0, planConfig.features.maxMetrics)
    .map(([key]) => ({
      key,
      label: formatMetricLabel(key),
      value: 0,
      format: getMetricFormat(key),
      icon: getMetricIcon(key),
    }));

  // Generate sections based on industry definition
  const sectionRules = INDUSTRY_SECTION_RULES[industry] || INDUSTRY_SECTION_RULES.default;
  const sections: DashboardSection[] = definition.sections
    .filter(sectionId => sectionRules[sectionId] !== false)
    .slice(0, planConfig.features.maxSections)
    .map((sectionId, index) => ({
      id: sectionId,
      title: formatSectionTitle(sectionId),
      subtitle: getSectionSubtitle(sectionId, industry),
      icon: getSectionIcon(sectionId),
      visible: sectionRules[sectionId] !== false,
      order: index,
      componentType: getComponentType(sectionId)
    }));

  return {
    industry: industry as UniversalDashboardConfig['industry'],
    variant,
    designCategory,
    timeHorizon: definition.defaultTimeHorizon,
    sections,
    metrics,
    featureFlags: {
      alerts: planConfig.features.alertTypes.length > 0,
      suggestions: true,
      charts: planConfig.features.chartTypes.length > 0,
      kpiComparison: planConfig.features.advancedAnalytics,
      exportData: planConfig.features.exportFormats.length > 0
    }
  };
}

/**
 * Get plan tier configuration for an industry
 */
export function getPlanTierConfig(
  industry: IndustrySlug,
  variant: DashboardVariant
): PlanTierConfig {
  return PLAN_TIER_FEATURES[variant];
}

/**
 * Check if a feature is available for the given plan tier
 */
export function isFeatureAvailable(
  variant: DashboardVariant,
  feature: keyof PlanTierConfig['features']
): boolean {
  const config = PLAN_TIER_FEATURES[variant];
  return Boolean(config.features[feature]);
}

/**
 * Get available chart types for a plan tier
 */
export function getAvailableChartTypes(variant: DashboardVariant): string[] {
  return PLAN_TIER_FEATURES[variant].features.chartTypes;
}

/**
 * Get metric limit for a plan tier
 */
export function getMaxMetrics(variant: DashboardVariant): number {
  return PLAN_TIER_FEATURES[variant].features.maxMetrics;
}

// ---------------------------------------------------------------------------
// Helper Functions
// ---------------------------------------------------------------------------

function formatMetricLabel(key: string): string {
  const labels: Record<string, string> = {
    revenue: 'Revenue',
    orders: 'Orders',
    customers: 'Customers',
    avg_order_value: 'Avg Order Value',
    conversion_rate: 'Conversion Rate',
    appointments: 'Appointments',
    products_sold: 'Products Sold',
    customer_retention: 'Retention',
    delivery_time: 'Delivery Time',
    perishable_waste: 'Waste %',
    conversions: 'Conversions',
    ad_spend: 'Ad Spend',
    roas: 'ROAS',
    avg_prep_time: 'Avg Prep Time',
    order_accuracy: 'Accuracy',
    bookings: 'Bookings',
    cancellations: 'Cancellations',
    no_show_rate: 'No-Show Rate',
    listings: 'Listings',
    viewings: 'Viewings',
    deals_closed: 'Deals Closed',
    test_drives: 'Test Drives',
    inventory_turn: 'Inventory Turn',
    lead_conversion: 'Lead Conv',
    occupancy: 'Occupancy',
    avg_daily_rate: 'ADR',
    guest_satisfaction: 'Satisfaction',
    quotes: 'Quotes',
    accounts: 'Accounts',
    mrr: 'MRR',
    churn: 'Churn Rate',
    arr: 'ARR',
    ltv: 'LTV',
    cases: 'Cases',
    billable_hours: 'Billable Hours',
    patients: 'Patients',
    appointment_show: 'Show Rate',
    attendees: 'Attendees',
    ticket_sales: 'Tickets Sold',
    venue_utilization: 'Utilization',
    cover_charges: 'Cover Charges',
    bottle_service: 'Bottle Service',
    guest_count: 'Guest Count',
    downloads: 'Downloads',
    refund_rate: 'Refund Rate',
    customer_rating: 'Rating',
    posts: 'Posts',
    subscribers: 'Subscribers',
    engagement: 'Engagement',
    projects: 'Projects',
    inquiries: 'Inquiries',
    portfolio_views: 'Views',
    donations: 'Donations',
    donors: 'Donors',
    campaigns: 'Campaigns',
    donor_retention: 'Retention',
    students: 'Students',
    courses: 'Courses',
    completion_rate: 'Completion',
    gmv: 'GMV',
    sellers: 'Sellers',
    transactions: 'Transactions',
    dispute_rate: 'Dispute Rate',
    placements: 'Placements',
    candidates: 'Candidates',
    time_to_fill: 'Time to Fill'
  };
  
  return labels[key] || key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

function getMetricFormat(key: string): 'currency' | 'number' | 'percentage' | 'duration' {
  const formats: Record<string, 'currency' | 'number' | 'percentage' | 'duration'> = {
    revenue: 'currency',
    ad_spend: 'currency',
    avg_order_value: 'currency',
    average_daily_rate: 'currency',
    mrr: 'currency',
    arr: 'currency',
    total_sales: 'currency',
    total_commission: 'currency',
    total_donations: 'currency',
    total_bookings_value: 'currency',
    total_placements_value: 'currency',
    total_commissions: 'currency',
    total_cases_value: 'currency',
    total_appointments_value: 'currency',
    total_enrollments_value: 'currency',
    total_ticket_sales: 'currency',
    roas: 'number',
    conversion_rate: 'percentage',
    customer_retention: 'percentage',
    no_show_rate: 'percentage',
    order_accuracy: 'percentage',
    occupancy: 'percentage',
    churn: 'percentage',
    refund_rate: 'percentage',
    dispute_rate: 'percentage',
    completion_rate: 'percentage',
    donor_retention: 'percentage',
    lead_conversion: 'percentage',
    appointment_show: 'percentage',
    guest_satisfaction: 'percentage',
    customer_rating: 'number',
    engagement: 'percentage',
    avg_prep_time: 'duration',
    delivery_time: 'duration',
    billable_hours: 'number',
    time_to_fill: 'number'
  };
  
  return formats[key] || 'number';
}

function getMetricIcon(key: string): string {
  const icons: Record<string, string> = {
    revenue: 'DollarSign',
    orders: 'ShoppingBag',
    customers: 'Users',
    avg_order_value: 'TrendingUp',
    conversion_rate: 'Percent',
    appointments: 'Calendar',
    products_sold: 'Package',
    customer_retention: 'Repeat',
    delivery_time: 'Clock',
    perishable_waste: 'Trash',
    conversions: 'TrendingUp',
    ad_spend: 'CreditCard',
    roas: 'BarChart3',
    avg_prep_time: 'Timer',
    order_accuracy: 'Target',
    bookings: 'CalendarCheck',
    cancellations: 'XCircle',
    no_show_rate: 'UserX',
    listings: 'Home',
    viewings: 'Eye',
    deals_closed: 'Handshake',
    test_drives: 'Car',
    inventory_turn: 'RefreshCw',
    lead_conversion: 'ArrowRight',
    occupancy: 'Hotel',
    avg_daily_rate: 'Tag',
    guest_satisfaction: 'Smile',
    quotes: 'FileText',
    accounts: 'Building',
    mrr: 'Activity',
    churn: 'ArrowDown',
    arr: 'TrendingUp',
    ltv: 'LifeBuoy',
    cases: 'Briefcase',
    billable_hours: 'Clock',
    patients: 'User',
    appointment_show: 'CheckCircle',
    attendees: 'Users',
    ticket_sales: 'Ticket',
    venue_utilization: 'MapPin',
    cover_charges: 'DollarSign',
    bottle_service: 'Wine',
    guest_count: 'Users',
    downloads: 'Download',
    refund_rate: 'ArrowDown',
    customer_rating: 'Star',
    posts: 'FileText',
    subscribers: 'Users',
    engagement: 'Heart',
    projects: 'Folder',
    inquiries: 'MessageSquare',
    portfolio_views: 'Eye',
    donations: 'Heart',
    donors: 'Users',
    campaigns: 'Flag',
    donor_retention: 'Repeat',
    students: 'GraduationCap',
    courses: 'BookOpen',
    completion_rate: 'Award',
    gmv: 'BarChart3',
    sellers: 'Store',
    transactions: 'Receipt',
    dispute_rate: 'ShieldAlert',
    placements: 'Briefcase',
    candidates: 'UserPlus',
    time_to_fill: 'Clock'
  };
  
  return icons[key] || 'BarChart3';
}

function formatSectionTitle(sectionId: string): string {
  const titles: Record<string, string> = {
    primary_object_health: 'Primary Object Health',
    live_operations: 'Live Operations',
    decision_kpis: 'Decision KPIs',
    bottlenecks_alerts: 'Bottlenecks & Alerts',
    suggested_actions: 'Suggested Actions'
  };
  
  return titles[sectionId] || sectionId.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

function getSectionSubtitle(sectionId: string, industry: IndustrySlug): string {
  const subtitles: Record<string, Record<string, string>> = {
    primary_object_health: {
      retail: 'Track your top products and inventory status',
      food: 'Monitor menu items and kitchen inventory',
      services: 'Track service performance and availability',
      b2b: 'Monitor quotes, orders, and client relationships'
    },
    live_operations: {
      retail: 'Real-time order fulfillment and shipping status',
      food: 'Current kitchen queue and prep times',
      services: 'Today\'s bookings and cancellations',
      b2b: 'Pending quotes and order fulfillment'
    }
  };
  
  return subtitles[sectionId]?.[industry] || '';
}

function getSectionIcon(sectionId: string): string {
  const icons: Record<string, string> = {
    primary_object_health: 'HeartPulse',
    live_operations: 'Zap',
    decision_kpis: 'TrendingUp',
    bottlenecks_alerts: 'AlertTriangle',
    suggested_actions: 'Lightbulb'
  };
  
  return icons[sectionId] || 'BarChart3';
}

function getComponentType(sectionId: string): DashboardSection['componentType'] {
  const types: Record<string, DashboardSection['componentType']> = {
    primary_object_health: 'metric-grid',
    live_operations: 'metric-grid',
    decision_kpis: 'chart',
    bottlenecks_alerts: 'alert-list',
    suggested_actions: 'task-list'
  };
  
  return types[sectionId] || 'custom';
}