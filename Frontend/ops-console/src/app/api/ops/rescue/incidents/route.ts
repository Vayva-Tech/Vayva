import { NextRequest, NextResponse } from "next/server";
import { prisma, Prisma } from "@vayva/db";
import { logger } from "@vayva/shared";
import { OpsAuthService } from "@/lib/ops-auth";

export async function GET(req: NextRequest) {
  try {
    await OpsAuthService.requireSession();

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const severity = searchParams.get("severity");
    const surface = searchParams.get("surface");

    const incidents = await prisma.rescueIncident?.findMany({
      where: {
        ...(status && { status: status as Prisma.EnumRescueIncidentStatusFilter<"RescueIncident"> }),
        ...(severity && { severity: severity as Prisma.EnumRescueIncidentSeverityFilter<"RescueIncident"> }),
        ...(surface && { surface: surface as Prisma.EnumRescueSurfaceFilter<"RescueIncident"> }),
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return NextResponse.json(incidents);
  } catch (error: unknown) {
    logger.error("[RESCUE_INCIDENTS_GET]", { error });
    return NextResponse.json(
      { error: "Unauthorized", status: "FAILED" },
      { status: 401 },
    );
  }
}
