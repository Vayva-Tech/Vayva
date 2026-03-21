// Permission constants for team/merchant
export const PERMISSIONS = {
  STORE_MANAGE: 'store:manage',
  ORDERS_MANAGE: 'orders:manage',
  PRODUCTS_MANAGE: 'products:manage',
  CUSTOMERS_MANAGE: 'customers:manage',
  MARKETING_MANAGE: 'marketing:manage',
  ANALYTICS_VIEW: 'analytics:view',
  SETTINGS_MANAGE: 'settings:manage',
  TEAM_MANAGE: 'team:manage',
  BILLING_MANAGE: 'billing:manage',
  SUPPORT_MANAGE: 'support:manage',
  INVENTORY_MANAGE: 'inventory:manage',
  REPORTS_VIEW: 'reports:view',
  DEVELOPER_TOOLS: 'developer:tools',
  INTEGRATIONS_MANAGE: 'integrations:manage',
  WEBHOOKS_MANAGE: 'webhooks:manage',
  API_KEYS_MANAGE: 'api_keys:manage',
  KITCHEN_MANAGE: 'kitchen:manage',
  DELIVERY_MANAGE: 'delivery:manage',
  LOYALTY_MANAGE: 'loyalty:manage',
  REFERRALS_MANAGE: 'referrals:manage',
  RESCUE_MANAGE: 'rescue:manage',
  EDUCATION_MANAGE: 'education:manage',
  AI_TOOLS: 'ai:tools',
} as const;

export type Permission = typeof PERMISSIONS[keyof typeof PERMISSIONS];

export function can(permission: Permission, userPermissions: string[]): boolean {
  return userPermissions.includes(permission) || userPermissions.includes('admin');
}

export function hasPermission(user: { permissions?: string[]; role?: string } | null | undefined, permission: Permission): boolean {
  return user?.permissions?.includes(permission) || user?.role === 'admin';
}
