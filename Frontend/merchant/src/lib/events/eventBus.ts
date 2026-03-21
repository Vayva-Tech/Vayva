import { prisma, type Prisma } from "@vayva/db";
import { logger } from "@vayva/shared";
import { EVENT_CATALOG } from "./catalog";

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

type PrismaOperation = Prisma.PrismaPromise<unknown>;

export class EventBus {
    static async publish(event: BusEvent) {
        const def = EVENT_CATALOG[event.type as keyof typeof EVENT_CATALOG];
        if (!def) {
            logger.warn(`[EventBus] Unregistered event type: ${event.type}`, { error: "Event not found in catalog", app: "merchant" });
            return;
        }
        const { merchantId, type, entityType, entityId, payload = {}, dedupeKey, ctx } = event;
        const ops: PrismaOperation[] = [];
        
        if ('audit' in def && def.audit) {
            const auditDef = def.audit as { 
                action: string; 
                beforeState?: (p: EventPayload) => unknown;
                afterState?: (p: EventPayload) => unknown;
            };
            ops.push(prisma.auditLog?.create({
                data: {
                    app: "merchant",
                    action: auditDef.action,
                    targetType: (entityType || "system") as Prisma.AuditLogCreateInput["targetType"],
                    targetId: entityId || "none",
                    targetStoreId: merchantId,
                    actorUserId: ctx.actorId,
                    actorRole: ctx.actorType,
                    ip: ctx.ipAddress,
                    userAgent: ctx.userAgent,
                    requestId: ctx.correlationId || "system",
                    metadata: {
                        actorLabel: ctx.actorLabel,
                        beforeState: auditDef.beforeState
                            ? auditDef.beforeState(payload)
                            : undefined,
                        afterState: auditDef.afterState
                            ? auditDef.afterState(payload)
                            : undefined,
                    } as Prisma.InputJsonValue,
                },
            }));
        }
        
        if ('notification' in def && def.notification) {
            const notifDef = def.notification as unknown as {
                title: string | ((p: EventPayload) => string);
                body: string | ((p: EventPayload) => string);
                severity: string;
                actionUrl?: string | ((p: EventPayload, id?: string) => string);
            };
            const title = typeof notifDef.title === "function"
                ? notifDef.title(payload)
                : notifDef.title;
            const body = typeof notifDef.body === "function"
                ? notifDef.body(payload)
                : notifDef.body;
            const actionUrl = notifDef.actionUrl
                ? typeof notifDef.actionUrl === "function"
                    ? notifDef.actionUrl(payload, entityId)
                    : notifDef.actionUrl
                : null;
            
            if (dedupeKey) {
                ops.push(prisma.notification?.upsert({
                    where: { dedupeKey },
                    create: {
                        storeId: merchantId,
                        userId: null,
                        type,
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
                }));
            }
            else {
                ops.push(prisma.notification?.create({
                    data: {
                        storeId: merchantId,
                        userId: null,
                        type,
                        title,
                        body,
                        severity: notifDef.severity,
                        actionUrl,
                        entityType,
                        entityId,
                        dedupeKey,
                        metadata: payload as Prisma.InputJsonValue,
                    },
                }));
            }
        }
        
        if (ops.length > 0) {
            try {
                await prisma.$transaction(ops);
            }
            catch (error) {
                logger.error(`[EventBus] Failed to process event ${event.type}:`, { error: error instanceof Error ? error.message : String(error) });
            }
        }
    }
}
