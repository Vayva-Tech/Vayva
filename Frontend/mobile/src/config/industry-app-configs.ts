/**
 * Mobile App Configuration - Phase 4 Enhancement
 * 
 * Industry-specific mobile app configurations for:
 * 1. Healthcare - Clinical mobile workflows
 * 2. Legal - Case management on-the-go
 * 3. Retail - Store operations & inventory
 * 4. Food - Kitchen & menu management
 * 5. Restaurant - FOH/KDS mobile access
 */

export interface IndustryAppConfig {
  /** Industry identifier */
  industry: string;
  /** App display name */
  appName: string;
  /** Primary color */
  primaryColor: string;
  /** Icon asset */
  iconAsset: string;
  /** Splash screen background */
  splashBackground: string;
  /** Feature flags */
  features: {
    offlineMode: boolean;
    pushNotifications: boolean;
    biometricAuth: boolean;
    cameraIntegration: boolean;
    locationServices: boolean;
  };
  /** Default navigation structure */
  navigation: Array<{
    id: string;
    title: string;
    icon: string;
    route: string;
  }>;
  /** Offline data sync configuration */
  offlineSync: {
    enabled: boolean;
    syncInterval: number; // minutes
    maxCacheSize: number; // MB
    priorityEntities: string[];
  };
}

/**
 * Healthcare Mobile App Configuration
 * Focus: Clinical workflows, patient management, appointments
 */
export const HEALTHCARE_APP_CONFIG: IndustryAppConfig = {
  industry: 'healthcare',
  appName: 'Vayva Health',
  primaryColor: '#0ea5e9', // Sky blue
  iconAsset: './assets/icons/healthcare-icon.png',
  splashBackground: '#0f172a',
  features: {
    offlineMode: true,
    pushNotifications: true,
    biometricAuth: true, // HIPAA compliance
    cameraIntegration: true, // Document scanning
    locationServices: false,
  },
  navigation: [
    { id: 'patients', title: 'Patients', icon: 'users', route: '/patients' },
    { id: 'appointments', title: 'Appointments', icon: 'calendar', route: '/appointments' },
    { id: 'clinical-notes', title: 'Clinical Notes', icon: 'file-text', route: '/notes' },
    { id: 'tasks', title: 'Tasks', icon: 'check-square', route: '/tasks' },
    { id: 'analytics', title: 'Analytics', icon: 'bar-chart', route: '/analytics' },
  ],
  offlineSync: {
    enabled: true,
    syncInterval: 15, // Sync every 15 minutes
    maxCacheSize: 500, // 500MB for patient records
    priorityEntities: ['patients', 'appointments', 'medications', 'allergies'],
  },
};

/**
 * Legal Mobile App Configuration
 * Focus: Case management, document review, court dates
 */
export const LEGAL_APP_CONFIG: IndustryAppConfig = {
  industry: 'legal',
  appName: 'Vayva Legal',
  primaryColor: '#7c3aed', // Violet
  iconAsset: './assets/icons/legal-icon.png',
  splashBackground: '#1e1b4b',
  features: {
    offlineMode: true,
    pushNotifications: true,
    biometricAuth: true, // Attorney-client privilege
    cameraIntegration: true, // Evidence capture
    locationServices: true, // Court locations
  },
  navigation: [
    { id: 'matters', title: 'Matters', icon: 'briefcase', route: '/matters' },
    { id: 'documents', title: 'Documents', icon: 'file-text', route: '/documents' },
    { id: 'calendar', title: 'Calendar', icon: 'calendar', route: '/calendar' },
    { id: 'tasks', title: 'Tasks', icon: 'check-square', route: '/tasks' },
    { id: 'time-tracking', title: 'Time & Billing', icon: 'clock', route: '/billing' },
  ],
  offlineSync: {
    enabled: true,
    syncInterval: 30,
    maxCacheSize: 1000, // 1GB for documents
    priorityEntities: ['matters', 'documents', 'deadlines', 'contacts'],
  },
};

/**
 * Retail Mobile App Configuration
 * Focus: Store operations, inventory, sales tracking
 */
