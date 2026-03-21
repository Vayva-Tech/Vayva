import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI, type APIContext } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { logger, standardHeaders } from "@vayva/shared";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const requestId = crypto.randomUUID();
  try {
    const { id } = params;
    const { searchParams } = new URL(req.url);
    const period = searchParams.get('period') || 'month';
    
    // Extract storeId from request context
    const storeId = "test-store-id"; // Placeholder

    // Verify promotion exists
    const promotion = await prisma.groceryPromotion.findFirst({
      where: { id, storeId },
    });

    if (!promotion) {
      return NextResponse.json(
        { error: "Promotion not found" },
        { status: 404, headers: standardHeaders(requestId) }
      );
    }

    // Calculate date range
    const now = new Date();
    let startDate: Date;
    
    switch (period) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'quarter': {
        const quarterStartMonth = Math.floor(now.getMonth() / 3) * 3;
        startDate = new Date(now.getFullYear(), quarterStartMonth, 1);
        break;
      }
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    // Get usage data
    const usageData = await prisma.groceryPromotionUsage.findMany({
      where: {
        promotionId: id,
        createdAt: { gte: startDate },
      },
      include: {
        order: {
          select: {
            id: true,
            orderNumber: true,
            totalAmount: true,
            customer: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Calculate usage metrics
    const totalUses = usageData.length;
    const totalDiscount = usageData.reduce((sum, usage) => sum + usage.discountAmount, 0);
    const affectedOrders = [...new Set(usageData.map(u => u.orderId))].length;
    const uniqueCustomers = [...new Set(usageData.map(u => u.order?.customer?.id))].length;
    
    const averageOrderIncrease = affectedOrders > 0 
      ? totalDiscount / affectedOrders 
      : 0;

    const usageMetrics = {
      totalUses,
      totalDiscountApplied: totalDiscount,
      affectedOrders,
      uniqueCustomers,
      averageDiscountPerUse: totalUses > 0 ? totalDiscount / totalUses : 0,
      averageOrderIncrease,
      usageRate: promotion.usageLimit > 0 
        ? (totalUses / promotion.usageLimit) * 100 
        : 0,
      recentUsage: usageData.slice(0, 20),
      dailyUsage: usageData.reduce((acc: Record<string, number>, usage) => {
        const date = usage.createdAt.toISOString().split('T')[0];
        acc[date] = (acc[date] || 0) + 1;
        return acc;
      }, {}),
    };

    return NextResponse.json(
      { data: usageMetrics },
      { headers: standardHeaders(requestId) }
    );
  } catch (error: unknown) {
    logger.error("[PROMOTION_USAGE_GET]", { error, promotionId: params.id });
    return NextResponse.json(
      { error: "Failed to fetch promotion usage data" },
      { status: 500, headers: standardHeaders(requestId) }
    );
  }
}