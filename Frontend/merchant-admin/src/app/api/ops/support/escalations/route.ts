import { logger } from "@/lib/logger";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@vayva/db";

const INTERNAL_SECRET = process.env?.INTERNAL_API_SECRET;

function verifyInternalAuth(req: NextRequest): boolean {
  if (!INTERNAL_SECRET) {
    logger.error("[INTERNAL_AUTH] INTERNAL_API_SECRET not configured");
    return false;
  }
  const secret = req.headers?.get("x-internal-secret");
  return secret === INTERNAL_SECRET;
}

export const dynamic = "force-dynamic";

// GET /api/ops/support/escalations - Get escalated tickets
export async function GET(req: NextRequest) {
  try {
    if (!verifyInternalAuth(req)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const skip = (page - 1) * limit;

    const [escalations, total] = await Promise.all([
      prisma.supportTicket?.findMany({
        where: {
          priority: { in: ["high", "urgent"] as any },
          status: { not: "resolved" as any },
        } as any,
        skip,
        take: limit,
        orderBy: [
          { priority: "desc" },
          { updatedAt: "desc" },
        ],
        include: {
          store: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          messages: {
            orderBy: { createdAt: "desc" },
            take: 3,
            select: {
              id: true,
              content: true,
              createdAt: true,
              isFromCustomer: true,
              user: {
                select: {
                  firstName: true,
                  lastName: true,
                  email: true,
                },
              },
            },
          },
        } as any,
      }),
      prisma.supportTicket?.count({
        where: {
          priority: { in: ["high", "urgent"] as any },
          status: { not: "resolved" as any },
        } as any,
      }),
    ]);

    return NextResponse.json({
      escalations,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    logger.error("[OPS_ESCALATIONS] Failed to fetch escalations", { error: error instanceof Error ? error.message : String(error) });
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
