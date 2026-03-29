/**
 * Enhanced Audit Logging System
 * Comprehensive tracking of security-sensitive and business-critical events
 * 
 * MIGRATED: Now calls backend API instead of direct Prisma queries
 */

import { logger } from "@vayva/shared";

const BACKEND_URL = process.env.BACKEND_API_URL || '';

export enum AuditEventType {
  // Authentication & Security
  LOGIN_SUCCESS = "LOGIN_SUCCESS",
  LOGIN_FAILED = "LOGIN_FAILED",
  LOGOUT = "LOGOUT",
  PASSWORD_CHANGED = "PASSWORD_CHANGED",
  PASSWORD_RESET_REQUESTED = "PASSWORD_RESET_REQUESTED",
  PASSWORD_RESET_COMPLETED = "PASSWORD_RESET_COMPLETED",
  TWO_FA_ENABLED = "TWO_FA_ENABLED",
  TWO_FA_DISABLED = "TWO_FA_DISABLED",
  SESSION_CREATED = "SESSION_CREATED",
  SESSION_TERMINATED = "SESSION_TERMINATED",
  
  // Authorization
  PERMISSION_GRANTED = "PERMISSION_GRANTED",
  PERMISSION_REVOKED = "PERMISSION_REVOKED",
  ROLE_CHANGED = "ROLE_CHANGED",
  TEAM_MEMBER_INVITED = "TEAM_MEMBER_INVITED",
  TEAM_MEMBER_REMOVED = "TEAM_MEMBER_REMOVED",
  
  // Data Access
  SENSITIVE_DATA_ACCESSED = "SENSITIVE_DATA_ACCESSED",
  BULK_DATA_EXPORTED = "BULK_DATA_EXPORTED",
  DATA_IMPORTED = "DATA_IMPORTED",
  
  // Financial Operations
  PAYMENT_PROCESSED = "PAYMENT_PROCESSED",
  PAYMENT_FAILED = "PAYMENT_FAILED",
  REFUND_ISSUED = "REFUND_ISSUED",
  PAYOUT_INITIATED = "PAYOUT_INITIATED",
  PAYOUT_COMPLETED = "PAYOUT_COMPLETED",
  INVOICE_GENERATED = "INVOICE_GENERATED",
  
  // Account Management
  ACCOUNT_CREATED = "ACCOUNT_CREATED",
  ACCOUNT_UPDATED = "ACCOUNT_UPDATED",
  ACCOUNT_DELETION_REQUESTED = "ACCOUNT_DELETION_REQUESTED",
  ACCOUNT_DELETION_CANCELLED = "ACCOUNT_DELETION_CANCELLED",
  ACCOUNT_DELETION_COMPLETED = "ACCOUNT_DELETION_COMPLETED",
  
  // Product & Inventory
  PRODUCT_CREATED = "PRODUCT_CREATED",
  PRODUCT_UPDATED = "PRODUCT_UPDATED",
  PRODUCT_DELETED = "PRODUCT_DELETED",
  INVENTORY_ADJUSTED = "INVENTORY_ADJUSTED",
  PRICE_CHANGED = "PRICE_CHANGED",
  
  // Order Management
  ORDER_CREATED = "ORDER_CREATED",
  ORDER_UPDATED = "ORDER_UPDATED",
  ORDER_CANCELLED = "ORDER_CANCELLED",
  ORDER_REFUNDED = "ORDER_REFUNDED",
  ORDER_STATUS_CHANGED = "ORDER_STATUS_CHANGED",
  
  // Customer Management
  CUSTOMER_CREATED = "CUSTOMER_CREATED",
  CUSTOMER_UPDATED = "CUSTOMER_UPDATED",
  CUSTOMER_DELETED = "CUSTOMER_DELETED",
  CUSTOMER_DATA_EXPORTED = "CUSTOMER_DATA_EXPORTED",
  
