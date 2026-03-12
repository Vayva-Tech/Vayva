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
  companyName: z.string().min(1),
  contactName: z.string().min(1),
  contactEmail: z.string().email(),
  contactPhone: z.string().min(1),
  businessType: z.enum(["manufacturer", "distributor", "wholesaler", "importer"]),
  taxId: z.string().optional(),
  paymentTerms: z.number().int().positive().default(30), // days
  minimumOrder: z.number().nonnegative().default(0),
  shippingInfo: z.object({
    address: z.string(),
    city: z.string(),
    state: z.string(),
    zipCode: z.string(),
    country: z.string(),
  }),
  categories: z.array(z.string()).default([]),
  notes: z.string().optional(),
});

export const GET = withVayvaAPI(
  PERMISSIONS.WHOLESALE_VIEW,
  async (req: NextRequest, { storeId, correlationId }: APIContext) => {
    const requestId = correlationId;
    try {
      const { searchParams } = new URL(req.url);
      
      const parseResult = SupplierQuerySchema.parse({
        page: searchParams.get("page"),
        limit: searchParams.get("limit"),
        status: searchParams.get("status"),
        category: searchParams.get("category"),
        minRating: searchParams.get("minRating"),
        maxRating: searchParams.get("maxRating"),
        search: searchParams.get("search"),
      });

      const skip = (parseResult.page - 1) * parseResult.limit;

      const whereClause = {
        storeId,
        ...(parseResult.status && { 
          active: parseResult.status === "active" || parseResult.status === "suspended" 
        }),
        ...(parseResult.category && { 
          categories: { has: parseResult.category } 
        }),
        ...(parseResult.search && {
          OR: [
            { companyName: { contains: parseResult.search, mode: "insensitive" } },
            { contactName: { contains: parseResult.search, mode: "insensitive" } },
            { contactEmail: { contains: parseResult.search, mode: "insensitive" } },
          ],
        }),
      };

      const [suppliers, total] = await Promise.all([
        prisma.wholesaleSupplier.findMany({
          where: whereClause,
          include: {
            _count: {
              select: {
                products: true,
                purchaseOrders: {
                  where: { status: { not: "cancelled" } },
                },
              },
            },
          },
          skip,
          take: parseResult.limit,
          orderBy: { companyName: "asc" },
        }),
        prisma.wholesaleSupplier.count({ where: whereClause }),
      ]);

      return NextResponse.json(
        {
          data: suppliers,
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
      logger.error("[WHOLESALE_SUPPLIERS_GET]", { error, storeId });
      return NextResponse.json(
        { error: "Failed to fetch suppliers" },
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

      const createdSupplier = await prisma.wholesaleSupplier.create({
        data: {
          ...parseResult.data,
          storeId,
          shippingAddress: JSON.stringify(parseResult.data.shippingInfo),
          categories: JSON.stringify(parseResult.data.categories),
          active: true,
          rating: 0,
        },
      });

      logger.info("[WHOLESALE_SUPPLIER_CREATE]", {
        supplierId: createdSupplier.id,
        companyName: createdSupplier.companyName,
        businessType: createdSupplier.businessType,
      });

      return NextResponse.json(
        { data: createdSupplier },
        { headers: standardHeaders(requestId) }
      );
    } catch (error: unknown) {
      logger.error("[WHOLESALE_SUPPLIER_CREATE]", { error, storeId });
      return NextResponse.json(
        { error: "Failed to create supplier" },
        { status: 500, headers: standardHeaders(requestId) }
      );
    }
  }
);