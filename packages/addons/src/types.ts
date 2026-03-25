/**
 * Add-on Types
 * 
 * Type definitions for the Vayva add-on system.
 */

export type AddOnCategory = 
  | 'ecommerce'
  | 'booking'
  | 'content'
  | 'marketing'
  | 'operations'
  | 'integration'
  | 'industry-specific'
  | 'analytics'
  | 'shipping'
  | 'payment'
  | 'communication'
  | 'automation'
  | 'inventory'
  | 'customer-service'
  | 'storefront';

export const ADDON_CATEGORIES = [
  { slug: 'marketing', label: 'Marketing' },
  { slug: 'analytics', label: 'Analytics' },
  { slug: 'shipping', label: 'Shipping' },
  { slug: 'payment', label: 'Payment' },
  { slug: 'communication', label: 'Communication' },
  { slug: 'automation', label: 'Automation' },
  { slug: 'inventory', label: 'Inventory' },
  { slug: 'customer-service', label: 'Customer Service' },
  { slug: 'storefront', label: 'Storefront' },
  { slug: 'operations', label: 'Operations' },
] as const;

// ============================================================================
// MOUNT POINTS — storefront / dashboard injection sites
// ============================================================================

export type MountPointId =
  | 'header-right'
  | 'header-nav'
  | 'header-left'
  | 'product-card'
  | 'product-detail'
  | 'product-grid-actions'
  | 'category-sidebar'
  | 'category-header'
  | 'page-sidebar'
  | 'page-footer'
  | 'footer-widgets'
  | 'floating-button'
  | 'checkout-summary'
  | 'checkout-header'
  | 'post-content'
  | 'post-sidebar'
  | 'hero-section'
  | 'below-fold'
  | 'dashboard-sidebar'
  | 'dashboard-home-widgets'
  | 'dashboard-analytics';

export const MOUNT_POINTS: Record<
  MountPointId,
  { label: string; description: string; maxComponents?: number }
> = {
  'header-right': {
    label: 'Header Right',
    description: 'Top-right of header (cart, notifications, profile)',
    maxComponents: 3,
  },
  'header-nav': { label: 'Header Navigation', description: 'Main navigation menu items' },
  'header-left': { label: 'Header Left', description: 'Top-left of header (logo area)' },
  'product-card': {
    label: 'Product Card',
    description: 'Inside product card (wishlist, quick-add)',
    maxComponents: 2,
  },
  'product-detail': {
    label: 'Product Detail',
    description: 'Product detail page sections',
    maxComponents: 5,
  },
  'product-grid-actions': {
    label: 'Product Grid Actions',
    description: 'Actions above product grid (filters, sort)',
    maxComponents: 3,
  },
  'category-sidebar': {
    label: 'Category Sidebar',
    description: 'Sidebar on category pages',
    maxComponents: 4,
  },
  'category-header': { label: 'Category Header', description: 'Header area of category pages' },
  'page-sidebar': {
    label: 'Page Sidebar',
    description: 'General page sidebar',
    maxComponents: 4,
  },
  'page-footer': { label: 'Page Footer', description: 'Above the main footer' },
  'footer-widgets': {
    label: 'Footer Widgets',
    description: 'Footer widget areas',
    maxComponents: 4,
  },
  'floating-button': {
    label: 'Floating Button',
    description: 'Fixed position floating button',
    maxComponents: 2,
  },
  'checkout-summary': { label: 'Checkout Summary', description: 'Checkout summary sidebar' },
  'checkout-header': { label: 'Checkout Header', description: 'Checkout page header' },
  'post-content': { label: 'Post Content', description: 'Inside blog post content' },
  'post-sidebar': {
    label: 'Post Sidebar',
    description: 'Blog post sidebar',
    maxComponents: 3,
  },
  'hero-section': {
    label: 'Hero Section',
    description: 'Homepage hero section overlays',
    maxComponents: 2,
  },
  'below-fold': { label: 'Below Fold', description: 'Below the homepage fold' },
  'dashboard-sidebar': {
    label: 'Dashboard Sidebar',
    description: 'Merchant dashboard sidebar sections',
    maxComponents: 5,
  },
  'dashboard-home-widgets': {
    label: 'Dashboard Widgets',
    description: 'Merchant dashboard home widgets',
    maxComponents: 6,
  },
  'dashboard-analytics': {
    label: 'Analytics Widgets',
    description: 'Analytics dashboard widgets',
    maxComponents: 4,
  },
};

