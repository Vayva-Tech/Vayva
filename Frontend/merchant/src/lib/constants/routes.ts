/**
 * Route Constants
 * 
 * Centralized route paths, names, and permission mappings
 */

export type RoutePermission = 'public' | 'authenticated' | 'admin' | 'pro' | 'pro_plus';

export interface RouteDefinition {
  path: string;
  name: string;
  permission: RoutePermission;
  icon?: string;
  category?: string;
  exact?: boolean;
}

/**
 * Public routes (no authentication required)
 */
export const PUBLIC_ROUTES: RouteDefinition[] = [
  { path: '/', name: 'Home', permission: 'public' },
  { path: '/pricing', name: 'Pricing', permission: 'public' },
  { path: '/features', name: 'Features', permission: 'public' },
  { path: '/templates', name: 'Templates', permission: 'public' },
  { path: '/marketplace', name: 'Marketplace', permission: 'public' },
];

/**
 * Auth routes
 */
export const AUTH_ROUTES: RouteDefinition[] = [
  { path: '/signin', name: 'Sign In', permission: 'public' },
  { path: '/signup', name: 'Sign Up', permission: 'public' },
  { path: '/verify', name: 'Verify OTP', permission: 'public' },
  { path: '/forgot-password', name: 'Forgot Password', permission: 'public' },
  { path: '/reset-password', name: 'Reset Password', permission: 'public' },
];

/**
 * Dashboard routes (authenticated)
 */
export const DASHBOARD_ROUTES: RouteDefinition[] = [
  // Main
  { path: '/dashboard', name: 'Dashboard', permission: 'authenticated', icon: 'dashboard', exact: true },
  { path: '/dashboard/overview', name: 'Overview', permission: 'authenticated', icon: 'trending_up' },
  
  // Products
  { path: '/dashboard/products', name: 'Products', permission: 'authenticated', icon: 'inventory', category: 'products' },
  { path: '/dashboard/products/add', name: 'Add Product', permission: 'authenticated', icon: 'add_circle' },
  { path: '/dashboard/products/categories', name: 'Categories', permission: 'authenticated', icon: 'category' },
  
  // Orders
  { path: '/dashboard/orders', name: 'Orders', permission: 'authenticated', icon: 'shopping_cart', category: 'orders' },
  { path: '/dashboard/orders/new', name: 'New Order', permission: 'authenticated', icon: 'add_shopping_cart' },
  { path: '/dashboard/orders/returns', name: 'Returns', permission: 'authenticated', icon: 'reply' },
  
  // Customers
  { path: '/dashboard/customers', name: 'Customers', permission: 'authenticated', icon: 'people', category: 'customers' },
  { path: '/dashboard/customers/segments', name: 'Segments', permission: 'authenticated', icon: 'groups' },
  
  // Analytics
  { path: '/dashboard/analytics', name: 'Analytics', permission: 'authenticated', icon: 'analytics', category: 'analytics' },
  { path: '/dashboard/analytics/reports', name: 'Reports', permission: 'authenticated', icon: 'assessment' },
  { path: '/dashboard/analytics/insights', name: 'Insights', permission: 'pro', icon: 'psychology' },
  
  // Marketing
  { path: '/dashboard/marketing', name: 'Marketing', permission: 'authenticated', icon: 'campaign', category: 'marketing' },
  { path: '/dashboard/marketing/campaigns', name: 'Campaigns', permission: 'pro', icon: 'email' },
  { path: '/dashboard/marketing/automation', name: 'Automation', permission: 'pro_plus', icon: 'auto_awesome' },
  
  // Inventory
  { path: '/dashboard/inventory', name: 'Inventory', permission: 'authenticated', icon: 'warehouse', category: 'inventory' },
  { path: '/dashboard/inventory/stock', name: 'Stock Levels', permission: 'authenticated', icon: 'stacked_line_chart' },
  { path: '/dashboard/inventory/alerts', name: 'Alerts', permission: 'authenticated', icon: 'notifications' },
  
  // Settings
  { path: '/dashboard/settings', name: 'Settings', permission: 'authenticated', icon: 'settings', category: 'settings' },
  { path: '/dashboard/settings/profile', name: 'Profile', permission: 'authenticated', icon: 'person' },
  { path: '/dashboard/settings/business', name: 'Business', permission: 'authenticated', icon: 'business' },
  { path: '/dashboard/settings/payment', name: 'Payment', permission: 'authenticated', icon: 'payment' },
  { path: '/dashboard/settings/shipping', name: 'Shipping', permission: 'authenticated', icon: 'local_shipping' },
  { path: '/dashboard/settings/team', name: 'Team', permission: 'authenticated', icon: 'group_add' },
  
  // Industry-specific
  { path: '/dashboard/kitchen', name: 'Kitchen', permission: 'authenticated', icon: 'restaurant', category: 'industry' },
  { path: '/dashboard/appointments', name: 'Appointments', permission: 'authenticated', icon: 'event', category: 'industry' },
  { path: '/dashboard/listings', name: 'Listings', permission: 'authenticated', icon: 'home', category: 'industry' },
  { path: '/dashboard/subscriptions', name: 'Subscriptions', permission: 'authenticated', icon: 'repeat', category: 'industry' },
  
  // Control Center
  { path: '/dashboard/control-center', name: 'Control Center', permission: 'authenticated', icon: 'dashboard_customize' },
];

