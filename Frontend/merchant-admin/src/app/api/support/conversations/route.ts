import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@vayva/db";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { logger } from "@/lib/logger";

type ChannelType = "INSTAGRAM" | "WHATSAPP" | "EMAIL" | "SMS";

export const GET = withVayvaAPI(PERMISSIONS.SUPPORT_VIEW, async (req: NextRequest, { storeId }: { storeId: string }) => {
  try {
    const url = new URL(req.url);
    const channel = url.searchParams.get("channel")?.toUpperCase();

    const where: Record<string, unknown> = { storeId };
    if (channel) {
      where.contact = { channel };
    }

    const conversations = await prisma.conversation?.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      include: {
        messages: { orderBy: { createdAt: "desc" }, take: 1 },
        contact: true,
      },
    });

    const formatted = conversations.map((c) => ({
      id: c.id,
      customerName: c.contact?.displayName || "Unknown",
      customerPhone: c.contact?.phoneE164 || null,
      customerEmail: null, // Contact model doesn't have email
      channel: c.contact?.channel as ChannelType,
      status: (c as any).status,
      priority: c.priority,
      lastMessage: c.messages[0]?.textBody || null,
      lastMessageAt: c.messages[0]?.createdAt || c.updatedAt,
      unreadCount: 0,
      tags: c.tags || [],
    }));

    return NextResponse.json({ success: true, data: formatted }, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error));
    logger.error("[CONVERSATIONS_GET] Failed to fetch conversations", { storeId, message: err.message });
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
});
