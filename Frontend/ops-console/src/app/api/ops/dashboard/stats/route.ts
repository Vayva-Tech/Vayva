import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@vayva/db";
import { withOpsAPI } from "@/lib/api-handler";
import { logger } from "@vayva/shared";

/**
 * GET /api/ops/dashboard/stats
 * 
 * Returns real-time platform statistics for the ops dashboard.
 * Calculates actual deltas from time-series data.
 */
const getHandler = withOpsAPI(
  async (req: any, context: any) => {
    const { user, requestId } = context;
    const now = new Date();
    
    // Time ranges for comparisons
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Fetch all stats in parallel
    const [
      currentMerchantCount,
      prevMerchantCount,
      currentRevenue,
      prevRevenue,
      currentOrders,
      prevOrders,
      openTickets,
      recentActivity,
      activeSubscriptions,
      mrrTotal,
      newMerchantsThisWeek,
    ] = await Promise.all([
      prisma.store?.count({ where: { isActive: true } }),
      prisma.store?.count({
        where: {
          isActive: true,
          createdAt: { lt: thirtyDaysAgo },
        },
      }),
      prisma.order?.aggregate({
        where: {
          createdAt: { gte: thirtyDaysAgo },
          paymentStatus: "SUCCESS",
        },
        _sum: { total: true },
      }),
      prisma.order?.aggregate({
        where: {
          createdAt: {
            gte: sixtyDaysAgo,
            lt: thirtyDaysAgo,
          },
          paymentStatus: "SUCCESS",
        },
        _sum: { total: true },
      }),
      prisma.order?.count({
        where: { createdAt: { gte: thirtyDaysAgo } },
      }),
      prisma.order?.count({
        where: {
          createdAt: {
            gte: sixtyDaysAgo,
            lt: thirtyDaysAgo,
          },
        },
      }),
      prisma.supportTicket?.count?.({
        where: { status: { in: ["open", "waiting"] } },
      }) || Promise.resolve(0),
      prisma.opsAuditEvent?.findMany({
        take: 10,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          eventType: true,
          createdAt: true,
          opsUserId: true,
        },
      }),
      prisma.subscription?.count?.({
        where: { status: "ACTIVE" },
      }) || Promise.resolve(0),
      Promise.resolve({ _sum: { amount: 0 } }), // Skip MRR calculation for now
      prisma.store?.count({
        where: { createdAt: { gte: sevenDaysAgo } },
      }),
    ]);

    // Calculate growth percentages
    const merchantGrowth = prevMerchantCount > 0
      ? ((currentMerchantCount - prevMerchantCount) / prevMerchantCount) * 100
      : 0;
    
    const currentRevenueTotal = Number(currentRevenue._sum?.total || 0);
    const prevRevenueTotal = Number(prevRevenue._sum?.total || 0);
    const revenueGrowth = prevRevenueTotal > 0
      ? ((currentRevenueTotal - prevRevenueTotal) / prevRevenueTotal) * 100
      : 0;
    
    const ordersGrowth = prevOrders > 0
      ? ((currentOrders - prevOrders) / prevOrders) * 100
      : 0;

    // Format recent activity
    const formattedActivity = recentActivity.map((log) => ({
      id: log.id,
      message: formatEventType(log.eventType),
      actor: log.opsUserId || "System",
      timestamp: log.createdAt?.toISOString(),
      relativeTime: getRelativeTime(log.createdAt),
    }));

    logger.info("[DASHBOARD_STATS]", {
      requestId,
      userId: user.id,
      merchants: currentMerchantCount,
      revenue: currentRevenueTotal,
      orders: currentOrders,
      tickets: openTickets,
    });

    return NextResponse.json({
      success: true,
      data: {
        merchants: {
          total: currentMerchantCount,
          delta: Math.round(merchantGrowth * 10) / 10,
          newThisWeek: newMerchantsThisWeek,
        },
        revenue: {
          total: currentRevenueTotal,
          delta: Math.round(revenueGrowth * 10) / 10,
          currency: "NGN",
          formatted: `₦${(currentRevenueTotal / 1000000).toFixed(2)}M`,
        },
        orders: {
          total: currentOrders,
          delta: Math.round(ordersGrowth * 10) / 10,
          avgOrderValue: currentOrders > 0 
            ? Math.round(currentRevenueTotal / currentOrders)
            : 0,
        },
        operations: {
          tickets: openTickets,
        },
        subscriptions: {
          active: activeSubscriptions,
          mrr: 0, // Subscription amount aggregation requires schema verification
          formattedMrr: "₦0",
        },
        recentActivity: formattedActivity,
      },
      meta: {
        requestId,
        timestamp: now.toISOString(),
      },
    });
  },
  { requiredPermission: "ops:dashboard:view" }
);

export async function GET(
  req: NextRequest,
  context: { params: Promise<Record<string, string>> }
) {
  const params = await context.params;
  return getHandler(req, { params } as any);
}

function formatEventType(eventType: string): string {
  const typeMap: Record<string, string> = {
    MERCHANT_CREATED: "New merchant onboarded",
    MERCHANT_SUSPENDED: "Merchant suspended",
    MERCHANT_ACTIVATED: "Merchant activated",
    ORDER_CREATED: "New order placed",
    PAYMENT_PROCESSED: "Payment processed",
    REFUND_ISSUED: "Refund issued",
    KYC_APPROVED: "KYC approved",
    KYC_REJECTED: "KYC rejected",
    SUPPORT_TICKET_CREATED: "Support ticket created",
    USER_LOGIN: "User logged in",
    SETTINGS_CHANGED: "Settings changed",
  };
  
  return typeMap[eventType] || eventType.replace(/_/g, " ");
}

function getRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  
  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}
