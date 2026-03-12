/**
 * Extended Role System for Ops Console
 * 
 * Defines all team roles and their permissions for different
 * functional areas of the platform.
 */

// ============================================================================
// Role Definitions
// ============================================================================

export type OpsRole =
  | "OPS_OWNER"           // Platform owner - full access
  | "OPS_ADMIN"           // Administrator - can manage users, settings
  | "SUPERVISOR"          // Operations supervisor - can approve/reject
  | "OPERATOR"            // General operator - read-only most areas
  | "CUSTOMER_SUPPORT"    // Support agent - tickets, basic merchant view
  | "CUSTOMER_SUPPORT_LEAD" // Support lead - can escalate, view reports
  | "DEVELOPER"           // Dev team - API access, logs, technical
  | "DEVOPS"              // DevOps - infrastructure, health, monitoring
  | "INVESTOR"            // Investor/analyst - analytics, financial data
  | "FINANCE"             // Finance team - payments, refunds, revenue
  | "GROWTH_MANAGER"      // Growth - marketing, campaigns, partnerships
  | "CONTENT_MODERATOR"   // Content - marketplace listings, reviews
  | "COMPLIANCE_OFFICER"  // Compliance - KYC, fraud, risk flags
  | "OPS_SUPPORT";        // Legacy support role

const OPS_ROLES: OpsRole[] = [
  "OPS_OWNER",
  "OPS_ADMIN",
  "SUPERVISOR",
  "OPERATOR",
  "CUSTOMER_SUPPORT",
  "CUSTOMER_SUPPORT_LEAD",
  "DEVELOPER",
  "DEVOPS",
  "INVESTOR",
  "FINANCE",
  "GROWTH_MANAGER",
  "CONTENT_MODERATOR",
  "COMPLIANCE_OFFICER",
  "OPS_SUPPORT",
];

export function isOpsRole(value: unknown): value is OpsRole {
  return typeof value === "string" && OPS_ROLES.includes(value as OpsRole);
}

// ============================================================================
// Permission Categories
// ============================================================================

export type PermissionCategory =
  | "dashboard"           // Dashboard and overview
  | "analytics"           // Analytics and reporting
  | "merchants"           // Merchant management
  | "orders"              // Order management
  | "kyc"                 // KYC verification
  | "disputes"            // Dispute handling
  | "support"             // Support tickets
  | "users"               // User management
  | "finance"             // Financial operations
  | "settings"            // Platform settings
  | "audit"               // Audit logs
  | "communications"      // Communications/campaigns
  | "partners"            // Partner management
  | "risk"                // Risk management
  | "security"            // Security settings
  | "tools"               // System tools
  | "webhooks"            // Webhook logs
  | "rescue"              // Rescue/incident management
  | "growth"              // Growth/campaigns
  | "content";            // Content moderation

// ============================================================================
// Permission Actions
// ============================================================================

export type PermissionAction = "view" | "create" | "update" | "delete" | "approve" | "export";

// ============================================================================
// Permission Matrix
// ============================================================================

