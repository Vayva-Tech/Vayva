import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { logger } from "@vayva/shared";
import { z } from "zod";

const productSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  category: z.string(),
  price: z.number(),
  costPrice: z.number().optional(),
  stockQuantity: z.number().optional(),
  lowStockThreshold: z.number().optional(),
  inventoryTracking: z.boolean().optional(),
  productType: z.enum(["RETAIL", "PROFESSIONAL"]).optional(),
  supplier: z.string().optional(),
  sku: z.string().optional(),
  barcode: z.string().optional(),
  imageUrl: z.string().optional(),
  metadata: z.any().optional(),
});

/**
 * GET /api/beauty/inventory
 * Get all inventory items with filtering and alerts
 */
export const GET = withVayvaAPI(
  PERMISSIONS.DASHBOARD_VIEW,
  async (req: NextRequest, { storeId }: { storeId: string }) => {
    try {
      const { searchParams } = new URL(req.url);
      const category = searchParams.get("category");
      const productType = searchParams.get("productType");
      const lowStockOnly = searchParams.get("lowStockOnly") === "true";
      const limit = parseInt(searchParams.get("limit") || "50");
      const page = parseInt(searchParams.get("page") || "1");

      const where: any = {
        merchantId: storeId,
      };

      if (category) where.category = category;
      if (productType) where.productType = productType;

      const [products, total] = await Promise.all([
        prisma.product.findMany({
          where,
          orderBy: {
            createdAt: "desc",
          },
          take: limit,
          skip: (page - 1) * limit,
        }),
        prisma.product.count({ where }),
      ]);

      // Calculate inventory metrics
      const productsWithMetrics = products.map((product) => {
        const isLowStock = product.inventoryTracking && 
          product.stockQuantity !== null && 
          product.lowStockThreshold !== null &&
          product.stockQuantity <= product.lowStockThreshold;

        return {
          ...product,
          isLowStock,
          stockStatus: !product.inventoryTracking 
            ? "not_tracking" 
            : product.stockQuantity === 0 
              ? "out_of_stock"
              : isLowStock 
                ? "low_stock"
                : "in_stock",
        };
      });

      // Get inventory summary
      const lowStockCount = productsWithMetrics.filter(p => p.isLowStock).length;
      const outOfStockCount = productsWithMetrics.filter(p => p.stockStatus === "out_of_stock").length;
      const totalValue = productsWithMetrics.reduce((acc, p) => {
        return acc + ((p.stockQuantity || 0) * (p.costPrice || p.price || 0));
      }, 0);

      return NextResponse.json({
        success: true,
        data: {
          products: productsWithMetrics,
          summary: {
            totalProducts: total,
            lowStockCount,
            outOfStockCount,
            totalValue,
          },
          pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
          },
        },
      });
    } catch (error: unknown) {
      logger.error("[BEAUTY_INVENTORY_GET_ERROR]", { 
        error: error instanceof Error ? error.message : String(error),
        storeId 
      });
      return NextResponse.json(
        { error: "Failed to fetch inventory" },
        { status: 500 }
      );
    }
  }
);

/**
 * POST /api/beauty/inventory
 * Create a new inventory product
 */
export const POST = withVayvaAPI(
  PERMISSIONS.DASHBOARD_EDIT,
  async (req: NextRequest, { storeId }: { storeId: string }) => {
    try {
      const body = await req.json();
      const validatedData = productSchema.parse(body);

      // Check if SKU already exists
      if (validatedData.sku) {
        const existingProduct = await prisma.product.findFirst({
          where: {
            merchantId: storeId,
            sku: validatedData.sku,
          },
        });

        if (existingProduct) {
          return NextResponse.json(
            { error: "SKU already exists" },
            { status: 400 }
          );
        }
      }

      const product = await prisma.product.create({
        data: {
          ...validatedData,
          merchantId: storeId,
          status: "active",
        },
      });

      logger.info("[BEAUTY_INVENTORY_POST] Product created", { 
        productId: product.id,
        storeId 
      });

      return NextResponse.json({
        success: true,
        data: product,
        message: "Product created successfully",
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { error: "Validation failed", details: error.errors },
          { status: 400 }
        );
      }
      
      logger.error("[BEAUTY_INVENTORY_POST_ERROR]", { 
        error: error instanceof Error ? error.message : String(error),
        storeId 
      });
      return NextResponse.json(
        { error: "Failed to create product" },
        { status: 500 }
      );
    }
  }
);
