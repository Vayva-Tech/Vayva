
export const PERMISSIONS = {
  STORE_VIEW: "store:view",
  TEAM_MANAGE: "team:manage",
  TEAM_VIEW: "team:view",
  FINANCE_VIEW: "finance:view",
  REFUNDS_MANAGE: "refunds:manage",
  SETTINGS_VIEW: "settings:view",
  SETTINGS_EDIT: "settings:edit",
  SETTINGS_MANAGE: "settings:manage",
  PAYMENTS_VIEW: "payments:view",
  PAYMENTS_MANAGE: "payments:manage",
  PAYOUTS_MANAGE: "payouts:manage",
  PAYOUTS_VIEW: "payouts:view",
  DOMAINS_MANAGE: "domains:manage",
  DOMAINS_VIEW: "domains:view",
  INTEGRATIONS_MANAGE: "integrations:manage",
  TEMPLATES_MANAGE: "templates:manage",
  KYC_MANAGE: "kyc:manage",
  BILLING_MANAGE: "billing:manage",
  COMMERCE_MANAGE: "commerce:manage",
  COMMERCE_VIEW: "commerce:view",
  VIEWER: "viewer",
  METRICS_VIEW: "metrics:view",
  DASHBOARD_VIEW: "dashboard:view",
  OPS_VIEW: "ops:view",
  ORDERS_VIEW: "orders:view",
  ORDERS_MANAGE: "orders:manage",
  PRODUCTS_VIEW: "products:view",
  PRODUCTS_MANAGE: "products:manage",
  PRODUCTS_EDIT: "products:edit",
  MARKETING_MANAGE: "marketing:manage",
  MARKETING_VIEW: "marketing:view",
  FULFILLMENT_VIEW: "fulfillment:view",
  FULFILLMENT_MANAGE: "fulfillment:manage",
  SUPPORT_VIEW: "support:view",
  SUPPORT_MANAGE: "support:manage",
  CUSTOMERS_VIEW: "customers:view",
  CUSTOMERS_MANAGE: "customers:manage",
  INBOX_VIEW: "inbox:view",
  INBOX_MANAGE: "inbox:manage",
  NOTIFICATIONS_VIEW: "notifications:view",
  NOTIFICATIONS_MANAGE: "notifications:manage",
  PLATFORM_AUDIT_VIEW: "platform:audit:view",
  SECURITY_VIEW: "security:view",
  SECURITY_MANAGE: "security:manage",
  EXPORTS_VIEW: "exports:view",
  EXPORTS_MANAGE: "exports:manage",
  STOREFRONT_VIEW: "storefront:view",
  STOREFRONT_MANAGE: "storefront:manage",
  ONBOARDING_VIEW: "onboarding:view",
  ONBOARDING_MANAGE: "onboarding:manage",
  ACCOUNT_VIEW: "account:view",
  ACCOUNT_MANAGE: "account:manage",
  PORTFOLIO_VIEW: "portfolio:view",
  PORTFOLIO_MANAGE: "portfolio:manage",
  ANALYTICS_VIEW: "analytics:view",
  INVENTORY_VIEW: "inventory:view",
  INVENTORY_MANAGE: "inventory:manage",
  // Sensitive Action Gates
  REFUNDS_APPROVE: "refunds:approve",
  CAMPAIGNS_APPROVE: "campaigns:approve",
  POLICIES_APPROVE: "policies:approve",
  DELIVERY_APPROVE: "delivery:approve",
  APPROVALS_DECIDE: "approvals:decide",
  APPROVALS_REQUEST: "approvals:request",
  APPROVALS_VIEW: "approvals:view",
};

