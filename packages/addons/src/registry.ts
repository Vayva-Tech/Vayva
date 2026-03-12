/**
 * Add-on Registry
 * 
 * Central registry for all available add-ons in the Vayva marketplace.
 */

export interface AddOnDefinition {
  id: string;
  name: string;
  description: string;
  version: string;
  category: AddOnCategory;
  price: number;
  isFree: boolean;
  developer: string;
  icon?: string;
  tags: string[];
  requirements?: string[];
  compatibleTemplates: string[];
  mountPoints: string[];
  configSchema?: Record<string, unknown>;
}

export type AddOnCategory = 
  | 'marketing'
  | 'analytics'
  | 'shipping'
  | 'payment'
  | 'communication'
  | 'automation'
  | 'inventory'
  | 'customer-service'
  | 'storefront'
  | 'operations';

export const ADDON_CATEGORIES: AddOnCategory[] = [
  'marketing',
  'analytics',
  'shipping',
  'payment',
  'communication',
  'automation',
  'inventory',
  'customer-service',
  'storefront',
  'operations',
];

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

// Registry of all available add-ons
const ADDON_REGISTRY: Map<string, AddOnDefinition> = new Map();

/**
 * Register an add-on in the marketplace
 */
export function registerAddon(addon: AddOnDefinition): void {
  ADDON_REGISTRY.set(addon.id, addon);
}

/**
 * Get an add-on by ID
 */
export function getAddonById(id: string): AddOnDefinition | undefined {
  return ADDON_REGISTRY.get(id);
}

/**
 * Get all available add-ons
 */
export function getAllAddons(): AddOnDefinition[] {
  return Array.from(ADDON_REGISTRY.values());
}

/**
 * Get add-ons by category
 */
export function getAddonsByCategory(category: AddOnCategory): AddOnDefinition[] {
  return getAllAddons().filter(addon => addon.category === category);
}

/**
 * Search add-ons by query
 */
export function searchAddons(query: string): AddOnDefinition[] {
  const lowerQuery = query.toLowerCase();
  return getAllAddons().filter(addon =>
    addon.name.toLowerCase().includes(lowerQuery) ||
    addon.description.toLowerCase().includes(lowerQuery) ||
    addon.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
  );
}

/**
 * Get compatible add-ons for a template
 */
export function getCompatibleAddons(templateId: string): AddOnDefinition[] {
  return getAllAddons().filter(addon =>
    addon.compatibleTemplates.includes(templateId) ||
    addon.compatibleTemplates.includes('*')
  );
}

// Export all add-ons constant for convenience
export const ALL_ADDONS: AddOnDefinition[] = getAllAddons();
