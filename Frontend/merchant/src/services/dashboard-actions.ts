/**
 * Dashboard Actions Service
 * Provides suggested actions and industry insights for merchant dashboard
 */
export interface SuggestedAction {
  id: string;
  title: string;
  description?: string;
  actionType?: string;
  priority?: string;
  severity?: "info" | "warning" | "error" | "critical";
  link?: string;
  href?: string;
  icon?: string;
  reason?: string;
}

export enum AuditEventType {
  USER_LOGIN = "USER_LOGIN",
  USER_LOGOUT = "USER_LOGOUT",
  ORDER_CREATED = "ORDER_CREATED",
  ORDER_UPDATED = "ORDER_UPDATED",
  PRODUCT_CREATED = "PRODUCT_CREATED",
  PRODUCT_UPDATED = "PRODUCT_UPDATED",
  PRODUCT_DELETED = "PRODUCT_DELETED",
  SETTINGS_CHANGED = "SETTINGS_CHANGED",
  PAYMENT_PROCESSED = "PAYMENT_PROCESSED",
  REFUND_ISSUED = "REFUND_ISSUED",
  SECURITY_RATE_LIMIT_BLOCKED = "SECURITY_RATE_LIMIT_BLOCKED",
}

/**
 * Fetch industry-specific data for the dashboard
 */
export async function fetchIndustryData(storeId: string): Promise<{ data: any }> {
  const res = await fetch(`/api/dashboard/industry?storeId=${storeId}`);
  if (!res.ok) {
    throw new Error(`Failed to fetch industry data: ${res.statusText}`);
  }
  return res.json();
}

/**
 * Fetch KPI metrics for the dashboard
 */
export async function fetchKPIs(storeId: string): Promise<{ kpis: any[] }> {
  const res = await fetch(`/api/dashboard/kpis?storeId=${storeId}`);
  if (!res.ok) {
    throw new Error(`Failed to fetch KPIs: ${res.statusText}`);
  }
  return res.json();
}

/**
 * Fetch dashboard overview data
 */
export async function fetchOverview(storeId: string): Promise<{ overview: any }> {
  const res = await fetch(`/api/dashboard/overview?storeId=${storeId}`);
  if (!res.ok) {
    throw new Error(`Failed to fetch overview: ${res.statusText}`);
  }
  return res.json();
}
