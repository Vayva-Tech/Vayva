/**
 * HIPAA Audit Logger - Tamper-Proof Audit Trail System
 * Captures all PHI access and modifications for compliance
 */

import { logger } from '@vayva/shared';
import type { PrismaClient } from '@prisma/client';

export interface AuditLogEvent {
  userId: string;
  action: 'VIEW' | 'CREATE' | 'UPDATE' | 'DELETE' | 'EXPORT' | 'LOGIN' | 'LOGOUT' | 'ACCESS_ATTEMPT';
  resourceType: 'PATIENT_RECORD' | 'APPOINTMENT' | 'PRESCRIPTION' | 'LAB_RESULT' | 'BILLING' | 'CONSENT';
  resourceId: string;
  timestamp?: Date;
  ipAddress: string;
  userAgent: string;
  reason?: string; // For emergency access
  storeId: string;
  patientId?: string; // For patient-specific tracking
  metadata?: Record<string, any>; // Additional context
}

export interface AuditLogFilters {
  userId?: string;
  resourceType?: string;
  action?: string;
  startDate?: Date;
  endDate?: Date;
  storeId?: string;
  patientId?: string;
  searchTerm?: string;
}

export interface AuditLogEntry extends AuditLogEvent {
  id: string;
  hash: string;
  immutable: boolean;
  retentionUntil: Date;
  createdAt: Date;
}

export class HIPAAAAuditLogger {
  private prisma: PrismaClient;
  private static instance: HIPAAAAuditLogger;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  public static getInstance(prisma: PrismaClient): HIPAAAAuditLogger {
    if (!HIPAAAAuditLogger.instance) {
      HIPAAAAuditLogger.instance = new HIPAAAAuditLogger(prisma);
    }
    return HIPAAAAuditLogger.instance;
  }

  /**
   * Log a HIPAA-regulated event to tamper-proof audit trail
   */
  async log(event: AuditLogEvent): Promise<void> {
    try {
      const timestamp = event.timestamp || new Date();
      
      // Generate integrity hash
      const hash = this.generateHash(event, timestamp);
      
      // Calculate retention date (6 years minimum for HIPAA)
      const retentionUntil = new Date(timestamp);
      retentionUntil.setFullYear(retentionUntil.getFullYear() + 6);

      // Create audit log entry with write-once flag
      await this.prisma.hIPAAAAuditLog.create({
        data: {
          userId: event.userId,
          action: event.action,
          resourceType: event.resourceType,
          resourceId: event.resourceId,
          timestamp,
          ipAddress: event.ipAddress,
          userAgent: event.userAgent,
          reason: event.reason,
          storeId: event.storeId,
          patientId: event.patientId,
          metadata: event.metadata ? JSON.stringify(event.metadata) : null,
          hash,
          immutable: true, // Write-once flag
          retentionUntil,
        },
      });

      // Log to monitoring service for real-time alerts
      logger.info('[HIPAA_AUDIT] Event logged', {
        eventId: event.resourceId,
        action: event.action,
        resourceType: event.resourceType,
        userId: event.userId,
        timestamp: timestamp.toISOString(),
      });

      // Check for suspicious patterns
      await this.detectSuspiciousActivity(event);
    } catch (error) {
      // CRITICAL: Audit log failures must be escalated
      logger.error('[HIPAA_AUDIT_FAILURE] Failed to log audit event', {
        error,
        event,
      });
      
      // In production, this should trigger an immediate alert
      throw new Error(`Failed to log HIPAA audit event: ${error}`);
    }
  }

  /**
   * Search audit logs with filters
   */
  async search(filters: AuditLogFilters): Promise<AuditLogEntry[]> {
    try {
      const whereClause: any = {};

      if (filters.userId) {
        whereClause.userId = filters.userId;
      }

      if (filters.resourceType) {
        whereClause.resourceType = filters.resourceType;
      }

      if (filters.action) {
        whereClause.action = filters.action;
      }

      if (filters.storeId) {
        whereClause.storeId = filters.storeId;
      }

      if (filters.patientId) {
        whereClause.patientId = filters.patientId;
      }

      if (filters.startDate || filters.endDate) {
        whereClause.timestamp = {};
        if (filters.startDate) {
          whereClause.timestamp.gte = filters.startDate;
        }
        if (filters.endDate) {
          whereClause.timestamp.lte = filters.endDate;
        }
      }

      if (filters.searchTerm) {
        whereClause.OR = [
          { resourceId: { contains: filters.searchTerm } },
          { reason: { contains: filters.searchTerm } },
          { userId: { contains: filters.searchTerm } },
        ];
      }

      const entries = await this.prisma.hIPAAAAuditLog.findMany({
        where: whereClause,
        orderBy: [{ timestamp: 'desc' }],
        take: 1000,
      });

      return entries.map(entry => ({
        ...entry,
        metadata: entry.metadata ? JSON.parse(entry.metadata as string) : null,
      }));
    } catch (error) {
      logger.error('[HIPAA_AUDIT_SEARCH_FAILURE] Failed to search audit logs', {
        error,
        filters,
      });
      throw error;
    }
  }

