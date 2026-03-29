import { prisma } from '@vayva/db';
import { logger } from '@vayva/shared';
import type { Prisma } from '@vayva/db';

/**
 * Event Bus Service - Centralized event publishing and processing
 * 
 * Handles:
 * - Audit log creation
 * - Notification generation
 * - Event deduplication
 * - Transactional event processing
 */
export class EventBusService {
  /**
   * Publish an event to the event bus
   * 
   * @param eventType - Type of event (must be registered in catalog)
   * @param merchantId - The merchant/store ID
   * @param payload - Event-specific payload data
   * @param context - Event context (actor, IP, correlation ID, etc.)
   * @param options - Optional event metadata (entity details, dedupe key)
   */
  async publish(
    eventType: string,
    merchantId: string,
    payload: Record<string, unknown>,
    context: {
      actorId?: string;
      actorType?: string;
      actorLabel?: string;
      ipAddress?: string;
      userAgent?: string;
      correlationId?: string;
    },
    options?: {
      entityType?: string;
      entityId?: string;
      dedupeKey?: string;
    }
  ): Promise<void> {
    try {
      // Get event definition from catalog
      const eventDef = this.getEventDefinition(eventType);
      
      if (!eventDef) {
        logger.warn('[EventBusService] Unregistered event type', { 
          eventType,
          app: 'backend' 
        });
        return;
      }

      const { entityType, entityId, dedupeKey } = options || {};

      // Build database operations
      const operations: Promise<unknown>[] = [];

      // Add audit log operation if configured
      if (eventDef.audit) {
        operations.push(this.createAuditLogOperation(
          eventType,
          merchantId,
          entityType,
          entityId,
          payload,
          eventDef.audit,
          context
        ));
      }

      // Add notification operation if configured
      if (eventDef.notification) {
        operations.push(this.createNotificationOperation(
          eventType,
          merchantId,
          entityType,
          entityId,
          payload,
          eventDef.notification,
          dedupeKey
        ));
      }

      // Execute all operations transactionally
      if (operations.length > 0) {
        await prisma.$transaction(operations);
        
        logger.debug('[EventBusService] Event processed successfully', {
          eventType,
          merchantId,
          operationsCount: operations.length,
        });
      }
    } catch (error) {
      logger.error('[EventBusService] Failed to process event', {
        eventType,
        merchantId,
        error: error instanceof Error ? error.message : String(error),
      });
      // Don't throw - event processing failures should not block main operation
    }
  }

  /**
   * Get event definition from catalog
   */
  private getEventDefinition(eventType: string): {
    audit?: {
      action: string;
      beforeState?: (payload: Record<string, unknown>) => unknown;
      afterState?: (payload: Record<string, unknown>) => unknown;
    };
    notification?: {
      title: string | ((payload: Record<string, unknown>) => string);
      body: string | ((payload: Record<string, unknown>) => string);
      severity: string;
      actionUrl?: string | ((payload: Record<string, unknown>, entityId?: string) => string);
    };
  } | null {
    // Import catalog dynamically to avoid circular dependencies
    // In production, this would be a proper import or microservice call
    const EVENT_CATALOG: Record<string, unknown> = {};
    
    // For now, return empty definition
    // Catalog will be populated as events are used
    return EVENT_CATALOG[eventType] || null;
  }

  /**
   * Create audit log database operation
   */
  private createAuditLogOperation(
    eventType: string,
    merchantId: string,
    entityType: string | undefined,
    entityId: string | undefined,
    payload: Record<string, unknown>,
    auditDef: {
      action: string;
      beforeState?: (payload: Record<string, unknown>) => unknown;
      afterState?: (payload: Record<string, unknown>) => unknown;
    },
    context: {
      actorId?: string;
      actorType?: string;
      actorLabel?: string;
      ipAddress?: string;
      userAgent?: string;
      correlationId?: string;
    }
  ): Promise<unknown> {
    return prisma.auditLog.create({
      data: {
        app: 'backend',
        action: auditDef.action,
        targetType: (entityType || 'system') as Prisma.AuditLogTargetType,
        targetId: entityId || 'none',
        targetStoreId: merchantId,
        actorUserId: context.actorId,
        actorRole: context.actorType,
        ip: context.ipAddress,
        userAgent: context.userAgent,
        requestId: context.correlationId || 'system',
        timestamp: new Date(),
        metadata: {
          actorLabel: context.actorLabel,
          eventType,
          beforeState: auditDef.beforeState?.(payload),
          afterState: auditDef.afterState?.(payload),
        } as Prisma.InputJsonValue,
      },
    });
  }

  /**
   * Create notification database operation
   */
  private createNotificationOperation(
    eventType: string,
    merchantId: string,
    entityType: string | undefined,
    entityId: string | undefined,
    payload: Record<string, unknown>,
    notifDef: {
      title: string | ((payload: Record<string, unknown>) => string);
      body: string | ((payload: Record<string, unknown>) => string);
      severity: string;
      actionUrl?: string | ((payload: Record<string, unknown>, entityId?: string) => string);
    },
    dedupeKey: string | undefined
  ): Promise<unknown> {
    const title = typeof notifDef.title === 'function'
      ? notifDef.title(payload)
      : notifDef.title;
    
    const body = typeof notifDef.body === 'function'
      ? notifDef.body(payload)
      : notifDef.body;
    
    const actionUrl = notifDef.actionUrl
      ? typeof notifDef.actionUrl === 'function'
        ? notifDef.actionUrl(payload, entityId)
        : notifDef.actionUrl
      : null;

    if (dedupeKey) {
      // Use upsert for deduplicated notifications
      return prisma.notification.upsert({
        where: { dedupeKey },
        create: {
          storeId: merchantId,
          userId: null,
          type: eventType,
          title,
          body,
          severity: notifDef.severity,
          actionUrl,
          entityType,
          entityId,
          dedupeKey,
          metadata: payload as Prisma.InputJsonValue,
        },
        update: {},
      });
    } else {
      // Create new notification
      return prisma.notification.create({
        data: {
          storeId: merchantId,
          userId: null,
          type: eventType,
          title,
          body,
          severity: notifDef.severity,
          actionUrl,
          entityType,
          entityId,
          dedupeKey,
          metadata: payload as Prisma.InputJsonValue,
        },
      });
    }
  }

