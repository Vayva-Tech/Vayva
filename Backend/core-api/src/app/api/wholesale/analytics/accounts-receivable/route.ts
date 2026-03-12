import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI, type APIContext } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { logger, standardHeaders } from "@vayva/shared";

export const GET = withVayvaAPI(
  PERMISSIONS.WHOLESALE_VIEW,
  async (req: NextRequest, { storeId, correlationId }: APIContext) => {
    const requestId = correlationId;
    try {
      const now = new Date();
      
      // Calculate date buckets
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
      const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);

      // Get invoices by aging buckets
      const [currentInvoices, oneToThirty, thirtyOneToSixty, sixtyPlus] = await Promise.all([
        prisma.wholesaleInvoice.findMany({
          where: {
            storeId,
            dueDate: { gte: thirtyDaysAgo },
            status: { not: "paid" }
          },
          select: { amount: true }
        }),
        prisma.wholesaleInvoice.findMany({
          where: {
            storeId,
            dueDate: { lt: thirtyDaysAgo, gte: sixtyDaysAgo },
            status: { not: "paid" }
          },
          select: { amount: true }
        }),
        prisma.wholesaleInvoice.findMany({
          where: {
            storeId,
            dueDate: { lt: sixtyDaysAgo, gte: ninetyDaysAgo },
            status: { not: "paid" }
          },
          select: { amount: true }
        }),
        prisma.wholesaleInvoice.findMany({
          where: {
            storeId,
            dueDate: { lt: ninetyDaysAgo },
            status: { not: "paid" }
          },
          select: { amount: true }
        })
      ]);

      // Calculate amounts
      const current = currentInvoices.reduce((sum, inv) => sum + inv.amount, 0);
      const oneToThirtyDays = oneToThirty.reduce((sum, inv) => sum + inv.amount, 0);
      const thirtyOneToSixtyDays = thirtyOneToSixty.reduce((sum, inv) => sum + inv.amount, 0);
      const sixtyPlusDays = sixtyPlus.reduce((sum, inv) => sum + inv.amount, 0);

      // Calculate DSO (Days Sales Outstanding) - simplified
      const totalOutstanding = current + oneToThirtyDays + thirtyOneToSixtyDays + sixtyPlusDays;
      
      // Get recent sales for DSO calculation
      const recentSales = await prisma.wholesaleOrder.findMany({
        where: {
          storeId,
          createdAt: { gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) },
          status: { not: "cancelled" }
        },
        select: { totalAmount: true }
      });

      const totalRecentSales = recentSales.reduce((sum, order) => sum + order.totalAmount, 0);
      const dailySales = totalRecentSales / 90; // Average daily sales
      
      // DSO calculation
      const dso = dailySales > 0 ? totalOutstanding / dailySales : 0;
      
      // Collection effectiveness (simplified)
      const collectionEffectiveness = 87; // Demo value - would calculate from collections data

      const accountsReceivable = {
        current,
        oneToThirtyDays,
        thirtyOneToSixtyDays,
        sixtyPlusDays,
        dso: Math.round(dso),
        collectionEffectiveness,
      };

      return NextResponse.json(
        { data: accountsReceivable },
        { headers: standardHeaders(requestId) }
      );
    } catch (error: unknown) {
      logger.error("[WHOLESALE_ACCOUNTS_RECEIVABLE_GET]", { error, storeId });
      return NextResponse.json(
        { error: "Failed to fetch accounts receivable data" },
        { status: 500, headers: standardHeaders(requestId) }
      );
    }
  }
);