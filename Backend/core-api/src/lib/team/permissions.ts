import { prisma } from "@vayva/db";

export const PERMISSIONS = {
  TEAM_MANAGE: "team:manage",
  TEAM_VIEW: "team:view",
  TEAM_CREATE: "team:create",
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
  CART_VIEW: "cart:view",
  CART_MANAGE: "cart:manage",
  // Marketing & Discounts
  DISCOUNT_VIEW: "discount:view",
  DISCOUNT_MANAGE: "discount:manage",
  // Billing
  BILLING_VIEW: "billing:view",
  // Education
  COURSES_VIEW: "courses:view",
  COURSES_CREATE: "courses:create",
  COURSES_MANAGE: "courses:manage",
  ENROLLMENTS_VIEW: "enrollments:view",
  ENROLLMENTS_CREATE: "enrollments:create",
  ENROLLMENTS_MANAGE: "enrollments:manage",
  STUDENTS_VIEW: "students:view",
  STUDENTS_CREATE: "students:create",
  STUDENTS_MANAGE: "students:manage",
  INSTRUCTORS_VIEW: "instructors:view",
  INSTRUCTORS_CREATE: "instructors:create",
  INSTRUCTORS_MANAGE: "instructors:manage",
  ASSESSMENTS_VIEW: "assessments:view",
  ASSESSMENTS_CREATE: "assessments:create",
  ASSESSMENTS_MANAGE: "assessments:manage",
  GRADES_VIEW: "grades:view",
  GRADES_CREATE: "grades:create",
  GRADES_MANAGE: "grades:manage",
  // Sensitive Action Gates
  REFUNDS_APPROVE: "refunds:approve",
  // Additional Education & AI
  CUSTOMERS_CREATE: "customers:create",
  CUSTOMERS_UPDATE: "customers:update",
  CUSTOMERS_DELETE: "customers:delete",
  AI_ASSISTANT_USE: "ai:assistant:use",
  ANALYTICS_CREATE: "analytics:create",
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
    PERMISSIONS.CART_VIEW,
    PERMISSIONS.CART_MANAGE,
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
    PERMISSIONS.CART_VIEW,
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
    PERMISSIONS.CART_VIEW,
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
    PERMISSIONS.CART_VIEW,
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
    PERMISSIONS.CART_VIEW,
  ],
};

export function can(role: string, action: string) {
  const normalizedRole = String(role || "").toLowerCase();
  const perms =
    ROLE_PERMISSIONS[normalizedRole as keyof typeof ROLE_PERMISSIONS] || [];
  if ((perms as string[]).includes("*")) return true;
  return (perms as string[]).includes(action);
}

/**
 * Server-side check: verifying if a specific user has permission in a store.
 * Requires fetching the membership role and its associated permissions.
 */
export async function hasPermission(
  userId: string,
  storeId: string,
  permission: string,
) {
  const membership = await prisma.membership.findUnique({
    where: {
      userId_storeId: {
        userId,
        storeId,
      },
    },
    include: {
      role: {
        include: {
          rolePermissions: {
            include: {
              permission: true,
            },
          },
        },
      },
    },
  });

  if (!membership) return false;

  // 1. Check Custom Role (DB)
  if (membership.role) {
    // STRICT CHECK: If a custom role is assigned, we purely rely on it.
    // We do NOT fall back to the system role `role_enum` if the permission is missing here.
    return membership.role.rolePermissions.some(
      (rp) => rp.permission.key === permission,
    );
  }

  // 2. Fallback to System Role (Hardcoded map) ONLY if no custom role exists
  const role = membership.role_enum.toLowerCase();
  return can(role, permission);
}

export const PLAN_SEAT_LIMITS = {
  STARTER: 1, // Growth/Free
  GROWTH: 1,
  PRO: 5,
  ENTERPRISE: 20,
};

export async function getPlanSeatLimit(storeId: string) {
  const store = await prisma.store.findUnique({
    where: { id: storeId },
    select: { plan: true },
  });
  if (!store) return 1;
  const plan = store.plan;
  return PLAN_SEAT_LIMITS[plan as keyof typeof PLAN_SEAT_LIMITS] || 1;
}

export async function canInviteMember(storeId: string) {
  const limit = await getPlanSeatLimit(storeId);
  const current = await prisma.membership.count({
    where: {
      storeId,
      status: "ACTIVE",
    },
  });
  const pending = await prisma.staffInvite.count({
    where: { storeId },
  });
  const used = current + pending;
  return {
    allowed: used < limit,
    limit,
    current: used,
  };
}