export const ROLE_PERMISSIONS: Record<OpsRole, Record<PermissionCategory, PermissionAction[] | "all">> = {
  OPS_OWNER: {
    dashboard: "all",
    analytics: "all",
    merchants: "all",
    orders: "all",
    kyc: "all",
    disputes: "all",
    support: "all",
    users: "all",
    finance: "all",
    settings: "all",
    audit: "all",
    communications: "all",
    partners: "all",
    risk: "all",
    security: "all",
    tools: "all",
    webhooks: "all",
    rescue: "all",
    growth: "all",
    content: "all",
  },
  
  OPS_ADMIN: {
    dashboard: ["view", "export"],
    analytics: ["view", "export"],
    merchants: ["view", "update", "export"],
    orders: ["view", "export"],
    kyc: ["view", "approve"],
    disputes: ["view", "approve"],
    support: ["view", "update"],
    users: ["view", "create", "update"],
    finance: ["view", "export"],
    settings: ["view", "update"],
    audit: ["view"],
    communications: ["view", "create", "update"],
    partners: ["view", "create", "update"],
    risk: ["view", "update"],
    security: ["view"],
    tools: ["view"],
    webhooks: ["view"],
    rescue: ["view", "update"],
    growth: ["view", "create", "update"],
    content: ["view", "update"],
  },
  
  SUPERVISOR: {
    dashboard: ["view", "export"],
    analytics: ["view", "export"],
    merchants: ["view", "update"],
    orders: ["view"],
    kyc: ["view", "approve"],
    disputes: ["view", "approve"],
    support: ["view", "update"],
    users: ["view"],
    finance: ["view"],
    settings: ["view"],
    audit: ["view"],
    communications: ["view", "create"],
    partners: ["view"],
    risk: ["view"],
    security: [],
    tools: ["view"],
    webhooks: ["view"],
    rescue: ["view", "update"],
    growth: ["view"],
    content: ["view"],
  },
  
  OPERATOR: {
    dashboard: ["view"],
    analytics: ["view"],
    merchants: ["view"],
    orders: ["view"],
    kyc: ["view"],
    disputes: ["view"],
    support: ["view", "update"],
    users: ["view"],
    finance: ["view"],
    settings: [],
    audit: [],
    communications: ["view"],
    partners: ["view"],
    risk: ["view"],
    security: [],
    tools: ["view"],
    webhooks: ["view"],
    rescue: ["view"],
    growth: ["view"],
    content: ["view"],
  },
  
  CUSTOMER_SUPPORT: {
    dashboard: ["view"],
    analytics: [],
    merchants: ["view"],
    orders: ["view"],
    kyc: [],
    disputes: ["view"],
    support: ["view", "create", "update"],
    users: [],
    finance: [],
    settings: [],
    audit: [],
    communications: [],
    partners: [],
    risk: [],
    security: [],
    tools: [],
    webhooks: [],
    rescue: ["view"],
    growth: [],
    content: [],
  },
  
  CUSTOMER_SUPPORT_LEAD: {
    dashboard: ["view"],
    analytics: ["view"],
    merchants: ["view"],
    orders: ["view"],
    kyc: ["view"],
    disputes: ["view", "update"],
    support: ["view", "create", "update", "delete"],
    users: ["view"],
    finance: ["view"],
    settings: [],
    audit: ["view"],
    communications: ["view"],
    partners: [],
    risk: ["view"],
    security: [],
    tools: [],
    webhooks: [],
    rescue: ["view"],
    growth: [],
    content: ["view"],
  },
  
  DEVELOPER: {
    dashboard: ["view"],
    analytics: ["view", "export"],
    merchants: ["view"],
    orders: ["view"],
    kyc: [],
    disputes: [],
    support: ["view"],
    users: [],
    finance: [],
    settings: ["view"],
    audit: ["view"],
    communications: [],
    partners: [],
    risk: ["view"],
    security: ["view"],
    tools: ["view", "create", "update"],
    webhooks: ["view", "export"],
    rescue: ["view", "update"],
    growth: [],
    content: [],
  },
  
  DEVOPS: {
    dashboard: ["view"],
    analytics: ["view", "export"],
    merchants: [],
    orders: [],
    kyc: [],
    disputes: [],
    support: [],
    users: [],
    finance: [],
    settings: ["view", "update"],
    audit: ["view"],
    communications: [],
    partners: [],
    risk: ["view"],
    security: ["view", "update"],
    tools: ["view", "create", "update", "delete"],
    webhooks: ["view"],
    rescue: ["view", "update"],
    growth: [],
    content: [],
  },
  
  INVESTOR: {
    dashboard: ["view"],
    analytics: ["view", "export"],
    merchants: ["view"],
    orders: ["view"],
    kyc: [],
    disputes: [],
    support: [],
    users: [],
    finance: ["view", "export"],
    settings: [],
    audit: [],
    communications: [],
    partners: ["view"],
    risk: [],
    security: [],
    tools: [],
    webhooks: [],
    rescue: [],
    growth: ["view"],
    content: [],
  },
  
  FINANCE: {
    dashboard: ["view"],
    analytics: ["view", "export"],
    merchants: ["view"],
    orders: ["view", "export"],
    kyc: ["view"],
    disputes: ["view", "approve"],
    support: ["view"],
    users: [],
    finance: ["view", "create", "update", "export"],
    settings: [],
    audit: ["view"],
    communications: [],
    partners: ["view"],
    risk: ["view"],
    security: [],
    tools: [],
    webhooks: [],
    rescue: [],
    growth: [],
    content: [],
  },
  
  GROWTH_MANAGER: {
    dashboard: ["view"],
    analytics: ["view", "export"],
    merchants: ["view", "update"],
    orders: ["view"],
    kyc: [],
    disputes: [],
    support: ["view"],
    users: [],
    finance: ["view"],
    settings: [],
    audit: [],
    communications: ["view", "create", "update"],
    partners: ["view", "create", "update"],
    risk: [],
    security: [],
    tools: [],
    webhooks: [],
    rescue: [],
    growth: ["view", "create", "update", "delete"],
    content: [],
  },
  
  CONTENT_MODERATOR: {
    dashboard: ["view"],
    analytics: [],
    merchants: ["view"],
    orders: [],
    kyc: [],
    disputes: [],
    support: [],
    users: [],
    finance: [],
    settings: [],
    audit: [],
    communications: [],
    partners: [],
    risk: [],
    security: [],
    tools: [],
    webhooks: [],
    rescue: [],
    growth: ["view"],
    content: ["view", "update", "delete"],
  },
  
  COMPLIANCE_OFFICER: {
    dashboard: ["view"],
    analytics: ["view", "export"],
    merchants: ["view", "update"],
    orders: ["view"],
    kyc: ["view", "approve"],
    disputes: ["view"],
    support: ["view"],
    users: ["view"],
    finance: ["view"],
    settings: [],
    audit: ["view", "export"],
    communications: [],
    partners: ["view"],
    risk: ["view", "update"],
    security: ["view"],
    tools: [],
    webhooks: ["view"],
    rescue: [],
    growth: [],
    content: ["view"],
  },
  
  OPS_SUPPORT: {
    dashboard: ["view"],
    analytics: [],
    merchants: ["view"],
    orders: ["view"],
    kyc: [],
    disputes: [],
    support: ["view", "update"],
    users: [],
    finance: [],
    settings: [],
    audit: [],
    communications: [],
    partners: [],
    risk: [],
    security: [],
    tools: [],
    webhooks: [],
    rescue: [],
    growth: [],
    content: [],
  },
};

