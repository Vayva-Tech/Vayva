import { NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { Prisma } from "@vayva/db";

export const GET = withVayvaAPI(
  PERMISSIONS.PAYMENTS_VIEW,
  async (req, { db, storeId }) => {
    try {
      const { searchParams } = new URL(req.url);
      const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
      const limit = Math.min(50, parseInt(searchParams.get("limit") || "20"));
      const status = searchParams.get("status");

      const where: Prisma.PaymentTransactionWhereInput = {
        storeId, // Explicitly set storeId even though injected db might handle it, for safety
      };

      if (status) {
        where.status = status as any;
      }

      const [transactions, total] = await Promise.all([
        db.paymentTransaction.findMany({
          where,
          orderBy: { createdAt: "desc" },
          take: limit,
          skip: (page - 1) * limit,
          include: {
            order: {
              select: {
                orderNumber: true,
                customerEmail: true,
              },
            },
          },
        }),
        db.paymentTransaction.count({ where }),
      ]);

      return NextResponse.json({
        data: transactions,
        meta: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit),
        },
      });
    } catch {
      return NextResponse.json(
        { error: "Failed to fetch transactions" },
        { status: 500 },
      );
    }
  },
);
