import { NextRequest, NextResponse } from "next/server";
import { buildBackendAuthHeaders } from "@/lib/backend-proxy";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

interface ContactWithChannel {
  channel: string;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const auth = await buildBackendAuthHeaders(request);
    if (!auth?.user?.storeId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const storeId = auth.user.storeId;
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
  } catch (error) {
    handleApiError(error, { endpoint: "/support/conversations/:id", operation: "GET" });
    return NextResponse.json(
      { error: "Failed to complete operation" },
      { status: 500 }
    );
  }
}
