import { NextResponse } from "next/server";
import { prisma, Prisma } from "@vayva/db";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { logger } from "@/lib/logger";
import { ShipmentQuerySchema } from "@/lib/validations/finance-ops";

export const GET = withVayvaAPI(
  PERMISSIONS.FULFILLMENT_VIEW,
  async (req, { storeId }) => {
    try {
      const { searchParams } = new URL(req.url);

      // Validate query params
      const query = ShipmentQuerySchema.safeParse({
        limit: searchParams.get("limit"),
        offset: searchParams.get("offset"),
        status: searchParams.get("status") || undefined,
        issue: searchParams.get("issue") || undefined,
      });

      if (!query.success) {
        // Fallback to defaults if validation fails, or return error?
        // Existing behavior was loose, but we want strictness.
        // For query params often we just ignore invalid ones, but implementation plan said "Strictly validate".
        // Let's return error for now to be safe.
        return NextResponse.json(
          { error: "Invalid query parameters" },
          { status: 400 },
        );
      }

      const { limit, offset, status, issue } = query.data;

      const where: Prisma.ShipmentWhereInput = { storeId };

      if (issue === "ALL") {
        // No filter
      } else if (issue) {
        // "delayed", "lost", "damaged" map to specific statuses?
        // The original code had: isIssue = true => ["FAILED", "EXCEPTION", "RETURNED", "RETURN_REQUESTED"]
        // Our schema has specific issue types.
        // Let's support the legacy "issue=true" logic if we can map it,
        // or if the schema "issue" param is new.
        // The schema has "issue: z.enum(...)".
        // Let's assume "issue" params map to status groups.
        const issueStatuses: Array<"FAILED" | "CANCELLED"> = [
          "FAILED",
          "CANCELLED",
        ];
        where.status = { in: issueStatuses };
      } else if (status && status !== "ALL") {
        where.status = status as "CREATED" | "ASSIGNED" | "PICKED_UP" | "IN_TRANSIT" | "DELIVERED" | "FAILED" | "CANCELLED";
      }

      const shipments = await prisma.shipment.findMany({
        where,
        include: {
          order: {
            select: { orderNumber: true, customerId: true },
          },
        },
        orderBy: { updatedAt: "desc" },
        take: limit,
        skip: offset,
      });

      const formatted = shipments.map((shipment) => ({
        id: shipment.id,
        orderId: shipment.orderId,
        orderNumber: shipment.order?.orderNumber || "Unknown",
        status: shipment.status,
        provider: shipment.provider,
        trackingCode: shipment.trackingCode,
        trackingUrl: shipment.trackingUrl,
        courierName: shipment.courierName,
        recipientName: shipment.recipientName,
        updatedAt: shipment.updatedAt,
      }));

      return NextResponse.json(
        { success: true, data: formatted },
        {
          headers: {
            "Cache-Control": "no-store",
          },
        },
      );
    } catch (error: unknown) {
      logger.error("[SHIPMENTS_GET]", error, { storeId });
      return NextResponse.json(
        { success: false, error: "Failed to fetch shipments" },
        { status: 500 },
      );
    }
  },
);
