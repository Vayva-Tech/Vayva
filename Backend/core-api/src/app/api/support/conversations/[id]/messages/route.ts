import { NextResponse } from "next/server";
import { prisma, Direction, MessageStatus, MessageType } from "@vayva/db";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { WhatsAppMessageSender, WhatsAppLinkedEntityType } from "@vayva/shared";
import { AuditEventType, logAudit } from "@/lib/audit";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getObject(value: unknown): Record<string, unknown> {
  return isRecord(value) ? value : {};
}

function getString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

export const GET = withVayvaAPI(
  PERMISSIONS.SUPPORT_VIEW,
  async (req, { params, storeId }) => {
    try {
      const { id } = await params; // conversationId

      const messages = await prisma.message.findMany({
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
        sender:
          m.direction === Direction.OUTBOUND
            ? WhatsAppMessageSender.MERCHANT
            : WhatsAppMessageSender.CUSTOMER,
        linkedType: WhatsAppLinkedEntityType.NONE,
        linkedId: undefined,
        content: m.textBody || "[Media message]",
        timestamp: m.createdAt.toISOString(),
        isAutomated: false,
      }));

      return NextResponse.json(
        { success: true, data: mapped },
        {
          headers: {
            "Cache-Control": "no-store",
          },
        },
      );
    } catch (error: unknown) {
      logger.error("[CONVERSATION_GET]", error, { storeId });
      return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
  },
);
export const POST = withVayvaAPI(
  PERMISSIONS.SUPPORT_MANAGE,
  async (req, { params, storeId, correlationId, user }) => {
    try {
      const { id } = await params;
      const body = getObject(await req.json().catch(() => ({})));
      const text = getString(body.text) || getString(body.content);
      if (!text) {
        return NextResponse.json(
          { error: "Message text required" },
          { status: 400 },
        );
      }

      const conversation = await prisma.conversation.findUnique({
        where: { id, storeId },
        include: {
          contact: true,
        },
      });
      if (!conversation) {
        return NextResponse.json(
          { error: "Conversation not found" },
          { status: 404 },
        );
      }

      const whatsappServiceUrl = process.env.WHATSAPP_SERVICE_URL;
      const apiGatewayUrl = process.env.NEXT_PUBLIC_API_URL;
      const upstreamBaseUrl = whatsappServiceUrl || apiGatewayUrl;

      const isAbsoluteUpstream =
        typeof upstreamBaseUrl === "string" &&
        /^https?:\/\//i.test(upstreamBaseUrl);

      if (isAbsoluteUpstream) {
        const base = upstreamBaseUrl.replace(/\/$/, "").replace(/\/v1$/, "");
        const upstreamUrl = `${base}/v1/whatsapp/threads/${id}/messages`;

        const internalApiSecret = process.env.INTERNAL_API_SECRET;
        if (!internalApiSecret) {
          return NextResponse.json(
            { error: "Server configuration error" },
            { status: 500 }
          );
        }

        const upstreamResponse = await fetch(upstreamUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-store-id": storeId,
            "x-correlation-id": correlationId,
            "x-internal-secret": internalApiSecret,
          },
          body: JSON.stringify({ body: text }),
        });

        const parsedUpstream = await upstreamResponse
          .json()
          .catch(async () => ({ raw: await upstreamResponse.text() }));
        const upstreamData = getObject(parsedUpstream);

        if (!upstreamResponse.ok) {
          const errObj = upstreamData.error;
          const message =
            (isRecord(errObj) && getString(errObj.message)) ||
            getString(errObj) ||
            "Failed to send message";
          if (upstreamResponse.status === 429) {
            const retryAfterSecondsRaw = upstreamData?.retryAfterSeconds;
            const retryAfterSeconds = Number(retryAfterSecondsRaw);
            const safeRetryAfter =
              Number.isFinite(retryAfterSeconds) && retryAfterSeconds > 0
                ? retryAfterSeconds
                : undefined;
            return NextResponse.json(
              { error: message, retryAfterSeconds: safeRetryAfter },
              {
                status: 429,
                headers: safeRetryAfter
                  ? { "Retry-After": String(safeRetryAfter) }
                  : undefined,
              },
            );
          }
          return NextResponse.json(
            { error: message },
            { status: upstreamResponse.status },
          );
        }

        await prisma.conversation.update({
          where: { id },
          data: {
            lastMessageAt: new Date(),
            lastOutboundAt: new Date(),
            unreadCount: 0,
          },
        });

        const created = getObject(upstreamData);
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
          timestamp: (created.createdAt
            ? new Date(String(created.createdAt))
            : new Date()
          ).toISOString(),
          isAutomated: false,
        };

        const forwardedFor = req.headers.get("x-forwarded-for") || "";
        const ipAddress =
          forwardedFor.split(",")[0]?.trim() ||
          req.headers.get("x-real-ip") ||
          undefined;
        const userAgent = req.headers.get("user-agent") || undefined;
        await logAudit(storeId, user?.id, AuditEventType.SOCIALS_MESSAGE_SENT, {
          correlationId,
          actorType: "merchant_user",
          actorLabel: user?.email || user?.id || "unknown",
          entityType: "CONVERSATION",
          entityId: id,
          afterState: {
            messageId: mapped.id,
            channel: undefined,
            textLength: String(text).length,
            via: "service",
          },
          ipAddress,
          userAgent,
        });

        return NextResponse.json({ success: true, data: mapped });
      }

      const created = await prisma.message.create({
        data: {
          storeId,
          conversationId: id,
          direction: Direction.OUTBOUND,
          type: MessageType.TEXT,
          status: MessageStatus.SENT,
          textBody: text,
        },
      });

      await prisma.conversation.update({
        where: { id },
        data: {
          lastMessageAt: new Date(),
          lastOutboundAt: new Date(),
          unreadCount: 0,
        },
      });

      const mapped = {
        id: created.id,
        conversationId: created.conversationId,
        sender: WhatsAppMessageSender.MERCHANT,
        content: created.textBody || "",
        linkedType: WhatsAppLinkedEntityType.NONE,
        linkedId: undefined,
        timestamp: created.createdAt.toISOString(),
        isAutomated: false,
      };

      const forwardedFor = req.headers.get("x-forwarded-for") || "";
      const ipAddress =
        forwardedFor.split(",")[0]?.trim() ||
        req.headers.get("x-real-ip") ||
        undefined;
      const userAgent = req.headers.get("user-agent") || undefined;
      await logAudit(storeId, user?.id, AuditEventType.SOCIALS_MESSAGE_SENT, {
        correlationId,
        actorType: "merchant_user",
        actorLabel: user?.email || user?.id || "unknown",
        entityType: "CONVERSATION",
        entityId: id,
        afterState: {
          messageId: mapped.id,
          channel: undefined,
          textLength: String(text).length,
          via: "local_db",
        },
        ipAddress,
        userAgent,
      });

      return NextResponse.json({ success: true, data: mapped });
    } catch (error: unknown) {
      logger.error("[CONVERSATION_REPLY]", error, { storeId, correlationId });
      return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
  },
);