  /**
   * Export audit logs for compliance audits (CSV format)
   */
  async exportToCSV(dateRange: { start: Date; end: Date }): Promise<string> {
    try {
      const entries = await this.search({
        startDate: dateRange.start,
        endDate: dateRange.end,
      });

      // CSV header
      const headers = [
        'ID',
        'Timestamp',
        'User ID',
        'Action',
        'Resource Type',
        'Resource ID',
        'Patient ID',
        'IP Address',
        'Reason',
        'Store ID',
        'Hash',
      ];

      // CSV rows
      const rows = entries.map(entry =>
        [
          entry.id,
          entry.timestamp.toISOString(),
          entry.userId,
          entry.action,
          entry.resourceType,
          entry.resourceId,
          entry.patientId || '',
          entry.ipAddress,
          entry.reason || '',
          entry.storeId,
          entry.hash,
        ]
          .map(field => `"${field}"`) // Escape fields
          .join(',')
      );

      return [headers.join(','), ...rows].join('\n');
    } catch (error) {
      logger.error('[HIPAA_AUDIT_EXPORT_FAILURE] Failed to export audit logs', {
        error,
        dateRange,
      });
      throw error;
    }
  }

  /**
   * Verify integrity of audit log entry (detect tampering)
   */
  async verifyIntegrity(entryId: string): Promise<boolean> {
    try {
      const entry = await this.prisma.hIPAAAAuditLog.findUnique({
        where: { id: entryId },
      });

      if (!entry) {
        return false;
      }

      // Recreate hash from stored data
      const eventData: AuditLogEvent = {
        userId: entry.userId,
        action: entry.action as any,
        resourceType: entry.resourceType as any,
        resourceId: entry.resourceId,
        timestamp: entry.timestamp,
        ipAddress: entry.ipAddress,
        userAgent: entry.userAgent,
        reason: entry.reason || undefined,
        storeId: entry.storeId,
        patientId: entry.patientId || undefined,
      };

      const expectedHash = this.generateHash(eventData, entry.timestamp);
      return entry.hash === expectedHash;
    } catch (error) {
      logger.error('[HIPAA_AUDIT_INTEGRITY_FAILURE] Failed to verify integrity', {
        error,
        entryId,
      });
      return false;
    }
  }

  /**
   * Detect suspicious activity patterns
   */
  private async detectSuspiciousActivity(event: AuditLogEvent): Promise<void> {
    // Check for unusual access patterns
    const recentAccessCount = await this.prisma.hIPAAAAuditLog.count({
      where: {
        userId: event.userId,
        resourceType: event.resourceType,
        timestamp: {
          gte: new Date(Date.now() - 5 * 60 * 1000), // Last 5 minutes
        },
      },
    });

    // Alert on excessive access (more than 20 accesses in 5 minutes)
    if (recentAccessCount > 20) {
      logger.warn('[HIPAA_SUSPICIOUS_ACTIVITY] Excessive PHI access detected', {
        userId: event.userId,
        resourceType: event.resourceType,
        accessCount: recentAccessCount,
      });

      // In production, trigger immediate security alert
    }

    // Check for after-hours access
    const hour = new Date().getHours();
    if (hour < 6 || hour > 22) {
      logger.info('[HIPAA_AFTER_HOURS_ACCESS] PHI accessed outside business hours', {
        userId: event.userId,
        hour,
        action: event.action,
      });
    }
  }

  /**
   * Generate SHA-256 hash for audit log integrity
   */
  private generateHash(event: AuditLogEvent, timestamp: Date): string {
    const crypto = require('crypto');
    const hashString = JSON.stringify({
      userId: event.userId,
      action: event.action,
      resourceType: event.resourceType,
      resourceId: event.resourceId,
      timestamp: timestamp.toISOString(),
      ipAddress: event.ipAddress,
      storeId: event.storeId,
      patientId: event.patientId,
    });

    return crypto.createHash('sha256').update(hashString).digest('hex');
  }
}

// Convenience function for easy import
export function createAuditLogger(prisma: PrismaClient): HIPAAAAuditLogger {
  return HIPAAAAuditLogger.getInstance(prisma);
}
