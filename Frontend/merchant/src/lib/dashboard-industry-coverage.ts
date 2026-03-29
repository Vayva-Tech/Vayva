 /**
 * Complete Industry Coverage for Unified Dashboard System
 * 
 * PHILOSOPHY:
 * - Build EVERYTHING once, organized cleanly
 * - Plan tiers ONLY control visibility (what users SEE)
 * - A STARTER user in restaurant sees restaurant-specific UI
 * - A PRO+ user sees MORE features, but same industry foundation
 * 
 * Example:
 * - Restaurant STARTER: Sees POS, Orders, Inventory, Customers, Control Center
 * - Restaurant PRO+: Sees ALL above + KDS, Tables, Commissions, Advanced Analytics
 * - Both are restaurant dashboards - just different feature visibility
 */

// ============================================================================
// INDUSTRY MASTER LIST - All 35+ Verticals
// ============================================================================

export const INDUSTRIES_BY_ARCHETYPE = {
  // ════════════════════════════════════════════════════════════════════════
  // COMMERCE ARCHETYPE (9 industries)
  // ════════════════════════════════════════════════════════════════════════
  commerce: [
    'retail',           // ✅ Template built
    'ecommerce',
    'wholesale',
    'grocery',          // ⏳ Priority: HIGH
    'fashion',
    'electronics',
    'home-decor',
    'sports-equipment',
    'pet-supplies',
  ] as const,

  // ════════════════════════════════════════════════════════════════════════
  // FOOD & BEVERAGE ARCHETYPE (5 industries)
  // ════════════════════════════════════════════════════════════════════════
  food_beverage: [
    'restaurant',       // ✅ Template built
    'cafe',
    'bakery',
    'food-truck',
    'meal-kit',
  ] as const,

  // ════════════════════════════════════════════════════════════════════════
  // BOOKINGS & EVENTS ARCHETYPE (10 industries)
  // ════════════════════════════════════════════════════════════════════════
  bookings_events: [
    'beauty-wellness',  // ✅ Template built (Beauty)
    'healthcare',       // ✅ Template built
    'fitness',
    'education',
    'professional-services',
    'automotive',
    'real-estate',
    'hotel-lodging',
    'event-planning',
    'photography',
  ] as const,

  // ════════════════════════════════════════════════════════════════════════
  // CONTENT & SERVICES ARCHETYPE (8 industries)
  // ════════════════════════════════════════════════════════════════════════
  content_services: [
    'media-entertainment',
    'nonprofit',
    'government',
    'legal-services',
    'financial-services',
    'consulting',
    'creative-agency',
    'technology-services',
  ] as const,
} as const;

// Flatten to single list
export const ALL_INDUSTRIES = [
  // Commerce
  'retail', 'ecommerce', 'wholesale', 'grocery', 'fashion', 'electronics',
  'home-decor', 'sports-equipment', 'pet-supplies',
  
  // Food & Beverage
  'restaurant', 'cafe', 'bakery', 'food-truck', 'meal-kit',
  
  // Bookings & Events
  'beauty-wellness', 'healthcare', 'fitness', 'education',
  'professional-services', 'automotive', 'real-estate', 'hotel-lodging',
  'event-planning', 'photography',
  
  // Content & Services
  'media-entertainment', 'nonprofit', 'government', 'legal-services',
  'financial-services', 'consulting', 'creative-agency', 'technology-services',
] as const;

export type IndustrySlug = typeof ALL_INDUSTRIES[number];

// ============================================================================
// CORE MODULES - Available across all/most industries
// ============================================================================