export interface AddOnConfigSchema {
  /** Preferred declarative fields for merchant UI. */
  fields?: Array<{
    key: string;
    label: string;
    type:
      | 'string'
      | 'number'
      | 'boolean'
      | 'select'
      | 'multiselect'
      | 'color'
      | 'image'
      | 'richtext'
      | 'json';
    description?: string;
    required?: boolean;
    defaultValue?: unknown;
    options?: Array<{ label: string; value: string }>;
    min?: number;
    max?: number;
    validation?: {
      min?: number;
      max?: number;
      pattern?: string;
      maxLength?: number;
      minLength?: number;
    };
  }>;
  sections?: Array<{
    title: string;
    description?: string;
    fields: string[];
  }>;
  /** Legacy JSON-schema style blobs used by some add-on definitions. */
  type?: string;
  properties?: Record<string, unknown>;
}

export interface AddOnDefinition {
  id: string;
  name: string;
  description: string;
  tagline?: string;
  version: string;
  category: AddOnCategory;
  price?: number;
  isFree?: boolean;
  developer?: string;
  icon?: string;
  tags?: string[];
  requirements?: string[];
  compatibleTemplates: string[];
  mountPoints?: string[];
  configSchema?: AddOnConfigSchema;
  previewImages?: {
    thumbnail: string;
    screenshots: string[];
    demoVideo?: string;
  };
  author?: {
    name: string;
    isOfficial: boolean;
    isVerified?: boolean;
    url?: string;
  };
  pricing?: {
    type: 'free' | 'one-time' | 'subscription';
    amount?: number;
    basePrice?: number;
    currency?: string;
    interval?: 'month' | 'year';
  };
  stats?: {
    installCount: number;
    rating: number;
    reviewCount: number;
    reviews?: number;
    lastUpdated: string;
    createdAt: string;
  };
  highlights?: string[];
  provides?: {
    pages?: { title: string; route: string; description?: string; layout?: string }[];
    components?: { componentName: string; mountPoint: string; priority?: number; conditions?: Record<string, unknown> }[];
    apiRoutes?: { path: string; methods: string[]; description?: string }[];
    databaseModels?: string[];
  };
  requires?: string[];
  installTimeEstimate?: number;
  docs?: {
    setup?: string;
    api?: string;
    faq?: string;
    support?: string;
  };
  defaultConfig?: Record<string, unknown>;
  configRequired?: boolean;
  // Legacy fields for backward compatibility
  installationType?: 'automatic' | 'manual' | 'hybrid';
  /** Pre-selected in template gallery / onboarding */
  isDefault?: boolean;
  canUninstall?: boolean;
  conflictsWith?: string[];
  versionHistory?: { version: string; date: string; changes: string[] }[];
}

export interface InstalledAddOn extends AddOnDefinition {
  storeId: string;
  installedAt: Date;
  updatedAt: Date;
  config: Record<string, unknown>;
  isActive: boolean;
  status: 'active' | 'inactive' | 'error' | 'pending';
}

export interface AddOnInstallationRequest {
  storeId: string;
  addonId: string;
  config?: Record<string, unknown>;
}

export interface AddOnInstallationResult {
  success: boolean;
  installedAddOn?: InstalledAddOn;
  error?: string;
  requiresSetup?: boolean;
  setupUrl?: string;
}
