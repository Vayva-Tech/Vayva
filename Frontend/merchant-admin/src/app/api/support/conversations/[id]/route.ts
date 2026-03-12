import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@vayva/db";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { logger } from "@/lib/logger";

interface ContactWithChannel {
  channel?: string;
}

export const GET = withVayvaAPI(PERMISSIONS.SUPPORT_VIEW, async (_req: NextRequest, { params, storeId }: { params: Record<string, string> | Promise<Record<string, string>>; storeId: string }) => {
  try {
    const { id } = await params;

    const conversation = await prisma.conversation?.findUnique({
      where: { id, storeId },
      include: {
        contact: true,
      },
    });

    if (!conversation) {
      return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
    }

    const contactName = conversation.contact?.displayName || conversation.contact?.phoneE164 || "Unknown Contact";
    const contactPhone = conversation.contact?.phoneE164 || null;
    const contactChannel = (conversation.contact as ContactWithChannel | null)?.channel || "WHATSAPP";

    const response = {
      id: conversation.id,
      channel: String(contactChannel).toLowerCase(),
      customerId: conversation.contactId || conversation.contact?.externalId || conversation.id,
      customerName: contactName,
      customerPhone: contactPhone || undefined,
      unreadCount: Number(conversation.unreadCount || 0),
      lastMessageAt: conversation.lastMessageAt || conversation.createdAt,
      status: String((conversation as any).status || "OPEN"),
    };

    return NextResponse.json({ success: true, data: response }, {
      headers: {
        "Cache-Control": "no-store",
      },
    });
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error));
    logger.error("[CONVERSATION_DETAIL] Failed to fetch conversation", { storeId, message: err.message });
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
});
