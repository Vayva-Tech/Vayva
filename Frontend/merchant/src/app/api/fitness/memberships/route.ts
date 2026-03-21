import { NextRequest, NextResponse } from "next/server";
import { PERMISSIONS } from "@/lib/team/permissions";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";
import { prisma } from "@/lib/prisma";

// GET /api/fitness/memberships - Get all memberships for the merchant
export async function GET(request: NextRequest) {
  try {
    const storeId = request.headers.get("x-store-id") || "";
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");
    const status = searchParams.get("status");
    const search = searchParams.get("search");

    const where: Record<string, unknown> = { storeId };

    if (status) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    const [memberships, total] = await Promise.all([
      (prisma as any).fitnessMembership.findMany({
        where,
        include: {
          _count: {
            select: {
              members: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip: offset,
        take: limit,
      }),
      (prisma as any).fitnessMembership.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: memberships,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + memberships.length < total,
      },
    });
  } catch (error) {
    handleApiError(error, {
      endpoint: "/api/fitness/memberships",
      operation: "GET_FITNESS_MEMBERSHIPS",
    });
    return NextResponse.json(
      { error: "Failed to fetch memberships" },
      { status: 500 }
    );
  }
}