export const PERMISSION_GROUPS = [
  {
    name: "General",
    id: "general",
    permissions: [
      {
        id: PERMISSIONS.TEAM_MANAGE,
        label: "Manage Staff",
        description: "Invite and remove staff members",
      },
      {
        id: PERMISSIONS.SETTINGS_EDIT,
        label: "Manage Settings",
        description: "Edit store profile and general configurations",
      },
      {
        id: PERMISSIONS.PLATFORM_AUDIT_VIEW,
        label: "View Audit Logs",
        description: "See platform-wide activity logs",
      },
    ],
  },
  {
    name: "Sales & Orders",
    id: "sales",
    permissions: [
      {
        id: PERMISSIONS.ORDERS_MANAGE,
        label: "Manage Orders",
        description: "View and process customer orders",
      },
      {
        id: PERMISSIONS.PRODUCTS_MANAGE,
        label: "Manage Products",
        description: "Edit catalog and inventory",
      },
    ],
  },
  {
    name: "Finance",
    id: "finance",
    permissions: [
      {
        id: PERMISSIONS.BILLING_MANAGE,
        label: "Manage Billing",
        description: "View invoices and pay subscription",
      },
      {
        id: PERMISSIONS.REFUNDS_MANAGE,
        label: "Manage Refunds",
        description: "Initiate refund requests",
      },
      {
        id: PERMISSIONS.REFUNDS_APPROVE,
        label: "Approve Refunds",
        description: "SENSITIVE: High-level financial approval",
      },
    ],
  },
  {
    name: "Operations",
    id: "ops",
    permissions: [
      {
        id: PERMISSIONS.FULFILLMENT_MANAGE,
        label: "Manage Delivery",
        description: "Organize shipments and logistics",
      },
      {
        id: PERMISSIONS.APPROVALS_DECIDE,
        label: "Decide Approvals",
        description: "Approve or reject platform-level requests",
      },
    ],
  },
];

export type PermissionKey = string;

export const ROLES = {
  OWNER: "owner",
  ADMIN: "admin",
  STAFF: "staff",
  FINANCE: "finance",
  SUPPORT: "support",
  VIEWER: "viewer",
};

export const ROLE_PERMISSIONS = {
  [ROLES.OWNER]: ["*"], // wildcard
  [ROLES.ADMIN]: [
    PERMISSIONS.TEAM_MANAGE,
    PERMISSIONS.TEAM_VIEW,
    PERMISSIONS.FINANCE_VIEW,
    PERMISSIONS.REFUNDS_MANAGE,
    PERMISSIONS.SETTINGS_VIEW,
    PERMISSIONS.SETTINGS_EDIT,
    PERMISSIONS.PAYMENTS_VIEW,
    PERMISSIONS.PAYMENTS_MANAGE,
    PERMISSIONS.PAYOUTS_MANAGE,
    PERMISSIONS.PAYOUTS_VIEW,
    PERMISSIONS.DOMAINS_MANAGE,
    PERMISSIONS.DOMAINS_VIEW,
    PERMISSIONS.INTEGRATIONS_MANAGE,
    PERMISSIONS.TEMPLATES_MANAGE,
    PERMISSIONS.KYC_MANAGE,
    PERMISSIONS.BILLING_MANAGE,
    PERMISSIONS.COMMERCE_MANAGE,
    PERMISSIONS.COMMERCE_VIEW,
    PERMISSIONS.METRICS_VIEW,
    PERMISSIONS.DASHBOARD_VIEW,
    PERMISSIONS.ORDERS_VIEW,
    PERMISSIONS.ORDERS_MANAGE,
    PERMISSIONS.FULFILLMENT_VIEW,
    PERMISSIONS.FULFILLMENT_MANAGE,
    PERMISSIONS.PRODUCTS_VIEW,
    PERMISSIONS.PRODUCTS_MANAGE,
    PERMISSIONS.CUSTOMERS_VIEW,
    PERMISSIONS.CUSTOMERS_MANAGE,
    PERMISSIONS.SUPPORT_VIEW,
    PERMISSIONS.SUPPORT_MANAGE,
    PERMISSIONS.INBOX_VIEW,
    PERMISSIONS.INBOX_MANAGE,
    PERMISSIONS.NOTIFICATIONS_VIEW,
    PERMISSIONS.NOTIFICATIONS_MANAGE,
    PERMISSIONS.SECURITY_VIEW,
    PERMISSIONS.SECURITY_MANAGE,
    PERMISSIONS.EXPORTS_VIEW,
    PERMISSIONS.EXPORTS_MANAGE,
    PERMISSIONS.STOREFRONT_VIEW,
    PERMISSIONS.STOREFRONT_MANAGE,
    PERMISSIONS.ONBOARDING_VIEW,
    PERMISSIONS.ONBOARDING_MANAGE,
    PERMISSIONS.ANALYTICS_VIEW,
  ],
  [ROLES.STAFF]: [
    PERMISSIONS.SETTINGS_VIEW,
    PERMISSIONS.REFUNDS_MANAGE,
    PERMISSIONS.COMMERCE_MANAGE,
    PERMISSIONS.COMMERCE_VIEW,
    PERMISSIONS.ORDERS_VIEW,
    PERMISSIONS.ORDERS_MANAGE,
    PERMISSIONS.FULFILLMENT_VIEW,
    PERMISSIONS.PRODUCTS_VIEW,
    PERMISSIONS.CUSTOMERS_VIEW,
    PERMISSIONS.INBOX_VIEW,
    PERMISSIONS.NOTIFICATIONS_VIEW,
    PERMISSIONS.STOREFRONT_VIEW,
    PERMISSIONS.ACCOUNT_VIEW,
  ],
  [ROLES.FINANCE]: [
    PERMISSIONS.REFUNDS_MANAGE,
    PERMISSIONS.SETTINGS_VIEW,
    PERMISSIONS.PAYOUTS_MANAGE,
    PERMISSIONS.PAYOUTS_VIEW,
    PERMISSIONS.COMMERCE_VIEW,
    PERMISSIONS.ORDERS_VIEW,
    PERMISSIONS.METRICS_VIEW,
    PERMISSIONS.FINANCE_VIEW,
    PERMISSIONS.PAYMENTS_VIEW,
    PERMISSIONS.ACCOUNT_VIEW,
    PERMISSIONS.SECURITY_VIEW,
  ],
  [ROLES.SUPPORT]: [
    PERMISSIONS.SETTINGS_VIEW,
    PERMISSIONS.REFUNDS_MANAGE,
    PERMISSIONS.COMMERCE_VIEW,
    PERMISSIONS.ORDERS_VIEW,
    PERMISSIONS.ORDERS_MANAGE,
    PERMISSIONS.FULFILLMENT_VIEW,
    PERMISSIONS.SUPPORT_VIEW,
    PERMISSIONS.SUPPORT_MANAGE,
    PERMISSIONS.INBOX_VIEW,
    PERMISSIONS.NOTIFICATIONS_VIEW,
    PERMISSIONS.CUSTOMERS_VIEW,
    PERMISSIONS.ACCOUNT_VIEW,
  ],
  [ROLES.VIEWER]: [
    PERMISSIONS.VIEWER,
    PERMISSIONS.COMMERCE_VIEW,
    PERMISSIONS.SETTINGS_VIEW,
    PERMISSIONS.DASHBOARD_VIEW,
    PERMISSIONS.ORDERS_VIEW,
    PERMISSIONS.PRODUCTS_VIEW,
    PERMISSIONS.CUSTOMERS_VIEW,
    PERMISSIONS.INBOX_VIEW,
    PERMISSIONS.NOTIFICATIONS_VIEW,
  ],
};

