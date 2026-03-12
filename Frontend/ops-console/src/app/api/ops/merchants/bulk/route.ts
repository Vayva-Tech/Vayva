import { NextRequest, NextResponse } from "next/server";
import { prisma, Prisma } from "@vayva/db";
import { withOpsAPI } from "@/lib/api-handler";
import { logger } from "@vayva/shared";

/**
 * POST /api/ops/merchants/bulk
 * 
 * Perform bulk operations on merchants:
 * - activate: Activate multiple merchants
 * - suspend: Suspend multiple merchants
 * - delete: Soft delete multiple merchants
 * - updateTier: Update subscription tier for multiple merchants
 */
const postHandler = withOpsAPI(
  async (req: any, context: any) => {
    const { user, requestId } = context;
    
    const body = await req.json();
    const { action, merchantIds, data } = body;

    if (!Array.isArray(merchantIds) || merchantIds.length === 0) {
      return NextResponse.json(
        { error: "merchantIds array is required" },
        { status: 400 }
      );
    }

    if (!action || !["activate", "suspend", "delete", "updateTier"].includes(action)) {
      return NextResponse.json(
        { error: "Invalid action" },
        { status: 400 }
      );
    }

    // Verify all merchants exist
    const existingMerchants = await prisma.store.findMany({
      where: { id: { in: merchantIds } },
      select: { id: true, name: true, isActive: true },
    });

    if (existingMerchants.length !== merchantIds.length) {
      const foundIds = new Set(existingMerchants.map((m: any) => m.id));
      const missingIds = merchantIds.filter((id: string) => !foundIds.has(id));
      return NextResponse.json(
        { error: "Some merchants not found", missingIds },
        { status: 404 }
      );
    }

    let result;
    const auditLogData: Array<{
      eventType: string;
      opsUserId: string;
      metadata: Prisma.InputJsonValue;
    }> = [];

    switch (action) {
      case "activate":
        result = await prisma.store.updateMany({
          where: { id: { in: merchantIds } },
          data: { isActive: true },
        });
        
        existingMerchants.forEach((m: any) => {
          auditLogData.push({
            eventType: "MERCHANT_ACTIVATED",
            opsUserId: user.id,
            metadata: {
              merchantId: m.id,
              merchantName: m.name,
              bulkAction: true,
              totalAffected: merchantIds.length,
            },
          });
        });
        break;

      case "suspend":
        result = await prisma.store.updateMany({
          where: { id: { in: merchantIds } },
          data: { isActive: false },
        });
        
        existingMerchants.forEach((m: any) => {
          auditLogData.push({
            eventType: "MERCHANT_SUSPENDED",
            opsUserId: user.id,
            metadata: {
              merchantId: m.id,
              merchantName: m.name,
              bulkAction: true,
              totalAffected: merchantIds.length,
              reason: data?.reason || "Bulk suspension",
            },
          });
        });
        break;

      case "delete":
        // Soft delete - mark as inactive (since deletedAt doesn't exist)
        result = await prisma.store.updateMany({
          where: { id: { in: merchantIds } },
          data: { 
            isActive: false,
          },
        });
        
        existingMerchants.forEach((m: any) => {
          auditLogData.push({
            eventType: "MERCHANT_DEACTIVATED",
            opsUserId: user.id,
            metadata: {
              merchantId: m.id,
              merchantName: m.name,
              bulkAction: true,
              totalAffected: merchantIds.length,
            },
          });
        });
        break;

      case "updateTier":
        // Skipping tier update - subscription schema doesn't have plan/tier field
        return NextResponse.json(
          { error: "Tier update not available - schema mismatch" },
          { status: 400 }
        );
    }

    // Create audit logs individually
    for (const logData of auditLogData) {
      await prisma.opsAuditEvent.create({
        data: logData,
      });
    }

    logger.info("[MERCHANTS_BULK_ACTION]", {
      requestId,
      userId: user.id,
      action,
      merchantCount: merchantIds.length,
      affectedCount: result?.count || merchantIds.length,
    });

    return NextResponse.json({
      success: true,
      data: {
        action,
        affectedCount: result?.count || merchantIds.length,
        merchantIds,
      },
    });
  },
  { requiredPermission: "ops:merchants:bulk" }
);

/**
 * GET /api/ops/merchants/bulk/export
 * Export merchants to CSV
 */
const getHandler = withOpsAPI(
  async (req: any, context: any) => {
    const { user, requestId } = context;
    
    const { searchParams } = new URL(req.url);
    const format = searchParams.get("format") || "csv";
    const filters = searchParams.get("filters");

    // Build where clause
    const where: Record<string, unknown> = { deletedAt: null };
    
    if (filters) {
      try {
        const parsed = JSON.parse(filters);
        if (parsed.status) where.isActive = parsed.status === "active";
        if (parsed.industry) where.industry = parsed.industry;
        if (parsed.search) {
          where.OR = [
            { name: { contains: parsed.search, mode: "insensitive" } },
            { slug: { contains: parsed.search, mode: "insensitive" } },
          ];
        }
      } catch {
        // Invalid filters JSON, ignore
      }
    }

    const merchants = await prisma.store.findMany({
      where,
      select: {
        id: true,
        name: true,
        slug: true,
        isActive: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
      take: 10000,
    });

    logger.info("[MERCHANTS_EXPORT]", {
      requestId,
      userId: user.id,
      format,
      exportedCount: merchants.length,
    });

    if (format === "csv") {
      const csv = convertToCSV(merchants);
      
      return new NextResponse(csv, {
        status: 200,
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="merchants-${new Date().toISOString().split("T")[0]}.csv"`,
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: merchants,
      meta: {
        exportedCount: merchants.length,
        format,
      },
    });
  },
  { requiredPermission: "ops:merchants:export" }
);

export async function POST(
  req: NextRequest,
  context: { params: Promise<Record<string, string>> }
) {
  const params = await context.params;
  return postHandler(req, { params } as any);
}

export async function GET(
  req: NextRequest,
  context: { params: Promise<Record<string, string>> }
) {
  const params = await context.params;
  return getHandler(req, { params } as any);
}

function convertToCSV(merchants: Array<{
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
  createdAt: Date;
}>): string {
  const headers = [
    "ID",
    "Name",
    "Slug",
    "Status",
    "Created At",
  ];
  
  const rows = merchants.map((m: any) => [
    m.id,
    m.name,
    m.slug,
    m.isActive ? "Active" : "Inactive",
    m.createdAt.toISOString(),
  ]);
  
  return [
    headers.join(","),
    ...rows.map((row) =>
      row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
    ),
  ].join("\n");
}