export const CORE_MODULES = {
  // ════════════════════════════════════════════════════════════════════════
  // UNIVERSAL MODULES (Every industry has these - ALWAYS VISIBLE)
  // ════════════════════════════════════════════════════════════════════════
  home: {
    id: 'home',
    name: 'Home Dashboard',
    description: 'Main overview with key metrics and KPIs',
    icon: 'Home',
    availableIn: ALL_INDUSTRIES, // ALL industries
    planTier: 'STARTER' as const, // Always visible to all plans
  },
  
  orders: {
    id: 'orders',
    name: 'Orders',
    description: 'Order management and tracking',
    icon: 'ShoppingCart',
    availableIn: ALL_INDUSTRIES, // ALL industries
    planTier: 'STARTER' as const,
  },
  
  customers: {
    id: 'customers',
    name: 'Customers',
    description: 'Customer database and CRM',
    icon: 'Users',
    availableIn: ALL_INDUSTRIES, // ALL industries
    planTier: 'STARTER' as const,
  },
  
  controlCenter: {
    id: 'control-center',
    name: 'Control Center',
    description: 'Settings, team management, permissions',
    icon: 'Settings',
    availableIn: ALL_INDUSTRIES, // ALL industries
    planTier: 'STARTER' as const,
  },
  
  // ────────────────────────────────────────────────────────────────────────
  // INDUSTRY-SPECIFIC MODULES (Built for everyone, shown based on industry + plan)
  // ────────────────────────────────────────────────────────────────────────
  
  // Inventory - Commerce & Food industries (visible to STARTER+)
  inventory: {
    id: 'inventory',
    name: 'Inventory / Catalog',
    description: 'Product/service catalog and stock management',
    icon: 'Package',
    availableIn: ['retail', 'ecommerce', 'wholesale', 'grocery', 'fashion', 'electronics', 'home-decor', 'sports-equipment', 'pet-supplies', 'restaurant', 'cafe', 'bakery', 'food-truck'] as IndustrySlug[],
    planTier: 'STARTER' as const, // Visible to STARTER in these industries
  },
  
  // Finance - All industries but only visible from PRO tier
  finance: {
    id: 'finance',
    name: 'Finance Hub',
    description: 'Revenue, expenses, taxes, financial reports',
    icon: 'DollarSign',
    availableIn: ALL_INDUSTRIES, // All industries have finance
    planTier: 'PRO' as const, // Only visible from PRO tier
  },
  
  // Marketing - All industries but only visible from PRO tier
  marketing: {
    id: 'marketing',
    name: 'Marketing Hub',
    description: 'Campaigns, promotions, email marketing',
    icon: 'Megaphone',
    availableIn: ALL_INDUSTRIES, // All industries have marketing
    planTier: 'PRO' as const, // Only visible from PRO tier
  },
  
  // ────────────────────────────────────────────────────────────────────────
  // INDUSTRY-SPECIFIC MODULES
  // ────────────────────────────────────────────────────────────────────────
  
  // POS (Point of Sale)
  pos: {
    id: 'pos',
    name: 'Point of Sale',
    description: 'In-person transaction processing',
    icon: 'CreditCard',
    availableIn: ['retail', 'grocery', 'restaurant', 'cafe', 'bakery', 'food-truck'],
    planTier: 'STARTER' as const,
  },
  
  // KDS (Kitchen Display System)
  kds: {
    id: 'kds',
    name: 'Kitchen Display System',
    description: 'Kitchen order management',
    icon: 'Monitor',
    availableIn: ['restaurant', 'cafe', 'bakery', 'food-truck'],
    planTier: 'PRO_PLUS' as const,
  },
  
  // Appointments & Bookings
  appointments: {
    id: 'appointments',
    name: 'Appointments',
    description: 'Booking calendar and scheduling',
    icon: 'Calendar',
    availableIn: ['beauty-wellness', 'healthcare', 'fitness', 'professional-services', 'automotive', 'photography'],
    planTier: 'STARTER' as const,
  },
  
  // Table Management
  tables: {
    id: 'tables',
    name: 'Table Management',
    description: 'Restaurant floor plan and table status',
    icon: 'Grid',
    availableIn: ['restaurant', 'cafe'],
    planTier: 'PRO' as const,
  },
  
  // EMR Integration (Healthcare)
  emr: {
    id: 'emr',
    name: 'Electronic Medical Records',
    description: 'Patient health records management',
    icon: 'FileText',
    availableIn: ['healthcare'],
    planTier: 'PRO_PLUS' as const,
  },
  
  // LMS (Learning Management System)
  lms: {
    id: 'lms',
    name: 'Learning Management System',
    description: 'Course content and student progress',
    icon: 'BookOpen',
    availableIn: ['education'],
    planTier: 'PRO' as const,
  },
  
  // Property Listings (Real Estate)
  listings: {
    id: 'listings',
    name: 'Property Listings',
    description: 'Real estate property management',
    icon: 'Home',
    availableIn: ['real-estate'],
    planTier: 'STARTER' as const,
  },
  
  // Vehicle Diagnostics (Automotive)
  diagnostics: {
    id: 'diagnostics',
    name: 'Vehicle Diagnostics',
    description: 'Car health checks and reports',
    icon: 'Tool',
    availableIn: ['automotive'],
    planTier: 'PRO' as const,
  },
  
  // Commission Tracking
  commissions: {
    id: 'commissions',
    name: 'Commission Tracking',
    description: 'Staff performance and commission calculations',
    icon: 'Percent',
    availableIn: ['beauty-wellness', 'retail', 'real-estate', 'automotive'],
    planTier: 'PRO_PLUS' as const,
  },
  
  // Loyalty Programs
  loyalty: {
    id: 'loyalty',
    name: 'Loyalty Program',
    description: 'Customer rewards and points system',
    icon: 'Award',
    availableIn: ['retail', 'ecommerce', 'restaurant', 'cafe', 'beauty-wellness', 'fitness'],
    planTier: 'PRO_PLUS' as const,
  },
  
  // Advanced Analytics
  advancedAnalytics: {
    id: 'advanced-analytics',
    name: 'Advanced Analytics',
    description: 'Predictive insights and AI recommendations',
    icon: 'TrendingUp',
    availableIn: ALL_INDUSTRIES,
    planTier: 'PRO_PLUS' as const,
  },
  
  // Multi-location Management
  multiLocation: {
    id: 'multi-location',
    name: 'Multi-location',
    description: 'Manage multiple store branches',
    icon: 'MapPin',
    availableIn: ALL_INDUSTRIES,
    planTier: 'PRO_PLUS' as const,
  },
} as const;