  // Marketing
  DISCOUNT_CREATED = "DISCOUNT_CREATED",
  DISCOUNT_UPDATED = "DISCOUNT_UPDATED",
  DISCOUNT_DELETED = "DISCOUNT_DELETED",
  CAMPAIGN_SENT = "CAMPAIGN_SENT",
  
  // Settings & Configuration
  SETTINGS_UPDATED = "SETTINGS_UPDATED",
  INTEGRATION_ENABLED = "INTEGRATION_ENABLED",
  INTEGRATION_DISABLED = "INTEGRATION_DISABLED",
  API_KEY_CREATED = "API_KEY_CREATED",
  API_KEY_REVOKED = "API_KEY_REVOKED",
  DOMAIN_ADDED = "DOMAIN_ADDED",
  DOMAIN_VERIFIED = "DOMAIN_VERIFIED",
  
  // Compliance
  KYC_SUBMITTED = "KYC_SUBMITTED",
  KYC_APPROVED = "KYC_APPROVED",
  KYC_REJECTED = "KYC_REJECTED",
  GDPR_REQUEST_RECEIVED = "GDPR_REQUEST_RECEIVED",
  GDPR_REQUEST_COMPLETED = "GDPR_REQUEST_COMPLETED",
  
  // Security Events
  RATE_LIMIT_EXCEEDED = "RATE_LIMIT_EXCEEDED",
  CSRF_VIOLATION_DETECTED = "CSRF_VIOLATION_DETECTED",
  SUSPICIOUS_ACTIVITY_DETECTED = "SUSPICIOUS_ACTIVITY_DETECTED",
  BRUTE_FORCE_ATTEMPT = "BRUTE_FORCE_ATTEMPT",
  SQL_INJECTION_ATTEMPT = "SQL_INJECTION_ATTEMPT",
  XSS_ATTEMPT = "XSS_ATTEMPT",
  
  // Support
  SUPPORT_TICKET_CREATED = "SUPPORT_TICKET_CREATED",
  SUPPORT_TICKET_UPDATED = "SUPPORT_TICKET_UPDATED",
  SUPPORT_TICKET_RESOLVED = "SUPPORT_TICKET_RESOLVED",
  DISPUTE_OPENED = "DISPUTE_OPENED",
  DISPUTE_RESOLVED = "DISPUTE_RESOLVED",
  
  // System
  WEBHOOK_RECEIVED = "WEBHOOK_RECEIVED",
  WEBHOOK_SENT = "WEBHOOK_SENT",
  CRON_JOB_EXECUTED = "CRON_JOB_EXECUTED",
  SYSTEM_ERROR = "SYSTEM_ERROR",
}

export interface AuditEventMeta {
  ipAddress?: string;
  userAgent?: string;
  targetType?: string;
  targetId?: string;
  reason?: string;
  changes?: Record<string, unknown>;
  meta?: Record<string, unknown>;
}

export interface SuspiciousActivityReport {
  failedLoginAttempts: number;
  rateLimitViolations: number;
  csrfViolations: number;
  bruteForceAttempts: number;
  unusualDataAccess: number;
}

/**
 * Log an audit event to the database via backend API
 */
export async function logAuditEvent(
  storeId: string | null,
  userId: string,
  eventType: AuditEventType,
  meta: AuditEventMeta = {}
): Promise<void> {
  try {
    const token = await getAuthToken();
    const res = await fetch(`${BACKEND_URL}/api/v1/audit/log`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        eventType,
        userId,
        storeId,
        meta,
      }),
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({ error: { message: 'Failed to log audit event' } }));
      logger.error('[AUDIT] Failed to log event', error);
    }
  } catch (error) {
    logger.error('[AUDIT] Error logging event', error);
    // Don't throw - audit logging failure shouldn't break main operation
  }
}

/**
 * Get audit logs for a store with filtering
 */
