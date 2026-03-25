import { INDUSTRY_CONFIG } from "@/config/industry";
import type { IndustrySlug } from "@/lib/templates/types";
import { logger } from "@/lib/logger";
import { Order, Booking, Customer, Payout, SupportTicket } from "@vayva/db";
import { prisma, type ExtendedPrismaClient } from "@/lib/db";
import { startOfDay, subDays, format } from "date-fns";
import {
  OverviewMetrics,
  AnalyticInsight,
  ChartDataItem
} from "@/types/analytics";

interface DashboardStoreInfo {
  industrySlug?: IndustrySlug | null;
  isLive: boolean;
  onboardingCompleted: boolean;
  plan: string;
}

interface InventoryItemWithProduct {
  id: string;
  available: number | null;
  onHand: number | null;
  reserved: number | null;
  reorderPoint: number | null;
  product: {
    id: string;
    price: number | { toString: () => string };
    title: string;
  } | null;
  productVariant: {
    id: string;
    price: number | { toString: () => string };
    title: string;
  } | null;
}
interface ActivityItem {
  id: string;
  type: string;
  date: Date;
  time: string;
  message: string;
  user: string;
}

export class DashboardService {
  /**
   * Fetches all dashboard data for a store in a single highly-parallel call.
   */
  static async getAggregateData(
    prisma: ExtendedPrismaClient,
    storeId: string,
    rangeKey: "today" | "week" | "month" = "month",
  ) {
    try {
      const store = await prisma.store.findUnique({
        where: { id: storeId },
        select: {
          industrySlug: true,
          isLive: true,
          onboardingCompleted: true,
          plan: true,
        },
      });

      const industrySlug = (store?.industrySlug || "retail") as IndustrySlug;
      const config = INDUSTRY_CONFIG[industrySlug] || INDUSTRY_CONFIG.retail;

      const hasBookings = Boolean(
        config?.features?.bookings ||
        config?.features?.reservations ||
        config?.features?.viewings,
      );
      const hasInventory = Boolean(config?.features?.inventory);

      const now = new Date();
      const days = rangeKey === "today" ? 1 : rangeKey === "week" ? 7 : 30;
      const start = new Date(now.getTime() - (days - 1) * 24 * 60 * 60 * 1000);
      start.setHours(0, 0, 0, 0);

      // Period dates for comparison (last 30 vs previous 30, etc.)
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

      const [
        kpis,
        metrics,
        overview,
        todosAlerts,
        recentActivity,
        recentPrimary,
        inventory,
        customerInsights,
        earnings,
      ] = await Promise.all([
        this.getKpis(
          prisma,
          storeId,
          hasBookings,
          hasInventory,
          thirtyDaysAgo,
          sixtyDaysAgo,
        ),
        this.getMetrics(prisma),
        this.getOverview(prisma, hasBookings, start, now),
        this.getTodosAlerts(prisma, store as DashboardStoreInfo | null),
        this.getRecentActivity(prisma),
        hasBookings
          ? this.getRecentBookings(prisma, thirtyDaysAgo, now)
          : this.getRecentOrders(prisma, thirtyDaysAgo, now),
        hasInventory ? this.getInventoryAlerts(prisma) : Promise.resolve(null),
        this.getCustomerInsights(prisma, start, now),
        this.getEarnings(prisma),
      ]);

      return {
        kpiData: kpis,
        metricsData: metrics,
        overviewData: overview,
        todosAlertsData: todosAlerts,
        activityData: recentActivity,
        recentPrimaryData: hasBookings
          ? { bookings: recentPrimary as Booking[] }
          : { orders: recentPrimary as Order[] },
        inventoryAlertsData: inventory,
        customerInsightsData: customerInsights,
        earningsData: earnings,
        storeInfo: {
          industrySlug: industrySlug as IndustrySlug,
          currency: "NGN",
          hasBookings,
          hasInventory,
        },
      };
    } catch (error) {
      logger.error("[DashboardService.getAggregateData]", error, { storeId });
      throw error;
    }
  }

