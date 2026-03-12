import { NextResponse } from "next/server";
import { prisma } from "@vayva/db";
import { OpsAuthService } from "@/lib/ops-auth";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { user } = await OpsAuthService.requireSession();
  // Security/Audit logs sensitive
  if (!["OPS_OWNER", "OPS_ADMIN"].includes(user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get("limit") || "100");

  const logs = await prisma.opsAuditEvent.findMany({
    take: limit,
    orderBy: { createdAt: "desc" },
    include: {
      opsUser: {
        select: { name: true, email: true },
      },
    },
  });

  return NextResponse.json({ data: logs });
}