// ============================================================================
// Role Metadata
// ============================================================================

export interface RoleMetadata {
  label: string;
  description: string;
  icon: string;
  level: number;
  category: "leadership" | "operations" | "technical" | "support" | "external";
}

export const ROLE_METADATA: Record<OpsRole, RoleMetadata> = {
  OPS_OWNER: {
    label: "Platform Owner",
    description: "Full access to all platform features and settings",
    icon: "Crown",
    level: 100,
    category: "leadership",
  },
  OPS_ADMIN: {
    label: "Administrator",
    description: "Can manage users, settings, and all operations",
    icon: "Shield",
    level: 90,
    category: "leadership",
  },
  SUPERVISOR: {
    label: "Operations Supervisor",
    description: "Can approve KYC, handle disputes, and manage operations",
    icon: "UsersThree",
    level: 70,
    category: "operations",
  },
  OPERATOR: {
    label: "Operations Operator",
    description: "Can view and manage day-to-day operations",
    icon: "Gear",
    level: 50,
    category: "operations",
  },
  CUSTOMER_SUPPORT: {
    label: "Support Agent",
    description: "Handles customer support tickets and inquiries",
    icon: "Headset",
    level: 30,
    category: "support",
  },
  CUSTOMER_SUPPORT_LEAD: {
    label: "Support Lead",
    description: "Manages support team and escalates complex issues",
    icon: "UserGear",
    level: 40,
    category: "support",
  },
  DEVELOPER: {
    label: "Developer",
    description: "Access to API logs, technical tools, and system data",
    icon: "Code",
    level: 60,
    category: "technical",
  },
  DEVOPS: {
    label: "DevOps Engineer",
    description: "Manages infrastructure, health monitoring, and deployments",
    icon: "Cloud",
    level: 70,
    category: "technical",
  },
  INVESTOR: {
    label: "Investor/Analyst",
    description: "Read-only access to analytics and financial data",
    icon: "ChartLineUp",
    level: 20,
    category: "external",
  },
  FINANCE: {
    label: "Finance Team",
    description: "Manages payments, refunds, and financial operations",
    icon: "CurrencyDollar",
    level: 60,
    category: "operations",
  },
  GROWTH_MANAGER: {
    label: "Growth Manager",
    description: "Manages marketing campaigns, partnerships, and growth",
    icon: "TrendUp",
    level: 50,
    category: "operations",
  },
  CONTENT_MODERATOR: {
    label: "Content Moderator",
    description: "Reviews marketplace listings and user-generated content",
    icon: "Eye",
    level: 30,
    category: "operations",
  },
  COMPLIANCE_OFFICER: {
    label: "Compliance Officer",
    description: "Manages KYC, fraud detection, and regulatory compliance",
    icon: "ShieldCheck",
    level: 60,
    category: "operations",
  },
  OPS_SUPPORT: {
    label: "Ops Support",
    description: "Basic operational support access",
    icon: "Question",
    level: 25,
    category: "support",
  },
};

