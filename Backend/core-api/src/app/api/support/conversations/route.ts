import { NextResponse } from "next/server";
import { Prisma, prisma } from "@vayva/db";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { logger } from "@/lib/logger";

type ConversationWithContactAndLastMessage = Prisma.ConversationGetPayload<{
  include: {
    contact: {
      select: {
        displayName: true;
        phoneE164: true;
        externalId: true;
        channel: true;
      };
    };
    messages: {
      take: 1;
      select: { textBody: true; createdAt: true; direction: true };
    };
  };
}>;

export const GET = withVayvaAPI(
  PERMISSIONS.SUPPORT_MANAGE,
  async (req, { storeId }) => {
    try {
      const { searchParams } = new URL(req.url);
      const channelParam = (searchParams.get("channel") || "").toLowerCase();

      const channelFilter: "INSTAGRAM" | "WHATSAPP" | null =
        channelParam === "instagram"
          ? "INSTAGRAM"
          : channelParam === "whatsapp"
            ? "WHATSAPP"
            : null;

      const conversations: ConversationWithContactAndLastMessage[] =
        await prisma.conversation.findMany({
          where: {
            storeId,
            ...(channelFilter
              ? {
                  contact: {
                    channel: channelFilter,
                  },
                }
              : {}),
          },
          include: {
            contact: {
              select: {
                displayName: true,
                phoneE164: true,
                externalId: true,
                channel: true,
              },
            },
            messages: {
              orderBy: { createdAt: "desc" },
              take: 1,
              select: { textBody: true, createdAt: true, direction: true },
            },
          },
          orderBy: { lastMessageAt: "desc" },
          take: 30,
        });
      const normalizeSupportStatus = (status: unknown): string => {
        const s = String(status || "OPEN").toUpperCase();
        if (s === "RESOLVED" || s === "CLOSED") return "RESOLVED";
        return "OPEN";
      };

      const normalizeWhatsAppStatus = (
        status: unknown,
      ): "open" | "resolved" => {
        const s = String(status || "OPEN").toUpperCase();
        if (s === "RESOLVED" || s === "CLOSED") return "resolved";
        return "open";
      };

      const formatted = conversations.map((c) => {
        const contactName =
          c.contact?.displayName || c.contact?.phoneE164 || "Unknown Contact";
        const contactPhone = c.contact?.phoneE164 || null;
        const subtitle = contactPhone || c.contact?.externalId || null;
        const unreadCount = Number(c.unreadCount || 0);
        const lastMsg = c.messages?.[0] || null;
        const lastMessage = lastMsg?.textBody || "No messages";
        const lastMessageAt = lastMsg?.createdAt || c.createdAt;

        const contactChannel = String(
          c.contact?.channel || "WHATSAPP",
        ).toLowerCase();
        const channel =
          contactChannel === "instagram" ? "instagram" : "whatsapp";

        return {
          channel,

          id: c.id,
          contactName,
          subtitle,
          status: normalizeSupportStatus(c.status),
          unread: unreadCount > 0,
          lastMessage,
          lastMessageAt,
          direction: lastMsg?.direction || "INBOUND",

          customerId: c.contactId || c.contact?.externalId || c.id,
          customerName: contactName,
          customerPhone: contactPhone || undefined,
          unreadCount,
          lastMessagePreview: lastMessage,
          statusWa: normalizeWhatsAppStatus(c.status),
        };
      });
      return NextResponse.json(
        { success: true, data: formatted },
        {
          headers: {
            "Cache-Control": "no-store",
          },
        },
      );
    } catch (error) {
      logger.error("[CONVERSATIONS_GET]", error, { storeId });
      return NextResponse.json(
        { error: "Failed to fetch conversations" },
        {
          headers: {
            "Cache-Control": "no-store",
          },
          status: 500,
        },
      );
    }
  },
);
