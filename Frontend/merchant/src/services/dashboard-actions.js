export var AuditEventType;
(function (AuditEventType) {
    AuditEventType["USER_LOGIN"] = "USER_LOGIN";
    AuditEventType["USER_LOGOUT"] = "USER_LOGOUT";
    AuditEventType["ORDER_CREATED"] = "ORDER_CREATED";
    AuditEventType["ORDER_UPDATED"] = "ORDER_UPDATED";
    AuditEventType["PRODUCT_CREATED"] = "PRODUCT_CREATED";
    AuditEventType["PRODUCT_UPDATED"] = "PRODUCT_UPDATED";
    AuditEventType["PRODUCT_DELETED"] = "PRODUCT_DELETED";
    AuditEventType["SETTINGS_CHANGED"] = "SETTINGS_CHANGED";
    AuditEventType["PAYMENT_PROCESSED"] = "PAYMENT_PROCESSED";
    AuditEventType["REFUND_ISSUED"] = "REFUND_ISSUED";
    AuditEventType["SECURITY_RATE_LIMIT_BLOCKED"] = "SECURITY_RATE_LIMIT_BLOCKED";
})(AuditEventType || (AuditEventType = {}));
/**
 * Fetch industry-specific data for the dashboard
 */
export async function fetchIndustryData(storeId) {
    const res = await fetch(`/api/dashboard/industry?storeId=${storeId}`);
    if (!res.ok) {
        throw new Error(`Failed to fetch industry data: ${res.statusText}`);
    }
    return res.json();
}
/**
 * Fetch KPI metrics for the dashboard
 */
export async function fetchKPIs(storeId) {
    const res = await fetch(`/api/dashboard/kpis?storeId=${storeId}`);
    if (!res.ok) {
        throw new Error(`Failed to fetch KPIs: ${res.statusText}`);
    }
    return res.json();
}
/**
 * Fetch dashboard overview data
 */
export async function fetchOverview(storeId) {
    const res = await fetch(`/api/dashboard/overview?storeId=${storeId}`);
    if (!res.ok) {
        throw new Error(`Failed to fetch overview: ${res.statusText}`);
    }
    return res.json();
}
