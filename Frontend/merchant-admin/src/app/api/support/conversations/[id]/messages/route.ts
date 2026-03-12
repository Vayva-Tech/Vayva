import { NextRequest, NextResponse } from "next/server";
import { prisma , Direction, MessageStatus, MessageType } from "@vayva/db";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { WhatsAppMessageSender, WhatsAppLinkedEntityType } from "@vayva/shared";
import { logger } from "@/lib/logger";
import { AuditEventType, logAudit } from "@/lib/audit";
export const GET = withVayvaAPI(PERMISSIONS.SUPPORT_VIEW, async (req: NextRequest, { params, storeId }: { params: Record<string, string> | Promise<Record<string, string>>; storeId: string }) => {
    try {
        const { id } = await params; // conversationId

        const messages = await prisma.message?.findMany({
            where: {
                conversationId: id,
                conversation: {
                    storeId,
                },
            },
            orderBy: { createdAt: "asc" },
            take: 200,
        });

        const mapped = messages.map((m) => ({
            id: m.id,
            conversationId: m.conversationId,
            sender: m.direction === Direction.OUTBOUND
                ? WhatsAppMessageSender.MERCHANT
                : WhatsAppMessageSender.CUSTOMER,
            linkedType: WhatsAppLinkedEntityType.NONE,
            linkedId: undefined,
            content: m.textBody || "[Media message]",
            timestamp: m.createdAt?.toISOString(),
            isAutomated: false,
        }));

        return NextResponse.json({ success: true, data: mapped }, {
            headers: {
                "Cache-Control": "no-store",
            },
        });
    }
    catch (error) {
        logger.error("[CONVERSATION_MESSAGES_GET] Failed to fetch messages", { storeId, error });
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
});
export const POST = withVayvaAPI(PERMISSIONS.SUPPORT_MANAGE, async (req: NextRequest, { params, storeId, correlationId, user }: { params: Record<string, string> | Promise<Record<string, string>>; storeId: string; correlationId: string; user: { id: string; email?: string } }) => {
    try {
        const { id } = await params;
        const body = await req.json();
        const text = body?.text || body?.content;
        if (!text) {
            return NextResponse.json({ error: "Message text required" }, { status: 400 });
        }

        const conversation = await prisma.conversation?.findUnique({
            where: { id, storeId },
            include: {
                contact: true,
            }
        });
        if (!conversation) {
            return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
        }

        const whatsappServiceUrl = process.env?.WHATSAPP_SERVICE_URL;
        const apiGatewayUrl = process.env?.NEXT_PUBLIC_API_URL;
        const upstreamBaseUrl = whatsappServiceUrl || apiGatewayUrl;

        const isAbsoluteUpstream = typeof upstreamBaseUrl === "string" && /^https?:\/\//i.test(upstreamBaseUrl);

        if (isAbsoluteUpstream) {
            const base = upstreamBaseUrl.replace(/\/$/, "").replace(/\/v1$/, "");
            const upstreamUrl = `${base}/v1/whatsapp/threads/${id}/messages`;

            const upstreamResponse = await fetch(upstreamUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "x-store-id": storeId,
                    "x-correlation-id": correlationId,
                    "x-internal-secret": process.env?.INTERNAL_API_SECRET || "",
                },
                body: JSON.stringify({ body: text }),
            });

            const upstreamData = await upstreamResponse
                .json()
                .catch(async () => ({ raw: await upstreamResponse.text() })) as Record<string, unknown>;

            if (!upstreamResponse.ok) {
                const errObj = upstreamData?.error as Record<string, unknown> | string | undefined;
                const message =
                    (typeof errObj === "object" && typeof errObj?.message === "string" && errObj.message) ||
                    (typeof errObj === "string" && errObj) ||
                    "Failed to send message";
                if ((upstreamResponse as any).status === 429) {
                    const retryAfterSecondsRaw = upstreamData?.retryAfterSeconds;
                    const retryAfterSeconds = Number(retryAfterSecondsRaw);
                    const safeRetryAfter = Number.isFinite(retryAfterSeconds) && retryAfterSeconds > 0
                        ? retryAfterSeconds
                        : undefined;
                    return NextResponse.json({ error: message, retryAfterSeconds: safeRetryAfter }, {
                        status: 429,
                        headers: safeRetryAfter ? { "Retry-After": String(safeRetryAfter) } : undefined,
                    });
                }
                return NextResponse.json({ error: message }, { status: (upstreamResponse as any).status });
            }

            await prisma.conversation?.update({
                where: { id },
                data: {
                    lastMessageAt: new Date(),
                    lastOutboundAt: new Date(),
                    unreadCount: 0
                }
            });

            const created = upstreamData as Record<string, unknown>;
            const mapped = {
                id: typeof created.id === "string" ? created.id : "",
                conversationId: id,
                sender: WhatsAppMessageSender.MERCHANT,
                content:
                    (typeof created.textBody === "string" && created.textBody) ||
                    (typeof created.text === "string" && created.text) ||
                    String(text),
                linkedType: WhatsAppLinkedEntityType.NONE,
                linkedId: undefined,
                timestamp: (
                    created.createdAt ? new Date(String(created.createdAt)) : new Date()
                ).toISOString(),
                isAutomated: false,
            };

            const forwardedFor = req.headers?.get("x-forwarded-for") || "";
            const ipAddress = forwardedFor.split(",")[0]?.trim() || req.headers?.get("x-real-ip") || undefined;
            const userAgent = req.headers?.get("user-agent") || undefined;
            await logAudit(storeId, user?.id, AuditEventType.SOCIALS_MESSAGE_SENT, {
                targetType: "CONVERSATION",
                targetId: id,
                ipAddress,
                meta: {
                    correlationId,
                    actorType: "merchant_user",
                    actorLabel: user?.email || user?.id || "unknown",
                    afterState: {
                        messageId: mapped.id,
                        channel: undefined,
                        textLength: String(text).length,
                        via: "service",
                    },
                    userAgent,
                },
            });

            return NextResponse.json({ success: true, data: mapped });
        }

        const created = await prisma.message?.create({
            data: {
                storeId,
                conversationId: id,
                direction: Direction.OUTBOUND,
                type: MessageType.TEXT,
                status: MessageStatus.SENT,
                textBody: text,
            }
        });

        await prisma.conversation?.update({
            where: { id },
            data: {
                lastMessageAt: new Date(),
                lastOutboundAt: new Date(),
                unreadCount: 0
            }
        });

        const mapped = {
            id: created.id,
            conversationId: created.conversationId,
            sender: WhatsAppMessageSender.MERCHANT,
            content: created.textBody || "",
            linkedType: WhatsAppLinkedEntityType.NONE,
            linkedId: undefined,
            timestamp: created.createdAt?.toISOString(),
            isAutomated: false,
        };

        const forwardedFor = req.headers?.get("x-forwarded-for") || "";
        const ipAddress = forwardedFor.split(",")[0]?.trim() || req.headers?.get("x-real-ip") || undefined;
        const userAgent = req.headers?.get("user-agent") || undefined;
        await logAudit(storeId, user?.id, AuditEventType.SOCIALS_MESSAGE_SENT, {
            targetType: "CONVERSATION",
            targetId: id,
            ipAddress,
            meta: {
                correlationId,
                actorType: "merchant_user",
                actorLabel: user?.email || user?.id || "unknown",
                afterState: {
                    messageId: mapped.id,
                    channel: undefined,
                    textLength: String(text).length,
                    via: "local_db",
                },
                userAgent,
            },
        });

        return NextResponse.json({ success: true, data: mapped });
    }
    catch (error) {
        logger.error("[CONVERSATION_REPLY] Failed to send message", { storeId, error });
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
});
