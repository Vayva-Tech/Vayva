import { NextRequest, NextResponse } from "next/server";
import { OpsAuthService } from "@/lib/ops-auth";
import { prisma } from "@vayva/db";

export async function GET(_req: NextRequest) {
  try {
    const { user } = await OpsAuthService.requireSession();

    // Fetch latest feature flags config
    const latestConfig = await prisma.opsAuditEvent.findFirst({
      where: {
        eventType: "OPS_FEATURE_FLAGS",
      },
      orderBy: { createdAt: "desc" },
      take: 1,
    });

    // Default flags
    const defaultFlags = {
      maintenanceMode: false,
      betaFeatures: false,
      updatedAt: new Date().toISOString(),
    };

    if (!latestConfig || !latestConfig.metadata) {
      return NextResponse.json({ flags: defaultFlags });
    }

    const flags = latestConfig.metadata as Record<string, unknown>;
    
    return NextResponse.json({ 
      flags: {
        ...defaultFlags,
        ...flags,
      }
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch feature flags" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { user } = await OpsAuthService.requireSession();
    if (!["OPS_OWNER", "OPS_ADMIN"].includes(user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json();
    const { maintenanceMode, betaFeatures } = body;

    // Persist config via audit log event
    await OpsAuthService.logEvent(user.id, "OPS_FEATURE_FLAGS", {
      maintenanceMode: maintenanceMode ?? false,
      betaFeatures: betaFeatures ?? false,
      updatedAt: new Date().toISOString(),
      updatedBy: user.id,
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to update feature flags" },
      { status: 500 },
    );
  }
}
