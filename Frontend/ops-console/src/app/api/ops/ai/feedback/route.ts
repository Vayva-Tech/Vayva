import { NextResponse } from "next/server";
import { prisma } from "@vayva/db";
import { OpsAuthService } from "@/lib/ops-auth";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { user } = await OpsAuthService.requireSession();
  if (!["OPS_OWNER", "OPS_ADMIN", "OPS_SUPPORT"].includes(user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get("limit") || "50");
  const rating = searchParams.get("rating");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = {};
  if (rating && rating !== "ALL") {
    where.rating = rating;
  }

  const feedbacks = await prisma.supportBotFeedback.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: limit,
    include: {
      store: {
        select: { id: true, name: true, slug: true },
      },
    },
  });

  return NextResponse.json({ data: feedbacks });
}
