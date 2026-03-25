import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@vayva/db";
import { OpsAuthService } from "@/lib/ops-auth";
import { opsApiAuthErrorResponse } from "@/lib/ops-api-auth";

// Get all feature flags
export async function GET(req: NextRequest) {
  try {
    const { user } = await OpsAuthService.requireSession();
    try {
      OpsAuthService.requireRole(user, "OPERATOR");
    } catch (roleErr) {
      const r = opsApiAuthErrorResponse(roleErr);
      if (r) return r;
      throw roleErr;
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("q") || "";

    const where: Record<string, unknown> = {};
    if (search) {
      where.OR = [
        { key: { contains: search, mode: "insensitive" } },
      ];
    }

    const flags = await prisma.featureFlag.findMany({
      where,
      select: {
        id: true,
        key: true,
        description: true,
        enabled: true,
        updatedAt: true,
      },
      orderBy: { key: "asc" },
    });

    return NextResponse.json({ flags });
  } catch (error) {
    const authRes = opsApiAuthErrorResponse(error);
    if (authRes) return authRes;
    console.error("[FEATURE_FLAGS_ERROR]", error);
    return NextResponse.json(
      { error: "Failed to fetch feature flags" },
      { status: 500 }
    );
  }
}

// Create new feature flag
export async function POST(req: NextRequest) {
  try {
    const { user } = await OpsAuthService.requireSession();
    try {
      OpsAuthService.requireRole(user, "SUPERVISOR");
    } catch (roleErr) {
      const r = opsApiAuthErrorResponse(roleErr);
      if (r) return r;
      throw roleErr;
    }

    const body = await req.json();
    const { key, description } = body;

    if (!key) {
      return NextResponse.json(
        { error: "Key is required" },
        { status: 400 }
      );
    }

    const flag = await prisma.featureFlag.create({
      data: {
        key,
        description,
        enabled: false,
      },
    });

    return NextResponse.json({ success: true, flag });
  } catch (error: unknown) {
    const authRes = opsApiAuthErrorResponse(error);
    if (authRes) return authRes;
    const prismaError = error as { code?: string };
    if (prismaError.code === "P2002") {
      return NextResponse.json(
        { error: "Feature flag key already exists" },
        { status: 409 }
      );
    }
    console.error("[FEATURE_FLAG_CREATE_ERROR]", error);
    return NextResponse.json(
      { error: "Failed to create feature flag" },
      { status: 500 }
    );
  }
}
