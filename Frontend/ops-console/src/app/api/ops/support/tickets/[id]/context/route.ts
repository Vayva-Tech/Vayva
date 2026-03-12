import { NextRequest, NextResponse } from "next/server";
import { OpsAuthService } from "@/lib/ops-auth";
import { prisma } from "@vayva/db";
import { logger } from "@vayva/shared";

export const dynamic = "force-dynamic";

interface MerchantContext {
  store: {
    id: string;
    name: string;
    slug: string;
    status: string;
    tier: string;
    createdAt: string;
    lastLoginAt: string | null;
  };
  subscription: {
    plan: string;
    status: string;
    currentPeriodEnd: string | null;
    trialEndsAt: string | null;
    mrr: number;
  } | null;
  billing: {
    paymentMethodOnFile: boolean;
    lastPaymentAt: string | null;
    lastPaymentAmount: number | null;
    failedPaymentCount: number;
    balance: number;
  };
  kyc: {
    status: string;
    verifiedAt: string | null;
    documentsSubmitted: number;
    documentsVerified: number;
  };
  recentOrders: {
    id: string;
    total: number;
    status: string;
    createdAt: string;
    customerName: string;
  }[];
  recentActivity: {
    id: string;
    type: string;
    description: string;
    createdAt: string;
  }[];
  openAlerts: {
    id: string;
    severity: string;
    message: string;
    createdAt: string;
  }[];
  stats: {
    totalOrders30d: number;
    totalRevenue30d: number;
    avgOrderValue: number;
    supportTickets30d: number;
  };
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { user } = await OpsAuthService.requireSession();
    (OpsAuthService as any).requireRole(user, "OPS_SUPPORT");

    const { id } = await params;

    // Get the ticket to find the store
    const ticket = await prisma.supportTicket.findUnique({
      where: { id },
      include: {
        store: true,
      },
    });

    if (!ticket || !ticket.store) {
      return NextResponse.json(
        { error: "Ticket or store not found" },
        { status: 404 },
      );
    }

    const store = ticket.store;

    // Fetch subscription data
    const subscription = await prisma.subscription.findFirst({
      where: { storeId: store.id },
      orderBy: { createdAt: "desc" },
    });

    // Fetch KYC data
    const kycRecord = await prisma.kycRecord.findUnique({
      where: { storeId: store.id },
    });

    // Fetch recent orders with customer info
    const recentOrders = await prisma.order.findMany({
      where: { storeId: store.id },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: {
        customer: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    // Fetch recent activity (from audit logs)
    const recentActivity = await prisma.auditLog.findMany({
      where: { 
        targetStoreId: store.id,
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    });

    // Fetch open alerts - use supportTickets with high priority as alerts
    const openAlerts = await prisma.supportTicket.findMany({
      where: {
        storeId: store.id,
        status: { in: ["open", "in_progress"] },
        priority: "high",
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    });

    // Calculate 30-day stats
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [orderStats, ticketStats] = await Promise.all([
      prisma.order.aggregate({
        where: {
          storeId: store.id,
          createdAt: { gte: thirtyDaysAgo },
        },
        _count: { id: true },
        _sum: { total: true },
        _avg: { total: true },
      }),
      prisma.supportTicket.count({
        where: {
          storeId: store.id,
          createdAt: { gte: thirtyDaysAgo },
        },
      }),
    ]);

    // Fetch billing info (last paid invoice as proxy for payment)
    const lastPayment = await prisma.invoiceV2.findFirst({
      where: {
        storeId: store.id,
        status: "PAID",
      },
      orderBy: { createdAt: "desc" },
      select: {
        totalKobo: true,
        createdAt: true,
      },
    });

    // Count failed/overdue invoices as proxy for failed payments
    const failedPayments = await prisma.invoiceV2.count({
      where: {
        storeId: store.id,
        status: "OVERDUE",
        createdAt: { gte: thirtyDaysAgo },
      },
    });

    // Plan pricing for MRR calculation
    const planPrices: Record<string, number> = {
      STARTER: 0,
      PROFESSIONAL: 15000,
      BUSINESS: 35000,
      ENTERPRISE: 100000,
    };

    const context: MerchantContext = {
      store: {
        id: store.id,
        name: store.name,
        slug: store.slug,
        status: store.isActive ? "ACTIVE" : "INACTIVE",
        tier: store.tier || "FREE",
        createdAt: store.createdAt.toISOString(),
        lastLoginAt: null, // Not available in schema
      },
      subscription: subscription
        ? {
            plan: subscription.planKey,
            status: subscription.status,
            currentPeriodEnd: subscription.currentPeriodEnd?.toISOString() || null,
            trialEndsAt: subscription.trialEndsAt?.toISOString() || null,
            mrr: planPrices[subscription.planKey] || 0,
          }
        : null,
      billing: {
        paymentMethodOnFile: false, // Not directly available
        lastPaymentAt: lastPayment?.createdAt?.toISOString() || null,
        lastPaymentAmount: lastPayment?.totalKobo ? Number(lastPayment.totalKobo) : null,
        failedPaymentCount: failedPayments,
        balance: 0,
      },
      kyc: {
        status: kycRecord?.status || "NOT_STARTED",
        verifiedAt: kycRecord?.reviewedAt?.toISOString() || null,
        documentsSubmitted: 0, // Not tracked in current schema
        documentsVerified: 0,
      },
      recentOrders: recentOrders.map((order) => ({
        id: order.id,
        total: Number(order.total),
        status: order.status,
        createdAt: order.createdAt.toISOString(),
        customerName: order.customer ? `${order.customer.firstName || ""} ${order.customer.lastName || ""}`.trim() || "Guest" : "Guest",
      })),
      recentActivity: recentActivity.map((activity) => ({
        id: activity.id,
        type: activity.action,
        description: activity.action,
        createdAt: activity.createdAt.toISOString(),
      })),
      openAlerts: openAlerts.map((alert) => ({
        id: alert.id,
        severity: alert.priority,
        message: alert.subject,
        createdAt: alert.createdAt.toISOString(),
      })),
      stats: {
        totalOrders30d: orderStats._count.id,
        totalRevenue30d: Number(orderStats._sum.total || 0),
        avgOrderValue: Math.round(Number(orderStats._avg.total || 0)),
        supportTickets30d: ticketStats,
      },
    };

    return NextResponse.json({ data: context });
  } catch (error: unknown) {
    if (
      error instanceof Error ? error.message : String(error) === "Unauthorized"
    )
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (
      error instanceof Error
        ? error.message
        : String(error)?.includes("Insufficient permissions")
    )
      return NextResponse.json(
        { error: error instanceof Error ? error.message : String(error) },
        { status: 403 },
      );

    logger.error("[SUPPORT_CONTEXT_ERROR]", { error });
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
