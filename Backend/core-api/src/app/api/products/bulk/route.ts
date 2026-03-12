import { NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { logActivity } from "@/lib/activity-logger";
import { logger } from "@/lib/logger";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

interface BulkUpdateItem {
  id: string;
  data: Record<string, unknown>;
}

export const PATCH = withVayvaAPI(
  PERMISSIONS.PRODUCTS_MANAGE,
  async (req, { storeId, user }) => {
    try {
      const body: unknown = await req.json().catch(() => ({}));
      const b = isRecord(body) ? body : {};
      const rawItems = Array.isArray(b.items) ? b.items : [];
      const items: BulkUpdateItem[] = rawItems.filter(
        (item): item is BulkUpdateItem =>
          isRecord(item) && typeof item.id === "string" && isRecord(item.data),
      );

      if (items.length === 0) {
        return NextResponse.json(
          { error: "No items to update" },
          { status: 400 },
        );
      }

      // 1. Fetch current state for logging and ownership verification
      const ids = items.map((i) => i.id);
      const currentProducts = await prisma.product.findMany({
        where: { id: { in: ids }, storeId },
      });

      const productMap = new Map(currentProducts.map((p) => [p.id, p]));

      // Filter items to only those that user owns
      const validItems = items.filter((item) => productMap.has(item.id));

      if (validItems.length === 0) {
        return NextResponse.json(
          { error: "No valid products found for update" },
          { status: 404 },
        );
      }

      // Use transaction for atomic updates
      const updates = await prisma.$transaction(
        validItems.map((item) => {
          const d = item.data;
          const title =
            typeof d.name === "string"
              ? d.name
              : typeof d.title === "string"
                ? d.title
                : undefined;
          const price = d.price !== undefined ? Number(d.price) : undefined;
          const status = typeof d.status === "string" ? d.status as "DRAFT" | "PENDING" | "ACTIVE" | "ARCHIVED" : undefined;
          return prisma.product.update({
            where: { id: item.id },
            data: { title, price, status },
          });
        }),
      );

      // 2. Async Logging
      validItems.forEach((item) => {
        const older = productMap.get(item.id);
        const newer = updates.find((u) => u.id === item.id);
        if (older && newer) {
          logActivity({
            storeId,
            actorUserId: user.id,
            action: "PRODUCT_BULK_UPDATE",
            targetType: "PRODUCT",
            targetId: item.id,
            before: {
              title: older.title,
              price: Number(older.price),
              status: older.status,
            },
            after: {
              title: newer.title,
              price: Number(newer.price),
              status: newer.status,
            },
          });
        }
      });

      return NextResponse.json({
        success: true,
        updatedCount: updates.length,
        message: `Successfully updated ${updates.length} products`,
      });
    } catch (error) {
      logger.error("[PRODUCTS_BULK_PATCH]", error, { storeId });
      return NextResponse.json(
        { error: "Internal Server Error" },
        { status: 500 },
      );
    }
  },
);
