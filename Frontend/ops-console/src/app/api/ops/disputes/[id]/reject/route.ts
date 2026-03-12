import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@vayva/db";
import { OpsAuthService } from "@/lib/ops-auth";
import { logger } from "@/lib/logger";

export async function POST(
  request: NextRequest,
  props: { params: Promise<{ id: string }> },
) {
  const params = await props.params;
  try {
    const sessionData = await OpsAuthService.requireSession();
    try {
      OpsAuthService.requireRole(sessionData.user, "OPS_ADMIN");
    } catch (e) {
      return NextResponse.json(
        {
          error:
            e instanceof Error
              ? e instanceof Error
                ? e.message
                : String(e)
              : String(e),
        },
        { status: 403 },
      );
    }
    const { user } = sessionData;

    const disputeId = params.id;
    const body = await request.json();
    const { reason } = body;

    // Fetch dispute
    const dispute = await prisma.dispute.findUnique({
      where: { id: disputeId },
    });

    if (!dispute) {
      return NextResponse.json({ error: "Dispute not found" }, { status: 404 });
    }

    // Check if already resolved
    if (["WON", "LOST", "CANCELLED"].includes(dispute.status)) {
      return NextResponse.json(
        { error: "Dispute is already resolved" },
        { status: 400 },
      );
    }

    // Update dispute status
    const updatedDispute = await prisma.dispute.update({
      where: { id: disputeId },
      data: {
        status: "WON", // Rejected claim = Merchant Won
        updatedAt: new Date(),
      },
    });

    // Create timeline event
    await prisma.disputeTimelineEvent.create({
      data: {
        disputeId,
        eventType: "ADMIN_ACTION",
        payload: {
          action: "REJECT",
          adminId: user.id,
          reason,
          description: `Dispute rejected by Ops Admin: ${user.email}`,
        },
      },
    });

    return NextResponse.json({
      success: true,
      dispute: updatedDispute,
      message: "Dispute rejected successfully",
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: unknown) {
    logger.error("Reject dispute error", error);
    return NextResponse.json(
      { error: "Failed to reject dispute" },
      { status: 500 },
    );
  }
}
