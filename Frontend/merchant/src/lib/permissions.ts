// Role-based permission system
// Defines granular permissions for different user roles

export type Permission =
  // Finance permissions
  | "finance:view"
  | "finance:edit_payouts"
  | "finance:export"
  | "finance:accounting"
  // Product permissions
  | "products:view"
  | "products:create"
  | "products:edit"
  | "products:delete"
  | "products:bulk_actions"
  | "products:import_export"
  // Order permissions
  | "orders:view"
  | "orders:manage"
  | "orders:refund"
  | "orders:export"
  // Customer permissions
  | "customers:view"
  | "customers:manage"
  | "customers:export"
  // Marketing permissions
  | "marketing:view"
  | "marketing:manage_campaigns"
  | "marketing:analytics"
  // B2B permissions
  | "b2b:view"
  | "b2b:manage_quotes"
  | "b2b:manage_credit"
  | "b2b:manage_requisitions"
  | "b2b:approve_quotes"
  // Events permissions
  | "events:view"
  | "events:manage"
  | "events:ticketing"
  // Nonprofit permissions
  | "nonprofit:view"
  | "nonprofit:manage_campaigns"
  | "nonprofit:manage_donations"
  | "nonprofit:manage_volunteers"
  | "nonprofit:manage_grants"
  // Settings permissions
  | "settings:view"
  | "settings:edit"
  | "settings:team_manage"
  | "settings:security"
  // KYC permissions
  | "kyc:view"
  | "kyc:submit"
  // Analytics permissions
  | "analytics:view"
  | "analytics:export"
  // Support permissions
  | "support:view"
  | "support:respond"
  // Admin permissions
  | "admin:full_access";

export type Role = "owner" | "admin" | "manager" | "staff" | "accountant" | "support";

interface RoleConfig {
  name: string;
  description: string;
  permissions: Permission[];
}

// Role definitions with their permission sets
export const ROLE_PERMISSIONS: Record<Role, RoleConfig> = {
  owner: {
    name: "Owner",
    description: "Full access to all features and settings",
    permissions: ["admin:full_access"],
  },
  admin: {
    name: "Admin",
    description: "Can manage most aspects except critical ownership settings",
    permissions: [
      "finance:view",
      "finance:edit_payouts",
      "finance:export",
      "finance:accounting",
      "products:view",
      "products:create",
      "products:edit",
      "products:delete",
      "products:bulk_actions",
      "products:import_export",
      "orders:view",
      "orders:manage",
      "orders:refund",
      "orders:export",
      "customers:view",
      "customers:manage",
      "customers:export",
      "marketing:view",
      "marketing:manage_campaigns",
      "marketing:analytics",
      "b2b:view",
      "b2b:manage_quotes",
      "b2b:manage_credit",
      "b2b:manage_requisitions",
      "b2b:approve_quotes",
      "events:view",
      "events:manage",
      "events:ticketing",
      "nonprofit:view",
      "nonprofit:manage_campaigns",
      "nonprofit:manage_donations",
      "nonprofit:manage_volunteers",
      "nonprofit:manage_grants",
      "settings:view",
      "settings:edit",
      "settings:team_manage",
      "settings:security",
      "kyc:view",
      "kyc:submit",
      "analytics:view",
      "analytics:export",
      "support:view",
      "support:respond",
    ],
  },
  manager: {
    name: "Manager",
    description: "Can manage products, orders, and view analytics",
    permissions: [
      "finance:view",
      "finance:export",
      "products:view",
      "products:create",
      "products:edit",
      "products:bulk_actions",
      "products:import_export",
      "orders:view",
      "orders:manage",
      "orders:export",
      "customers:view",
      "customers:manage",
      "customers:export",
      "marketing:view",
      "marketing:manage_campaigns",
      "marketing:analytics",
      "b2b:view",
      "b2b:manage_quotes",
      "b2b:manage_credit",
      "b2b:manage_requisitions",
      "events:view",
      "events:manage",
      "nonprofit:view",
      "nonprofit:manage_campaigns",
      "nonprofit:manage_donations",
      "nonprofit:manage_volunteers",
      "settings:view",
      "analytics:view",
      "analytics:export",
    ],
  },
  staff: {
    name: "Staff",
    description: "Can view and manage orders and customers",
    permissions: [
      "orders:view",
      "orders:manage",
      "customers:view",
      "customers:manage",
      "products:view",
      "support:view",
      "support:respond",
    ],
  },
  accountant: {
    name: "Accountant",
    description: "Access to financial data and accounting features",
    permissions: [
      "finance:view",
      "finance:export",
      "finance:accounting",
      "orders:view",
      "orders:export",
      "analytics:view",
      "analytics:export",
    ],
  },
  support: {
    name: "Support",
    description: "Can view orders and respond to customer inquiries",
    permissions: [
      "orders:view",
      "customers:view",
      "support:view",
      "support:respond",
    ],
  },
};

