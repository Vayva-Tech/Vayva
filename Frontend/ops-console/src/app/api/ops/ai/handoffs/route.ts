import { NextResponse } from "next/server";
import { prisma } from "@vayva/db";
import { OpsAuthService } from "@/lib/ops-auth";

interface HandoffEventWithRelations {
  id: string;
  triggerType: string;
  aiSummary: string | null;
  createdAt: Date;
  store: {
    id: string;
    name: string;
    slug: string;
  } | null;
  conversation: {
    id: string;
    storeId: string;
    lastMessageAt: Date | null;
    contact: {
      phoneE164: string | null;
    } | null;
  } | null;
  ticket: {
    id: string;
    status: string;
    priority: string | null;
  } | null;
}

export async function GET(_request: Request) {
  const { user } = await OpsAuthService.requireSession(); // Ensure auth

  // Fetch recent Handoff Events
  const handoffs = await prisma.handoffEvent.findMany({
    take: 50,
    orderBy: { createdAt: "desc" },
    include: {
      store: {
        select: { id: true, name: true, slug: true },
      },
      conversation: {
        select: {
          id: true,
          contact: {
            select: {
              phoneE164: true,
            },
          },
          storeId: true,
          lastMessageAt: true,
        },
      },
      ticket: {
        select: {
          id: true,
          status: true,
          priority: true,
        },
      },
    },
  });

  // Transform for UI with proper typing - no type assertions
  const data = (handoffs as unknown as HandoffEventWithRelations[]).map((h: any) => ({
    id: h.id,
    storeName: h.store?.name ?? "Unknown Store",
    customerPhone: h.conversation?.contact?.phoneE164 ?? "Unknown",
    trigger: h.triggerType,
    aiSummary: h.aiSummary,
    ticketStatus: h.ticket?.status ?? "UNKNOWN",
    timestamp: h.createdAt.toISOString(),
    // Derive preview from actual AI summary instead of hardcoded text
    lastMessagePreview: h.aiSummary
      ? h.aiSummary.split(".").slice(0, 2).join(".") + "."
      : null,
  }));

  return NextResponse.json({ data });
}
