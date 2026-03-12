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

// GET /api/ops/support/tickets - List all support tickets with filters
export async function GET(req: NextRequest) {
  try {
    // Verify internal auth from ops-console
    if (!verifyInternalAuth(req)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    
    // Pagination
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const skip = (page - 1) * limit;
    
    // Filters
    const status = searchParams.get("status");
    const priority = searchParams.get("priority");
    const category = searchParams.get("category");
    const assignedTo = searchParams.get("assignedTo");
    const storeId = searchParams.get("storeId");
    const search = searchParams.get("search");
    
    // Date range
    const fromDate = searchParams.get("from");
    const toDate = searchParams.get("to");

    // Build where clause
    const where: Record<string, unknown> & { createdAt?: { gte?: Date; lte?: Date } } = {};
    
    if (status) (where as any).status = status;
    if (priority) where.priority = priority;
    if (category) where.category = category;
    if (assignedTo) where.assignedTo = assignedTo;
    if (storeId) where.storeId = storeId;
    
    if (search) {
      where.OR = [
        { subject: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }
    
    if (fromDate || toDate) {
      where.createdAt = {};
      if (fromDate) where.createdAt.gte = new Date(fromDate);
      if (toDate) where.createdAt.lte = new Date(toDate);
    }

    const [tickets, total] = await Promise.all([
      prisma.supportTicket?.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          store: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          assignedUser: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          messages: {
            orderBy: { createdAt: "desc" },
            take: 1,
            select: {
              id: true,
              content: true,
              createdAt: true,
              isFromCustomer: true,
            },
          },
        } as any,
      }),
      prisma.supportTicket?.count({ where }),
    ]);

    return NextResponse.json({
      tickets,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    logger.error("[OPS_TICKETS_GET] Failed to fetch tickets", { error: error instanceof Error ? error.message : String(error) });
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// POST /api/ops/support/tickets - Create internal ticket
export async function POST(req: NextRequest) {
  try {
    if (!verifyInternalAuth(req)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { storeId, subject, description, priority = "MEDIUM", category = "GENERAL", createdBy } = body;

    if (!storeId || !subject) {
      return NextResponse.json(
        { error: "Missing required fields: storeId, subject" },
        { status: 400 }
      );
    }

    const ticket = await prisma.supportTicket?.create({
      data: {
        storeId,
        subject,
        description,
        priority,
        category,
        status: "open" as any,
      },
      include: {
        store: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    // Log to audit
    await prisma.auditLog?.create({
      data: {
        app: "merchant",
        action: "OPS_TICKET_CREATED",
        actorUserId: createdBy || "system",
        actorEmail: createdBy || "ops@vayva.ng",
        targetType: "support_ticket" as any,
        targetId: ticket.id,
        targetStoreId: storeId,
        severity: "INFO",
        requestId: `ops-ticket-create-${ticket.id}`,
        metadata: { subject, priority, category },
      },
    });

    return NextResponse.json({ ticket }, { status: 201 });
  } catch (error) {
    logger.error("[OPS_TICKETS_CREATE] Failed to create ticket", { error: error instanceof Error ? error.message : String(error) });
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
