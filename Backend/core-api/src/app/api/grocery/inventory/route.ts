import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI, type APIContext } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { logger, standardHeaders } from "@vayva/shared";
import { z } from "zod";

const InventoryQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  status: z.enum(["in_stock", "low_stock", "out_of_stock", "discontinued"]).optional(),
  categoryId: z.string().optional(),
  supplierId: z.string().optional(),
  minStock: z.coerce.number().optional(),
  maxStock: z.coerce.number().optional(),
  search: z.string().optional(),
});

const InventoryCreateSchema = z.object({
  name: z.string().min(1),
  sku: z.string().min(1),
  barcode: z.string().optional(),
  categoryId: z.string(),
  supplierId: z.string(),
  description: z.string().optional(),
  unit: z.enum(["each", "pound", "ounce", "gram", "kilogram", "liter", "milliliter", "package"]),
  weight: z.number().positive().optional(),
  dimensions: z.object({
    length: z.number().positive().optional(),
    width: z.number().positive().optional(),
    height: z.number().positive().optional(),
  }).optional(),
  costPrice: z.number().nonnegative(),
  sellingPrice: z.number().positive(),
  wholesalePrice: z.number().nonnegative().optional(),
  minimumStock: z.number().int().nonnegative().default(0),
  maximumStock: z.number().int().positive().optional(),
  currentStock: z.number().int().nonnegative().default(0),
  reorderPoint: z.number().int().nonnegative().default(0),
  shelfLifeDays: z.number().int().positive().optional(),
  storageRequirements: z.string().optional(),
  notes: z.string().optional(),
});

export const GET = withVayvaAPI(
  PERMISSIONS.INVENTORY_VIEW,
  async (req: NextRequest, { storeId, correlationId }: APIContext) => {
    const requestId = correlationId;
    try {
      const { searchParams } = new URL(req.url);
      const parseResult = InventoryQuerySchema.safeParse(
        Object.fromEntries(searchParams)
      );

      if (!parseResult.success) {
        return NextResponse.json(
          {
            error: "Invalid query parameters",
            details: parseResult.error.flatten(),
          },
          { status: 400, headers: standardHeaders(requestId) }
        );
      }

      const { page, limit, status, categoryId, supplierId, minStock, maxStock, search } = parseResult.data;
      const skip = (page - 1) * limit;

      const where: any = { storeId };
      
      if (status) where.status = status;
      if (categoryId) where.categoryId = categoryId;
      if (supplierId) where.supplierId = supplierId;
      if (minStock !== undefined) where.currentStock = { ...where.currentStock, gte: minStock };
      if (maxStock !== undefined) where.currentStock = { ...where.currentStock, lte: maxStock };
      if (search) {
        where.OR = [
          { name: { contains: search, mode: "insensitive" } },
          { sku: { contains: search, mode: "insensitive" } },
          { barcode: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
        ];
      }

      const [products, total] = await Promise.all([
        prisma.groceryProduct.findMany({
          where,
          include: {
            category: {
              select: {
                id: true,
                name: true,
                description: true,
              },
            },
            supplier: {
              select: {
                id: true,
                name: true,
                contactEmail: true,
              },
            },
            _count: {
              select: {
                orderItems: true,
              },
            },
          },
          skip,
          take: limit,
          orderBy: { createdAt: "desc" },
        }),
        prisma.groceryProduct.count({ where }),
      ]);

      // Calculate inventory metrics and stock status
      const productsWithMetrics = products.map(product => {
        const stockStatus = this.determineStockStatus(
          product.currentStock,
          product.minimumStock,
          product.reorderPoint
        );
        
        const stockTurnover = product._count.orderItems > 0 
          ? Math.round((product._count.orderItems / (product.currentStock + 1)) * 100) / 100
          : 0;

        const profitMargin = product.sellingPrice > 0 
          ? Math.round(((product.sellingPrice - product.costPrice) / product.sellingPrice) * 10000) / 100
          : 0;

        const daysUntilExpiry = product.shelfLifeDays 
          ? product.shelfLifeDays - Math.floor((Date.now() - product.createdAt.getTime()) / (1000 * 60 * 60 * 24))
          : null;

        return {
          ...product,
          dimensions: JSON.parse(product.dimensions || "{}"),
          stockStatus,
          stockTurnover,
          profitMargin,
          daysUntilExpiry,
          needsReordering: product.currentStock <= product.reorderPoint,
          isLowStock: stockStatus === "low_stock",
          isOutOfStock: stockStatus === "out_of_stock",
        };
      });

      return NextResponse.json(
        {
          data: productsWithMetrics,
          meta: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
          },
        },
        { headers: standardHeaders(requestId) }
      );
    } catch (error: unknown) {
      logger.error("[GROCERY_INVENTORY_GET]", { error, storeId });
      return NextResponse.json(
        { error: "Failed to fetch inventory" },
        { status: 500, headers: standardHeaders(requestId) }
      );
    }
  }
);

