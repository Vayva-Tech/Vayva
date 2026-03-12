import { NextResponse } from "next/server";
import { prisma } from "@vayva/db";
import { OpsAuthService } from "@/lib/ops-auth";
import { logger } from "@vayva/shared";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { user } = await OpsAuthService.requireSession();
    if (!["OPS_OWNER", "OPS_ADMIN", "OPS_SUPPORT"].includes(user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const resolvedParams = await params;
    const { id } = resolvedParams;

    // Fetch shipment
    const shipment = await prisma.shipment.findUnique({
      where: { id },
      include: { order: true },
    });

    if (!shipment) {
      return NextResponse.json(
        { error: "Shipment not found" },
        { status: 404 },
      );
    }

    // 1. Audit log
    await OpsAuthService.logEvent(user.id, "SHIPMENT_RETRY_DISPATCH", {
      shipmentId: id,
      orderId: shipment.orderId,
      reason: "Manual retry by OP",
    });

    // 2. Logic to retry dispatch
    // This would traditionally call a logistics service (Kwik, etc.)
    // to create a new job. For now, we update status to trigger re-sync
    // or background worker pickup.
    await prisma.shipment.update({
      where: { id },
      data: {
        status: "CREATED",
      },
    });

    return NextResponse.json({
      success: true,
      message: "Dispatch retry initiated",
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: unknown) {
    if (
      error instanceof Error ? error.message : String(error) === "Unauthorized"
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    logger.error("[RETRY_DISPATCH_ERROR]", { error });
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
