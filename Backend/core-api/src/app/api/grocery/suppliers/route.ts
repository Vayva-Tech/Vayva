import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI, type APIContext } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { logger, standardHeaders } from "@vayva/shared";
import { z } from "zod";

const SupplierQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  status: z.enum(["active", "inactive", "suspended"]).optional(),
  category: z.string().optional(),
  minRating: z.coerce.number().min(0).max(5).optional(),
  maxRating: z.coerce.number().min(0).max(5).optional(),
  search: z.string().optional(),
});

const SupplierCreateSchema = z.object({
  name: z.string().min(1),
  contactName: z.string().min(1),
  contactEmail: z.string().email(),
  contactPhone: z.string().min(1),
  address: z.object({
    street: z.string(),
    city: z.string(),
    state: z.string(),
    zipCode: z.string(),
    country: z.string().default("US"),
  }),
  website: z.string().url().optional(),
  paymentTerms: z.enum(["net_30", "net_15", "cod", "prepaid"]).default("net_30"),
  minimumOrder: z.number().nonnegative().default(0),
  deliveryDays: z.number().int().positive().default(3),
  categories: z.array(z.string()).default([]),
  certifications: z.array(z.string()).default([]),
  notes: z.string().optional(),
});

export const GET = withVayvaAPI(
  PERMISSIONS.SUPPLIERS_VIEW,
  async (req: NextRequest, { storeId, correlationId }: APIContext) => {
    const requestId = correlationId;
    try {
      const { searchParams } = new URL(req.url);
      const parseResult = SupplierQuerySchema.safeParse(
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

      const { page, limit, status, category, minRating, maxRating, search } = parseResult.data;
      const skip = (page - 1) * limit;

      const where: any = { storeId };
      
      if (status) where.status = status;
      if (category) where.categories = { contains: `"${category}"` };
      if (search) {
        where.OR = [
          { name: { contains: search, mode: "insensitive" } },
          { contactName: { contains: search, mode: "insensitive" } },
          { contactEmail: { contains: search, mode: "insensitive" } },
        ];
      }

      const [suppliers, total] = await Promise.all([
        prisma.grocerySupplier.findMany({
          where,
          include: {
            _count: {
              select: {
                products: true,
                orders: true,
              },
            },
          },
          skip,
          take: limit,
          orderBy: { createdAt: "desc" },
        }),
        prisma.grocerySupplier.count({ where }),
      ]);

      // Filter by rating if specified
      let filteredSuppliers = suppliers;
      if (minRating !== undefined || maxRating !== undefined) {
        filteredSuppliers = await Promise.all(
          suppliers.map(async (supplier) => {
            const reviews = await prisma.grocerySupplierReview.findMany({
              where: { supplierId: supplier.id },
            });
            
            const avgRating = reviews.length > 0 
              ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
              : 0;
              
            const passesFilter = (
              (minRating === undefined || avgRating >= minRating) &&
              (maxRating === undefined || avgRating <= maxRating)
            );
            
            return passesFilter ? { ...supplier, averageRating: Math.round(avgRating * 100) / 100 } : null;
          })
        ).then(results => results.filter(Boolean) as any[]);
      }

      // Calculate supplier metrics
      const suppliersWithMetrics = filteredSuppliers.map(supplier => ({
        ...supplier,
        address: JSON.parse(supplier.address || "{}"),
        categories: JSON.parse(supplier.categories || "[]"),
        certifications: JSON.parse(supplier.certifications || "[]"),
        averageRating: supplier.averageRating || 0,
        performance: {
          totalProducts: supplier._count.products,
          totalOrders: supplier._count.orders,
          onTimeDeliveryRate: 95, // Would calculate from order history
          qualityScore: 4.2, // Would calculate from product reviews
        },
      }));

      return NextResponse.json(
        {
          data: suppliersWithMetrics,
          meta: {
            total: filteredSuppliers.length,
            page,
            limit,
            totalPages: Math.ceil(filteredSuppliers.length / limit),
          },
        },
        { headers: standardHeaders(requestId) }
      );
    } catch (error: unknown) {
      logger.error("[GROCERY_SUPPLIERS_GET]", { error, storeId });
      return NextResponse.json(
        { error: "Failed to fetch suppliers" },
        { status: 500, headers: standardHeaders(requestId) }
      );
    }
  }
);

export const POST = withVayvaAPI(
  PERMISSIONS.SUPPLIERS_MANAGE,
  async (req: NextRequest, { storeId, user, correlationId }: APIContext) => {
    const requestId = correlationId;
    try {
      const json = await req.json().catch(() => ({}));
      const parseResult = SupplierCreateSchema.safeParse(json);

      if (!parseResult.success) {
        return NextResponse.json(
          {
            error: "Invalid supplier data",
            details: parseResult.error.flatten(),
          },
          { status: 400, headers: standardHeaders(requestId) }
        );
      }

      const body = parseResult.data;

      // Check for duplicate email
      const existingSupplier = await prisma.grocerySupplier.findFirst({
        where: { contactEmail: body.contactEmail, storeId },
      });

      if (existingSupplier) {
        return NextResponse.json(
          { error: "Supplier with this email already exists" },
          { status: 409, headers: standardHeaders(requestId) }
        );
      }

      const supplier = await prisma.grocerySupplier.create({
        data: {
          storeId,
          name: body.name,
          contactName: body.contactName,
          contactEmail: body.contactEmail,
          contactPhone: body.contactPhone,
          address: JSON.stringify(body.address),
          website: body.website,
          paymentTerms: body.paymentTerms,
          minimumOrder: body.minimumOrder,
          deliveryDays: body.deliveryDays,
          categories: JSON.stringify(body.categories),
          certifications: JSON.stringify(body.certifications),
          notes: body.notes,
          status: "active",
        },
      });

      return NextResponse.json(supplier, {
        status: 201,
        headers: standardHeaders(requestId),
      });
    } catch (error: unknown) {
      logger.error("[GROCERY_SUPPLIERS_POST]", { error, storeId, userId: user?.id });
      return NextResponse.json(
        { error: "Failed to create supplier" },
        { status: 500, headers: standardHeaders(requestId) }
      );
    }
  }
);