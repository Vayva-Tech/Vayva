import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI, type APIContext } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { logger, standardHeaders } from "@vayva/shared";
import { z } from "zod";

const CommissionQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  status: z.enum(["pending", "paid", "disputed"]).optional(),
  supplierId: z.string().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

export const GET = withVayvaAPI(
  PERMISSIONS.FINANCE_VIEW,
  async (req: NextRequest, { storeId, correlationId }: APIContext) => {
    const requestId = correlationId;
    try {
      const { searchParams } = new URL(req.url);
      const parseResult = CommissionQuerySchema.safeParse(
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

      const { page, limit, status, supplierId, startDate, endDate } = parseResult.data;
      const skip = (page - 1) * limit;

      const where: any = { storeId };
      
      if (status) where.status = status;
      if (supplierId) where.supplierId = supplierId;
      if (startDate || endDate) {
        where.createdAt = {};
        if (startDate) where.createdAt.gte = new Date(startDate);
        if (endDate) where.createdAt.lte = new Date(endDate);
      }

      const [commissions, total] = await Promise.all([
        prisma.travelCommission.findMany({
          where,
          include: {
            supplier: {
              select: {
                id: true,
                name: true,
                commissionRate: true,
              },
            },
            booking: {
              select: {
                id: true,
                destination: true,
                totalPrice: true,
                currency: true,
                status: true,
              },
            },
          },
          skip,
          take: limit,
          orderBy: { createdAt: "desc" },
        }),
        prisma.travelCommission.count({ where }),
      ]);

      // Calculate totals
      const totalAmount = commissions.reduce((sum, comm) => sum + comm.amount, 0);
      const pendingAmount = commissions
        .filter(c => c.status === "pending")
        .reduce((sum, comm) => sum + comm.amount, 0);

      return NextResponse.json(
        {
          data: commissions,
          meta: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
            summary: {
              totalAmount,
              pendingAmount,
              currency: commissions[0]?.currency || "USD",
            },
          },
        },
        { headers: standardHeaders(requestId) }
      );
    } catch (error: unknown) {
      logger.error("[TRAVEL_COMMISSIONS_GET]", { error, storeId });
      return NextResponse.json(
        { error: "Failed to fetch commissions" },
        { status: 500, headers: standardHeaders(requestId) }
      );
    }
  }
);