import { prisma, Prisma, AuditTargetType, AuditSeverity } from "@vayva/db";
import { logger } from "@vayva/shared";
import { EVENT_CATALOG } from "./catalog";

type AuditDefinition = {
  action: string;
  beforeState?: (payload: Record<string, unknown>) => unknown;
  afterState?: (payload: Record<string, unknown>) => unknown;
};

function toJsonValue(value: unknown): Prisma.InputJsonValue {
  return JSON.parse(
    JSON.stringify(value, (_key, item) => {
      if (item instanceof Date) return item.toISOString();
      if (typeof item === "bigint") return item.toString();
      return item;
    }),
  );
}

export class EventBus {
  /**
   * Publishes an event to the system.
   * Automatically creates Notifications and AuditLogs based on the Catalog definition.
   * Wraps writes in a transaction if possible, or executes them safely.
   */
  static async publish(event: {
    type: string;
    merchantId: string;
    entityType?: string;
    entityId?: string;
    payload?: Record<string, unknown>;
    dedupeKey?: string;
    ctx: {
      actorId: string;
      actorType: string;
      actorLabel?: string;
      ipAddress?: string;
      userAgent?: string;
      correlationId?: string;
    };
  }) {
    const eventType = event.type as keyof typeof EVENT_CATALOG;
    const def = EVENT_CATALOG[eventType];
    if (!def) {
      // Event not in catalog - ignore or just log debug
      logger.warn(`[EventBus] Unregistered event type: ${event.type}`, {
        error: "Event not found in catalog",
        app: "merchant",
      });
      return;
    }
    const {
      merchantId,
      type,
      entityType,
      entityId,
      payload = {},
      dedupeKey,
      ctx,
    } = event;
    const ops: Array<
      | ReturnType<typeof prisma.auditLog.create>
      | ReturnType<typeof prisma.notification.create>
      | ReturnType<typeof prisma.notification.upsert>
    > = [];

    if ("audit" in def && def.audit) {
      const auditDef = def.audit as AuditDefinition;
      const beforeState =
        typeof auditDef.beforeState === "function"
          ? auditDef.beforeState(payload)
          : undefined;
      const afterState =
        typeof auditDef.afterState === "function"
          ? auditDef.afterState(payload)
          : undefined;
      ops.push(
        prisma.auditLog.create({
          data: {
            app: "merchant",
            action: auditDef.action,
            targetType: (entityType || "system") as AuditTargetType,
            targetId: entityId || "none",
            targetStoreId: merchantId,
            actorUserId: ctx.actorId,
            actorRole: ctx.actorType,
            ip: ctx.ipAddress || null,
            userAgent: ctx.userAgent || null,
            requestId: ctx.correlationId || "system",
            metadata: toJsonValue({
              actorLabel: ctx.actorLabel,
              beforeState,
              afterState,
            }),
          },
        }),
      );
    }
    if ("notification" in def && def.notification) {
      const notifDef = def.notification;
      type NotifDef = {
        title: string | ((p: Record<string, unknown>) => string);
        body: string | ((p: Record<string, unknown>) => string);
        actionUrl?:
          | string
          | ((p: Record<string, unknown>, id?: string) => string);
        severity: string;
      };
      const nd = notifDef as NotifDef;
      const title =
        typeof nd.title === "function" ? nd.title(payload) : nd.title;
      const body = typeof nd.body === "function" ? nd.body(payload) : nd.body;
      const actionUrl = nd.actionUrl
        ? typeof nd.actionUrl === "function"
          ? nd.actionUrl(payload, entityId)
          : nd.actionUrl
        : null;
      // Handle deduplication if key provided
      if (dedupeKey) {
        ops.push(
          prisma.notification.upsert({
            where: { dedupeKey },
            create: {
              storeId: merchantId,
              userId: null, // Default to null for broadcast
              type,
              title,
              body,
              severity: nd.severity,
              actionUrl,
              entityType: entityType || null,
              entityId: entityId || null,
              dedupeKey,
              metadata: toJsonValue(payload),
            },
            update: {},
          }),
        );
      } else {
        ops.push(
          prisma.notification.create({
            data: {
              storeId: merchantId,
              userId: null, // Broadcast to store
              type,
              title,
              body,
              severity: nd.severity,
              actionUrl,
              entityType: entityType || null,
              entityId: entityId || null,
              dedupeKey: null,
              metadata: toJsonValue(payload),
            },
          }),
        );
      }
    }
    if (ops.length > 0) {
      try {
        await prisma.$transaction(ops);
      } catch (error) {
        logger.error(`[EventBus] Failed to process event ${event.type}:`, {
          error: error instanceof Error ? error.message : String(error),
        });
        // Don't throw, to avoid breaking the main business logic flow if this was awaited
      }
    }
  }
}
