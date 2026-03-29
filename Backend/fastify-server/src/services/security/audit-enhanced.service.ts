import { prisma } from '@vayva/db';
import { logger } from '@vayva/shared';

/**
 * Enhanced Audit Logging Service
 * Comprehensive tracking of security-sensitive and business-critical events
 */

export enum AuditEventType {
  // Authentication & Security
  LOGIN_SUCCESS = 'LOGIN_SUCCESS',
  LOGIN_FAILED = 'LOGIN_FAILED',
  LOGOUT = 'LOGOUT',
  PASSWORD_CHANGED = 'PASSWORD_CHANGED',
  PASSWORD_RESET_REQUESTED = 'PASSWORD_RESET_REQUESTED',
  PASSWORD_RESET_COMPLETED = 'PASSWORD_RESET_COMPLETED',
  TWO_FA_ENABLED = 'TWO_FA_ENABLED',
  TWO_FA_DISABLED = 'TWO_FA_DISABLED',
  SESSION_CREATED = 'SESSION_CREATED',
  SESSION_TERMINATED = 'SESSION_TERMINATED',
  
  // Authorization
  PERMISSION_GRANTED = 'PERMISSION_GRANTED',
  PERMISSION_REVOKED = 'PERMISSION_REVOKED',
  ROLE_CHANGED = 'ROLE_CHANGED',
  TEAM_MEMBER_INVITED = 'TEAM_MEMBER_INVITED',
  TEAM_MEMBER_REMOVED = 'TEAM_MEMBER_REMOVED',
  
  // Data Access
  SENSITIVE_DATA_ACCESSED = 'SENSITIVE_DATA_ACCESSED',
  BULK_DATA_EXPORTED = 'BULK_DATA_EXPORTED',
  DATA_IMPORTED = 'DATA_IMPORTED',
  
  // Financial Operations
  PAYMENT_PROCESSED = 'PAYMENT_PROCESSED',
  PAYMENT_FAILED = 'PAYMENT_FAILED',
  REFUND_ISSUED = 'REFUND_ISSUED',
  PAYOUT_INITIATED = 'PAYOUT_INITIATED',
  PAYOUT_COMPLETED = 'PAYOUT_COMPLETED',
  INVOICE_GENERATED = 'INVOICE_GENERATED',
  
  // Account Management
  ACCOUNT_CREATED = 'ACCOUNT_CREATED',
  ACCOUNT_UPDATED = 'ACCOUNT_UPDATED',
  ACCOUNT_DELETION_REQUESTED = 'ACCOUNT_DELETION_REQUESTED',
  ACCOUNT_DELETION_CANCELLED = 'ACCOUNT_DELETION_CANCELLED',
  ACCOUNT_DELETION_COMPLETED = 'ACCOUNT_DELETION_COMPLETED',
  
  // Product & Inventory
  PRODUCT_CREATED = 'PRODUCT_CREATED',
  PRODUCT_UPDATED = 'PRODUCT_UPDATED',
  PRODUCT_DELETED = 'PRODUCT_DELETED',
  INVENTORY_ADJUSTED = 'INVENTORY_ADJUSTED',
  PRICE_CHANGED = 'PRICE_CHANGED',
  
  // Order Management
  ORDER_CREATED = 'ORDER_CREATED',
  ORDER_UPDATED = 'ORDER_UPDATED',
  ORDER_CANCELLED = 'ORDER_CANCELLED',
  ORDER_REFUNDED = 'ORDER_REFUNDED',
  ORDER_STATUS_CHANGED = 'ORDER_STATUS_CHANGED',
  
  // Customer Management
  CUSTOMER_CREATED = 'CUSTOMER_CREATED',
  CUSTOMER_UPDATED = 'CUSTOMER_UPDATED',
  CUSTOMER_DELETED = 'CUSTOMER_DELETED',
  CUSTOMER_DATA_EXPORTED = 'CUSTOMER_DATA_EXPORTED',
  
  // Marketing
  DISCOUNT_CREATED = 'DISCOUNT_CREATED',
  DISCOUNT_UPDATED = 'DISCOUNT_UPDATED',
  DISCOUNT_DELETED = 'DISCOUNT_DELETED',
  CAMPAIGN_SENT = 'CAMPAIGN_SENT',
  
  // Settings & Configuration
  SETTINGS_UPDATED = 'SETTINGS_UPDATED',
  INTEGRATION_ENABLED = 'INTEGRATION_ENABLED',
  INTEGRATION_DISABLED = 'INTEGRATION_DISABLED',
  API_KEY_CREATED = 'API_KEY_CREATED',
  API_KEY_REVOKED = 'API_KEY_REVOKED',
  DOMAIN_ADDED = 'DOMAIN_ADDED',
  DOMAIN_VERIFIED = 'DOMAIN_VERIFIED',
  
