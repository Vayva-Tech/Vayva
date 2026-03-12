/**
 * Permission Manager - Capability-based access control for add-ons
 * 
 * Each add-on declares required permissions, and the host grants
 * only what's explicitly allowed by the merchant.
 */

export type AddOnPermission =
  // Data Access
  | 'read:store-data'      // Basic store info (name, logo, contact)
  | 'read:products'        // Product catalog access
  | 'read:orders'          // Order history (own store only)
  | 'read:customers'       // Customer list
  | 'read:analytics'       // Store analytics
  | 'write:products'       // Modify products
  | 'write:orders'         // Update order status
  | 'write:customers'      // Modify customer data
  
  // UI/UX
  | 'ui:mount-header'      // Mount to header areas
  | 'ui:mount-product'     // Mount to product pages
  | 'ui:mount-footer'      // Mount to footer areas
  | 'ui:mount-floating'    // Create floating elements
  | 'ui:modal'             // Show modal dialogs
  | 'ui:toast'             // Show toast notifications
  | 'ui:custom-css'        // Inject custom CSS
  
  // External
  | 'network:external-api' // Call external APIs
  | 'network:webhook'      // Register webhooks
  | 'storage:local'        // Use localStorage
  | 'storage:session'        // Use sessionStorage
  | 'storage:server'       // Server-side persisted storage
  
  // Advanced
  | 'advanced:scheduled-job'   // Register cron jobs
  | 'advanced:email-send'      // Send emails via Vayva
  | 'advanced:sms-send'        // Send SMS via Vayva
  | 'advanced:payment'       // Process payments
  | 'advanced:shipping'      // Access shipping carriers
  | 'advanced:ai-generation' // Use AI generation APIs
  | 'advanced:third-party-auth'; // OAuth flows

export interface PermissionSet {
  granted: AddOnPermission[];
  denied: AddOnPermission[];
  /** Human-readable descriptions for UI */
  descriptions: Record<AddOnPermission, string>;
}

export const PERMISSION_DESCRIPTIONS: Record<AddOnPermission, string> = {
  'read:store-data': 'View your store name, logo, and contact information',
  'read:products': 'View your product catalog and inventory',
  'read:orders': 'View order history and details',
  'read:customers': 'View customer list and basic info',
  'read:analytics': 'View store performance metrics',
  'write:products': 'Add, edit, or delete products',
  'write:orders': 'Update order status and fulfillment',
  'write:customers': 'Modify customer information',
  'ui:mount-header': 'Add components to your website header',
  'ui:mount-product': 'Add components to product pages',
  'ui:mount-footer': 'Add components to your website footer',
  'ui:mount-floating': 'Add floating buttons or widgets',
  'ui:modal': 'Show popup dialogs',
  'ui:toast': 'Show notification messages',
  'ui:custom-css': 'Apply custom styling',
  'network:external-api': 'Connect to external services',
  'network:webhook': 'Receive real-time updates from external services',
  'storage:local': 'Store data in browser memory',
  'storage:session': 'Store temporary session data',
  'storage:server': 'Store data permanently on our servers',
  'advanced:scheduled-job': 'Run automated tasks on schedule',
  'advanced:email-send': 'Send emails to your customers',
  'advanced:sms-send': 'Send SMS messages',
  'advanced:payment': 'Process payments',
  'advanced:shipping': 'Access shipping and delivery services',
  'advanced:ai-generation': 'Use AI for content and image generation',
  'advanced:third-party-auth': 'Connect to third-party accounts',
};

export const PERMISSION_CATEGORIES: Record<string, AddOnPermission[]> = {
  'Data Access': [
    'read:store-data',
    'read:products',
    'read:orders',
    'read:customers',
    'read:analytics',
    'write:products',
    'write:orders',
    'write:customers',
  ],
  'UI Components': [
    'ui:mount-header',
    'ui:mount-product',
    'ui:mount-footer',
    'ui:mount-floating',
    'ui:modal',
    'ui:toast',
    'ui:custom-css',
  ],
  'External Services': [
    'network:external-api',
    'network:webhook',
    'storage:local',
    'storage:session',
    'storage:server',
  ],
  'Advanced Features': [
    'advanced:scheduled-job',
    'advanced:email-send',
    'advanced:sms-send',
    'advanced:payment',
    'advanced:shipping',
    'advanced:ai-generation',
    'advanced:third-party-auth',
  ],
};

