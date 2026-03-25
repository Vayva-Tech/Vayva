import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { logger, standardHeaders } from "@vayva/shared";
import { z } from "zod";

const OrderHistoryQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  status: z
    .enum([
      "pending",
      "processing",
      "shipped",
      "delivered",
      "cancelled",
    ])
    .optional(),
  minAmount: z.coerce.number().optional(),
  maxAmount: z.coerce.number().optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
});

export const GET = withVayvaAPI(
  PERMISSIONS.WHOLESALE_VIEW,
  async (req: NextRequest, { storeId, params, correlationId }) => {
    const requestId = correlationId;
    try {
      const { id } = await params;
      const { searchParams } = new URL(req.url);

      const parseResult = OrderHistoryQuerySchema.parse({
        page: searchParams.get("page"),
        limit: searchParams.get("limit"),
        status: searchParams.get("status"),
        minAmount: searchParams.get("minAmount"),
        maxAmount: searchParams.get("maxAmount"),
        dateFrom: searchParams.get("dateFrom"),
        dateTo: searchParams.get("dateTo"),
      });

      const customer = await prisma.wholesaleCustomer.findFirst({
        where: { id, storeId },
      });

      if (!customer) {
        return NextResponse.json(
          { error: "Customer not found" },
          { status: 404, headers: standardHeaders(requestId) },
        );
      }

      const skip = (parseResult.page - 1) * parseResult.limit;

      const createdAt =
        parseResult.dateFrom || parseResult.dateTo
          ? {
              ...(parseResult.dateFrom && {
                gte: new Date(parseResult.dateFrom),
              }),
              ...(parseResult.dateTo && { lte: new Date(parseResult.dateTo) }),
            }
          : undefined;

      const totalAmount =
        parseResult.minAmount !== undefined ||
        parseResult.maxAmount !== undefined
          ? {
              ...(parseResult.minAmount !== undefined && {
                gte: parseResult.minAmount,
              }),
              ...(parseResult.maxAmount !== undefined && {
                lte: parseResult.maxAmount,
              }),
            }
          : undefined;

      const whereClause = {
        customerId: id,
        storeId,
        ...(parseResult.status && { status: parseResult.status }),
        ...(totalAmount && Object.keys(totalAmount).length > 0
          ? { totalAmount }
          : {}),
        ...(createdAt && Object.keys(createdAt).length > 0
          ? { createdAt }
          : {}),
      };

      const [orders, total] = await Promise.all([
        prisma.wholesaleOrder.findMany({
          where: whereClause,
          include: {
            items: {
              select: {
                id: true,
                productId: true,
                quantity: true,
                unitPrice: true,
                totalPrice: true,
              },
            },
          },
          skip,
          take: parseResult.limit,
          orderBy: { createdAt: "desc" },
        }),
        prisma.wholesaleOrder.count({ where: whereClause }),
      ]);

      const totalValue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
      const averageOrderValue =
        orders.length > 0 ? totalValue / orders.length : 0;

      const statusCounts = orders.reduce(
        (acc, order) => {
          acc[order.status] = (acc[order.status] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>,
      );

      return NextResponse.json(
        {
          data: orders,
          meta: {
            page: parseResult.page,
            limit: parseResult.limit,
            total,
            totalPages: Math.ceil(total / parseResult.limit),
            metrics: {
              totalValue,
              averageOrderValue,
              orderCount: orders.length,
              statusDistribution: statusCounts,
            },
          },
        },
        { headers: standardHeaders(requestId) },
      );
    } catch (error: unknown) {
      const { id: customerId } = await params;
      logger.error("[CUSTOMER_ORDER_HISTORY_GET]", { error, customerId });
      return NextResponse.json(
        { error: "Failed to fetch customer order history" },
        { status: 500, headers: standardHeaders(requestId) },
      );
    }
  },
);
