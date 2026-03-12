import { NextResponse } from "next/server";
import { prisma } from "@vayva/db";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";

export const GET = withVayvaAPI(
  PERMISSIONS.SUPPORT_VIEW,
  async (_req, { params, storeId }) => {
    try {
      const { id } = await params;

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

      const contactName =
        conversation.contact?.displayName ||
        conversation.contact?.phoneE164 ||
        "Unknown Contact";
      const contactPhone = conversation.contact?.phoneE164 || null;

      const response = {
        id: conversation.id,
        channel: String(
          conversation.contact?.channel || "WHATSAPP",
        ).toLowerCase(),
        customerId:
          conversation.contactId ||
          conversation.contact?.externalId ||
          conversation.id,
        customerName: contactName,
        customerPhone: contactPhone || undefined,
        unreadCount: Number(conversation.unreadCount || 0),
        lastMessageAt: conversation.lastMessageAt || conversation.createdAt,
        status: String(conversation.status || "OPEN"),
      };

      return NextResponse.json(
        { success: true, data: response },
        {
          headers: {
            "Cache-Control": "no-store",
          },
        },
      );
    } catch (error: unknown) {
      logger.error("[CONVERSATION_DETAIL]", error, { storeId });
      return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
  },
);
