/**
 * Enhanced Dashboard Routing Configuration
 * Centralized routing for all pro dashboard experiences
 */

import { IndustrySlug } from '@/lib/templates/types';

export interface DashboardRoute {
  id: string;
  path: string;
  title: string;
  description: string;
  icon: string;
  category: 'business' | 'marketing' | 'analytics' | 'settings';
  requiresPro?: boolean;
  industrySpecific?: boolean;
  availableIndustries?: IndustrySlug[];
}

export const DASHBOARD_ROUTES: DashboardRoute[] = [
  // Business Operations
  {
    id: 'overview',
    path: '/dashboard',
    title: 'Business Overview',
    description: 'Main dashboard with key business metrics',
    icon: 'LayoutDashboard',
    category: 'business',
    industrySpecific: true
  },
  {
    id: 'control-center',
    path: '/dashboard/control-center',
    title: 'Control Center',
    description: 'Manage all business operations and settings',
    icon: 'Wrench',
    category: 'business'
  },
  {
    id: 'control-center-pro',
    path: '/dashboard/control-center/pro',
    title: 'Control Center Pro',
    description: 'Advanced control center with AI insights',
    icon: 'Wrench',
    category: 'business',
    requiresPro: true
  },
  {
    id: 'products',
    path: '/dashboard/products',
    title: 'Product Management',
    description: 'Manage your product catalog and inventory',
    icon: 'Package',
    category: 'business',
    industrySpecific: true
  },
  {
    id: 'orders',
    path: '/dashboard/orders',
    title: 'Order Management',
    description: 'Process orders and manage fulfillment',
    icon: 'ShoppingCart',
    category: 'business'
  },
  {
    id: 'customers',
    path: '/dashboard/customers',
    title: 'Customer Management',
    description: 'Manage customer relationships and data',
    icon: 'Users',
    category: 'business'
  },

  // Marketing & Growth
  {
    id: 'marketing-hub',
    path: '/dashboard/marketing',
    title: 'Marketing Hub',
    description: 'Campaign management and marketing tools',
    icon: 'Megaphone',
    category: 'marketing'
  },
  {
    id: 'marketing-pro',
    path: '/dashboard/marketing/pro',
    title: 'Marketing Pro',
    description: 'Advanced marketing with automation and AI',
    icon: 'Megaphone',
    category: 'marketing',
    requiresPro: true
  },
  {
    id: 'marketing-automation',
    path: '/dashboard/marketing/automation',
    title: 'Marketing Automation',
    description: 'Automated workflows and campaigns',
    icon: 'Zap',
    category: 'marketing'
  },
  {
    id: 'campaigns',
    path: '/dashboard/marketing/campaigns',
    title: 'Campaign Manager',
    description: 'Create and manage marketing campaigns',
    icon: 'Megaphone',
    category: 'marketing'
  },
  {
    id: 'ab-testing',
    path: '/dashboard/ab-testing',
    title: 'A/B Testing',
    description: 'Run experiments and optimize performance',
    icon: 'Flask',
    category: 'marketing'
  },

  // Analytics & Insights
  {
    id: 'analytics',
    path: '/dashboard/analytics',
    title: 'Business Analytics',
    description: 'Detailed performance metrics and insights',
    icon: 'ChartLine',
    category: 'analytics'
  },
  {
    id: 'ai-insights',
    path: '/dashboard/ai-insights',
    title: 'AI Insights',
    description: 'AI-powered business recommendations',
    icon: 'Sparkles',
    category: 'analytics',
    requiresPro: true
  },
  {
    id: 'reports',
    path: '/dashboard/reports',
    title: 'Reports & Export',
    description: 'Generate reports and export data',
    icon: 'FileText',
    category: 'analytics'
  },
  {
    id: 'predictive-analytics',
    path: '/dashboard/predictive-analytics',
    title: 'Predictive Analytics',
    description: 'Forecast trends and future performance',
    icon: 'TrendingUp',
    category: 'analytics',
    requiresPro: true
  },

  // Settings & Configuration
  {
    id: 'settings-profile',
    path: '/dashboard/settings/profile',
    title: 'Profile Settings',
    description: 'Manage your account and profile',
    icon: 'User',
    category: 'settings'
  },
  {
    id: 'store-settings',
    path: '/dashboard/settings/store',
    title: 'Store Settings',
    description: 'Configure your store preferences',
    icon: 'Store',
    category: 'settings'
  },
  {
    id: 'integrations',
    path: '/dashboard/settings/integrations',
    title: 'Integrations',
    description: 'Connect third-party services',
    icon: 'Plug',
    category: 'settings'
  },
  {
    id: 'billing',
    path: '/dashboard/billing',
    title: 'Billing & Subscription',
    description: 'Manage your subscription and billing',
    icon: 'CreditCard',
    category: 'settings'
  },
  {
    id: "ai-usage",
    path: "/dashboard/ai-usage",
    title: "AI Usage & Top-ups",
    description: "View AI message balance and buy top-up packs",
    icon: "Zap",
    category: "settings",
  },
  
  // Meal Kit Management
  {
    id: 'meal-kit',
    path: '/dashboard/meal-kit',
    title: 'Meal Kit Manager',
    description: 'Manage subscriptions, menus, and deliveries',
    icon: 'Utensils',
    category: 'business',
    industrySpecific: true,
    availableIndustries: ["food", "meal-kit"],
  },
  {
    id: "desktop-app",
    path: "/beta/desktop-app",
    title: "Native apps (beta)",
    description: "Waitlist for desktop and mobile merchant apps",
    icon: "Monitor",
    category: "settings",
  },
];

