import { NextResponse } from "next/server";
import { prisma } from "@vayva/db";
import { OpsAuthService } from "@/lib/ops-auth";
import { logger } from "@vayva/shared";

export async function GET(_request: Request) {
  const { user } = await OpsAuthService.requireSession();
  if (!["OPS_OWNER", "OPS_ADMIN"].includes(user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const feedbacks = await prisma.supportTicketFeedback.findMany({
      select: { rating: true },
    });

    const total = feedbacks.length;
    const great = feedbacks.filter((f) => f.rating === "GREAT").length;
    const okay = feedbacks.filter((f) => f.rating === "OKAY").length;
    const bad = feedbacks.filter((f) => f.rating === "BAD").length;

    const csatScore = total > 0 ? Math.round((great / total) * 100) : 0;

    return NextResponse.json({
      data: {
        total,
        great,
        okay,
        bad,
        csatScore,
        target: 85,
      },
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: unknown) {
    logger.error("[CSAT_AGGREGATE_ERROR]", { error });
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
