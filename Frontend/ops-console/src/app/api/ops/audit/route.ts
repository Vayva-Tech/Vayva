import { NextRequest, NextResponse } from "next/server";
import { OpsAuthService } from "@/lib/ops-auth";
import { prisma, Prisma } from "@vayva/db";
import { logger } from "@vayva/shared";

type AuditEventWithUser = Prisma.OpsAuditEventGetPayload<{
  include: {
    opsUser: {
      select: { name: true; email: true; role: true };
    };
  };
}>;

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    await OpsAuthService.requireSession();

    const searchParams = req.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    const skip = (page - 1) * limit;

    const [events, total] = await Promise.all([
      prisma.opsAuditEvent.findMany({
        take: limit,
        skip,
        orderBy: { createdAt: "desc" },
        include: {
          opsUser: {
            select: { name: true, email: true, role: true },
          },
        },
      }),
      prisma.opsAuditEvent.count(),
    ]);

    const data = events.map((e: AuditEventWithUser) => ({
      id: e.id,
      eventType: e.eventType,
      metadata: e.metadata,
      createdAt: e.createdAt,
      actor: e.opsUser
        ? {
            name: e.opsUser.name,
            email: e.opsUser.email,
            role: e.opsUser.role,
          }
        : { name: "System", email: "system", role: "SYSTEM" },
    }));

    return NextResponse.json({
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: unknown) {
    logger.error("[AUDIT_LOGS_ERROR]", { error });
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
