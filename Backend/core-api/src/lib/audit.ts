import { prisma, AuditTargetType, AuditSeverity } from "@/lib/db";
import { logger } from "@/lib/logger";
import { v4 as uuidv4 } from "uuid";
export enum AuditEventType {
  SETTINGS_CHANGED = "SETTINGS_CHANGED",
  WITHDRAWAL_REQUESTED = "WITHDRAWAL_REQUESTED",
  USER_INVITED = "USER_INVITED",
  ROLE_UPDATED = "ROLE_UPDATED",
  API_KEY_CREATED = "API_KEY_CREATED",
  WEBHOOK_UPDATED = "WEBHOOK_UPDATED",
  SOCIALS_MESSAGE_SENT = "SOCIALS_MESSAGE_SENT",
  LOGIN_ATTEMPT_FAILED = "LOGIN_ATTEMPT_FAILED",
  SENSITIVE_ACCESS = "SENSITIVE_ACCESS",
  // Legacy mappings
  ORDER_BULK_STATUS_CHANGED = "ORDER_BULK_STATUS_CHANGED",
  ORDER_STATUS_CHANGED = "ORDER_STATUS_CHANGED",
  ORDER_EXPORTED = "ORDER_EXPORTED",
  WITHDRAWAL_BLOCKED_KYC = "WITHDRAWAL_BLOCKED_KYC",
  WITHDRAWAL_STATUS_CHANGED = "WITHDRAWAL_STATUS_CHANGED",
  WITHDRAWAL_EXPORTED = "WITHDRAWAL_EXPORTED",
  SECURITY_RATE_LIMIT_BLOCKED = "SECURITY_RATE_LIMIT_BLOCKED",
  SECURITY_STEP_UP_REQUIRED = "SECURITY_STEP_UP_REQUIRED",
  EXPORT_CREATED = "EXPORT_CREATED",
  EXPORT_DOWNLOADED = "EXPORT_DOWNLOADED",
  SECURITY_SESSION_INVALIDATED = "SECURITY_SESSION_INVALIDATED",
  IDEMPOTENCY_REPLAYED = "IDEMPOTENCY_REPLAYED",
  OPERATION_LOCKED = "OPERATION_LOCKED",
  OPERATION_LOCK_TIMEOUT = "OPERATION_LOCK_TIMEOUT",
  OPERATION_FAILED = "OPERATION_FAILED",
  OPERATION_STUCK = "OPERATION_STUCK",
  OPERATION_SLOW = "OPERATION_SLOW",
  COMPLIANCE_REPORT_CREATED = "COMPLIANCE_REPORT_CREATED",
  COMPLIANCE_REPORT_DOWNLOADED = "COMPLIANCE_REPORT_DOWNLOADED",
  SUDO_SUCCESS = "SUDO_SUCCESS",
  SUDO_FAILED = "SUDO_FAILED",
  TEAM_INVITE_SENT = "TEAM_INVITE_SENT",
  TEAM_ROLE_CHANGED = "TEAM_ROLE_CHANGED",
  TEAM_MEMBER_REMOVED = "TEAM_MEMBER_REMOVED",
  REFUND_PROCESSED = "REFUND_PROCESSED",
  PRODUCT_CREATED = "PRODUCT_CREATED",
  PRODUCT_UPDATED = "PRODUCT_UPDATED",
  DOMAIN_CHANGED = "DOMAIN_CHANGED",
  PAYOUT_SETTING_CHANGED = "PAYOUT_SETTING_CHANGED",
  ACCOUNT_SECURITY_ACTION = "ACCOUNT_SECURITY_ACTION",
}
interface AuditDetails {
  targetType?: string;
  targetId?: string;
  reason?: string;
  before?: unknown;
  after?: unknown;
  meta?: unknown;
  ipAddress?: string;
  userAgent?: string;
  correlationId?: string;
  requestId?: string;
  actorType?: string;
  actorLabel?: string;
  entityType?: string;
  entityId?: string;
  beforeState?: unknown;
  afterState?: unknown;
  severity?: string;
  ip?: string;
  metadata?: Record<string, unknown>;
  [key: string]: unknown;
}

export async function logAuditEvent(
  storeId: string,
  userId: string,
  action: string | AuditEventType,
  details: AuditDetails,
) {
  try {
    await prisma.adminAuditLog.create({
      data: {
        storeId,
        actorUserId: userId,
        action: action.toString(),
        targetType: details.targetType,
        targetId: details.targetId,
        reason: details.reason,
        before: details.before
          ? JSON.parse(JSON.stringify(details.before))
          : undefined,
        after: details.after
          ? JSON.parse(JSON.stringify(details.after))
          : undefined,
        ipAddress: details.ipAddress,
        userAgent: details.userAgent,
      },
    });

    await logAudit(storeId, userId, action, {
      correlationId: details?.correlationId,
      actorType: details?.actorType,
      actorLabel: details?.actorLabel,
      entityType: details?.targetType,
      entityId: details?.targetId,
      beforeState: details?.before,
      afterState: details?.after ?? details?.meta,
      ipAddress: details?.ipAddress,
      userAgent: details?.userAgent,
    });
  } catch (error) {
    logger.error("Failed to write audit log:", error);
  }
}

export async function logAudit(
  storeId: string,
  actorId: string | null,
  action: string | AuditEventType,
  details: AuditDetails,
) {
  try {
    const requestId = details?.correlationId || details?.requestId || uuidv4();
    const actorType = details?.actorType || "merchant_user";
    const actorLabel = details?.actorLabel || String(actorId || "unknown");

    await prisma.auditLog.create({
      data: {
        app: "merchant",
        targetStoreId: storeId,
        actorUserId: actorId ? String(actorId) : null,
        actorRole: actorType,
        action: action.toString(),
        targetType: (details?.entityType || "SYSTEM") as AuditTargetType,
        targetId: details?.entityId || "none",
        ip: details?.ipAddress || details?.ip,
        userAgent: details?.userAgent,
        requestId: String(requestId),
        severity: (details?.severity || "INFO") as AuditSeverity,
        metadata: {
          actorLabel,
          beforeState: details?.beforeState
            ? JSON.parse(JSON.stringify(details.beforeState))
            : undefined,
          afterState: details?.afterState
            ? JSON.parse(JSON.stringify(details.afterState))
            : undefined,
          ...(details?.metadata || {}),
        },
      },
    });

    logger.info("AUDIT_LOG_WRITTEN", {
      storeId,
      actorId,
      action: action.toString(),
      targetType: details?.entityType,
      targetId: details?.entityId,
      requestId,
    });
  } catch (error: unknown) {
    const _errMsg = error instanceof Error ? error.message : String(error);
    logger.error("Failed to write audit log", {
      error: _errMsg,
      storeId,
      actorId,
      action: action?.toString?.() || String(action),
      requestId: details?.correlationId,
    });
  }
}

// Helper for diffing
export function computeDiff(
  oldObj: Record<string, unknown>,
  newObj: Record<string, unknown>,
) {
  const before: Record<string, unknown> = {};
  const after: Record<string, unknown> = {};
  const allKeys = new Set([
    ...Object.keys(oldObj || {}),
    ...Object.keys(newObj || {}),
  ]);
  for (const key of Array.from(allKeys)) {
    const oldVal = oldObj?.[key];
    const newVal = newObj?.[key];
    if (JSON.stringify(oldVal) !== JSON.stringify(newVal)) {
      before[key] = oldVal;
      after[key] = newVal;
    }
  }
  return { before, after };
}
