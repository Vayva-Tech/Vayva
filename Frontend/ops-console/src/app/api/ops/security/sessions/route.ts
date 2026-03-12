import { NextResponse } from "next/server";
import { prisma } from "@vayva/db";
import { OpsAuthService } from "@/lib/ops-auth";

export const dynamic = "force-dynamic";

export async function GET(_request: Request) {
  const { user } = await OpsAuthService.requireSession();
  if (!["OPS_OWNER", "OPS_ADMIN", "OPS_SECURITY"].includes(user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const sessions = await prisma.merchantSession.findMany({
    where: {
      expiresAt: { gt: new Date() }, // Only active sessions
    },
    orderBy: { createdAt: "desc" },
    include: {
      user: {
        select: { email: true, firstName: true, lastName: true },
      },
    },
    take: 50,
  });

  return NextResponse.json({ data: sessions });
}