export const RETAIL_APP_CONFIG: IndustryAppConfig = {
  industry: 'retail',
  appName: 'Vayva Retail',
  primaryColor: '#10b981', // Emerald
  iconAsset: './assets/icons/retail-icon.png',
  splashBackground: '#064e3b',
  features: {
    offlineMode: true,
    pushNotifications: true,
    biometricAuth: false,
    cameraIntegration: true, // Barcode scanning
    locationServices: true, // Multi-store
  },
  navigation: [
    { id: 'pos', title: 'POS', icon: 'shopping-bag', route: '/pos' },
    { id: 'inventory', title: 'Inventory', icon: 'package', route: '/inventory' },
    { id: 'sales', title: 'Sales', icon: 'dollar-sign', route: '/sales' },
    { id: 'customers', title: 'Customers', icon: 'users', route: '/customers' },
    { id: 'staff', title: 'Staff', icon: 'users', route: '/staff' },
  ],
  offlineSync: {
    enabled: true,
    syncInterval: 5, // Frequent sync for inventory
    maxCacheSize: 200,
    priorityEntities: ['products', 'inventory', 'orders', 'customers'],
  },
};

/**
 * Food/Grocery Mobile App Configuration
 * Focus: Inventory, recipes, supplier management
 */
export const FOOD_APP_CONFIG: IndustryAppConfig = {
  industry: 'food',
  appName: 'Vayva Kitchen',
  primaryColor: '#f59e0b', // Amber
  iconAsset: './assets/icons/food-icon.png',
  splashBackground: '#78350f',
  features: {
    offlineMode: true,
    pushNotifications: true,
    biometricAuth: false,
    cameraIntegration: true, // Inventory photos
    locationServices: false,
  },
  navigation: [
    { id: 'inventory', title: 'Inventory', icon: 'package', route: '/inventory' },
    { id: 'recipes', title: 'Recipes', icon: 'book-open', route: '/recipes' },
    { id: 'menu', title: 'Menu', icon: 'menu', route: '/menu' },
    { id: 'suppliers', title: 'Suppliers', icon: 'truck', route: '/suppliers' },
    { id: 'waste-tracking', title: 'Waste Tracking', icon: 'alert-circle', route: '/waste' },
  ],
  offlineSync: {
    enabled: true,
    syncInterval: 10,
    maxCacheSize: 300,
    priorityEntities: ['ingredients', 'recipes', 'inventory', 'suppliers'],
  },
};

/**
 * Restaurant Mobile App Configuration
 * Focus: Table management, KDS, reservations
 */
export const RESTAURANT_APP_CONFIG: IndustryAppConfig = {
  industry: 'restaurant',
  appName: 'Vayva Restaurant',
  primaryColor: '#ef4444', // Red
  iconAsset: './assets/icons/restaurant-icon.png',
  splashBackground: '#450a0a',
  features: {
    offlineMode: true,
    pushNotifications: true,
    biometricAuth: false,
    cameraIntegration: false,
    locationServices: false,
  },
  navigation: [
    { id: 'floor-plan', title: 'Floor Plan', icon: 'grid', route: '/floor-plan' },
    { id: 'kds', title: 'Kitchen', icon: 'chef-hat', route: '/kitchen' },
    { id: 'reservations', title: 'Reservations', icon: 'calendar', route: '/reservations' },
    { id: 'orders', title: 'Orders', icon: 'shopping-cart', route: '/orders' },
    { id: 'staff', title: 'Staff', icon: 'users', route: '/staff' },
  ],
  offlineSync: {
    enabled: true,
    syncInterval: 2, // Real-time for restaurant ops
    maxCacheSize: 100,
    priorityEntities: ['tables', 'orders', 'reservations', 'menu-items'],
  },
};

/**
 * Get industry-specific app configuration
 */
export function getIndustryAppConfig(industry: string): IndustryAppConfig {
  const configs: Record<string, IndustryAppConfig> = {
    healthcare: HEALTHCARE_APP_CONFIG,
    legal: LEGAL_APP_CONFIG,
    retail: RETAIL_APP_CONFIG,
    food: FOOD_APP_CONFIG,
    restaurant: RESTAURANT_APP_CONFIG,
  };

  return configs[industry] || RETAIL_APP_CONFIG; // Default to retail
}

/**
 * Top 5 Industries Mobile Rollout Priority
 */
export const MOBILE_ROLLOUT_PRIORITY = [
  'healthcare',
  'legal',
  'retail',
  'food',
  'restaurant',
];
