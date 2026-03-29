// Frontend must not use Prisma directly - delegate to backend
// import { prisma, type Prisma } from "@vayva/db"; // REMOVED - Backend-only
import { logger } from "@vayva/shared";
import { EVENT_CATALOG } from "./catalog";

const BACKEND_URL = process.env.BACKEND_API_URL || '';

interface EventPayload {
  [key: string]: unknown;
}

interface EventContext {
  actorId?: string;
  actorType?: string;
  actorLabel?: string;
  ipAddress?: string;
  userAgent?: string;
  correlationId?: string;
}

interface BusEvent {
  type: string;
  merchantId: string;
  entityType?: string;
  entityId?: string;
  payload?: EventPayload;
  dedupeKey?: string;
  ctx: EventContext;
}

/**
 * EventBus - Frontend proxy to backend EventBusService
 * 
 * All event publishing is delegated to the backend which handles:
 * - Audit log creation
 * - Notification generation
 * - Event deduplication
 * - Transactional event processing
 */
export class EventBus {
  static async publish(event: BusEvent) {
    const def = EVENT_CATALOG[event.type as keyof typeof EVENT_CATALOG];
    
    if (!def) {
      logger.warn(`[EventBus] Unregistered event type: ${event.type}`, { 
        error: "Event not found in catalog", 
        app: "merchant" 
      });
      return;
    }

    const { merchantId, type, entityType, entityId, payload = {}, dedupeKey, ctx } = event;

    try {
      // Call backend API to publish event
      const res = await fetch(`${BACKEND_URL}/api/v1/security/events/publish`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          eventType: type,
          merchantId,
          payload,
          context: {
            actorId: ctx.actorId,
            actorType: ctx.actorType,
            actorLabel: ctx.actorLabel,
            ipAddress: ctx.ipAddress,
            userAgent: ctx.userAgent,
            correlationId: ctx.correlationId,
          },
          options: {
            entityType,
            entityId,
            dedupeKey,
          },
        }),
      });

      if (!res.ok) {
        const error = await res.json().catch(() => ({ 
          error: { message: 'Failed to publish event' } 
        }));
        logger.error('[EventBus] Failed to publish event', error);
      }
    } catch (error) {
      logger.error('[EventBus] Error publishing event', {
        error: error instanceof Error ? error.message : String(error),
        eventType: type,
      });
      // Don't throw - event publishing failures should not block main operation
    }
  }

  /**
   * Get unread notifications for a store
   */
  static async getUnreadNotifications(storeId: string, limit: number = 20) {
    try {
      const token = await getAuthToken();
      
      if (!token) {
        throw new Error('Authentication required');
      }

      const res = await fetch(
        `${BACKEND_URL}/api/v1/security/events/notifications/unread?storeId=${storeId}&limit=${limit}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) {
        const error = await res.json().catch(() => ({ 
          error: { message: 'Failed to get notifications' } 
        }));
        throw new Error(error.error?.message || 'Failed to get notifications');
      }

      const data = await res.json();
      return data.data;
    } catch (error) {
      logger.error('[EventBus] Error getting unread notifications', error);
      throw error;
    }
  }

  /**
   * Mark notification as read
   */
  static async markNotificationAsRead(notificationId: string, storeId: string) {
    try {
      const token = await getAuthToken();
      
      if (!token) {
        throw new Error('Authentication required');
      }

      const res = await fetch(
        `${BACKEND_URL}/api/v1/security/events/notifications/${notificationId}/read`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ storeId }),
        }
      );

      if (!res.ok) {
        const error = await res.json().catch(() => ({ 
          error: { message: 'Failed to mark notification as read' } 
        }));
        throw new Error(error.error?.message || 'Failed to mark notification as read');
      }

      return true;
    } catch (error) {
      logger.error('[EventBus] Error marking notification as read', error);
      throw error;
    }
  }

  /**
   * Get audit logs for a store
   */
  static async getAuditLogs(
    storeId: string,
    options?: {
      limit?: number;
      offset?: number;
      action?: string;
      targetType?: string;
    }
  ) {
    try {
      const token = await getAuthToken();
      
      if (!token) {
        throw new Error('Authentication required');
      }

      const queryParams = new URLSearchParams({
        storeId,
        limit: String(options?.limit || 50),
        offset: String(options?.offset || 0),
      });

      if (options?.action) queryParams.append('action', options.action);
      if (options?.targetType) queryParams.append('targetType', options.targetType);

      const res = await fetch(
        `${BACKEND_URL}/api/v1/security/events/audit-logs?${queryParams.toString()}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) {
        const error = await res.json().catch(() => ({ 
          error: { message: 'Failed to get audit logs' } 
        }));
        throw new Error(error.error?.message || 'Failed to get audit logs');
      }

      const data = await res.json();
      return data.data;
    } catch (error) {
      logger.error('[EventBus] Error getting audit logs', error);
      throw error;
    }
  }
}

/**
 * Helper function to get auth token from cookies
 */
async function getAuthToken(): Promise<string | null> {
  try {
    const { cookies } = await import('next/headers');
    const cookieStore = await cookies();
    const authTokenCookie = cookieStore.get('auth_token');
    return authTokenCookie?.value || null;
  } catch {
    return null;
  }
}
