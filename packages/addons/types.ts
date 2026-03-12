/**
 * Vayva Add-On System - Core Type Definitions
 * 
 * This defines the complete type system for the add-on gallery,
 * including add-on definitions, mount points, installation systems,
 * and template compatibility.
 */

// ============================================================================
// ADD-ON CATEGORIES
// ============================================================================

export type AddOnCategory =
  | 'ecommerce'
  | 'booking'
  | 'content'
  | 'marketing'
  | 'operations'
  | 'integration'
  | 'industry-specific';

export const ADDON_CATEGORIES: { slug: AddOnCategory; label: string; icon: string }[] = [
  { slug: 'ecommerce', label: 'E-Commerce', icon: 'ShoppingCart' },
  { slug: 'booking', label: 'Booking & Scheduling', icon: 'Calendar' },
  { slug: 'content', label: 'Content & Media', icon: 'FileText' },
  { slug: 'marketing', label: 'Marketing & Conversion', icon: 'TrendingUp' },
  { slug: 'operations', label: 'Business Operations', icon: 'Settings' },
  { slug: 'integration', label: 'Integrations', icon: 'Plug' },
  { slug: 'industry-specific', label: 'Industry Specific', icon: 'Briefcase' },
];

// ============================================================================
// MOUNT POINTS - Where add-ons can inject UI
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

export const MOUNT_POINTS: Record<MountPointId, { label: string; description: string; maxComponents?: number }> = {
  'header-right': { label: 'Header Right', description: 'Top-right of header (cart, notifications, profile)', maxComponents: 3 },
  'header-nav': { label: 'Header Navigation', description: 'Main navigation menu items' },
  'header-left': { label: 'Header Left', description: 'Top-left of header (logo area)' },
  'product-card': { label: 'Product Card', description: 'Inside product card (wishlist, quick-add)', maxComponents: 2 },
  'product-detail': { label: 'Product Detail', description: 'Product detail page sections', maxComponents: 5 },
  'product-grid-actions': { label: 'Product Grid Actions', description: 'Actions above product grid (filters, sort)', maxComponents: 3 },
  'category-sidebar': { label: 'Category Sidebar', description: 'Sidebar on category pages', maxComponents: 4 },
  'category-header': { label: 'Category Header', description: 'Header area of category pages' },
  'page-sidebar': { label: 'Page Sidebar', description: 'General page sidebar', maxComponents: 4 },
  'page-footer': { label: 'Page Footer', description: 'Above the main footer' },
  'footer-widgets': { label: 'Footer Widgets', description: 'Footer widget areas', maxComponents: 4 },
  'floating-button': { label: 'Floating Button', description: 'Fixed position floating button', maxComponents: 2 },
  'checkout-summary': { label: 'Checkout Summary', description: 'Checkout summary sidebar' },
  'checkout-header': { label: 'Checkout Header', description: 'Checkout page header' },
  'post-content': { label: 'Post Content', description: 'Inside blog post content' },
  'post-sidebar': { label: 'Post Sidebar', description: 'Blog post sidebar', maxComponents: 3 },
  'hero-section': { label: 'Hero Section', description: 'Homepage hero section overlays', maxComponents: 2 },
  'below-fold': { label: 'Below Fold', description: 'Below the homepage fold' },
  'dashboard-sidebar': { label: 'Dashboard Sidebar', description: 'Merchant dashboard sidebar sections', maxComponents: 5 },
  'dashboard-home-widgets': { label: 'Dashboard Widgets', description: 'Merchant dashboard home widgets', maxComponents: 6 },
  'dashboard-analytics': { label: 'Analytics Widgets', description: 'Analytics dashboard widgets', maxComponents: 4 },
};

// ============================================================================
// ADD-ON PROVIDES - What an add-on contributes
// ============================================================================

export interface AddOnProvides {
  /** Pages this add-on creates (e.g., "/cart", "/checkout") */
  pages?: Array<{
    route: string;
    title: string;
    description?: string;
    layout?: 'default' | 'full-width' | 'sidebar';
  }>;
  
  /** Components it injects into mount points */
  components?: Array<{
    mountPoint: MountPointId;
    componentName: string;
    priority: number; // Lower = higher position
    conditions?: {
      /** Only show on these page types */
      pageTypes?: ('home' | 'product' | 'category' | 'cart' | 'checkout' | 'post' | 'page')[];
      /** Only show when user is logged in/out */
      authState?: 'logged-in' | 'logged-out' | 'any';
      /** Require feature flag to be enabled */
      featureFlag?: string;
    };
  }>;
  
