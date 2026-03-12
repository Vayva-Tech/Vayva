import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI, type APIContext } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { logger, standardHeaders } from "@vayva/shared";
import { z } from "zod";

const SupplierProductsQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  status: z.enum(["active", "inactive", "discontinued"]).optional(),
  categoryId: z.string().optional(),
  minPrice: z.coerce.number().optional(),
  maxPrice: z.coerce.number().optional(),
  search: z.string().optional(),
});

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const requestId = crypto.randomUUID();
  try {
    const { id } = params;
    const { searchParams } = new URL(req.url);
    
    const parseResult = SupplierProductsQuerySchema.parse({
      page: searchParams.get("page"),
      limit: searchParams.get("limit"),
      status: searchParams.get("status"),
      categoryId: searchParams.get("categoryId"),
      minPrice: searchParams.get("minPrice"),
      maxPrice: searchParams.get("maxPrice"),
      search: searchParams.get("search"),
    });

    // Extract storeId from request context
    const storeId = "test-store-id"; // Placeholder

    // Verify supplier exists
    const supplier = await prisma.grocerySupplier.findFirst({
      where: { id, storeId },
    });

    if (!supplier) {
      return NextResponse.json(
        { error: "Supplier not found" },
        { status: 404, headers: standardHeaders(requestId) }
      );
    }

    const skip = (parseResult.page - 1) * parseResult.limit;

    const whereClause = {
      supplierId: id,
      storeId,
      ...(parseResult.status && { active: parseResult.status === "active" }),
      ...(parseResult.categoryId && { categoryId: parseResult.categoryId }),
      ...(parseResult.minPrice && { price: { gte: parseResult.minPrice } }),
      ...(parseResult.maxPrice && { price: { lte: parseResult.maxPrice } }),
      ...(parseResult.search && {
        OR: [
          { name: { contains: parseResult.search, mode: "insensitive" } },
          { sku: { contains: parseResult.search, mode: "insensitive" } },
          { description: { contains: parseResult.search, mode: "insensitive" } },
        ],
      }),
    };

    const [products, total] = await Promise.all([
      prisma.groceryProduct.findMany({
        where: whereClause,
        include: {
          category: {
            select: {
              id: true,
              name: true,
            },
          },
          _count: {
            select: {
              sales: true,
              reviews: true,
            },
          },
        },
        skip,
        take: parseResult.limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.groceryProduct.count({ where: whereClause }),
    ]);

    // Calculate supplier performance metrics
    const performanceMetrics = {
      totalProducts: total,
      activeProducts: products.filter(p => p.active).length,
      lowStockProducts: products.filter(p => p.lowStockAlert).length,
      averageRating: products.length > 0 
        ? products.reduce((sum, p) => sum + (p.averageRating || 0), 0) / products.length
        : 0,
      totalRevenue: products.reduce((sum, p) => sum + (p.totalRevenue || 0), 0),
    };

    return NextResponse.json(
      {
        data: products,
        meta: {
          page: parseResult.page,
          limit: parseResult.limit,
          total,
          totalPages: Math.ceil(total / parseResult.limit),
          performance: performanceMetrics,
        },
      },
      { headers: standardHeaders(requestId) }
    );
  } catch (error: unknown) {
    logger.error("[SUPPLIER_PRODUCTS_GET]", { error, supplierId: params.id });
    return NextResponse.json(
      { error: "Failed to fetch supplier products" },
      { status: 500, headers: standardHeaders(requestId) }
    );
  }
}