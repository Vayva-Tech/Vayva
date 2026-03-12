import { NextRequest, NextResponse } from "next/server";
import { prisma, Prisma } from "@vayva/db";
import { withVayvaAPI, APIContext } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { standardHeaders, logger } from "@vayva/shared";
import { z } from "zod";

// Delivery configuration schema
const DeliveryConfigSchema = z.object({
  type: z.enum(["free", "flat", "calculated", "store_default"]),
  fee: z.number().min(0).optional(),
  zones: z.array(z.string()).optional(),
  requiresDelivery: z.boolean().default(true),
  note: z.string().max(500).optional(),
});

// GET /api/products/[id]/delivery - Get product delivery configuration
export const GET = withVayvaAPI(
  PERMISSIONS.PRODUCTS_VIEW,
  async (req: NextRequest, { storeId, correlationId }: APIContext) => {
    const requestId = correlationId;
    
    try {
      const url = new URL(req.url);
      const productId = url.pathname.split("/").slice(-2)[0];

      const product = await prisma.product.findFirst({
        where: { id: productId, storeId },
        select: {
          id: true,
          title: true,
          metadata: true,
        },
      });

      if (!product) {
        return NextResponse.json(
          { error: "Product not found" },
          { status: 404, headers: standardHeaders(requestId) },
        );
      }

      // Parse and validate delivery config from metadata
      const rawMetadata = product.metadata as Record<string, unknown> | null;
      const config = rawMetadata?.deliveryConfig as Record<string, unknown> | null;
      
      return NextResponse.json(
        {
          productId: product.id,
          title: product.title,
          deliveryConfig: config || {
            type: "store_default",
            requiresDelivery: true,
          },
        },
        { headers: standardHeaders(requestId) },
      );
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      logger.error("[PRODUCT_DELIVERY_GET] Failed to fetch delivery config", {
        error: message,
        storeId,
        requestId,
      });
      return NextResponse.json(
        { error: "Failed to fetch delivery configuration" },
        { status: 500, headers: standardHeaders(requestId) },
      );
    }
  },
);

// PATCH /api/products/[id]/delivery - Update product delivery configuration
export const PATCH = withVayvaAPI(
  PERMISSIONS.PRODUCTS_EDIT,
  async (req: NextRequest, { storeId, correlationId }: APIContext) => {
    const requestId = correlationId;
    
    try {
      const url = new URL(req.url);
      const productId = url.pathname.split("/").slice(-2)[0];

      // Verify product exists and belongs to store
      const existingProduct = await prisma.product.findFirst({
        where: { id: productId, storeId },
        select: { id: true, metadata: true },
      });

      if (!existingProduct) {
        return NextResponse.json(
          { error: "Product not found" },
          { status: 404, headers: standardHeaders(requestId) },
        );
      }

      // Parse and validate request body
      const body = await req.json();
      const result = DeliveryConfigSchema.safeParse(body);

      if (!result.success) {
        return NextResponse.json(
          {
            error: "Invalid delivery configuration",
            details: result.error.flatten(),
          },
          { status: 400, headers: standardHeaders(requestId) },
        );
      }

      const config = result.data;

      // Validate fee is present when type is 'flat'
      if (config.type === "flat" && (config.fee === undefined || config.fee === null)) {
        return NextResponse.json(
          { error: "Fee is required when delivery type is 'flat'" },
          { status: 400, headers: standardHeaders(requestId) },
        );
      }

      // Update product with delivery config
      const updatedProduct = await prisma.product.update({
        where: { id: productId },
        data: {
          metadata: Object.assign(
            {},
            (existingProduct.metadata as Record<string, unknown> | null) || {},
            { deliveryConfig: config }
          ) as unknown as Prisma.InputJsonValue,
          updatedAt: new Date(),
        },
        select: {
          id: true,
          title: true,
          metadata: true,
          updatedAt: true,
        },
      });

      logger.info("[PRODUCT_DELIVERY_PATCH] Updated delivery config", {
        productId,
        storeId,
        configType: config.type,
        requestId,
      });

      return NextResponse.json(
        {
          productId: updatedProduct.id,
          title: updatedProduct.title,
          deliveryConfig: (updatedProduct.metadata as Record<string, unknown>)?.deliveryConfig || null,
          updatedAt: updatedProduct.updatedAt,
        },
        { headers: standardHeaders(requestId) },
      );
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      logger.error("[PRODUCT_DELIVERY_PATCH] Failed to update delivery config", {
        error: message,
        storeId,
        requestId,
      });
      return NextResponse.json(
        { error: "Failed to update delivery configuration" },
        { status: 500, headers: standardHeaders(requestId) },
      );
    }
  },
);

// DELETE /api/products/[id]/delivery - Remove product delivery configuration (reset to store default)
export const DELETE = withVayvaAPI(
  PERMISSIONS.PRODUCTS_EDIT,
  async (req: NextRequest, { storeId, correlationId }: APIContext) => {
    const requestId = correlationId;
    
    try {
      const url = new URL(req.url);
      const productId = url.pathname.split("/").slice(-2)[0];

      // Verify product exists and belongs to store
      const existingProduct = await prisma.product.findFirst({
        where: { id: productId, storeId },
        select: { id: true, metadata: true },
      });

      if (!existingProduct) {
        return NextResponse.json(
          { error: "Product not found" },
          { status: 404, headers: standardHeaders(requestId) },
        );
      }

      // Reset delivery config to null (uses store default)
      const updatedProduct = await prisma.product.update({
        where: { id: productId },
        data: {
          metadata: Object.assign(
            {},
            (existingProduct.metadata as Record<string, unknown> | null) || {},
            { deliveryConfig: undefined }
          ) as unknown as Prisma.InputJsonValue,
          updatedAt: new Date(),
        },
        select: {
          id: true,
          title: true,
          metadata: true,
          updatedAt: true,
        },
      });

      logger.info("[PRODUCT_DELIVERY_DELETE] Reset delivery config to store default", {
        productId,
        storeId,
        requestId,
      });

      return NextResponse.json(
        {
          productId: updatedProduct.id,
          title: updatedProduct.title,
          deliveryConfig: null,
          updatedAt: updatedProduct.updatedAt,
        },
        { headers: standardHeaders(requestId) },
      );
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      logger.error("[PRODUCT_DELIVERY_DELETE] Failed to reset delivery config", {
        error: message,
        storeId,
        requestId,
      });
      return NextResponse.json(
        { error: "Failed to reset delivery configuration" },
        { status: 500, headers: standardHeaders(requestId) },
      );
    }
  },
);
