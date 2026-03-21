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
export declare enum AuditEventType {
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
    SECURITY_RATE_LIMIT_BLOCKED = "SECURITY_RATE_LIMIT_BLOCKED"
}
/**
 * Fetch industry-specific data for the dashboard
 */
export declare function fetchIndustryData(storeId: string): Promise<{
    data: unknown;
}>;
/**
 * Fetch KPI metrics for the dashboard
 */
export declare function fetchKPIs(storeId: string): Promise<{
    kpis: unknown[];
}>;
/**
 * Fetch dashboard overview data
 */
export declare function fetchOverview(storeId: string): Promise<{
    overview: unknown;
}>;
