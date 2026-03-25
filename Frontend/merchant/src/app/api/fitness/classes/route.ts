import { NextRequest, NextResponse } from "next/server";
import { buildBackendAuthHeaders } from "@/lib/backend-proxy";
import { PERMISSIONS } from "@/lib/team/permissions";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";
import { prisma } from "@/lib/prisma";

// GET /api/fitness/classes - Get all fitness classes
export async function GET(request: NextRequest) {
  try {
    const auth = await buildBackendAuthHeaders(request);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const storeId = auth.user.storeId;
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");
    const status = searchParams.get("status");
    const instructorId = searchParams.get("instructorId");

    const where: Record<string, unknown> = { storeId };

    if (status) {
      where.status = status;
    }

    if (instructorId) {
      where.instructorId = instructorId;
    }

    const [classes, total] = await Promise.all([
      (prisma as any).fitnessClass.findMany({
        where,
        include: {
          instructor: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
          _count: {
            select: {
              bookings: true,
            },
          },
        },
        orderBy: { schedule: "asc" },
        skip: offset,
        take: limit,
      }),
      (prisma as any).fitnessClass.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: classes,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + classes.length < total,
      },
    });
  } catch (error) {
    handleApiError(error, {
      endpoint: "/api/fitness/classes",
      operation: "GET_FITNESS_CLASSES",
    });
    return NextResponse.json(
      { error: "Failed to fetch fitness classes" },
      { status: 500 }
    );
  }
}