  // Compliance
  KYC_SUBMITTED = 'KYC_SUBMITTED',
  KYC_APPROVED = 'KYC_APPROVED',
  KYC_REJECTED = 'KYC_REJECTED',
  GDPR_REQUEST_RECEIVED = 'GDPR_REQUEST_RECEIVED',
  GDPR_REQUEST_COMPLETED = 'GDPR_REQUEST_COMPLETED',
  
  // Security Events
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  CSRF_VIOLATION_DETECTED = 'CSRF_VIOLATION_DETECTED',
  SUSPICIOUS_ACTIVITY_DETECTED = 'SUSPICIOUS_ACTIVITY_DETECTED',
  BRUTE_FORCE_ATTEMPT = 'BRUTE_FORCE_ATTEMPT',
  SQL_INJECTION_ATTEMPT = 'SQL_INJECTION_ATTEMPT',
  XSS_ATTEMPT = 'XSS_ATTEMPT',
  
  // Support
  SUPPORT_TICKET_CREATED = 'SUPPORT_TICKET_CREATED',
  SUPPORT_TICKET_UPDATED = 'SUPPORT_TICKET_UPDATED',
  SUPPORT_TICKET_RESOLVED = 'SUPPORT_TICKET_RESOLVED',
  DISPUTE_OPENED = 'DISPUTE_OPENED',
  DISPUTE_RESOLVED = 'DISPUTE_RESOLVED',
  
  // System
  WEBHOOK_RECEIVED = 'WEBHOOK_RECEIVED',
  WEBHOOK_SENT = 'WEBHOOK_SENT',
  CRON_JOB_EXECUTED = 'CRON_JOB_EXECUTED',
  SYSTEM_ERROR = 'SYSTEM_ERROR',
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

export class AuditEnhancedService {
  /**
   * Log an audit event to the database
   */
  async logAuditEvent(
    storeId: string | null,
    userId: string,
    eventType: AuditEventType,
    meta: AuditEventMeta = {}
  ): Promise<void> {
    try {
      await prisma.auditLog.create({
        data: {
          storeId,
          userId,
          eventType,
          ipAddress: meta.ipAddress,
          userAgent: meta.userAgent,
          targetType: meta.targetType,
          targetId: meta.targetId,
          reason: meta.reason,
          metadata: meta.meta || {},
          timestamp: new Date(),
        },
      });

      logger.info(`[AUDIT] ${eventType}`, {
        storeId,
        userId,
        ...meta,
      });
    } catch (error) {
      logger.error('[AUDIT] Failed to log event', {
        storeId,
        userId,
        eventType,
        error: error instanceof Error ? error.message : String(error),
      });
      // Don't throw - audit logging failure shouldn't break main operation
    }
  }

