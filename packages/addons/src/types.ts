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

export interface AddOnConfigSchema {
  fields: Array<{
    key: string;
    label: string;
    type: 'string' | 'number' | 'boolean' | 'select' | 'multiselect' | 'color' | 'image' | 'richtext' | 'json';
    description?: string;
    required?: boolean;
    defaultValue?: unknown;
    options?: Array<{ label: string; value: string }>;
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
  };
  author?: {
    name: string;
    isOfficial: boolean;
    isVerified?: boolean;
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
  };
  defaultConfig?: Record<string, unknown>;
  configRequired?: boolean;
  // Legacy fields for backward compatibility
  installationType?: 'automatic' | 'manual' | 'hybrid';
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
