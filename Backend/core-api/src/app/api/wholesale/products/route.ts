import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI, type APIContext } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { logger, standardHeaders } from "@vayva/shared";
import { z } from "zod";

const ProductQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  status: z.enum(["active", "inactive", "discontinued"]).optional(),
  categoryId: z.string().optional(),
  supplierId: z.string().optional(),
  minPrice: z.coerce.number().optional(),
  maxPrice: z.coerce.number().optional(),
  minStock: z.coerce.number().optional(),
  maxStock: z.coerce.number().optional(),
  search: z.string().optional(),
});

const ProductCreateSchema = z.object({
  name: z.string().min(1),
  sku: z.string().min(1),
  description: z.string().optional(),
  categoryId: z.string(),
  supplierId: z.string(),
  unitPrice: z.number().positive(),
  costPrice: z.number().positive(),
  unitOfMeasure: z.string().min(1),
  weight: z.number().positive().optional(),
  dimensions: z.object({
    length: z.number().positive(),
    width: z.number().positive(),
    height: z.number().positive(),
  }).optional(),
  minimumOrderQuantity: z.number().int().positive().default(1),
  leadTimeDays: z.number().int().nonnegative().default(0),
  active: z.boolean().default(true),
  specifications: z.record(z.unknown()).optional(),
});

export const GET = withVayvaAPI(
  PERMISSIONS.WHOLESALE_VIEW,
  async (req: NextRequest, { storeId, correlationId }: APIContext) => {
    const requestId = correlationId;
    try {
      const { searchParams } = new URL(req.url);
      
      const parseResult = ProductQuerySchema.parse({
        page: searchParams.get("page"),
        limit: searchParams.get("limit"),
        status: searchParams.get("status"),
        categoryId: searchParams.get("categoryId"),
        supplierId: searchParams.get("supplierId"),
        minPrice: searchParams.get("minPrice"),
        maxPrice: searchParams.get("maxPrice"),
        minStock: searchParams.get("minStock"),
        maxStock: searchParams.get("maxStock"),
        search: searchParams.get("search"),
      });

      const skip = (parseResult.page - 1) * parseResult.limit;

      const whereClause = {
        storeId,
        ...(parseResult.status && { 
          active: parseResult.status === "active" || parseResult.status === "discontinued" 
        }),
        ...(parseResult.categoryId && { categoryId: parseResult.categoryId }),
        ...(parseResult.supplierId && { supplierId: parseResult.supplierId }),
        ...(parseResult.minPrice !== undefined && { 
          unitPrice: { gte: parseResult.minPrice } 
        }),
        ...(parseResult.maxPrice !== undefined && { 
          unitPrice: { lte: parseResult.maxPrice } 
        }),
        ...(parseResult.search && {
          OR: [
            { name: { contains: parseResult.search, mode: "insensitive" } },
            { sku: { contains: parseResult.search, mode: "insensitive" } },
            { description: { contains: parseResult.search, mode: "insensitive" } },
          ],
        }),
      };

      const [products, total] = await Promise.all([
        prisma.wholesaleProduct.findMany({
          where: whereClause,
          include: {
            category: {
              select: {
                id: true,
                name: true,
              },
            },
            supplier: {
              select: {
                id: true,
                companyName: true,
              },
            },
            _count: {
              select: {
                orderItems: true,
                inventoryMovements: true,
              },
            },
          },
          skip,
          take: parseResult.limit,
          orderBy: { name: "asc" },
        }),
        prisma.wholesaleProduct.count({ where: whereClause }),
      ]);

      // Enrich with inventory data
      const productsWithInventory = await Promise.all(
        products.map(async (product) => {
          const inventory = await prisma.wholesaleInventory.findFirst({
            where: { productId: product.id, storeId },
          });
          
          return {
            ...product,
            currentStock: inventory?.currentStock || 0,
            reservedStock: inventory?.reservedStock || 0,
            availableStock: inventory ? inventory.currentStock - inventory.reservedStock : 0,
            lowStockAlert: inventory?.lowStockAlert || false,
          };
        })
      );

      return NextResponse.json(
        {
          data: productsWithInventory,
          meta: {
            page: parseResult.page,
            limit: parseResult.limit,
            total,
            totalPages: Math.ceil(total / parseResult.limit),
          },
        },
        { headers: standardHeaders(requestId) }
      );
    } catch (error: unknown) {
      logger.error("[WHOLESALE_PRODUCTS_GET]", { error, storeId });
      return NextResponse.json(
        { error: "Failed to fetch products" },
        { status: 500, headers: standardHeaders(requestId) }
      );
    }
  }
);

export const POST = withVayvaAPI(
  PERMISSIONS.WHOLESALE_MANAGE,
  async (req: NextRequest, { storeId, user, correlationId }: APIContext) => {
    const requestId = correlationId;
    try {
      const json = await req.json().catch(() => ({}));
      const parseResult = ProductCreateSchema.safeParse(json);

      if (!parseResult.success) {
        return NextResponse.json(
          {
            error: "Invalid product data",
            details: parseResult.error.flatten(),
          },
          { status: 400, headers: standardHeaders(requestId) }
        );
      }

      // Verify category and supplier exist
      const [category, supplier] = await Promise.all([
        prisma.wholesaleCategory.findFirst({
          where: { id: parseResult.data.categoryId, storeId },
        }),
        prisma.wholesaleSupplier.findFirst({
          where: { id: parseResult.data.supplierId, storeId },
        }),
      ]);

      if (!category) {
        return NextResponse.json(
          { error: "Category not found" },
          { status: 400, headers: standardHeaders(requestId) }
        );
      }

      if (!supplier) {
        return NextResponse.json(
          { error: "Supplier not found" },
          { status: 400, headers: standardHeaders(requestId) }
        );
      }

      const createdProduct = await prisma.wholesaleProduct.create({
        data: {
          ...parseResult.data,
          storeId,
          specifications: parseResult.data.specifications 
            ? JSON.stringify(parseResult.data.specifications) 
            : undefined,
        },
        include: {
          category: {
            select: {
              name: true,
            },
          },
          supplier: {
            select: {
              companyName: true,
            },
          },
        },
      });

      // Create initial inventory record
      await prisma.wholesaleInventory.create({
        data: {
          productId: createdProduct.id,
          storeId,
          currentStock: 0,
          reservedStock: 0,
          reorderPoint: 0,
          lowStockAlert: false,
        },
      });

      logger.info("[WHOLESALE_PRODUCT_CREATE]", {
        productId: createdProduct.id,
        name: createdProduct.name,
        sku: createdProduct.sku,
      });

      return NextResponse.json(
        { data: createdProduct },
        { headers: standardHeaders(requestId) }
      );
    } catch (error: unknown) {
      logger.error("[WHOLESALE_PRODUCT_CREATE]", { error, storeId });
      return NextResponse.json(
        { error: "Failed to create product" },
        { status: 500, headers: standardHeaders(requestId) }
      );
    }
  }
);