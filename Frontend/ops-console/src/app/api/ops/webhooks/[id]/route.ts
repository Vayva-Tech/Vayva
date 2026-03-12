import { NextRequest, NextResponse } from "next/server";
import { OpsAuthService } from "@/lib/ops-auth";
import { prisma } from "@vayva/db";
import { logger } from "@vayva/shared";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await OpsAuthService.requireSession();

    const { id } = await params;

    const webhook = await prisma.webhookEvent.findUnique({
      where: { id },
      include: {
        store: {
          select: { id: true, name: true, slug: true },
        },
      },
    });

    if (!webhook) {
      return NextResponse.json({ error: "Webhook not found" }, { status: 404 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data: any = {
      id: webhook.id,
      provider: webhook.provider,
      eventType: webhook.eventType,
      status: webhook.status.toUpperCase(),
      receivedAt: webhook.receivedAt,
      processedAt: webhook.processedAt,
      error: webhook.error,
      payload: webhook.payload,
      storeId: webhook.store?.id,
      storeName: webhook.store?.name || "Unknown Store",
    };

    return NextResponse.json({ data });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: unknown) {
    logger.error("[WEBHOOK_DETAIL_ERROR]", { error });
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
