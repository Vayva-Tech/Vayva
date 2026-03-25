import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@vayva/db";
import { OpsAuthService } from "@/lib/ops-auth";
import { opsApiAuthErrorResponse } from "@/lib/ops-api-auth";

// Update feature flag
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user } = await OpsAuthService.requireSession();
    try {
      OpsAuthService.requireRole(user, "SUPERVISOR");
    } catch (roleErr) {
      const r = opsApiAuthErrorResponse(roleErr);
      if (r) return r;
      throw roleErr;
    }

    const { id } = await params;
    const body = await req.json();
    const { enabled, description } = body;

    const updateData: Record<string, unknown> = {};
    if (enabled !== undefined) updateData.enabled = enabled;
    if (description !== undefined) updateData.description = description;

    const flag = await prisma.featureFlag.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        key: true,
        description: true,
        enabled: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({ success: true, flag });
  } catch (error) {
    const authRes = opsApiAuthErrorResponse(error);
    if (authRes) return authRes;
    console.error("[FEATURE_FLAG_UPDATE_ERROR]", error);
    return NextResponse.json(
      { error: "Failed to update feature flag" },
      { status: 500 }
    );
  }
}

// Get single feature flag with overrides
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user } = await OpsAuthService.requireSession();
    try {
      OpsAuthService.requireRole(user, "OPERATOR");
    } catch (roleErr) {
      const r = opsApiAuthErrorResponse(roleErr);
      if (r) return r;
      throw roleErr;
    }

    const { id } = await params;
    const flag = await prisma.featureFlag.findUnique({
      where: { id },
      select: {
        id: true,
        key: true,
        description: true,
        enabled: true,
        updatedAt: true,
      },
    });

    if (!flag) {
      return NextResponse.json(
        { error: "Feature flag not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ flag });
  } catch (error) {
    const authRes = opsApiAuthErrorResponse(error);
    if (authRes) return authRes;
    console.error("[FEATURE_FLAG_GET_ERROR]", error);
    return NextResponse.json(
      { error: "Failed to fetch feature flag" },
      { status: 500 }
    );
  }
}