export class PermissionManager {
  private grantedPermissions: Set<AddOnPermission> = new Set();
  private permissionChecks: Map<AddOnPermission, () => boolean> = new Map();

  constructor(initialPermissions?: AddOnPermission[]) {
    if (initialPermissions) {
      initialPermissions.forEach((p) => this.grantedPermissions.add(p));
    }
    this.setupDefaultChecks();
  }

  /**
   * Grant a permission to the add-on
   */
  grant(permission: AddOnPermission): void {
    this.grantedPermissions.add(permission);
  }

  /**
   * Revoke a permission
   */
  revoke(permission: AddOnPermission): void {
    this.grantedPermissions.delete(permission);
  }

  /**
   * Check if a permission is granted
   */
  has(permission: AddOnPermission): boolean {
    // Check custom validator if exists
    const check = this.permissionChecks.get(permission);
    if (check && !check()) return false;

    return this.grantedPermissions.has(permission);
  }

  /**
   * Check multiple permissions (all must be granted)
   */
  hasAll(permissions: AddOnPermission[]): boolean {
    return permissions.every((p) => this.has(p));
  }

  /**
   * Check if any of the permissions are granted
   */
  hasAny(permissions: AddOnPermission[]): boolean {
    return permissions.some((p) => this.has(p));
  }

  /**
   * Get all granted permissions
   */
  getGranted(): AddOnPermission[] {
    return Array.from(this.grantedPermissions);
  }

  /**
   * Register a custom permission check
   */
  registerCheck(permission: AddOnPermission, check: () => boolean): void {
    this.permissionChecks.set(permission, check);
  }

  /**
   * Validate requested permissions against granted set
   */
  validateRequested(
    requested: AddOnPermission[]
  ): { valid: true } | { valid: false; missing: AddOnPermission[] } {
    const missing = requested.filter((p) => !this.has(p));
    if (missing.length === 0) {
      return { valid: true };
    }
    return { valid: false, missing };
  }

  /**
   * Create permission descriptor for UI display
   */
  describe(permission: AddOnPermission): {
    id: AddOnPermission;
    label: string;
    description: string;
    granted: boolean;
    category: string;
  } {
    const category = Object.entries(PERMISSION_CATEGORIES).find(([, perms]) =>
      perms.includes(permission)
    )?.[0] || 'Other';

    return {
      id: permission,
      label: this.formatPermissionLabel(permission),
      description: PERMISSION_DESCRIPTIONS[permission],
      granted: this.has(permission),
      category,
    };
  }

  private setupDefaultChecks(): void {
    // Example: Advanced permissions might require plan upgrade
    this.permissionChecks.set('advanced:ai-generation', () => {
      // Would check if store has AI add-on enabled
      return true;
    });

    this.permissionChecks.set('advanced:payment', () => {
      // Would check if store has payment processing enabled
      return true;
    });
  }

  private formatPermissionLabel(permission: AddOnPermission): string {
    return permission
      .split(':')
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' - ');
  }
}

/**
 * Generate default permission set based on add-on category
 */
export function getDefaultPermissionsForCategory(
  category: string
): AddOnPermission[] {
  const base: AddOnPermission[] = [
    'read:store-data',
    'ui:mount-floating',
    'storage:local',
  ];

  switch (category) {
    case 'ecommerce':
      return [
        ...base,
        'read:products',
        'read:orders',
        'ui:mount-product',
        'ui:mount-header',
        'network:external-api',
      ];
    case 'booking':
      return [
        ...base,
        'read:orders',
        'write:orders',
        'ui:mount-product',
        'advanced:scheduled-job',
        'advanced:email-send',
      ];
    case 'marketing':
      return [
        ...base,
        'read:customers',
        'read:analytics',
        'ui:mount-footer',
        'ui:toast',
        'advanced:email-send',
        'network:webhook',
      ];
    case 'content':
      return [...base, 'ui:mount-product', 'ui:custom-css', 'storage:server'];
    case 'operations':
      return [
        ...base,
        'read:orders',
        'read:analytics',
        'write:orders',
        'advanced:scheduled-job',
      ];
    case 'integration':
      return [
        ...base,
        'network:external-api',
        'network:webhook',
        'storage:server',
        'advanced:third-party-auth',
      ];
    default:
      return base;
  }
}
