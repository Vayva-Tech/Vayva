import { NextRequest, NextResponse } from "next/server";
import { prisma, Prisma } from "@vayva/db";
import { withVayvaAPI, APIContext } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { standardHeaders, logger, BaseError } from "@vayva/shared";
import { z } from "zod";
import { ProductCreateSchema } from "@/lib/product-schemas";
import { sanitizeText, sanitizeHtml, sanitizeUrl } from "@/lib/input-sanitization";
import { logAuditEvent, AuditEventType } from "@/lib/audit";

const ProductQuerySchema = z.object({
  limit: z.coerce.number().min(1).max(100).default(20),
  cursor: z.string().optional().nullable(),
  q: z.string().trim().optional().nullable(),
  status: z.enum(["published", "draft", "all"]).optional().nullable(),
  from: z.string().datetime().optional().nullable(),
  to: z.string().datetime().optional().nullable(),
});

export const GET = withVayvaAPI(
  PERMISSIONS.PRODUCTS_VIEW,
  async (req: NextRequest, { storeId, correlationId }: APIContext) => {
    const requestId = correlationId;
    try {
      const { searchParams } = new URL(req.url);
      const result = ProductQuerySchema.safeParse(
        Object.fromEntries(searchParams),
      );

      if (!result.success) {
        return NextResponse.json(
          {
            error: "Invalid query parameters",
            details: result.error.flatten(),
          },
          { status: 400, headers: standardHeaders(requestId) },
        );
      }

      const { limit, cursor, q, status, from, to } = result.data;

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const cursorUpdatedAt: Date | null = null; // Defined variable to match original logic flow structure if needed later, though maybe redundant if we rewrite logic below.

      const where: Prisma.ProductWhereInput = { storeId };

      if (status === "published") where.status = "ACTIVE";
      if (status === "draft") where.status = "DRAFT";

      if (from || to) {
        where.createdAt = {
          ...(from ? { gte: new Date(from) } : {}),
          ...(to ? { lte: new Date(to) } : {}),
        };
      }

      if (q) {
        where.OR = [
          { title: { contains: q, mode: "insensitive" } },
          { sku: { contains: q, mode: "insensitive" } },
        ];
      }

      if (cursor) {
        const cursorRow = await prisma.product.findFirst({
          where: { id: cursor, storeId },
          select: { updatedAt: true },
        });
        if (cursorRow) {
          where.AND = [
            ...(Array.isArray(where.AND) ? where.AND : []),
            {
              OR: [
                { updatedAt: { lt: cursorRow.updatedAt } },
                { updatedAt: cursorRow.updatedAt, id: { lt: cursor } },
              ],
            },
          ];
        }
      }

      const products = await prisma.product.findMany({
        where,
        orderBy: [{ updatedAt: "desc" }, { id: "desc" }],
        take: limit + 1,
        select: {
          id: true,
          title: true,
          sku: true,
          status: true,
          price: true,
          createdAt: true,
          updatedAt: true,
          productImages: {
            orderBy: { position: "asc" },
            take: 1,
            select: { url: true },
          },
          _count: {
            select: {
              productVariants: true,
            },
          },
        },
      });

      const hasMore = products.length > limit;
      const pageItems = products.slice(0, limit);
      const nextCursor = hasMore
        ? (pageItems[pageItems.length - 1]?.id ?? null)
        : null;

      const ids = pageItems.map((p) => p.id);
      const inventoryAgg = ids.length
        ? await prisma.inventoryItem.groupBy({
            by: ["productId"],
            where: { productId: { in: ids } },
            _sum: { available: true, reserved: true },
          })
        : [];

      const invByProductId = new Map(
        inventoryAgg.map((r) => [
          r.productId,
          { available: r._sum.available ?? 0, reserved: r._sum.reserved ?? 0 },
        ]),
      );

      const items = pageItems.map((p) => {
        const inv = invByProductId.get(p.id) || { available: 0, reserved: 0 };

        return {
          id: p.id,
          name: p.title,
          sku: p.sku ?? null,
          status: p.status,
          published: p.status === "ACTIVE",
          price: Number(p.price),
          currency: "NGN",
          createdAt: p.createdAt.toISOString(),
          updatedAt: p.updatedAt.toISOString(),
          thumbnailUrl: p.productImages?.[0]?.url ?? null,
          inventory: inv,
          variantsCount: p._count.productVariants,
        };
      });

      return NextResponse.json(
        { items, nextCursor, requestId },
        { headers: standardHeaders(requestId) },
      );
    } catch (error: unknown) {
      if (error instanceof BaseError) throw error;
      const msg = error instanceof Error ? error.message : String(error);
      logger.error("Failed to fetch products", {
        requestId,
        error: msg,
        storeId,
        app: "merchant",
      });
      return NextResponse.json(
        { error: "Internal Server Error", requestId },
        { status: 500, headers: standardHeaders(requestId) },
      );
    }
  },
);

// POST /api/products - Create new product
export const POST = withVayvaAPI(
  PERMISSIONS.PRODUCTS_MANAGE,
  async (req: NextRequest, { storeId, user, correlationId }: APIContext) => {
    const requestId = correlationId;
    try {
      const body = await req.json().catch(() => ({}));
      const validation = ProductCreateSchema.safeParse(body);

      if (!validation.success) {
        return NextResponse.json(
          {
            error: "Validation failed",
            details: validation.error.format(),
          },
          { status: 400, headers: standardHeaders(requestId) },
        );
      }

      const data = validation.data;

      // Sanitize Handle or Generate
      const handle = data.handle
        ? sanitizeText(data.handle)
        : sanitizeText(data.title).toLowerCase().replace(/[^a-z0-9]+/g, "-") +
          "-" +
          Math.random().toString(36).substring(2, 7);

      // Handle Images from metadata if present
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
      await logAuditEvent(storeId, user?.id || "", AuditEventType.PRODUCT_CREATED, {
        targetType: "PRODUCT",
        targetId: product.id,
        meta: {
          name: product.title,
          price: Number(product.price),
        },
      });

      return NextResponse.json(
        { success: true, data: product },
        { status: 201, headers: standardHeaders(requestId) },
      );
    } catch (error: unknown) {
      if (error instanceof BaseError) throw error;
      const msg = error instanceof Error ? error.message : String(error);
      logger.error("Failed to create product", {
        requestId,
        error: msg,
        storeId,
        userId: user?.id,
        app: "merchant",
      });
      return NextResponse.json(
        { error: "Internal Server Error", requestId },
        { status: 500, headers: standardHeaders(requestId) },
      );
    }
  },
);