// Check if a role has a specific permission
export function hasPermission(role: Role, permission: Permission): boolean {
  const roleConfig = ROLE_PERMISSIONS[role];
  if (!roleConfig) return false;

  // Owner has all permissions
  if (roleConfig.permissions.includes("admin:full_access")) return true;

  return roleConfig.permissions.includes(permission);
}

// Check if a role has any of the specified permissions
export function hasAnyPermission(role: Role, permissions: Permission[]): boolean {
  return permissions.some((p) => hasPermission(role, p));
}

// Check if a role has all specified permissions
export function hasAllPermissions(role: Role, permissions: Permission[]): boolean {
  return permissions.every((p) => hasPermission(role, p));
}

// Get all permissions for a role
export function getRolePermissions(role: Role): Permission[] {
  const roleConfig = ROLE_PERMISSIONS[role];
  if (!roleConfig) return [];
  return [...roleConfig.permissions];
}

// Permission groups for UI organization
export const PERMISSION_GROUPS = {
  finance: [
    "finance:view",
    "finance:edit_payouts",
    "finance:export",
    "finance:accounting",
  ],
  products: [
    "products:view",
    "products:create",
    "products:edit",
    "products:delete",
    "products:bulk_actions",
    "products:import_export",
  ],
  orders: [
    "orders:view",
    "orders:manage",
    "orders:refund",
    "orders:export",
  ],
  customers: [
    "customers:view",
    "customers:manage",
    "customers:export",
  ],
  marketing: [
    "marketing:view",
    "marketing:manage_campaigns",
    "marketing:analytics",
  ],
  settings: [
    "settings:view",
    "settings:edit",
    "settings:team_manage",
    "settings:security",
  ],
  analytics: [
    "analytics:view",
    "analytics:export",
  ],
  support: [
    "support:view",
    "support:respond",
  ],
  b2b: ["b2b:view", "b2b:manage_quotes", "b2b:manage_credit", "b2b:manage_requisitions", "b2b:approve_quotes"],
  events: ["events:view", "events:manage", "events:ticketing"],
  nonprofit: ["nonprofit:view", "nonprofit:manage_campaigns", "nonprofit:manage_donations", "nonprofit:manage_volunteers", "nonprofit:manage_grants"],
} as const;

// Human-readable permission labels
export const PERMISSION_LABELS: Record<Permission, string> = {
  "finance:view": "View Finance",
  "finance:edit_payouts": "Edit Payouts",
  "finance:export": "Export Financial Data",
  "finance:accounting": "Access Accounting",
  "products:view": "View Products",
  "products:create": "Create Products",
  "products:edit": "Edit Products",
  "products:delete": "Delete Products",
  "products:bulk_actions": "Bulk Product Actions",
  "products:import_export": "Import/Export Products",
  "orders:view": "View Orders",
  "orders:manage": "Manage Orders",
  "orders:refund": "Process Refunds",
  "orders:export": "Export Orders",
  "customers:view": "View Customers",
  "customers:manage": "Manage Customers",
  "customers:export": "Export Customers",
  "marketing:view": "View Marketing",
  "marketing:manage_campaigns": "Manage Campaigns",
  "marketing:analytics": "Marketing Analytics",
  "b2b:view": "View B2B Features",
  "b2b:manage_quotes": "Manage B2B Quotes",
  "b2b:manage_credit": "Manage Credit Accounts",
  "b2b:manage_requisitions": "Manage Requisitions",
  "b2b:approve_quotes": "Approve B2B Quotes",
  "events:view": "View Events",
  "events:manage": "Manage Events",
  "events:ticketing": "Manage Ticketing",
  "nonprofit:view": "View Nonprofit Features",
  "nonprofit:manage_campaigns": "Manage Fundraising Campaigns",
  "nonprofit:manage_donations": "Manage Donations",
  "nonprofit:manage_volunteers": "Manage Volunteers",
  "nonprofit:manage_grants": "Manage Grants",
  "settings:view": "View Settings",
  "settings:edit": "Edit Settings",
  "settings:team_manage": "Manage Team",
  "settings:security": "Security Settings",
  "kyc:view": "View KYC Status",
  "kyc:submit": "Submit KYC",
  "analytics:view": "View Analytics",
  "analytics:export": "Export Analytics",
  "support:view": "View Support Tickets",
  "support:respond": "Respond to Tickets",
  "admin:full_access": "Full Admin Access",
};
