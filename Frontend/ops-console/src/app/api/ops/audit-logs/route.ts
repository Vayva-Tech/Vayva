import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@vayva/db";
import { withOpsAPI } from "@/lib/api-handler";
import { logger } from "@vayva/shared";

/**
 * GET /api/ops/audit-logs
 * 
 * Query params:
 * - page: number (default: 1)
 * - limit: number (default: 50, max: 100)
 * - eventType: string (filter by event type)
 * - userId: string (filter by user)
 * - targetType: string (filter by target type)
 * - startDate: ISO string
 * - endDate: ISO string
 * - search: string (search in metadata)
 */
const getHandler = withOpsAPI(
  async (req: any, context: any) => {
    const { user, requestId } = context;
    
    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "50", 10)));
    const eventType = searchParams.get("eventType");
    const userId = searchParams.get("userId");
    const targetType = searchParams.get("targetType");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const search = searchParams.get("search");

    // Build where clause
    const where: Record<string, unknown> = {};
    
    if (eventType) {
      where.eventType = eventType;
    }
    
    if (userId) {
      where.opsUserId = userId;
    }
    
    if (targetType) {
      where.targetType = targetType;
    }
    
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        (where.createdAt as Record<string, Date>).gte = new Date(startDate);
      }
      if (endDate) {
        (where.createdAt as Record<string, Date>).lte = new Date(endDate);
      }
    }
    
    if (search) {
      where.OR = [
        { eventType: { contains: search, mode: "insensitive" } },
        { metadata: { path: ["description"], string_contains: search } },
      ];
    }

    // Fetch logs and total count in parallel
    const [logs, total] = await Promise.all([
      prisma.opsAuditEvent.findMany({
        where,
        take: limit,
        skip: (page - 1) * limit,
        orderBy: { createdAt: "desc" },
        include: {
          opsUser: {
            select: {
              id: true,
              email: true,
              role: true,
            },
          },
        },
      }),
      prisma.opsAuditEvent.count({ where }),
    ]);

    logger.info("[AUDIT_LOGS_QUERY]", {
      requestId,
      userId: user.id,
      filters: { eventType, userId, targetType, startDate, endDate },
      results: logs.length,
      total,
    });

    return NextResponse.json({
      success: true,
      data: logs.map((log: any) => ({
        id: log.id,
        eventType: log.eventType,
        eventLabel: formatEventLabel(log.eventType),
        user: log.opsUser
          ? {
              id: log.opsUser.id,
              email: log.opsUser.email,
              role: log.opsUser.role,
            }
          : null,
        metadata: log.metadata,
        rescueIncidentId: log.rescueIncidentId,
        createdAt: log.createdAt.toISOString(),
        relativeTime: getRelativeTime(log.createdAt),
      })),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page * limit < total,
        hasPrevPage: page > 1,
      },
    });
  },
  { requiredPermission: "ops:audit:view" }
);

export async function GET(
  req: NextRequest,
  context: { params: Promise<Record<string, string>> }
) {
  const params = await context.params;
  return getHandler(req, { params } as any);
}

/**
 * POST /api/ops/audit-logs/export
 * Export audit logs to CSV
 */
const postHandler = withOpsAPI(
  async (req: any, context: any) => {
    const { user, requestId } = context;
    
    const body = await req.json();
    const { filters, format = "csv" } = body;

    // Build where clause from filters
    const where: Record<string, unknown> = {};
    
    if (filters?.eventType) {
      where.eventType = filters.eventType;
    }
    if (filters?.userId) {
      where.opsUserId = filters.userId;
    }
    if (filters?.startDate || filters?.endDate) {
      where.createdAt = {};
      if (filters.startDate) {
        (where.createdAt as Record<string, Date>).gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        (where.createdAt as Record<string, Date>).lte = new Date(filters.endDate);
      }
    }

    // Fetch all matching logs (up to 10k for export)
    const logs = await prisma.opsAuditEvent.findMany({
      where,
      take: 10000,
      orderBy: { createdAt: "desc" },
      include: {
        opsUser: {
          select: {
            id: true,
            email: true,
            role: true,
          },
        },
      },
    });

    logger.info("[AUDIT_LOGS_EXPORT]", {
      requestId,
      userId: user.id,
      exportedCount: logs.length,
      format,
    });

    if (format === "csv") {
      const csv = convertToCSV(logs);
      
      return new NextResponse(csv, {
        status: 200,
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="audit-logs-${new Date().toISOString().split("T")[0]}.csv"`,
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: logs,
      meta: {
        exportedCount: logs.length,
        format,
      },
    });
  },
  { requiredPermission: "ops:audit:export" }
);

export async function POST(
  req: NextRequest,
  context: { params: Promise<Record<string, string>> }
) {
  const params = await context.params;
  return postHandler(req, { params } as any);
}

function formatEventLabel(eventType: string): string {
  const labels: Record<string, string> = {
    MERCHANT_CREATED: "Merchant Created",
    MERCHANT_SUSPENDED: "Merchant Suspended",
    MERCHANT_ACTIVATED: "Merchant Activated",
    MERCHANT_DELETED: "Merchant Deleted",
    ORDER_CREATED: "Order Created",
    ORDER_UPDATED: "Order Updated",
    PAYMENT_PROCESSED: "Payment Processed",
    REFUND_ISSUED: "Refund Issued",
    KYC_APPROVED: "KYC Approved",
    KYC_REJECTED: "KYC Rejected",
    SUPPORT_TICKET_CREATED: "Ticket Created",
    SUPPORT_TICKET_RESOLVED: "Ticket Resolved",
    USER_LOGIN: "User Login",
    USER_LOGOUT: "User Logout",
    SETTINGS_CHANGED: "Settings Changed",
    BULK_ACTION: "Bulk Action",
  };
  
  return labels[eventType] || eventType.replace(/_/g, " ");
}

function getRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  
  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

function convertToCSV(logs: Array<{
  id: string;
  eventType: string;
  createdAt: Date;
  opsUser: { email: string; role: string } | null;
  metadata: unknown;
  rescueIncidentId: string | null;
}>): string {
  const headers = [
    "ID",
    "Event Type",
    "Event Label",
    "User Email",
    "User Role",
    "Rescue Incident ID",
    "Timestamp",
    "Metadata",
  ];
  
  const rows = logs.map((log: any) => [
    log.id,
    log.eventType,
    formatEventLabel(log.eventType),
    log.opsUser?.email || "System",
    log.opsUser?.role || "N/A",
    log.rescueIncidentId || "",
    log.createdAt.toISOString(),
    JSON.stringify(log.metadata),
  ]);
  
  return [
    headers.join(","),
    ...rows.map((row) =>
      row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
    ),
  ].join("\n");
}
