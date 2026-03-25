/**
 * Tenant Resolver
 * 
 * Resolves the merchant/store based on hostname/subdomain
 * Supports:
 * - Subdomains: storename.vayva.ng
 * - Custom domains: www.merchant.com
 * - Domain masking/aliasing
 */

import { headers } from 'next/headers';

export interface TenantConfig {
  storeId: string;
  storeName: string;
  templateId: string;
  customDomain?: string;
  isCustomDomain: boolean;
  primaryDomain: string;
}

const VAYVA_DOMAIN = process.env.NEXT_PUBLIC_VAYVA_DOMAIN || 'vayva.ng';

/**
 * Extract store identifier from hostname
 */
export function resolveTenantFromHostname(hostname: string): {
  storeSlug: string | null;
  isCustomDomain: boolean;
} {
  // Remove port if present
  const cleanHostname = hostname.split(':')[0].toLowerCase();
  
  // Check if it's the main domain
  if (cleanHostname === VAYVA_DOMAIN || cleanHostname === `www.${VAYVA_DOMAIN}`) {
    return { storeSlug: null, isCustomDomain: false };
  }
  
  // Check for subdomain pattern: storename.vayva.ng
  if (cleanHostname.endsWith(`.${VAYVA_DOMAIN}`)) {
    const storeSlug = cleanHostname.replace(`.${VAYVA_DOMAIN}`, '');
    return { storeSlug, isCustomDomain: false };
  }
  
  // It's a custom domain
  return { storeSlug: cleanHostname, isCustomDomain: true };
}

/**
 * Get tenant configuration from request headers or hostname
 */
export async function getTenantConfig(): Promise<TenantConfig | null> {
  const headersList = await headers();
  
  // Try to get from custom header (set by middleware)
  const storeId = headersList.get('x-store-id');
  const storeName = headersList.get('x-store-name');
  const templateId = headersList.get('x-template-id');
  const customDomain = headersList.get('x-custom-domain');
  const hostname = headersList.get('x-forwarded-host') || headersList.get('host') || '';
  
  if (!storeId || !templateId) {
    // Try to resolve from hostname directly
    const { storeSlug, isCustomDomain } = resolveTenantFromHostname(hostname);
    
    if (!storeSlug) {
      return null;
    }
    
    // In production, fetch from API/database
    // For now, return a mock config
    return {
      storeId: storeSlug,
      storeName: storeSlug,
      templateId: 'standard', // Default template
      customDomain: isCustomDomain ? hostname : undefined,
      isCustomDomain,
      primaryDomain: isCustomDomain ? hostname : `${storeSlug}.${VAYVA_DOMAIN}`,
    };
  }
  
  return {
    storeId,
    storeName: storeName || storeId,
    templateId,
    customDomain: customDomain || undefined,
    isCustomDomain: !!customDomain,
    primaryDomain: customDomain || `${storeId}.${VAYVA_DOMAIN}`,
  };
}

/**
 * Generate store URL
 */
export function getStoreUrl(storeSlug: string, customDomain?: string): string {
  if (customDomain) {
    return `https://${customDomain}`;
  }
  return `https://${storeSlug}.${VAYVA_DOMAIN}`;
}

/**
 * Check if domain is valid for SSL/custom cert
 */
export function isValidCustomDomain(domain: string): boolean {
  // Basic domain validation
  const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9](?:\.[a-zA-Z]{2,})+$/;
  return domainRegex.test(domain);
}

/**
 * Validate domain ownership (DNS check)
 * In production, this would verify CNAME/A records point to Vayva
 */
export async function validateDomainOwnership(
  _domain: string,
  _expectedStoreId: string
): Promise<{ valid: boolean; message?: string }> {
  // Mock validation - in production, check DNS records
  return { valid: true };
}