// ============================================================================
// MODULE VISIBILITY RULES - Clean Architecture
// ============================================================================

export interface ModuleVisibilityRule {
  moduleId: string;
  industries: string[];
  minPlanTier: 'STARTER' | 'PRO' | 'PRO_PLUS';
  requiredFeatures?: string[];
}

export const MODULE_VISIBILITY_RULES: ModuleVisibilityRule[] = [
  // Core modules (all industries)
  { moduleId: 'home', industries: [], minPlanTier: 'STARTER' },
  { moduleId: 'orders', industries: [], minPlanTier: 'STARTER' },
  { moduleId: 'customers', industries: [], minPlanTier: 'STARTER' },
  { moduleId: 'control-center', industries: [], minPlanTier: 'STARTER' },
  
  // Inventory - Commerce + Food only
  { moduleId: 'inventory', industries: ['retail', 'ecommerce', 'wholesale', 'grocery', 'fashion', 'electronics', 'home-decor', 'sports-equipment', 'pet-supplies', 'restaurant', 'cafe', 'bakery', 'food-truck'], minPlanTier: 'STARTER' },
  
  // Finance & Marketing - PRO tier
  { moduleId: 'finance', industries: [], minPlanTier: 'PRO' },
  { moduleId: 'marketing', industries: [], minPlanTier: 'PRO' },
  
  // POS - Physical sales locations
  { moduleId: 'pos', industries: ['retail', 'grocery', 'restaurant', 'cafe', 'bakery', 'food-truck'], minPlanTier: 'STARTER' },
  
  // KDS - Kitchen operations (PRO+)
  { moduleId: 'kds', industries: ['restaurant', 'cafe', 'bakery', 'food-truck'], minPlanTier: 'PRO_PLUS' },
  
  // Appointments - Service businesses
  { moduleId: 'appointments', industries: ['beauty-wellness', 'healthcare', 'fitness', 'professional-services', 'automotive', 'photography'], minPlanTier: 'STARTER' },
  
  // Tables - Restaurant only (PRO)
  { moduleId: 'tables', industries: ['restaurant', 'cafe'], minPlanTier: 'PRO' },
  
  // EMR - Healthcare only (PRO+)
  { moduleId: 'emr', industries: ['healthcare'], minPlanTier: 'PRO_PLUS' },
  
  // LMS - Education only (PRO)
  { moduleId: 'lms', industries: ['education'], minPlanTier: 'PRO' },
  
  // Listings - Real Estate only
  { moduleId: 'listings', industries: ['real-estate'], minPlanTier: 'STARTER' },
  
  // Diagnostics - Automotive only (PRO)
  { moduleId: 'diagnostics', industries: ['automotive'], minPlanTier: 'PRO' },
  
  // Commissions - Performance-based (PRO+)
  { moduleId: 'commissions', industries: ['beauty-wellness', 'retail', 'real-estate', 'automotive'], minPlanTier: 'PRO_PLUS' },
  
  // Loyalty - Customer retention (PRO+)
  { moduleId: 'loyalty', industries: ['retail', 'ecommerce', 'restaurant', 'cafe', 'beauty-wellness', 'fitness'], minPlanTier: 'PRO_PLUS' },
  
  // Advanced Analytics - Universal PRO+
  { moduleId: 'advanced-analytics', industries: [], minPlanTier: 'PRO_PLUS' },
  
  // Multi-location - Universal PRO+
  { moduleId: 'multi-location', industries: [], minPlanTier: 'PRO_PLUS' },
];

