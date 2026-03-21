import { NextRequest, NextResponse } from "next/server";
import { PERMISSIONS } from "@/lib/team/permissions";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";
import { prisma } from "@/lib/prisma";

// GET /api/legal/cases - Get all legal cases
export async function GET(request: NextRequest) {
  try {
    const storeId = request.headers.get("x-store-id") || "";
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");
    const status = searchParams.get("status");
    const clientId = searchParams.get("clientId");
    const priority = searchParams.get("priority");

    const where: Record<string, unknown> = { storeId };

    if (status) {
      where.status = status;
    }

    if (clientId) {
      where.clientId = clientId;
    }

    if (priority) {
      where.priority = priority;
    }

    const [cases, total] = await Promise.all([
      (prisma as any).legalCase.findMany({
        where,
        include: {
          client: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          assignedTo: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
          _count: {
            select: {
              documents: true,
              timeEntries: true,
              invoices: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip: offset,
        take: limit,
      }),
      (prisma as any).legalCase.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: cases,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + cases.length < total,
      },
    });
  } catch (error) {
    handleApiError(error, {
      endpoint: "/api/legal/cases",
      operation: "GET_LEGAL_CASES",
    });
    return NextResponse.json(
      { error: "Failed to fetch legal cases" },
      { status: 500 }
    );
  }
}
