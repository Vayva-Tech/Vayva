import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@vayva/db";
import { OpsAuthService } from "@/lib/ops-auth";

export async function GET(_req: NextRequest) {
  try {
    await OpsAuthService.requireSession();

    const fixes = await prisma.rescueFixAction.findMany({
      include: {
        incident: true,
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return NextResponse.json(fixes);
  } catch (error: unknown) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 },
    );
  }
}