// ============================================================================
// Permission Helpers
// ============================================================================

/**
 * Check if a role has a specific permission
 */
export function hasPermission(
  role: OpsRole,
  category: PermissionCategory,
  action: PermissionAction
): boolean {
  const permissions = ROLE_PERMISSIONS[role];
  if (!permissions) return false;

  const categoryPerms = permissions[category];
  if (categoryPerms === "all") return true;
  if (Array.isArray(categoryPerms)) {
    return categoryPerms.includes(action);
  }
  return false;
}

/**
 * Check if a role can access a category at all
 */
export function canAccess(role: OpsRole, category: PermissionCategory): boolean {
  const permissions = ROLE_PERMISSIONS[role];
  if (!permissions) return false;

  const categoryPerms = permissions[category];
  return categoryPerms === "all" || (Array.isArray(categoryPerms) && categoryPerms.length > 0);
}

/**
 * Get all permissions for a role in a category
 */
export function getPermissions(
  role: OpsRole,
  category: PermissionCategory
): PermissionAction[] {
  const permissions = ROLE_PERMISSIONS[role];
  if (!permissions) return [];

  const categoryPerms = permissions[category];
  if (categoryPerms === "all") {
    return ["view", "create", "update", "delete", "approve", "export"];
  }
  return categoryPerms || [];
}

/**
 * Get all accessible categories for a role
 */
export function getAccessibleCategories(role: OpsRole): PermissionCategory[] {
  const permissions = ROLE_PERMISSIONS[role];
  if (!permissions) return [];

  return Object.entries(permissions)
    .filter(([, perms]) => perms === "all" || (Array.isArray(perms) && perms.length > 0))
    .map(([category]) => category as PermissionCategory);
}

/**
 * Get all roles that have a specific permission
 */
export function getRolesWithPermission(
  category: PermissionCategory,
  action: PermissionAction
): OpsRole[] {
  return Object.keys(ROLE_PERMISSIONS).filter((role) =>
    hasPermission(role as OpsRole, category, action)
  ) as OpsRole[];
}

/**
 * Check if one role outranks another
 */
export function outranks(role1: OpsRole, role2: OpsRole): boolean {
  return ROLE_METADATA[role1].level > ROLE_METADATA[role2].level;
}

/**
 * Get roles that can be assigned by a given role
 */
export function getAssignableRoles(byRole: OpsRole): OpsRole[] {
  const byLevel = ROLE_METADATA[byRole].level;
  return Object.entries(ROLE_METADATA)
    .filter(([, meta]) => meta.level < byLevel)
    .map(([role]) => role as OpsRole);
}