  /** API endpoints it adds */
  apiRoutes?: Array<{
    path: string;
    methods: ('GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH')[];
    description?: string;
  }>;
  
  /** Database tables it creates (Prisma model names) */
  databaseModels?: string[];
  
  /** Dashboard widgets it adds */
  dashboardWidgets?: Array<{
    id: string;
    title: string;
    description?: string;
    defaultPosition: { x: number; y: number; w: number; h: number };
  }>;
  
  /** Webhook handlers it registers */
  webhooks?: Array<{
    event: string;
    handler: string;
    description?: string;
  }>;
  
  /** Background jobs it registers */
  scheduledJobs?: Array<{
    name: string;
    schedule: string; // Cron expression
    handler: string;
    description?: string;
  }>;
}

// ============================================================================
// ADD-ON PRICING
// ============================================================================

export interface AddOnPricing {
  type: 'free' | 'one-time' | 'subscription';
  /** Base price in cents (e.g., 999 = $9.99) */
  basePrice?: number;
  /** Billing interval for subscriptions */
  billingInterval?: 'monthly' | 'yearly';
  /** Trial period in days */
  trialDays?: number;
  /** Commission percentage on transactions (for payment add-ons) */
  commissionPercent?: number;
  /** Usage-based pricing tiers */
  usageTiers?: Array<{
    maxUsage: number | 'unlimited';
    price: number;
    label: string;
  }>;
}

// ============================================================================
// ADD-ON CONFIGURATION SCHEMA
// ============================================================================

export type ConfigFieldType = 
  | 'string' 
  | 'number' 
  | 'boolean' 
  | 'select' 
  | 'multiselect' 
  | 'color' 
  | 'image' 
  | 'richtext'
  | 'json';

export interface ConfigField {
  key: string;
  label: string;
  type: ConfigFieldType;
  description?: string;
  required?: boolean;
  defaultValue?: unknown;
  options?: Array<{ label: string; value: string }>; // For select/multiselect
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    maxLength?: number;
    minLength?: number;
  };
}

export interface AddOnConfigSchema {
  fields: ConfigField[];
  sections?: Array<{
    title: string;
    description?: string;
    fields: string[]; // Field keys
  }>;
}

// ============================================================================
// MAIN ADD-ON DEFINITION
// ============================================================================

export interface AddOnDefinition {
  /** Unique identifier (kebab-case) */
  id: string;
  
  /** Display name */
  name: string;
  
  /** Short tagline (50 chars max) */
  tagline?: string;
  
  /** Full description (supports markdown) */
  description: string;
  
  /** Category */
  category: AddOnCategory;
  
  /** Sub-categories for filtering */
  tags?: string[];
  
  /** Phosphor icon name */
  icon?: string;
  
  /** Preview images */
  previewImages?: {
    thumbnail: string;
    screenshots: string[];
    demoVideo?: string;
  };
  
  /** Author information */
  author?: {
    name: string;
    url?: string;
    isVerified: boolean;
    isOfficial: boolean;
  };
  
  /** Version info */
  version: string;
  versionHistory?: Array<{
    version: string;
    date: string;
    changes: string[];
  }>;
  
  // -------------------------------------------------------------------------
  // COMPATIBILITY
  // -------------------------------------------------------------------------
  
  /** Template IDs this add-on works with */
  compatibleTemplates: string[];
  
  /** Template IDs this add-on definitely does NOT work with */
  incompatibleTemplates?: string[];
  
  /** Add-on IDs that conflict with this one */
  conflictsWith?: string[];
  
  /** Add-on IDs that must be installed first */
  requires?: string[];
  
  /** Add-on IDs that are recommended but not required */
  recommended?: string[];
  
  /** Minimum template capability version required */
  minTemplateVersion?: string;
  
  // -------------------------------------------------------------------------
  // INSTALLATION
  // -------------------------------------------------------------------------
  
  installationType?: 'automatic' | 'manual' | 'hybrid';
  
  /** Whether this add-on is installed by default on new stores */
  isDefault?: boolean;
  
  /** Whether this can be uninstalled */
  canUninstall?: boolean;
  
  /** Installation time estimate in minutes */
  installTimeEstimate?: number;
  
  /** Requires code review for auto-install */
  requiresCodeReview?: boolean;
  
  // -------------------------------------------------------------------------
  // FEATURES
  // -------------------------------------------------------------------------
  
  provides?: AddOnProvides;
  
  // -------------------------------------------------------------------------
  // CONFIGURATION
  // -------------------------------------------------------------------------
  
  configSchema?: AddOnConfigSchema;
  defaultConfig?: Record<string, unknown>;
  
  /** Whether configuration is required before first use */
  configRequired?: boolean;
  
