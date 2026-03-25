import { NextRequest, NextResponse } from "next/server";
import { buildBackendAuthHeaders } from "@/lib/backend-proxy";
import { prisma } from "@vayva/db";
import { handleApiError } from "@/lib/api-error-handler";

export async function GET(request: NextRequest) {
  try {
    const auth = await buildBackendAuthHeaders(request);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const storeId = auth.user.storeId;
    const url = new URL(request.url);
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
      channel: c.contact?.channel as string,
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
  } catch (error) {
    handleApiError(error, { endpoint: "/api/support/conversations", operation: "GET" });
    return NextResponse.json(
      { error: "Failed to complete operation" },
      { status: 500 }
    );
  }
}