  /**
   * Get audit logs for a store with filtering
   */
  async getAuditLogs(options: {
    storeId: string;
    userId?: string;
    eventType?: AuditEventType;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
    offset?: number;
  }): Promise<{
    logs: Array<{
      id: string;
      timestamp: Date;
      eventType: string;
      userId: string | null;
      storeId: string | null;
      ipAddress: string | null;
      userAgent: string | null;
      targetType: string | null;
      targetId: string | null;
      reason: string | null;
      metadata: any;
      user?: {
        id: string;
        email: string;
        firstName: string | null;
        lastName: string | null;
      };
    }>;
    total: number;
    hasMore: boolean;
  }> {
    const { 
      storeId, 
      userId, 
      eventType, 
      startDate, 
      endDate, 
      limit = 50, 
      offset = 0 
    } = options;

    const where: Record<string, unknown> = {
      storeId,
    };

    if (userId) {
      where.userId = userId;
    }

    if (eventType) {
      where.eventType = eventType;
    }

    if (startDate || endDate) {
      where.timestamp = {};
      if (startDate) {
        where.timestamp.gte = startDate;
      }
      if (endDate) {
        where.timestamp.lte = endDate;
      }
    }

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        orderBy: { timestamp: 'desc' },
        take: limit,
        skip: offset,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      }),
      prisma.auditLog.count({ where }),
    ]);

    return {
      logs,
      total,
      hasMore: offset + limit < total,
    };
  }

  /**
   * Get suspicious activity report
   */
  async getSuspiciousActivityReport(
    storeId: string,
    days = 7
  ): Promise<SuspiciousActivityReport> {
    const since = new Date();
    since.setDate(since.getDate() - days);

    const [failedLogins, rateLimits, csrfViolations, bruteForce, unusualAccess] = await Promise.all([
      prisma.auditLog.count({
        where: {
          storeId,
          eventType: AuditEventType.LOGIN_FAILED,
          timestamp: { gte: since },
        },
      }),
      prisma.auditLog.count({
        where: {
          storeId,
          eventType: AuditEventType.RATE_LIMIT_EXCEEDED,
          timestamp: { gte: since },
        },
      }),
      prisma.auditLog.count({
        where: {
          storeId,
          eventType: AuditEventType.CSRF_VIOLATION_DETECTED,
          timestamp: { gte: since },
        },
      }),
      prisma.auditLog.count({
        where: {
          storeId,
          eventType: AuditEventType.BRUTE_FORCE_ATTEMPT,
          timestamp: { gte: since },
        },
      }),
      prisma.auditLog.count({
        where: {
          storeId,
          eventType: AuditEventType.SENSITIVE_DATA_ACCESSED,
          timestamp: { gte: since },
        },
      }),
    ]);

    return {
      failedLoginAttempts: failedLogins,
      rateLimitViolations: rateLimits,
      csrfViolations: csrfViolations,
      bruteForceAttempts: bruteForce,
      unusualDataAccess: unusualAccess,
    };
  }

  /**
   * Export audit logs for compliance
   */
  async exportAuditLogs(
    storeId: string,
    startDate: Date,
    endDate: Date
  ): Promise<string> {
    const logs = await prisma.auditLog.findMany({
      where: {
        storeId,
        timestamp: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: { timestamp: 'asc' },
    });

    // Convert to CSV format
    const headers = ['timestamp', 'eventType', 'userId', 'storeId', 'ipAddress', 'targetType', 'targetId', 'reason'];
    const rows = logs.map((log) =>
      headers.map((header) => {
        const value = (log as any)[header];
        return typeof value === 'object' ? JSON.stringify(value) : String(value || '');
      }).join(',')
    );

    return [headers.join(','), ...rows].join('\n');
  }

  /**
   * Get recent audit activity summary
   */
  async getRecentActivitySummary(storeId: string, hours = 24): Promise<{
    totalEvents: number;
    uniqueUsers: number;
    topEventTypes: Array<{ eventType: string; count: number }>;
    suspiciousEvents: number;
  }> {
    const since = new Date();
    since.setHours(since.getHours() - hours);

    const [totalEvents, suspiciousEvents] = await Promise.all([
      prisma.auditLog.count({
        where: {
          storeId,
          timestamp: { gte: since },
        },
      }),
      prisma.auditLog.count({
        where: {
          storeId,
          eventType: {
            in: [
              AuditEventType.LOGIN_FAILED,
              AuditEventType.RATE_LIMIT_EXCEEDED,
              AuditEventType.CSRF_VIOLATION_DETECTED,
              AuditEventType.BRUTE_FORCE_ATTEMPT,
              AuditEventType.SUSPICIOUS_ACTIVITY_DETECTED,
            ],
          },
          timestamp: { gte: since },
        },
      }),
    ]);

    const uniqueUsersResult = await prisma.auditLog.groupBy({
      by: ['userId'],
      where: {
        storeId,
        timestamp: { gte: since },
      },
    });

    const topEventTypesResult = await prisma.auditLog.groupBy({
      by: ['eventType'],
      where: {
        storeId,
        timestamp: { gte: since },
      },
      _count: true,
      orderBy: {
        _count: {
          eventType: 'desc',
        },
      },
      take: 10,
    });

    return {
      totalEvents,
      uniqueUsers: uniqueUsersResult.length,
      topEventTypes: topEventTypesResult.map((r) => ({
        eventType: r.eventType,
        count: r._count,
      })),
      suspiciousEvents,
    };
  }

  /**
   * Clear old audit logs (retention policy)
   */
  async clearOldAuditLogs(retentionDays = 90): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

    try {
      const result = await prisma.auditLog.deleteMany({
        where: {
          timestamp: {
            lt: cutoffDate,
          },
        },
      });

      logger.info('[AUDIT] Cleared old audit logs', {
        deletedCount: result.count,
        retentionDays,
        cutoffDate: cutoffDate.toISOString(),
      });

      return result.count;
    } catch (error) {
      logger.error('[AUDIT] Failed to clear old logs', {
        error: error instanceof Error ? error.message : String(error),
      });
      return 0;
    }
  }
}
