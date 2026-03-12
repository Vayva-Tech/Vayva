import { NextRequest, NextResponse } from "next/server";
import { prisma, ReturnStatus } from "@vayva/db";
import { OpsAuthService } from "@/lib/ops-auth";
import { logger } from "@vayva/shared";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { user } = await OpsAuthService.requireSession();

  try {
    const { id } = await params;
    const { action } = await req.json();

    if (!["approve", "reject"].includes(action)) {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    const newStatus = action === "approve" ? "APPROVED" : "REJECTED";

    await prisma.returnRequest.update({
      where: { id },
      data: { status: newStatus as ReturnStatus },
    });

    await OpsAuthService.logEvent(user.id, `REFUND_${action.toUpperCase()}`, {
      returnRequestId: id,
    });

    return NextResponse.json({ success: true });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: unknown) {
    logger.error("[REFUND_ACTION_ERROR]", { error });
    return NextResponse.json(
      { error: "Failed to process refund" },
      { status: 500 },
    );
  }
}