// ============================================================================
// DASHBOARD LAYOUT CONFIGURATION
// ============================================================================

export interface DashboardLayoutConfig {
  industry: string;
  planTier: string;
  modules: Array<{
    id: string;
    position: 'sidebar' | 'topbar' | 'main';
    order: number;
    visible: boolean;
  }>;
}

export function getDashboardLayout(industry: string, planTier: string): DashboardLayoutConfig {
  const modules: DashboardLayoutConfig['modules'] = [];
  let order = 0;
  
  // Always include core modules
  ['home', 'orders', 'customers', 'control-center'].forEach(moduleId => {
    modules.push({
      id: moduleId,
      position: 'sidebar',
      order: order++,
      visible: true,
    });
  });
  
  // Add inventory for applicable industries
  if (CORE_MODULES.inventory.availableIn.includes(industry as any)) {
    modules.push({
      id: 'inventory',
      position: 'sidebar',
      order: order++,
      visible: true,
    });
  }
  
  // Add finance & marketing for PRO+
  if (planTier === 'PRO' || planTier === 'PRO_PLUS') {
    modules.push(
      { id: 'finance', position: 'sidebar', order: order++, visible: true },
      { id: 'marketing', position: 'sidebar', order: order++, visible: true }
    );
  }
  
  // Add industry-specific modules
  MODULE_VISIBILITY_RULES.forEach(rule => {
    if (
      rule.industries.includes(industry) &&
      getTierLevel(planTier) >= getTierLevel(rule.minPlanTier)
    ) {
      modules.push({
        id: rule.moduleId,
        position: 'sidebar',
        order: order++,
        visible: true,
      });
    }
  });
  
  return {
    industry,
    planTier,
    modules,
  };
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

export function getTierLevel(tier: string): number {
  const levels: Record<string, number> = {
    STARTER: 0,
    PRO: 1,
    PRO_PLUS: 2,
  };
  return levels[tier] ?? 0;
}

export function shouldShowModule(
  moduleId: string,
  context: { industry: string; planTier: string; enabledFeatures: string[] }
): boolean {
  const rule = MODULE_VISIBILITY_RULES.find(r => r.moduleId === moduleId);
  if (!rule) return true; // No rule = always show
  
  // Check industry restriction
  if (rule.industries.length > 0 && !rule.industries.includes(context.industry)) {
    return false;
  }
  
  // Check plan tier requirement
  if (getTierLevel(context.planTier) < getTierLevel(rule.minPlanTier)) {
    return false;
  }
  
  // Check feature requirements
  if (rule.requiredFeatures?.some(f => !context.enabledFeatures.includes(f))) {
    return false;
  }
  
  return true;
}

export function getAvailableModules(industry: string, planTier: string): string[] {
  return Object.keys(CORE_MODULES).filter(moduleId =>
    shouldShowModule(moduleId, {
      industry,
      planTier,
      enabledFeatures: [],
    })
  );
}