export const POST = withVayvaAPI(
  PERMISSIONS.INVENTORY_MANAGE,
  async (req: NextRequest, { storeId, user, correlationId }: APIContext) => {
    const requestId = correlationId;
    try {
      const json = await req.json().catch(() => ({}));
      const parseResult = InventoryCreateSchema.safeParse(json);

      if (!parseResult.success) {
        return NextResponse.json(
          {
            error: "Invalid product data",
            details: parseResult.error.flatten(),
          },
          { status: 400, headers: standardHeaders(requestId) }
        );
      }

      const body = parseResult.data;

      // Verify category exists
      const category = await prisma.groceryCategory.findFirst({
        where: { id: body.categoryId, storeId },
      });

      if (!category) {
        return NextResponse.json(
          { error: "Category not found" },
          { status: 404, headers: standardHeaders(requestId) }
        );
      }

      // Verify supplier exists
      const supplier = await prisma.grocerySupplier.findFirst({
        where: { id: body.supplierId, storeId },
      });

      if (!supplier) {
        return NextResponse.json(
          { error: "Supplier not found" },
          { status: 404, headers: standardHeaders(requestId) }
        );
      }

      // Check for duplicate SKU
      const existingProduct = await prisma.groceryProduct.findFirst({
        where: { sku: body.sku, storeId },
      });

      if (existingProduct) {
        return NextResponse.json(
          { error: "Product with this SKU already exists" },
          { status: 409, headers: standardHeaders(requestId) }
        );
      }

      const product = await prisma.groceryProduct.create({
        data: {
          storeId,
          name: body.name,
          sku: body.sku,
          barcode: body.barcode,
          categoryId: body.categoryId,
          supplierId: body.supplierId,
          description: body.description,
          unit: body.unit,
          weight: body.weight,
          dimensions: JSON.stringify(body.dimensions),
          costPrice: body.costPrice,
          sellingPrice: body.sellingPrice,
          wholesalePrice: body.wholesalePrice,
          minimumStock: body.minimumStock,
          maximumStock: body.maximumStock,
          currentStock: body.currentStock,
          reorderPoint: body.reorderPoint,
          shelfLifeDays: body.shelfLifeDays,
          storageRequirements: body.storageRequirements,
          notes: body.notes,
          status: body.currentStock > 0 ? "in_stock" : "out_of_stock",
        },
        include: {
          category: {
            select: {
              name: true,
            },
          },
          supplier: {
            select: {
              name: true,
            },
          },
        },
      });

      return NextResponse.json(product, {
        status: 201,
        headers: standardHeaders(requestId),
      });
    } catch (error: unknown) {
      logger.error("[GROCERY_INVENTORY_POST]", { error, storeId, userId: user?.id });
      return NextResponse.json(
        { error: "Failed to create product" },
        { status: 500, headers: standardHeaders(requestId) }
      );
    }
  }
);

// Determine stock status based on current stock levels
function determineStockStatus(currentStock: number, minimumStock: number, reorderPoint: number): string {
  if (currentStock <= 0) return "out_of_stock";
  if (currentStock <= minimumStock) return "low_stock";
  if (currentStock <= reorderPoint) return "reorder_needed";
  return "in_stock";
}