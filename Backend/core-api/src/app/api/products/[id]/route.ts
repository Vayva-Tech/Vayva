import { NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma, Prisma } from "@vayva/db";
import { sanitizeHtml } from "@/lib/input-sanitization";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function _getString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

function parseProductStatus(value: unknown): "DRAFT" | "PENDING" | "ACTIVE" | "ARCHIVED" | undefined {
  if (typeof value !== "string") return undefined;
  const normalized = value.toUpperCase();
  const allowed = ["DRAFT", "PENDING", "ACTIVE", "ARCHIVED"];
  return allowed.includes(normalized) ? normalized as "DRAFT" | "PENDING" | "ACTIVE" | "ARCHIVED" : undefined;
}

export const GET = withVayvaAPI(
  PERMISSIONS.PRODUCTS_VIEW,
  async (req, { storeId, params }) => {
    const { id } = await params;
    try {
      if (!id) {
        return NextResponse.json({ error: "ID required" }, { status: 400 });
      }
      // Fetch product verifying store ownership
      const product = await prisma.product.findFirst({
        where: {
          id,
          storeId,
        },
        include: {
          productImages: true,
          productVariants: true,
          marketplaceListing: true,
        },
      });
      if (!product) {
        return NextResponse.json(
          {
            error: "Product not found",
            message: "Product does not exist or you don't have access to it",
          },
          { status: 404 },
        );
      }
      // Transform to API response format
      const response = {
        id: product.id,
        storeId: product.storeId,
        title: product.title,
        description: product.description,
        handle: product.handle,
        price: Number(product.price),
        compareAtPrice: product.compareAtPrice
          ? Number(product.compareAtPrice)
          : null,
        costPrice: product.costPrice ? Number(product.costPrice) : null,
        sku: product.sku,
        barcode: product.barcode,
        trackInventory: product.trackInventory,
        allowBackorder: product.allowBackorder,
        weight: product.weight,
        width: product.width,
        height: product.height,
        depth: product.depth,
        status: product.status,
        productType: product.productType,
        brand: product.brand,
        tags: product.tags,
        seoTitle: product.seoTitle,
        seoDescription: product.seoDescription,
        metadata: product.metadata,
        condition: product.condition,
        warrantyMonths: product.warrantyMonths,
        techSpecs: product.techSpecs,
        moq: product.moq,
        createdAt: product.createdAt.toISOString(),
        updatedAt: product.updatedAt.toISOString(),
      };
      return NextResponse.json(response, {
        headers: {
          "Cache-Control": "no-store",
        },
      });
    } catch (error: unknown) {
      logger.error("[PRODUCT_GET_BY_ID]", error, { storeId, productId: id });
      return NextResponse.json(
        {
          error: "Internal Error",
          message: error instanceof Error ? error.message : "Unknown error",
        },
        { status: 500 },
      );
    }
  },
);

export const PATCH = withVayvaAPI(
  PERMISSIONS.PRODUCTS_MANAGE,
  async (req, { storeId, user, params }) => {
    const { id } = await params;
    try {
      if (!id)
        return NextResponse.json({ error: "ID required" }, { status: 400 });
      const parsedBody: unknown = await req.json().catch(() => ({}));
      const body = isRecord(parsedBody) ? parsedBody : {};

      // Verify ownership first
      const existing = await prisma.product.findFirst({
        where: { id, storeId },
      });
      if (!existing) {
        return NextResponse.json(
          { error: "Product not found" },
          { status: 404 },
        );
      }

      const attributes =
        (isRecord(body.attributes) ? body.attributes : undefined) ||
        (isRecord(body.metadata) ? body.metadata : undefined) ||
        {};

      // Update Basic Fields
      await prisma.product.update({
        where: { id },
        data: {
          title:
            (typeof body.title === "string" ? body.title : undefined) ||
            (typeof body.name === "string" ? body.name : undefined) ||
            undefined,
          description:
            typeof body.description === "string"
              ? sanitizeHtml(body.description)
              : undefined,
          price: body.price ? parseFloat(body.price.toString()) : undefined,
          compareAtPrice:
            body.compareAtPrice !== undefined
              ? body.compareAtPrice
                ? parseFloat(body.compareAtPrice.toString())
                : null
              : undefined,
          costPrice:
            body.costPrice !== undefined
              ? body.costPrice
                ? parseFloat(body.costPrice.toString())
                : null
              : undefined,
          status: parseProductStatus(body.status),
          metadata:
            Object.keys(attributes).length > 0
              ? (attributes as Prisma.InputJsonValue)
              : undefined,
          ...(Array.isArray(body.images) && {
            productImages: {
              deleteMany: {},
              create: body.images.map((img: unknown, idx: number) => {
                const image = isRecord(img) ? img : {};
                return {
                  url: String(image.url || ""),
                  altText: String(image.altText || image.alt || ""),
                  position: idx,
                };
              }),
            },
          }),
        },
      });

      // Handle Variants: Delete removed, Update existing, Create new
      if (Array.isArray(body.variants)) {
        const variants = body.variants.filter(isRecord);
        const incomingIds = variants.map((v) => String(v.id)).filter(Boolean);
        await prisma.productVariant.deleteMany({
          where: {
            productId: id,
            id: { notIn: incomingIds },
          },
        });
        for (const [idx, v] of variants.entries()) {
          const variantData = {
            title: String(v.title ?? ""),
            options: (isRecord(v.options)
              ? v.options
              : {}) as Prisma.InputJsonValue,
            sku: typeof v.sku === "string" ? v.sku : undefined,
            barcode: typeof v.barcode === "string" ? v.barcode : undefined,
            price: v.price ? parseFloat(String(v.price)) : 0,
            compareAtPrice: v.compareAtPrice
              ? parseFloat(String(v.compareAtPrice))
              : null,
            position: idx,
            imageId: typeof v.imageId === "string" ? v.imageId : null,
          };
          if (v.id) {
            await prisma.productVariant.updateMany({
              where: { id: String(v.id), productId: id },
              data: variantData,
            });
          } else {
            await prisma.productVariant.create({
              data: {
                ...variantData,
                productId: id,
                storeId,
              },
            });
          }
        }
      }

      const finalProduct = await prisma.product.findUnique({
        where: { id },
        include: {
          productImages: { orderBy: { position: "asc" } },
          productVariants: { orderBy: { position: "asc" } },
        },
      });
      return NextResponse.json(finalProduct);
    } catch (error: unknown) {
      logger.error("[PRODUCT_UPDATE_PATCH]", error, {
        storeId,
        productId: id,
        userId: user.id,
      });
      return NextResponse.json({ error: "Update Failed" }, { status: 500 });
    }
  },
);
