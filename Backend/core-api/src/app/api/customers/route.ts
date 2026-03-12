import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI, type APIContext } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma, Prisma } from "@vayva/db";
import { logger, standardHeaders } from "@vayva/shared";
import { z } from "zod";

const CustomerQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(50),
  search: z.string().trim().toLowerCase().optional(),
});

const CustomerCreateSchema = z
  .object({
    firstName: z.string().trim().optional(),
    lastName: z.string().trim().optional(),
    email: z.string().email().optional().nullable().or(z.literal("")),
    phone: z.string().trim().optional().nullable(),
    notes: z.string().trim().optional().nullable(),
  })
  .refine((data) => data.firstName || data.lastName, {
    message: "At least one name (First or Last) is required",
    path: ["firstName"],
  });

export const GET = withVayvaAPI(
  PERMISSIONS.CUSTOMERS_VIEW,
  async (req: NextRequest, { storeId, correlationId }: APIContext) => {
    const requestId = correlationId;
    try {
      const { searchParams } = new URL(req.url);
      const parseResult = CustomerQuerySchema.safeParse(
        Object.fromEntries(searchParams),
      );

      if (!parseResult.success) {
        return NextResponse.json(
          {
            error: "Invalid query parameters",
            details: parseResult.error.flatten(),
          },
          { status: 400, headers: standardHeaders(requestId) },
        );
      }

      const { page, limit, search } = parseResult.data;
      const skip = (page - 1) * limit;

      const where: Prisma.CustomerWhereInput = { storeId };
      if (search) {
        where.OR = [
          { firstName: { contains: search, mode: "insensitive" } },
          { lastName: { contains: search, mode: "insensitive" } },
          { phone: { contains: search } },
          { email: { contains: search, mode: "insensitive" } },
        ];
      }

      const [customers, total] = await Promise.all([
        prisma.customer.findMany({
          where,
          include: {
            orders: {
              select: {
                total: true,
                createdAt: true,
              },
              orderBy: { createdAt: "desc" },
              take: 5,
            },
          },
          skip,
          take: limit,
          orderBy: { createdAt: "desc" },
        }),
        prisma.customer.count({ where }),
      ]);

      return NextResponse.json(
        {
          data: customers,
          meta: {
            total,
            page,
            limit,
          },
        },
        {
          headers: standardHeaders(requestId),
        },
      );
    } catch (error: unknown) {
      logger.error("[CUSTOMERS_GET]", { error, storeId });
      return NextResponse.json(
        { error: "Failed to fetch customers" },
        { status: 500, headers: standardHeaders(requestId) },
      );
    }
  },
);

export const POST = withVayvaAPI(
  PERMISSIONS.CUSTOMERS_MANAGE,
  async (req: NextRequest, { storeId, user, correlationId }: APIContext) => {
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
          { status: 400, headers: standardHeaders(requestId) },
        );
      }

      const body = parseResult.data;

      const customer = await prisma.customer.create({
        data: {
          storeId,
          firstName: body.firstName || "",
          lastName: body.lastName || "",
          email: body.email || null,
          phone: body.phone || null,
          notes: body.notes || null,
        },
      });
      return NextResponse.json(customer, {
        headers: standardHeaders(requestId),
      });
    } catch (error: unknown) {
      logger.error("[CUSTOMERS_POST]", { error, storeId, userId: user?.id });
      return NextResponse.json(
        { error: "Failed to create customer" },
        { status: 500, headers: standardHeaders(requestId) },
      );
    }
  },
);