export function can(role: string, action: string) {
  const normalizedRole = String(role || "").toLowerCase();
  const perms =
    ROLE_PERMISSIONS[normalizedRole as keyof typeof ROLE_PERMISSIONS] || [];
  if ((perms as string[]).includes("*")) return true;
  return (perms as string[]).includes(action);
}

export const PLAN_SEAT_LIMITS = {
  STARTER: 1, // Growth/Free
  GROWTH: 1,
  PRO: 5,
  ENTERPRISE: 20,
};

/**
 * Get the seat limit for a store based on its plan
 */
export async function getPlanSeatLimit(storeId: string) {
  // Dynamic import to avoid circular dependency issues
  const { prisma } = await import("@/lib/prisma");
  const store = await prisma.store?.findUnique({
    where: { id: storeId },
    select: { plan: true },
  });
  if (!store) return 1;
  const plan = store.plan;
  return PLAN_SEAT_LIMITS[plan as keyof typeof PLAN_SEAT_LIMITS] || 1;
}

/**
 * Check if a new member can be invited based on seat limits
 */
export async function canInviteMember(storeId: string) {
  const { prisma } = await import("@/lib/prisma");
  const limit = await getPlanSeatLimit(storeId);
  const current = await prisma.membership?.count({
    where: {
      storeId,
      status: "ACTIVE",
    },
  });
  // Pending invites also consume seats to prevent invite spam
  const pending = await prisma.staffInvite?.count({
    where: { storeId },
  });
  const used = current + pending;
  return {
    allowed: used < limit,
    limit,
    current: used,
  };
}
