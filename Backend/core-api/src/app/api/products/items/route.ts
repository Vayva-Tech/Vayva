import { NextRequest, NextResponse } from "next/server";
import { prisma, Prisma } from "@/lib/db";
import { withVayvaAPI, APIContext } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { logAuditEvent, AuditEventType } from "@/lib/audit";
import {
  sanitizeText,
  sanitizeHtml,
  sanitizeUrl
} from "@/lib/input-sanitization";
import { logger } from "@/lib/logger";
import { ProductCreateSchema } from "@/lib/product-schemas";

export const GET = withVayvaAPI(
  PERMISSIONS.PRODUCTS_VIEW,
  async (request: NextRequest, { storeId }: APIContext) => {
    try {
      const { searchParams } = new URL(request.url);
      // Parse query parameters with ProductListRequest type
      const status = searchParams.get("status");
      const limit = parseInt(searchParams.get("limit") || "50");
      const offset = parseInt(searchParams.get("offset") || "0");
      // Build where clause with proper typing
      const where: Prisma.ProductWhereInput = { storeId };
      if (status && status !== "ALL") {
        where.status = String(status) as "DRAFT" | "PENDING" | "ACTIVE" | "ARCHIVED";
      }
      const [products, total] = await Promise.all([
        prisma.product.findMany({
          where,
          orderBy: { createdAt: "desc" },
          take: limit,
          skip: offset,
          include: {
            inventoryItems: true,
          },
        }),
        prisma.product.count({ where }),
      ]);
      const formattedProducts = products.map((product) => {
        const totalQuantity =
          product.inventoryItems?.reduce(
            (sum: number, item) => sum + Number(item?.available ?? 0),
            0,
          ) || 0;
        return {
          id: product.id,
          merchantId: product.storeId,
          type: "RETAIL",
          name: product.title,
          description: product.description || "",
          price: Number(product.price),
          currency: "NGN",
          status: product.status,
          inventory: {
            enabled: product.trackInventory,
            quantity: totalQuantity,
          },
          itemsSold: 0,
          createdAt: product.createdAt.toISOString(),
        };
      });
      return NextResponse.json(
        {
          data: formattedProducts,
          meta: {
            total,
            limit,
            offset,
          },
        },
        {
          headers: {
            "Cache-Control": "no-store",
          },
        },
      );
    } catch (error: unknown) {
      logger.error("[PRODUCTS_ITEMS_GET]", error, { storeId });
      return NextResponse.json(
        {
          data: [],
          meta: {
            total: 0,
            limit: 0,
            offset: 0,
          },
          error: "Failed to fetch products",
        },
        { status: 500 },
      );
    }
  },
);
export const POST = withVayvaAPI(
  PERMISSIONS.PRODUCTS_MANAGE,
  async (request: NextRequest, { storeId, user }: APIContext) => {
    try {
      const userId = user.id;
      const body = await request.json().catch(() => ({}));

      const validation = ProductCreateSchema.safeParse(body);

      if (!validation.success) {
        return NextResponse.json(
          {
            error: "Validation failed",
            details: validation.error.format(),
          },
          { status: 400 },
        );
      }

      const data = validation.data;

      // Sanitize Handle or Generate
      const handle = data.handle
        ? sanitizeText(data.handle)
        : sanitizeText(data.title)
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-") +
          "-" +
          Math.random().toString(36).substring(2, 7);

      // Handle Images from metadata if present (Legacy support)
      // ideally this should be a separate relation create, but we keep existing logic for now
      let imageCreates = undefined;
      if (
        data.metadata &&
        typeof data.metadata === "object" &&
        "images" in data.metadata &&
        Array.isArray(data.metadata.images)
      ) {
        const images = data.metadata.images as Array<{
          url: string;
          position?: number;
        }>;
        const validImages = images
          .filter((img) => img && typeof img.url === "string")
          .map((img) => ({
            url: sanitizeUrl(img.url),
            position: Number(img.position) || 0,
          }))
          .filter((img) => img.url);

        if (validImages.length > 0) {
          imageCreates = { create: validImages };
        }
      }

      const product = await prisma.product.create({
        data: {
          storeId,
          title: sanitizeText(data.title),
          description: data.description ? sanitizeHtml(data.description) : "",
          handle,
          price: data.price,
          status: data.status,
          productType: data.productType
            ? sanitizeText(data.productType)
            : undefined,
          sku: data.sku ? sanitizeText(data.sku) : undefined,
          trackInventory: data.trackInventory,
          productImages: imageCreates,
        },
        include: {
          productImages: true,
        },
      });

      // Audit Log
      await logAuditEvent(storeId, userId, AuditEventType.PRODUCT_CREATED, {
        targetType: "PRODUCT",
        targetId: product.id,
        meta: {
          name: product.title,
          price: Number(product.price),
        },
      });

      return NextResponse.json(product);
    } catch (error: unknown) {
      logger.error("[PRODUCTS_ITEMS_POST]", error, {
        storeId,
        userId: user.id,
      });
      return NextResponse.json(
        { error: "Failed to create product" },
        { status: 500 },
      );
    }
  },
);