// Industry-specific route adaptations
export const INDUSTRY_ROUTE_ADAPTATIONS: Partial<
  Record<IndustrySlug, Partial<Record<string, string>>>
> = {
  retail: {
    'products': 'Products',
    'orders': 'Orders'
  },
  legal: {
    'products': 'Cases',
    'orders': 'Matters'
  },
  healthcare: {
    'products': 'Services',
    'orders': 'Appointments'
  },
  education: {
    'products': 'Courses',
    'orders': 'Enrollments'
  },
  real_estate: {
    'products': 'Properties',
    'orders': 'Transactions'
  },
  automotive: {
    'products': 'Vehicles',
    'orders': 'Sales'
  },
  food: {
    'products': 'Meal Plans',
    'orders': 'Subscriptions',
    'meal-kit': 'Meal Kit Manager',
  },
  "meal-kit": {
    products: "Meal plans",
    orders: "Subscriptions",
    "meal-kit": "Meal Kit Manager",
  },
  beauty: {
    'products': 'Services',
    'orders': 'Bookings'
  },
  events: {
    'products': 'Events',
    'orders': 'Registrations'
  },
};

// Get adapted route titles for specific industries
export function getAdaptedRouteTitle(routeId: string, industry: IndustrySlug): string {
  const adaptations = INDUSTRY_ROUTE_ADAPTATIONS[industry] || {};
  const route = DASHBOARD_ROUTES.find(r => r.id === routeId);
  
  if (!route) return routeId;
  
  return adaptations[routeId] || route.title;
}

// Get available routes for a specific industry and user tier
export function getAvailableRoutes(industry: IndustrySlug, isProUser: boolean = false): DashboardRoute[] {
  return DASHBOARD_ROUTES.filter(route => {
    // Filter by pro requirement
    if (route.requiresPro && !isProUser) {
      return false;
    }
    
    // Filter by industry availability if specified
    if (route.availableIndustries && !route.availableIndustries.includes(industry)) {
      return false;
    }
    
    return true;
  });
}

// Get routes by category
export function getRoutesByCategory(industry: IndustrySlug, isProUser: boolean = false): Record<string, DashboardRoute[]> {
  const availableRoutes = getAvailableRoutes(industry, isProUser);
  
  return {
    business: availableRoutes.filter(r => r.category === 'business'),
    marketing: availableRoutes.filter(r => r.category === 'marketing'),
    analytics: availableRoutes.filter(r => r.category === 'analytics'),
    settings: availableRoutes.filter(r => r.category === 'settings')
  };
}

// Navigation helpers
export const NAVIGATION_CATEGORIES = [
  { id: 'business', label: 'Business Operations', icon: 'Building' },
  { id: 'marketing', label: 'Marketing & Growth', icon: 'Megaphone' },
  { id: 'analytics', label: 'Analytics & Insights', icon: 'ChartLine' },
  { id: 'settings', label: 'Settings', icon: 'Settings' }
];