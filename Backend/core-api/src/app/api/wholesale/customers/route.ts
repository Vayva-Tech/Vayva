import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI, type APIContext } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { logger, standardHeaders } from "@vayva/shared";
import { z } from "zod";

const CustomerQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  status: z.enum(["active", "inactive", "suspended"]).optional(),
  tier: z.enum(["bronze", "silver", "gold", "platinum"]).optional(),
  minCreditLimit: z.coerce.number().optional(),
  maxCreditLimit: z.coerce.number().optional(),
  search: z.string().optional(),
});

const CustomerCreateSchema = z.object({
  companyName: z.string().min(1),
  contactName: z.string().min(1),
  contactEmail: z.string().email(),
  contactPhone: z.string().min(1),
  billingAddress: z.object({
    street: z.string(),
    city: z.string(),
    state: z.string(),
    zipCode: z.string(),
    country: z.string(),
  }),
  shippingAddress: z.object({
    street: z.string(),
    city: z.string(),
    state: z.string(),
    zipCode: z.string(),
    country: z.string(),
  }).optional(),
  creditLimit: z.number().nonnegative().default(0),
  paymentTerms: z.number().int().positive().default(30),
  taxId: z.string().optional(),
  tier: z.enum(["bronze", "silver", "gold", "platinum"]).default("bronze"),
  notes: z.string().optional(),
});

export const GET = withVayvaAPI(
  PERMISSIONS.WHOLESALE_VIEW,
  async (req: NextRequest, { storeId, correlationId }: APIContext) => {
    const requestId = correlationId;
    try {
      const { searchParams } = new URL(req.url);
      
      const parseResult = CustomerQuerySchema.parse({
        page: searchParams.get("page"),
        limit: searchParams.get("limit"),
        status: searchParams.get("status"),
        tier: searchParams.get("tier"),
        minCreditLimit: searchParams.get("minCreditLimit"),
        maxCreditLimit: searchParams.get("maxCreditLimit"),
        search: searchParams.get("search"),
      });

      const skip = (parseResult.page - 1) * parseResult.limit;

      const whereClause = {
        storeId,
        ...(parseResult.status && { 
          active: parseResult.status === "active" || parseResult.status === "suspended" 
        }),
        ...(parseResult.tier && { tier: parseResult.tier }),
        ...(parseResult.minCreditLimit !== undefined && { 
          creditLimit: { gte: parseResult.minCreditLimit } 
        }),
        ...(parseResult.maxCreditLimit !== undefined && { 
          creditLimit: { lte: parseResult.maxCreditLimit } 
        }),
        ...(parseResult.search && {
          OR: [
            { companyName: { contains: parseResult.search, mode: "insensitive" } },
            { contactName: { contains: parseResult.search, mode: "insensitive" } },
            { contactEmail: { contains: parseResult.search, mode: "insensitive" } },
          ],
        }),
      };

      const [customers, total] = await Promise.all([
        prisma.wholesaleCustomer.findMany({
          where: whereClause,
          include: {
            _count: {
              select: {
                orders: {
                  where: { status: { not: "cancelled" } },
                },
              },
            },
          },
          skip,
          take: parseResult.limit,
          orderBy: { companyName: "asc" },
        }),
        prisma.wholesaleCustomer.count({ where: whereClause }),
      ]);

      return NextResponse.json(
        {
          data: customers,
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
      logger.error("[WHOLESALE_CUSTOMERS_GET]", { error, storeId });
      return NextResponse.json(
        { error: "Failed to fetch customers" },
        { status: 500, headers: standardHeaders(requestId) }
      );
    }
  }
);

export const POST = withVayvaAPI(
  PERMISSIONS.WHOLESALE_MANAGE,
  async (req: NextRequest, { storeId, _user, correlationId }: APIContext) => {
    const requestId = correlationId;
    try {
      const json = await req.json().catch(() => ({}));
      const parseResult = CustomerCreateSchema.safeParse(json);

      if (!parseResult.success) {
        return NextResponse.json(
          {
            error: "Invalid customer data",
            details: parseResult.error.flatten(),
          },
          { status: 400, headers: standardHeaders(requestId) }
        );
      }

      const createdCustomer = await prisma.wholesaleCustomer.create({
        data: {
          ...parseResult.data,
          storeId,
          billingAddress: JSON.stringify(parseResult.data.billingAddress),
          shippingAddress: parseResult.data.shippingAddress 
            ? JSON.stringify(parseResult.data.shippingAddress) 
            : JSON.stringify(parseResult.data.billingAddress),
          active: true,
          outstandingBalance: 0,
        },
      });

      logger.info("[WHOLESALE_CUSTOMER_CREATE]", {
        customerId: createdCustomer.id,
        companyName: createdCustomer.companyName,
        tier: createdCustomer.tier,
      });

      return NextResponse.json(
        { data: createdCustomer },
        { headers: standardHeaders(requestId) }
      );
    } catch (error: unknown) {
      logger.error("[WHOLESALE_CUSTOMER_CREATE]", { error, storeId });
      return NextResponse.json(
        { error: "Failed to create customer" },
        { status: 500, headers: standardHeaders(requestId) }
      );
    }
  }
);