import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@vayva/db";
import { OpsAuthService } from "@/lib/ops-auth";
import { logger } from "@vayva/shared";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  await OpsAuthService.requireSession();

  try {
    const { id: storeId } = await params;

    // Get audit logs for this merchant from store's order events as proxy
    const orderEvents = await prisma.orderEvent.findMany({
      where: { storeId },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const logs = orderEvents.map((event: any) => ({
      id: event.id,
      action: event.type || "ORDER_EVENT",
      actor: "system",
      actorName: "System",
      metadata: event.data || {},
      createdAt: event.createdAt.toISOString(),
      ipAddress: null,
    }));

    return NextResponse.json({ logs });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: unknown) {
    logger.error("[MERCHANT_AUDIT_ERROR]", { error });
    return NextResponse.json(
      { error: "Failed to fetch audit logs" },
      { status: 500 },
    );
  }
}