  static async getKpis(
    prisma: ExtendedPrismaClient,
    storeId: string,
    hasBookings: boolean,
    hasInventory: boolean,
    thirtyDaysAgo: Date,
    sixtyDaysAgo: Date,
  ) {
    const now = new Date();
    const sevenDaysAhead = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const [
      currentOrders,
      currentCustomers,
      paymentStatusCurrent,
      currentBookingsTotal,
      currentBookingsCompleted,
      upcomingBookings,
      bookingCancellations,
      inventoryItems,
      refundRows,
      refundOrderIds,
      refundRateOrderTotal,
      returnRequestOrderIds,
      fulfillmentReturnedOrderIds,
    ] = await Promise.all([
      prisma.order.findMany({
        where: {
          createdAt: { gte: thirtyDaysAgo },
          status: { notIn: ["DRAFT", "CANCELLED", "REFUNDED"] },
        },
        select: { total: true, customerId: true, paymentStatus: true },
      }),
      prisma.customer.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
      prisma.order.groupBy({
        by: ["paymentStatus"],
        where: {
          createdAt: { gte: thirtyDaysAgo },
          status: { notIn: ["DRAFT", "CANCELLED", "REFUNDED"] },
        },
        _count: { _all: true },
      }),
      hasBookings
        ? prisma.booking.count({ where: { createdAt: { gte: thirtyDaysAgo } } })
        : Promise.resolve(0),
      hasBookings
        ? prisma.booking.count({
            where: { createdAt: { gte: thirtyDaysAgo }, status: "COMPLETED" },
          })
        : Promise.resolve(0),
      hasBookings
        ? prisma.booking.count({
            where: {
              startsAt: { gte: now, lte: sevenDaysAhead },
              status: { in: ["PENDING", "CONFIRMED"] },
            },
          })
        : Promise.resolve(0),
      hasBookings
        ? prisma.booking.count({
            where: {
              createdAt: { gte: thirtyDaysAgo },
              status: { in: ["CANCELLED", "NO_SHOW"] },
            },
          })
        : Promise.resolve(0),
      hasInventory
        ? prisma.inventoryItem.findMany({
            where: { inventoryLocation: { storeId } },
            select: {
              available: true,
              reorderPoint: true,
              product: { select: { price: true } },
              productVariant: { select: { price: true } },
            },
          })
        : Promise.resolve([]),
      prisma.refund.findMany({
        where: { createdAt: { gte: thirtyDaysAgo }, status: "SUCCESS" },
        select: { amount: true, orderId: true },
      }),
      prisma.refund.findMany({
        where: {
          createdAt: { gte: thirtyDaysAgo },
          status: "SUCCESS",
          orderId: { not: null },
        },
        distinct: ["orderId"],
        select: { orderId: true },
      }),
      prisma.order.count({
        where: {
          createdAt: { gte: thirtyDaysAgo },
          status: { notIn: ["DRAFT", "CANCELLED"] },
        },
      }),
      prisma.returnRequest.findMany({
        where: {
          merchantId: storeId,
          createdAt: { gte: thirtyDaysAgo },
          status: { not: "CANCELLED" },
        },
        distinct: ["orderId"],
        select: { orderId: true },
      }),
      prisma.order.findMany({
        where: {
          createdAt: { gte: thirtyDaysAgo },
          fulfillmentStatus: "RETURNED",
        },
        distinct: ["id"],
        select: { id: true },
      }),
    ]);

    const [
      previousOrders,
      previousCustomers,
      previousBookingsTotal,
      _previousBookingsCompleted,
    ] = await Promise.all([
      prisma.order.findMany({
        where: {
          createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo },
          status: { notIn: ["DRAFT", "CANCELLED", "REFUNDED"] },
        },
        select: { total: true, paymentStatus: true },
      }),
      prisma.customer.count({
        where: { createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo } },
      }),
      hasBookings
        ? prisma.booking.count({
            where: { createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo } },
          })
        : Promise.resolve(0),
      hasBookings
        ? prisma.booking.count({
            where: {
              createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo },
              status: "COMPLETED",
            },
          })
        : Promise.resolve(0),
    ]);

    const currentPaidOrders = currentOrders.filter(
      (o: Pick<Order, "paymentStatus">) => o.paymentStatus === "SUCCESS",
    );
    const currentRevenue = currentPaidOrders.reduce(
      (sum: number, order: { total: unknown }) =>
        sum + Number(order.total || 0),
      0,
    );
    const currentOrderCount = hasBookings
      ? currentBookingsTotal
      : currentOrders.length;
    const conversionRate = hasBookings
      ? currentOrderCount > 0
        ? (Number(currentBookingsCompleted || 0) / currentOrderCount) * 100
        : 0
      : currentOrderCount > 0
        ? (currentPaidOrders.length / currentOrderCount) * 100
        : 0;

    const aov =
      currentPaidOrders.length > 0
        ? currentRevenue / currentPaidOrders.length
        : 0;

    const activePaidCustomerIds = Array.from(
      new Set(
        currentPaidOrders
          .map((o: { customerId: string | null }) => o.customerId)
          .filter((id: string | null): id is string => Boolean(id)),
      ),
    );
    const priorPaidCustomerRows = activePaidCustomerIds.length
      ? await prisma.order.findMany({
          where: {
            customerId: { in: activePaidCustomerIds },
            paymentStatus: "SUCCESS",
            createdAt: { lt: thirtyDaysAgo },
            status: { notIn: ["DRAFT", "CANCELLED", "REFUNDED"] },
          },
          distinct: ["customerId"],
          select: { customerId: true },
        })
      : [];
    const returningCustomers = new Set(
      (priorPaidCustomerRows || [])
        .map((r: { customerId: string | null }) => r.customerId)
        .filter((id: string | null): id is string => Boolean(id)),
    ).size;
    const repeatRate =
      activePaidCustomerIds.length > 0
        ? (returningCustomers / activePaidCustomerIds.length) * 100
        : 0;

    const refundAmount = refundRows.reduce(
      (sum: number, r: { amount: unknown }) => sum + Number(r.amount || 0),
      0,
    );
    const refundedOrders = Array.isArray(refundOrderIds)
      ? refundOrderIds.length
      : 0;
    const totalOrdersForRefundRate = Number(refundRateOrderTotal || 0);
    const refundRate =
      totalOrdersForRefundRate > 0
        ? (refundedOrders / totalOrdersForRefundRate) * 100
        : 0;

    const returnedOrderIdSet = new Set<string>();
    for (const r of returnRequestOrderIds) {
      if (r?.orderId) returnedOrderIdSet.add(String(r.orderId));
    }
    for (const r of fulfillmentReturnedOrderIds) {
      if (r?.id) returnedOrderIdSet.add(String(r.id));
    }
    const returnsCount = returnedOrderIdSet.size;

    const inventoryValue = (
      inventoryItems as InventoryItemWithProduct[]
    ).reduce((sum, it) => {
      const available = Number(it.available || 0);
      const unitPrice = Number(
        it.productVariant?.price ?? it.product?.price ?? 0,
      );
      return sum + Math.max(0, available) * Math.max(0, unitPrice);
    }, 0);

    const lowStockThreshold = 5;
    let lowStockCount = 0;
    let belowReorderCount = 0;
    const trackedCount = inventoryItems.length;
    for (const it of inventoryItems as InventoryItemWithProduct[]) {
      const available = Number(it.available || 0);
      const reorderPoint =
        it.reorderPoint == null ? lowStockThreshold : Number(it.reorderPoint);
      if (available > 0 && available <= reorderPoint) lowStockCount += 1;
      if (available <= reorderPoint) belowReorderCount += 1;
    }
    const pctBelowReorder =
      trackedCount > 0 ? (belowReorderCount / trackedCount) * 100 : 0;

    const paymentCountMap = new Map<string, number>();
    for (const row of paymentStatusCurrent) {
      paymentCountMap.set(
        String(row.paymentStatus),
        Number(row._count._all || 0),
      );
    }
    const paySuccess = Number(paymentCountMap.get("SUCCESS") || 0);
    const payFailed = Number(paymentCountMap.get("FAILED") || 0);
    const paymentSuccessRate =
      paySuccess + payFailed > 0
        ? (paySuccess / (paySuccess + payFailed)) * 100
        : 0;
    const failedPayments = payFailed;

    const previousPaidOrders = previousOrders.filter(
      (o: { paymentStatus: string }) => o.paymentStatus === "SUCCESS",
    );
    const previousRevenue = previousPaidOrders.reduce(
      (sum: number, order: { total: unknown }) =>
        sum + Number(order.total || 0),
      0,
    );
    const previousOrderCount = hasBookings
      ? previousBookingsTotal
      : previousOrders.length;

    const revenueChange =
      previousRevenue > 0
        ? ((currentRevenue - previousRevenue) / previousRevenue) * 100
        : currentRevenue > 0
          ? 100
          : 0;
    const ordersChange =
      previousOrderCount > 0
        ? ((currentOrderCount - previousOrderCount) / previousOrderCount) * 100
        : currentOrderCount > 0
          ? 100
          : 0;
    const customersChange =
      previousCustomers > 0
        ? ((currentCustomers - previousCustomers) / previousCustomers) * 100
        : currentCustomers > 0
          ? 100
          : 0;

    return {
      revenue: currentRevenue,
      orders: currentOrderCount,
      bookings: hasBookings ? currentBookingsTotal : 0,
      customers: currentCustomers,
      conversionRate: Math.round(conversionRate * 10) / 10,
      revenueChange: Math.round(revenueChange * 10) / 10,
      ordersChange: Math.round(ordersChange * 10) / 10,
      customersChange: Math.round(customersChange * 10) / 10,
      conversionChange: 0,
      aov: Math.round(aov * 100) / 100,
      returningCustomers,
      repeatRate: Math.round(repeatRate * 10) / 10,
      failedPayments,
      paymentSuccessRate: Math.round(paymentSuccessRate * 10) / 10,
      upcomingBookings: hasBookings ? upcomingBookings : 0,
      cancellations: hasBookings ? bookingCancellations : 0,
      inventoryValue: hasInventory ? Math.round(inventoryValue * 100) / 100 : 0,
      lowStockCount: hasInventory ? lowStockCount : 0,
      pctBelowReorder: hasInventory ? Math.round(pctBelowReorder * 10) / 10 : 0,
      returnsCount,
      refundAmount: Math.round(refundAmount * 100) / 100,
      refundRate: Math.round(refundRate * 10) / 10,
      completionRate:
        hasBookings && currentBookingsTotal > 0
          ? Math.round(
              (currentBookingsCompleted / currentBookingsTotal) * 1000,
            ) / 10
          : 0,
      utilizationRate:
        hasBookings && currentBookingsTotal > 0
          ? Math.round(
              (currentBookingsTotal /
                (currentBookingsTotal + bookingCancellations)) *
                1000,
            ) / 10
          : 0,
      retention:
        activePaidCustomerIds.length > 0 && previousCustomers > 0
          ? Math.round(
              (activePaidCustomerIds.length / previousCustomers) * 1000,
            ) / 10
          : 0,
    };
  }

  static async getMetrics(prisma: ExtendedPrismaClient) {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const [salesToday, pendingOrders, totalCustomers] = await Promise.all([
      prisma.order.aggregate({
        where: { paymentStatus: "SUCCESS", createdAt: { gte: startOfToday } },
        _sum: { total: true },
      }),
      prisma.order.count({ where: { fulfillmentStatus: "UNFULFILLED" } }),
      prisma.customer.count(),
    ]);

    return {
      metrics: {
        revenue: { value: Number(salesToday._sum.total || 0) },
        orders: { value: pendingOrders },
        customers: { value: totalCustomers },
      },
    };
  }

  static async getOverview(
    prisma: ExtendedPrismaClient,
    hasBookings: boolean,
    start: Date,
    end: Date,
  ) {
    const [statusGroups, upcomingBookings, openTickets] = await Promise.all([
      hasBookings
        ? prisma.booking.groupBy({
            by: ["status"],
            where: { createdAt: { gte: start, lte: end } },
            _count: { _all: true },
          })
        : prisma.order.groupBy({
            by: ["status"],
            where: { createdAt: { gte: start, lte: end } },
            _count: { _all: true },
          }),
      prisma.booking.findMany({
        where: { startsAt: { gte: new Date() } },
        orderBy: { startsAt: "asc" },
        take: 3,
        select: {
          id: true,
          startsAt: true,
          service: { select: { title: true } },
          customer: {
            select: { firstName: true, lastName: true, email: true },
          },
        },
      }),
      prisma.supportTicket.findMany({
        where: { status: { in: ["open", "pending", "in_progress"] } },
        orderBy: { updatedAt: "desc" },
        take: 3,
        include: { customer: true },
      }),
    ]);

    const statusCounts: Record<string, number> = {};
    statusGroups.forEach(
      (row: { status: string | null; _count: { _all: number } }) => {
        statusCounts[String(row.status)] = Number(row._count._all || 0);
      },
    );

    return {
      statusCounts,
      meetings: upcomingBookings.map(
        (b: {
          id: string;
          startsAt: Date;
          service?: { title: string } | null;
          customer?: {
            firstName: string | null;
            lastName: string | null;
            email: string | null;
          } | null;
        }) => ({
          id: b.id,
          title: b.service?.title || "Booking",
          subtitle:
            `${b.customer?.firstName || ""} ${b.customer?.lastName || ""}`.trim() ||
            b.customer?.email ||
            "Customer",
          time: b.startsAt.toISOString(),
        }),
      ),
      tickets: openTickets.map(
        (
          t: SupportTicket & {
            customer?: {
              firstName: string | null;
              lastName: string | null;
              email: string | null;
              phone: string | null;
            } | null;
          },
        ) => ({
          id: t.id,
          name:
            `${t.customer?.firstName || ""} ${t.customer?.lastName || ""}`.trim() ||
            t.customer?.email ||
            "Customer",
          subject: t.subject,
          status: t.status,
          priority: (t as { priority?: string }).priority as string,
          updatedAt: t.updatedAt.toISOString(),
        }),
      ),
    };
  }

  static async getTodosAlerts(
    prisma: ExtendedPrismaClient,
    store: DashboardStoreInfo | null,
  ) {
    const [pendingOrders, totalProducts] = await Promise.all([
      prisma.order.count({ where: { status: "PENDING_PAYMENT" } }),
      prisma.product.count(),
    ]);

    const todos = [];
    const alerts = [];

    if (!store?.onboardingCompleted) {
      todos.push({
        id: "complete-onboarding",
        title: "Complete Onboarding",
        description: "Finish setting up your store to start selling",
        priority: "high",
        icon: "CheckCircle",
        action: { label: "Continue Setup", href: "/onboarding" },
      });
    }

    if (!store?.isLive && store?.onboardingCompleted) {
      todos.push({
        id: "publish-store",
        title: "Publish Your Store",
        description: "Make your store live and start accepting orders",
        priority: "high",
        icon: "Rocket",
        action: { label: "Go Live", href: "/dashboard/settings/store" },
      });
    }

    if (totalProducts === 0) {
      todos.push({
        id: "add-products",
        title: "Add Your First Product",
        description: "Start selling by adding products to your catalog",
        priority: "high",
        icon: "Package",
        action: { label: "Add Product", href: "/dashboard/products/new" },
      });
    }

    if (pendingOrders > 0) {
      todos.push({
        id: "pending-orders",
        title: `${pendingOrders} Pending Order${pendingOrders > 1 ? "s" : ""}`,
        description: "Orders waiting for payment confirmation",
        priority: "medium",
        icon: "Clock",
        action: {
          label: "View Orders",
          href: "/dashboard/orders?status=pending",
        },
      });
    }

    if (store?.plan === "FREE" || store?.plan === "STARTER") {
      alerts.push({
        id: "upgrade-plan",
        type: "info",
        title: "Upgrade Your Plan",
        message: "Unlock advanced features and grow your business faster",
        action: { label: "View Plans", href: "/dashboard/billing" },
      });
    }

    return { todos, alerts };
  }

  static async getRecentActivity(prisma: ExtendedPrismaClient) {
    const [orders, payouts, tickets] = await Promise.all([
      prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: { customer: true },
      }),
      prisma.payout.findMany({ take: 3, orderBy: { createdAt: "desc" } }),
      prisma.supportTicket.findMany({
        take: 3,
        orderBy: { createdAt: "desc" },
      }),
    ]);

    const getTimeAgo = (date: Date) => {
      const seconds = Math.floor(
        (new Date().getTime() - new Date(date).getTime()) / 1000,
      );
      if (seconds < 60) return "just now";
      const intervals: Record<string, number> = {
        y: 31536000,
        mo: 2592000,
        d: 86400,
        h: 3600,
        m: 60,
      };
      for (const [unit, val] of Object.entries(intervals)) {
        const interval = seconds / val;
        if (interval > 1) return Math.floor(interval) + unit + " ago";
      }
      return "just now";
    };

    const activities: ActivityItem[] = [
      ...orders.map(
        (
          o: Order & {
            customer?: {
              firstName: string | null;
              lastName: string | null;
              email: string | null;
            } | null;
          },
        ) => ({
          id: o.id,
          type: "ORDER",
          date: o.createdAt,
          time: getTimeAgo(o.createdAt),
          message: `New order ${o.orderNumber} for ₦${Number(o.total).toLocaleString()}`,
          user:
            [o.customer?.firstName, o.customer?.lastName]
              .filter(Boolean)
              .join(" ")
              .trim() ||
            o.customer?.email ||
            "Guest",
        }),
      ),
      ...payouts.map((p: Payout) => ({
        id: p.id,
        type: "PAYOUT",
        date: p.createdAt,
        time: getTimeAgo(p.createdAt),
        message: `Payout of ₦${Number(p.amount).toLocaleString()} ${p.status.toLowerCase()}`,
        user: "System",
      })),
      ...tickets.map((t: SupportTicket) => ({
        id: t.id,
        type: "TICKET",
        date: t.updatedAt,
        time: getTimeAgo(t.updatedAt),
        message: `Ticket "${t.subject}" updated (${t.status})`,
        user: "Support",
      })),
    ]
      .sort((a, b) => b.date.getTime() - a.date.getTime())
      .slice(0, 10);

    return activities;
  }

  static async getRecentOrders(
    prisma: ExtendedPrismaClient,
    start: Date,
    end: Date,
  ) {
    const orders = await prisma.order.findMany({
      where: {
        createdAt: { gte: start, lte: end },
        status: { notIn: ["DRAFT"] },
      },
      orderBy: { createdAt: "desc" },
      take: 6,
      select: {
        id: true,
        orderNumber: true,
        refCode: true,
        status: true,
        paymentStatus: true,
        fulfillmentStatus: true,
        total: true,
        currency: true,
        createdAt: true,
        customer: {
          select: { firstName: true, lastName: true, email: true, phone: true },
        },
        items: { take: 3, select: { title: true, quantity: true } },
        _count: { select: { items: true } },
      },
    });

    return orders.map(
      (o: {
        id: string;
        orderNumber: string;
        refCode: string | null;
        status: string;
        paymentStatus: string;
        fulfillmentStatus: string;
        total: unknown;
        currency: string | null;
        createdAt: Date;
        customer?: {
          firstName: string | null;
          lastName: string | null;
          email: string | null;
          phone: string | null;
        } | null;
        items: { title: string; quantity: number | null }[];
        _count?: { items: number } | null;
      }) => ({
        id: o.id,
        orderNumber: o.orderNumber,
        refCode: o.refCode,
        status: o.status,
        paymentStatus: o.paymentStatus,
        fulfillmentStatus: o.fulfillmentStatus,
        total: Number(o.total || 0),
        currency: o.currency || "NGN",
        createdAt: o.createdAt,
        customer: {
          name:
            [o.customer?.firstName, o.customer?.lastName]
              .filter(Boolean)
              .join(" ")
              .trim() ||
            o.customer?.email ||
            "Customer",
          email: o.customer?.email || null,
          phone: o.customer?.phone || null,
        },
        itemsPreview: o.items.map(
          (it: { title: string; quantity: number | null }) => ({
            title: it.title,
            quantity: Number(it.quantity || 0),
          }),
        ),
        itemsCount: Number(o._count?.items || 0),
      }),
    );
  }

  static async getRecentBookings(
    prisma: ExtendedPrismaClient,
    start: Date,
    end: Date,
  ) {
    const bookings = await prisma.booking.findMany({
      where: { createdAt: { gte: start, lte: end } },
      orderBy: { createdAt: "desc" },
      take: 6,
      select: {
        id: true,
        startsAt: true,
        status: true,
        service: { select: { title: true } },
        customer: { select: { firstName: true, lastName: true, email: true } },
      },
    });

    const formatTime = (d: Date) =>
      new Intl.DateTimeFormat("en-US", {
        hour: "numeric",
        minute: "2-digit",
      }).format(d);

    return bookings.map(
      (b: {
        id: string;
        startsAt: Date;
        status: string;
        service?: { title: string } | null;
        customer?: {
          firstName: string | null;
          lastName: string | null;
          email: string | null;
        } | null;
      }) => ({
        id: b.id,
        title: b.service?.title || "Booking",
        subtitle:
          [b.customer?.firstName, b.customer?.lastName]
            .filter(Boolean)
            .join(" ")
            .trim() ||
          b.customer?.email ||
          "Customer",
        time: formatTime(new Date(b.startsAt)),
        status: b.status,
      }),
    );
  }

  static async getInventoryAlerts(prisma: ExtendedPrismaClient) {
    const LOW_STOCK_THRESHOLD = 5;
    const [lowItems, lowCount, outOfStockCount] = await Promise.all([
      prisma.inventoryItem.findMany({
        where: { available: { lte: LOW_STOCK_THRESHOLD } },
        orderBy: [{ available: "asc" }, { updatedAt: "desc" }],
        take: 6,
        select: {
          id: true,
          available: true,
          onHand: true,
          reserved: true,
          product: { select: { id: true, title: true } },
          productVariant: { select: { id: true, title: true } },
        },
      }),
      prisma.inventoryItem.count({
        where: { available: { lte: LOW_STOCK_THRESHOLD } },
      }),
      prisma.inventoryItem.count({ where: { available: { lte: 0 } } }),
    ]);

    return {
      lowStockThreshold: LOW_STOCK_THRESHOLD,
      lowCount,
      outOfStockCount,
      items: (lowItems as unknown as InventoryItemWithProduct[]).map((it) => {
        const available = Number(it.available || 0);
        const onHand = Number(it.onHand || 0);
        const reserved = Number(it.reserved || 0);
        const fallbackAvailable = Math.max(0, onHand - reserved);

        return {
          id: it.id,
          productId: it.product?.id,
          productTitle: it.product?.title || "Product",
          variantId: it.productVariant?.id,
          variantTitle: it.productVariant?.title || null,
          available: Number.isFinite(available) ? available : fallbackAvailable,
        };
      }),
    };
  }

  static async getCustomerInsights(
    prisma: ExtendedPrismaClient,
    start: Date,
    end: Date,
  ) {
    const [
      totalCustomers,
      newCustomers,
      currentPeriodCustomerRows,
      topCustomerRows,
    ] = await Promise.all([
      prisma.customer.count(),
      prisma.customer.count({ where: { createdAt: { gte: start, lte: end } } }),
      prisma.order.groupBy({
        by: ["customerId"],
        where: {
          customerId: { not: null },
          paymentStatus: "SUCCESS",
          createdAt: { gte: start, lte: end },
          status: { notIn: ["DRAFT", "CANCELLED", "REFUNDED"] },
        },
        _count: { _all: true },
      }),
      prisma.order.groupBy({
        by: ["customerId"],
        where: {
          customerId: { not: null },
          paymentStatus: "SUCCESS",
          createdAt: { gte: start, lte: end },
          status: { notIn: ["DRAFT", "CANCELLED", "REFUNDED"] },
        },
        _sum: { total: true },
        _count: { _all: true },
        orderBy: { _sum: { total: "desc" } },
        take: 5,
      }),
    ]);

    const currentCustomerIds = currentPeriodCustomerRows
      .map((r: { customerId: string | null }) => r.customerId)
      .filter((id: string | null): id is string => Boolean(id));

    const priorCustomerRows = currentCustomerIds.length
      ? await prisma.order.findMany({
          where: {
            customerId: { in: currentCustomerIds },
            paymentStatus: "SUCCESS",
            createdAt: { lt: start },
            status: { notIn: ["DRAFT", "CANCELLED", "REFUNDED"] },
          },
          distinct: ["customerId"],
          select: { customerId: true },
        })
      : [];

    const returningCustomerIds = new Set(
      priorCustomerRows
        .map((r: { customerId: string | null }) => r.customerId)
        .filter((id: string | null): id is string => Boolean(id)),
    );

    const customersById = topCustomerRows.length
      ? await prisma.customer.findMany({
          where: {
            id: {
              in: topCustomerRows
                .map((r: { customerId: string | null }) => r.customerId)
                .filter((id: string | null): id is string => Boolean(id)),
            },
          },
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        })
      : [];

    const customerMap = new Map(
      customersById.map((c: Partial<Customer>) => [c.id, c] as const),
    );
    const returningCount = returningCustomerIds.size;
    const activeCustomers = currentCustomerIds.length;
    const repeatRate =
      activeCustomers > 0 ? (returningCount / activeCustomers) * 100 : 0;

    return {
      totals: {
        totalCustomers,
        newCustomers,
        activeCustomers,
        returningCustomers: returningCount,
        repeatRate: Math.round(repeatRate * 10) / 10,
      },
      topCustomers: topCustomerRows.map(
        (row: {
          customerId: string | null;
          _count: { _all: number };
          _sum: { total: unknown };
        }) => {
          const customerId = row.customerId || "";
          const c = customerMap.get(customerId) as
            | Partial<Customer>
            | undefined;
          const name = [c?.firstName, c?.lastName]
            .filter(Boolean)
            .join(" ")
            .trim();
          return {
            id: customerId,
            name: name || c?.email || "Customer",
            email: c?.email || null,
            phone: c?.phone || null,
            orders: Number(row._count?._all || 0),
            spend: Number(row._sum?.total || 0),
          };
        },
      ),
    };
  }

  static async getEarnings(prisma: ExtendedPrismaClient) {
    const salesStats = await prisma.order.aggregate({
      where: { paymentStatus: "SUCCESS" },
      _sum: { total: true },
      _count: { id: true },
    });
    const totalSales = Number(salesStats._sum.total || 0);
    const platformFee = Math.ceil(totalSales * 0.03);
    const netEarnings = totalSales - platformFee;

    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const pendingOrders = await prisma.order.findMany({
      where: {
        paymentStatus: "SUCCESS",
        OR: [
          { fulfillmentStatus: { not: "DELIVERED" } },
          { updatedAt: { gt: sevenDaysAgo } },
        ],
      },
      select: { total: true },
    });
    const pendingFunds = pendingOrders.reduce(
      (sum: number, o: { total: unknown }) => sum + Number(o.total) * 0.97,
      0,
    );
    const availableFunds = Math.max(0, netEarnings - pendingFunds);

    const payouts = await prisma.payout.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    return {
      totalSales,
      platformFee,
      netEarnings,
      pendingFunds: Math.ceil(pendingFunds),
      availableFunds: Math.floor(availableFunds),
      history: payouts.map((p: Payout) => ({
        id: p.id,
        amount: Number(p.amount),
        status: p.status,
        date: p.createdAt.toISOString(),
      })),
    };
  }

  /**
   * Analytics Overview (Unified from AnalyticsService)
   */
  static async getAnalyticsOverview(
    storeId: string,
    range: string = "7d",
  ): Promise<OverviewMetrics> {
    const days = range === "90d" ? 90 : range === "30d" ? 30 : 7;
    const startDate = startOfDay(subDays(new Date(), days));

    const orders = await prisma.order.findMany({
      where: {
        storeId,
        createdAt: { gte: startDate },
        status: { not: "CANCELLED" },
        paymentStatus: "SUCCESS",
      },
      select: {
        id: true,
        total: true,
        createdAt: true,
        customerId: true,
      },
    });

    const totalSales = orders.reduce((sum, o) => sum + Number(o.total), 0);
    const totalOrders = orders.length;
    const aov = totalOrders > 0 ? totalSales / totalOrders : 0;
    const uniqueCustomerIds = new Set(
      orders.map((o) => o.customerId).filter(Boolean),
    );
    const activeCustomers = uniqueCustomerIds.size;
    const chartData = this.groupByDay(orders, days);

    return {
      totalSales,
      totalOrders,
      aov,
      activeCustomers,
      chartData,
    };
  }

  static groupByDay(
    orders: Array<{ createdAt: Date; total: unknown }>,
    days: number,
  ): ChartDataItem[] {
    const map = new Map();
    const now = new Date();
    for (let i = days; i >= 0; i--) {
      const date = subDays(now, i);
      const key = format(date, "MMM dd");
      map.set(key, { date: key, sales: 0, orders: 0 });
    }
    orders.forEach((order) => {
      const key = format(order.createdAt, "MMM dd");
      if (map.has(key)) {
        const entry = map.get(key) as ChartDataItem;
        entry.sales += Number(order.total);
        entry.orders += 1;
      }
    });
    return Array.from(map.values());
  }

  static async getAnalyticsInsights(
    storeId: string,
  ): Promise<AnalyticInsight[]> {
    const today = new Date();
    const startLast7 = subDays(today, 7);
    const startPrev7 = subDays(today, 14);
    const [last7, prev7] = await Promise.all([
      prisma.order.count({
        where: { storeId, createdAt: { gte: startLast7 } },
      }),
      prisma.order.count({
        where: { storeId, createdAt: { gte: startPrev7, lt: startLast7 } },
      }),
    ]);
    const insights = [];
    if (last7 > prev7) {
      insights.push({
        id: "insight-growth",
        type: "positive" as const,
        message: `Orders include perambulating on an upward trend! (${last7} vs ${prev7} last week).`,
        action: "View Growth Report",
      });
    } else if (last7 < prev7) {
      insights.push({
        id: "insight-decline",
        type: "neutral" as const,
        message: `Order volume slightly lower than last week (${last7} vs ${prev7}).`,
        action: "Check Marketing",
      });
    } else {
      insights.push({
        id: "insight-stable",
        type: "neutral" as const,
        message: `Order volume remains stable (${last7} orders).`,
        action: "Boost Sales",
      });
    }
    return insights;
  }
}
