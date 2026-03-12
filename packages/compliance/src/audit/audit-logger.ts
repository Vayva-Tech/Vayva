/**
 * Audit Logger
 * Comprehensive audit trail system for compliance
 */

export interface AuditAction {
  id?: string;
  storeId: string;
  userId?: string;
  action: string;
  entityType: string;
  entityId: string;
  changes?: {
    before?: Record<string, unknown>;
    after?: Record<string, unknown>;
  };
  metadata?: {
    ipAddress?: string;
    userAgent?: string;
    sessionId?: string;
    requestId?: string;
    purpose?: string;
  };
  timestamp?: Date;
}

export interface AuditQuery {
  storeId?: string;
  userId?: string;
  entityType?: string;
  entityId?: string;
  action?: string;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}

export class AuditLogger {
  private logs: Map<string, AuditAction> = new Map();

  /**
   * Log an action
   */
  async logAction(action: AuditAction): Promise<void> {
    const logEntry: AuditAction = {
      ...action,
      id: action.id || `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: action.timestamp || new Date(),
    };

    this.logs.set(logEntry.id!, logEntry);
    
    // In production, persist to database
    console.log(`Audit log: ${logEntry.action} on ${logEntry.entityType}:${logEntry.entityId}`);
  }

  /**
   * Query audit logs
   */
  async queryLogs(query: AuditQuery): Promise<{
    logs: AuditAction[];
    total: number;
  }> {
    let results = Array.from(this.logs.values());

    if (query.storeId) {
      results = results.filter(l => l.storeId === query.storeId);
    }

    if (query.userId) {
      results = results.filter(l => l.userId === query.userId);
    }

    if (query.entityType) {
      results = results.filter(l => l.entityType === query.entityType);
    }

    if (query.entityId) {
      results = results.filter(l => l.entityId === query.entityId);
    }

    if (query.action) {
      results = results.filter(l => l.action === query.action);
    }

    if (query.startDate) {
      results = results.filter(l => l.timestamp && l.timestamp >= query.startDate!);
    }

    if (query.endDate) {
      results = results.filter(l => l.timestamp && l.timestamp <= query.endDate!);
    }

    // Sort by timestamp descending
    results.sort((a, b) => (b.timestamp?.getTime() || 0) - (a.timestamp?.getTime() || 0));

    const total = results.length;
    const offset = query.offset || 0;
    const limit = query.limit || 50;

    return {
      logs: results.slice(offset, offset + limit),
      total,
    };
  }

  /**
   * Get entity history
   */
  async getEntityHistory(
    entityType: string,
    entityId: string
  ): Promise<AuditAction[]> {
    const { logs } = await this.queryLogs({
      entityType,
      entityId,
      limit: 100,
    });

    return logs;
  }

  /**
   * Get user activity
   */
  async getUserActivity(userId: string, storeId?: string): Promise<AuditAction[]> {
    const { logs } = await this.queryLogs({
      userId,
      storeId,
      limit: 100,
    });

    return logs;
  }

  /**
   * Export logs for compliance report
   */
  async exportLogs(
    query: AuditQuery,
    format: 'json' | 'csv' = 'json'
  ): Promise<string> {
    const { logs } = await this.queryLogs(query);

    if (format === 'csv') {
      const headers = ['timestamp', 'storeId', 'userId', 'action', 'entityType', 'entityId'];
      const rows = logs.map(l => [
        l.timestamp?.toISOString(),
        l.storeId,
        l.userId || '',
        l.action,
        l.entityType,
        l.entityId,
      ]);
      return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    }

    return JSON.stringify(logs, null, 2);
  }

  /**
   * Get audit statistics
   */
  async getStats(storeId?: string): Promise<{
    totalActions: number;
    actionsByType: Record<string, number>;
    actionsByUser: Record<string, number>;
    periodStats: {
      today: number;
      thisWeek: number;
      thisMonth: number;
    };
  }> {
    let logs = Array.from(this.logs.values());
    
    if (storeId) {
      logs = logs.filter(l => l.storeId === storeId);
    }

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const thisWeek = new Date(today.getTime() - today.getDay() * 24 * 60 * 60 * 1000);
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const actionsByType: Record<string, number> = {};
    const actionsByUser: Record<string, number> = {};

    for (const log of logs) {
      actionsByType[log.action] = (actionsByType[log.action] || 0) + 1;
      if (log.userId) {
        actionsByUser[log.userId] = (actionsByUser[log.userId] || 0) + 1;
      }
    }

    return {
      totalActions: logs.length,
      actionsByType,
      actionsByUser,
      periodStats: {
        today: logs.filter(l => l.timestamp && l.timestamp >= today).length,
        thisWeek: logs.filter(l => l.timestamp && l.timestamp >= thisWeek).length,
        thisMonth: logs.filter(l => l.timestamp && l.timestamp >= thisMonth).length,
      },
    };
  }

  /**
   * Log data access
   */
  async logDataAccess(params: {
    storeId: string;
    userId?: string;
    dataType: string;
    recordId?: string;
    purpose: string;
    metadata?: AuditAction['metadata'];
  }): Promise<void> {
    await this.logAction({
      storeId: params.storeId,
      userId: params.userId,
      action: 'DATA_ACCESS',
      entityType: params.dataType,
      entityId: params.recordId || 'BULK',
      metadata: {
        ...params.metadata,
        purpose: params.purpose,
      },
    });
  }

  /**
   * Log data modification
   */
  async logDataModification(params: {
    storeId: string;
    userId?: string;
    entityType: string;
    entityId: string;
    before: Record<string, unknown>;
    after: Record<string, unknown>;
    metadata?: AuditAction['metadata'];
  }): Promise<void> {
    await this.logAction({
      storeId: params.storeId,
      userId: params.userId,
      action: 'DATA_MODIFICATION',
      entityType: params.entityType,
      entityId: params.entityId,
      changes: {
        before: params.before,
        after: params.after,
      },
      metadata: params.metadata,
    });
  }

  /**
   * Log authentication event
   */
  async logAuthEvent(params: {
    storeId: string;
    userId?: string;
    event: 'LOGIN' | 'LOGOUT' | 'LOGIN_FAILED' | 'PASSWORD_CHANGE';
    metadata?: AuditAction['metadata'];
  }): Promise<void> {
    await this.logAction({
      storeId: params.storeId,
      userId: params.userId,
      action: `AUTH_${params.event}`,
      entityType: 'USER',
      entityId: params.userId || 'UNKNOWN',
      metadata: params.metadata,
    });
  }
}

export const auditLogger = new AuditLogger();
export default AuditLogger;