  // -------------------------------------------------------------------------
  // PRICING
  // -------------------------------------------------------------------------
  
  pricing?: AddOnPricing;
  
  // -------------------------------------------------------------------------
  // METRICS & SOCIAL PROOF
  // -------------------------------------------------------------------------
  
  stats?: {
    installCount: number;
    rating: number;
    reviewCount: number;
    lastUpdated: string;
    createdAt: string;
  };
  
  /** Feature highlights for marketing */
  highlights?: string[];
  
  /** Documentation URLs */
  docs?: {
    setup?: string;
    api?: string;
    faq?: string;
    support?: string;
  };
  
  // Legacy compatibility fields
  price?: number;
  isFree?: boolean;
  developer?: string;
  mountPoints?: string[];
}

// ============================================================================
// INSTALLED ADD-ON (Instance in a store)
// ============================================================================

export interface InstalledAddOn {
  /** Reference to the add-on definition */
  addOnId: string;
  
  /** Which store this is installed on */
  storeId: string;
  
  /** Installation status */
  status: 'installing' | 'active' | 'disabled' | 'error' | 'uninstalling';
  
  /** Current configuration values */
  config: Record<string, unknown>;
  
  /** Installation timestamp */
  installedAt: string;
  
  /** Last configuration update */
  configUpdatedAt: string;
  
  /** Installed version */
  installedVersion: string;
  
  /** Whether there's an update available */
  updateAvailable: boolean;
  
  /** Latest version available */
  latestVersion?: string;
  
  /** Installation error if status is 'error' */
  errorMessage?: string;
  
  /** Who installed it */
  installedBy: string;
  
  /** Custom CSS overrides */
  customCSS?: string;
  
  /** Feature flags enabled for this instance */
  enabledFeatures?: string[];
}

// ============================================================================
// TEMPLATE CAPABILITIES
// ============================================================================

export interface TemplateCapabilities {
  templateId: string;
  templateVersion: string;
  
  /** Mount points this template supports */
  supportedMountPoints: MountPointId[];
  
  /** Add-ons that are pre-installed/embedded */
  builtInAddOns: string[];
  
  /** Add-ons that cannot be installed on this template */
  blockedAddOns: string[];
  
  /** Maximum number of add-ons allowed */
  maxAddOns: number;
  
  /** Requires specific features to be enabled */
  requiredFeatures?: string[];
  
  /** API version this template supports */
  apiVersion: string;
}

// ============================================================================
// INSTALLATION REQUEST
// ============================================================================

export interface AddOnInstallationRequest {
  addOnId: string;
  storeId: string;
  requestedBy: string;
  
  /** Initial configuration values */
  initialConfig?: Record<string, unknown>;
  
  /** Override compatibility checks (admin only) */
  forceInstall?: boolean;
  
  /** Skip configuration wizard */
  skipConfig?: boolean;
  
  /** Schedule for later */
  scheduleAt?: string;
}

export interface AddOnInstallationResult {
  success: boolean;
  installedAddOn?: InstalledAddOn;
  error?: string;
  
  /** Files that were modified */
  modifiedFiles: string[];
  
  /** Database migrations applied */
  migrationsApplied: string[];
  
  /** Manual steps required */
  manualSteps?: Array<{
    step: number;
    title: string;
    description: string;
    codeSnippet?: string;
  }>;
  
  /** Links to preview */
  previewUrls?: {
    storefront: string;
    dashboard: string;
  };
}

// ============================================================================
// GALLERY FILTERS
// ============================================================================

export interface AddOnGalleryFilters {
  category?: AddOnCategory;
  searchQuery?: string;
  compatibleWithTemplate?: string;
  priceType?: 'free' | 'paid' | 'any';
  minRating?: number;
  author?: 'official' | 'community' | 'any';
  sortBy?: 'popular' | 'rating' | 'newest' | 'name';
  installed?: 'all' | 'installed' | 'not-installed';
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

export interface AddOnGalleryResponse {
  addOns: AddOnDefinition[];
  totalCount: number;
  filters: AddOnGalleryFilters;
  categories: Array<{ slug: AddOnCategory; count: number }>;
}

export interface AddOnDetailResponse {
  addOn: AddOnDefinition;
  isInstalled: boolean;
  installedInstance?: InstalledAddOn;
  compatibleTemplates: string[];
  reviews: AddOnReview[];
}

export interface AddOnReview {
  id: string;
  addOnId: string;
  storeId: string;
  reviewerName: string;
  rating: number;
  title: string;
  body: string;
  helpfulCount: number;
  createdAt: string;
  updatedAt: string;
  isVerifiedPurchase: boolean;
}
