/**
 * Integration Marketplace Types
 */

export type IntegrationCategory =
  | 'accounting'
  | 'payments'
  | 'delivery'
  | 'scheduling'
  | 'communication'
  | 'email'
  | 'crm'
  | 'analytics'
  | 'social'
  | 'inventory'
  | 'esignature'
  | 'marketing'
  | 'hr'
  | 'shipping';

export type IntegrationPricing = 'free' | 'paid' | 'usage_based';

export type SetupType = 'one_click' | 'oauth' | 'api_key' | 'webhook';

export type InstallationStatus = 'pending' | 'active' | 'error' | 'disabled';

export interface Integration {
  id: string;
  name: string;
  description: string;
  category: IntegrationCategory;
  logo: string;
  rating: number;
  reviewCount: number;
  installCount: number;
  pricing: IntegrationPricing;
  setupType: SetupType;
  features: string[];
  screenshots?: string[];
  documentationUrl?: string;
  supportEmail?: string;
  developer: {
    name: string;
    website?: string;
  };
  requirements?: string[];
  permissions?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IntegrationInstallation {
  id: string;
  storeId: string;
  integrationId: string;
  status: InstallationStatus;
  config?: Record<string, unknown>;
  credentials?: {
    encrypted: boolean;
    data: Record<string, unknown>;
  };
  settings?: Record<string, unknown>;
  installedAt: Date;
  updatedAt: Date;
  lastSyncAt?: Date;
  errorMessage?: string;
}

export interface IntegrationFilter {
  category?: IntegrationCategory;
  pricing?: IntegrationPricing;
  search?: string;
  sortBy?: 'rating' | 'installs' | 'newest' | 'name';
}

export interface InstallationResult {
  success: boolean;
  installationId?: string;
  redirectUrl?: string;
  message?: string;
  error?: string;
}

export interface ConnectorConfig {
  baseUrl: string;
  apiVersion?: string;
  timeout?: number;
  retryAttempts?: number;
}

export interface SyncResult {
  success: boolean;
  itemsSynced: number;
  errors: string[];
  lastSyncAt: Date;
}