export async function getAuditLogs(options: {
  storeId: string;
  userId?: string;
  eventType?: AuditEventType;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}) {
  const { storeId, userId, eventType, startDate, endDate, limit = 50, offset = 0 } = options;

  try {
    const token = await getAuthToken();
    const params = new URLSearchParams({
      storeId,
      limit: String(limit),
      offset: String(offset),
    });

    if (userId) params.append('userId', userId);
    if (eventType) params.append('eventType', eventType);
    if (startDate) params.append('startDate', startDate.toISOString());
    if (endDate) params.append('endDate', endDate.toISOString());

    const res = await fetch(`${BACKEND_URL}/api/v1/audit/logs?${params.toString()}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      throw new Error('Failed to fetch audit logs');
    }

    const data = await res.json();
    return data;
  } catch (error) {
    logger.error('[AUDIT] Error fetching logs', error);
    return {
      logs: [],
      total: 0,
      hasMore: false,
    };
  }
}

/**
 * Get suspicious activity report
 */
export async function getSuspiciousActivityReport(storeId: string, days = 7): Promise<SuspiciousActivityReport> {
  try {
    const token = await getAuthToken();
    const res = await fetch(
      `${BACKEND_URL}/api/v1/audit/suspicious-report?storeId=${storeId}&days=${days}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }
    );

    if (!res.ok) {
      throw new Error('Failed to fetch suspicious activity report');
    }

    const data = await res.json();
    return data;
  } catch (error) {
    logger.error('[AUDIT] Error fetching suspicious activity report', error);
    return {
      failedLoginAttempts: 0,
      rateLimitViolations: 0,
      csrfViolations: 0,
      bruteForceAttempts: 0,
      unusualDataAccess: 0,
    };
  }
}

/**
 * Export audit logs for compliance
 */
export async function exportAuditLogs(
  storeId: string,
  startDate: Date,
  endDate: Date
): Promise<string> {
  try {
    const token = await getAuthToken();
    const res = await fetch(`${BACKEND_URL}/api/v1/audit/export`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        storeId,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      }),
    });

    if (!res.ok) {
      throw new Error('Failed to export audit logs');
    }

    return await res.text();
  } catch (error) {
    logger.error('[AUDIT] Error exporting logs', error);
    return '';
  }
}

/**
 * Get recent activity summary
 */
export async function getRecentActivitySummary(storeId: string, hours = 24): Promise<{
  totalEvents: number;
  uniqueUsers: number;
  topEventTypes: Array<{ eventType: string; count: number }>;
  suspiciousEvents: number;
}> {
  try {
    const token = await getAuthToken();
    const res = await fetch(
      `${BACKEND_URL}/api/v1/audit/activity-summary?storeId=${storeId}&hours=${hours}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }
    );

    if (!res.ok) {
      throw new Error('Failed to fetch activity summary');
    }

    const data = await res.json();
    return data;
  } catch (error) {
    logger.error('[AUDIT] Error fetching activity summary', error);
    return {
      totalEvents: 0,
      uniqueUsers: 0,
      topEventTypes: [],
      suspiciousEvents: 0,
    };
  }
}

/**
 * Clear old audit logs (retention policy)
 */
export async function clearOldAuditLogs(retentionDays = 90): Promise<number> {
  try {
    const token = await getAuthToken();
    const res = await fetch(`${BACKEND_URL}/api/v1/audit/cleanup`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ retentionDays }),
    });

    if (!res.ok) {
      throw new Error('Failed to clear old audit logs');
    }

    const data = await res.json();
    return data.data.deletedCount;
  } catch (error) {
    logger.error('[AUDIT] Error clearing old logs', error);
    return 0;
  }
}

/**
 * Get auth token from cookies
 */
async function getAuthToken(): Promise<string | null> {
  try {
    const { cookies } = await import('next/headers');
    const cookieStore = await cookies();
    return cookieStore.get('auth_token')?.value || null;
  } catch {
    return null;
  }
}
