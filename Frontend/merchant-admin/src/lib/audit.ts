import { logger } from "@vayva/shared";

export enum AuditEventType {
  USER_LOGIN = "USER_LOGIN",
  USER_LOGOUT = "USER_LOGOUT",
  ORDER_CREATED = "ORDER_CREATED",
  ORDER_UPDATED = "ORDER_UPDATED",
  PRODUCT_CREATED = "PRODUCT_CREATED",
  PRODUCT_UPDATED = "PRODUCT_UPDATED",
  PRODUCT_DELETED = "PRODUCT_DELETED",
  SETTINGS_CHANGED = "SETTINGS_CHANGED",
  USER_PASSWORD_CHANGED = "USER_PASSWORD_CHANGED",
  PAYMENT_PROCESSED = "PAYMENT_PROCESSED",
  REFUND_ISSUED = "REFUND_ISSUED",
  SECURITY_RATE_LIMIT_BLOCKED = "SECURITY_RATE_LIMIT_BLOCKED",
  TEAM_MEMBER_REMOVED = "TEAM_MEMBER_REMOVED",
  TEAM_MEMBER_ROLE_UPDATED = "TEAM_MEMBER_ROLE_UPDATED",
  SOCIALS_MESSAGE_SENT = "SOCIALS_MESSAGE_SENT",
}

export interface AuditEvent {
  id: string;
  storeId: string;
  userId?: string;
  eventType: AuditEventType;
  targetType: string;
  targetId?: string;
  meta?: Record<string, unknown>;
  createdAt: Date;
}

export async function logAuditEvent(
  storeId: string,
  userId: string,
  eventType: AuditEventType,
  data: {
    targetType: string;
    targetId?: string;
    ipAddress?: string;
    reason?: string;
    meta?: Record<string, unknown>;
  }
): Promise<void> {
  // Send audit event to backend logging service
  try {
    const response = await fetch(`${process.env.BACKEND_API_URL}/api/audit/log`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        storeId,
        userId,
        eventType,
        targetType: data.targetType,
        targetId: data.targetId,
        ipAddress: data.ipAddress,
        reason: data.reason,
        meta: data.meta,
        timestamp: new Date().toISOString(),
      }),
    });

    if (!response.ok) {
      logger.error("[AUDIT_LOG_FAILED]", { storeId, userId, eventType, status: response.status });
    }
  } catch (error) {
    logger.error("[AUDIT_LOG_ERROR]", { error: error instanceof Error ? error.message : String(error), storeId, eventType });
  }
}

// Alias for compatibility
export { logAuditEvent as logAudit };