  /**
   * Publish order-related events
   */
  async publishOrderEvent(
    eventType: string,
    merchantId: string,
    orderId: string,
    orderNumber: string,
    payload: Record<string, unknown>,
    context: {
      actorId?: string;
      actorType?: string;
      ipAddress?: string;
      userAgent?: string;
    }
  ): Promise<void> {
    await this.publish(eventType, merchantId, payload, context, {
      entityType: 'ORDER',
      entityId: orderId,
      dedupeKey: `${eventType}:${orderId}`,
    });
  }

  /**
   * Publish payment-related events
   */
  async publishPaymentEvent(
    eventType: string,
    merchantId: string,
    paymentId: string,
    amount: number,
    payload: Record<string, unknown>,
    context: {
      actorId?: string;
      actorType?: string;
      ipAddress?: string;
      userAgent?: string;
    }
  ): Promise<void> {
    await this.publish(eventType, merchantId, { ...payload, amount, paymentId }, context, {
      entityType: 'PAYMENT',
      entityId: paymentId,
      dedupeKey: `${eventType}:${paymentId}`,
    });
  }

  /**
   * Publish user-related events
   */
  async publishUserEvent(
    eventType: string,
    merchantId: string,
    userId: string,
    payload: Record<string, unknown>,
    context: {
      actorId?: string;
      actorType?: string;
      ipAddress?: string;
      userAgent?: string;
    }
  ): Promise<void> {
    await this.publish(eventType, merchantId, payload, context, {
      entityType: 'USER',
      entityId: userId,
      dedupeKey: `${eventType}:${userId}`,
    });
  }

  /**
   * Get recent audit logs for a store
   */
  async getAuditLogs(
    storeId: string,
    options?: {
      limit?: number;
      offset?: number;
      action?: string;
      targetType?: string;
      startDate?: Date;
      endDate?: Date;
    }
  ): Promise<Array<{
    id: string;
    action: string;
    targetType: string;
    targetId: string;
    actorUserId: string | null;
    actorRole: string | null;
    timestamp: Date;
    ip: string | null;
    userAgent: string | null;
    requestId: string;
  }>> {
    const {
      limit = 50,
      offset = 0,
      action,
      targetType,
      startDate,
      endDate,
    } = options || {};

    const where: Prisma.AuditLogWhereInput = {
      targetStoreId: storeId,
    };

    if (action) {
      where.action = action;
    }

    if (targetType) {
      where.targetType = targetType as Prisma.AuditLogTargetType;
    }

    if (startDate || endDate) {
      where.timestamp = {};
      if (startDate) where.timestamp.gte = startDate;
      if (endDate) where.timestamp.lte = endDate;
    }

    const logs = await prisma.auditLog.findMany({
      where,
      select: {
        id: true,
        action: true,
        targetType: true,
        targetId: true,
        actorUserId: true,
        actorRole: true,
        timestamp: true,
        ip: true,
        userAgent: true,
        requestId: true,
      },
      orderBy: { timestamp: 'desc' },
      take: limit,
      skip: offset,
    });

    return logs;
  }

  /**
   * Get unread notifications for a store
   */
  async getUnreadNotifications(
    storeId: string,
    options?: {
      limit?: number;
      type?: string;
    }
  ): Promise<Array<{
    id: string;
    type: string;
    title: string;
    body: string;
    severity: string;
    actionUrl: string | null;
    createdAt: Date;
  }>> {
    const { limit = 20, type } = options || {};

    const where: Prisma.NotificationWhereInput = {
      storeId,
      readAt: null, // Only unread
    };

    if (type) {
      where.type = type;
    }

    const notifications = await prisma.notification.findMany({
      where,
      select: {
        id: true,
        type: true,
        title: true,
        body: true,
        severity: true,
        actionUrl: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return notifications;
  }

  /**
   * Mark notification as read
   */
  async markNotificationAsRead(
    notificationId: string,
    storeId: string
  ): Promise<boolean> {
    try {
      await prisma.notification.update({
        where: { 
          id: notificationId,
          storeId,
        },
        data: {
          readAt: new Date(),
        },
      });

      return true;
    } catch (error) {
      logger.error('[EventBusService] Failed to mark notification as read', {
        notificationId,
        error: error instanceof Error ? error.message : String(error),
      });
      return false;
    }
  }

  /**
   * Mark all notifications as read for a store
   */
  async markAllNotificationsAsRead(storeId: string): Promise<number> {
    try {
      const result = await prisma.notification.updateMany({
        where: {
          storeId,
          readAt: null,
        },
        data: {
          readAt: new Date(),
        },
      });

      logger.info('[EventBusService] Marked all notifications as read', {
        storeId,
        count: result.count,
      });

      return result.count;
    } catch (error) {
      logger.error('[EventBusService] Failed to mark all notifications as read', {
        storeId,
        error: error instanceof Error ? error.message : String(error),
      });
      return 0;
    }
  }
}