/**
 * Admin routes (super admin only)
 */
export const ADMIN_ROUTES: RouteDefinition[] = [
  { path: '/admin', name: 'Admin', permission: 'admin', icon: 'admin_panel_settings' },
  { path: '/admin/users', name: 'Users', permission: 'admin', icon: 'people_outline' },
  { path: '/admin/merchants', name: 'Merchants', permission: 'admin', icon: 'business' },
  { path: '/admin/system', name: 'System', permission: 'admin', icon: 'dns' },
];

/**
 * All routes combined
 */
export const ALL_ROUTES: RouteDefinition[] = [
  ...PUBLIC_ROUTES,
  ...AUTH_ROUTES,
  ...DASHBOARD_ROUTES,
  ...ADMIN_ROUTES,
];

/**
 * Get route by path
 */
export function getRouteByPath(path: string): RouteDefinition | null {
  return ALL_ROUTES.find(route => {
    if (route.exact) {
      return path === route.path;
    }
    return path.startsWith(route.path);
  }) || null;
}

/**
 * Check if user has access to route
 */
export function hasRouteAccess(
  route: RouteDefinition,
  context: {
    isAuthenticated: boolean;
    plan?: 'starter' | 'pro' | 'pro_plus';
    isAdmin?: boolean;
  }
): boolean {
  switch (route.permission) {
    case 'public':
      return true;
    case 'authenticated':
      return context.isAuthenticated;
    case 'pro':
      return context.isAuthenticated && (context.plan === 'pro' || context.plan === 'pro_plus');
    case 'pro_plus':
      return context.isAuthenticated && context.plan === 'pro_plus';
    case 'admin':
      return context.isAuthenticated && context.isAdmin === true;
    default:
      return false;
  }
}

/**
 * Get routes by category
 */
export function getRoutesByCategory(category: string): RouteDefinition[] {
  return DASHBOARD_ROUTES.filter(route => route.category === category);
}

/**
 * Get navigation structure
 */
export function getNavigationStructure(context: {
  isAuthenticated: boolean;
  plan?: 'starter' | 'pro' | 'pro_plus';
  isAdmin?: boolean;
}): Record<string, RouteDefinition[]> {
  const categories = new Set(DASHBOARD_ROUTES.map(r => r.category).filter(Boolean));
  const result: Record<string, RouteDefinition[]> = {};
  
  categories.forEach(category => {
    if (category) {
      result[category] = getRoutesByCategory(category).filter(route =>
        hasRouteAccess(route, context)
      );
    }
  });
  
  return result;
}
