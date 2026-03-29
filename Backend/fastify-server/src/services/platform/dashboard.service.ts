import { prisma, type ExtendedPrismaClient } from '@vayva/db';
import { logger } from '../../lib/logger';
import { startOfDay, subDays, format } from 'date-fns';

// Industry-specific types
interface IndustryConfig {
  features?: {
    bookings?: boolean;
    reservations?: boolean;
    viewings?: boolean;
    inventory?: boolean;
    delivery?: boolean;
  };
}

const INDUSTRY_CONFIG: Record<string, IndustryConfig> = {
  beauty: { features: { bookings: true, inventory: true } },
  healthcare: { features: { bookings: true, inventory: true } },
  automotive: { features: { bookings: true, inventory: true } },
  restaurant: { features: { reservations: true, inventory: true } },
  retail: { features: { inventory: true, delivery: true } },
  grocery: { features: { inventory: true, delivery: true } },
  food: { features: { inventory: true, delivery: true } },
};

interface DashboardStoreInfo {
  industrySlug?: string | null;
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

interface SuggestedAction {
  id: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  icon: string;
  action?: { label: string; href: string };
}

interface Alert {
  id: string;
  type: 'critical' | 'warning' | 'info' | 'success';
  title: string;
  message: string;
  action?: { label: string; href: string };
}

export class DashboardService {
  constructor(private readonly db = prisma) {}
  
  // Cache for performance
  private cache = new Map<string, { data: any; timestamp: number }>();
  private readonly CACHE_TTL = 30000; // 30 seconds

  /**
   * Fetches all dashboard data for a store in a single highly-parallel call.
   */
  async getAggregateData(
    storeId: string,
    range: 'today' | 'week' | 'month' = 'month',
  ) {
    try {
      const store = await this.db.store.findUnique({
        where: { id: storeId },
        select: {
          industrySlug: true,
          isLive: true,
          onboardingCompleted: true,
          plan: true,
        },
      });

      const industrySlug = (store?.industrySlug || 'retail') as any;
      const config = INDUSTRY_CONFIG[industrySlug] || INDUSTRY_CONFIG.retail;

      const hasBookings = Boolean(
        config?.features?.bookings ||
        config?.features?.reservations ||
        config?.features?.viewings,
      );
      const hasInventory = Boolean(config?.features?.inventory);

      const now = new Date();
      const days = range === 'today' ? 1 : range === 'week' ? 7 : 30;
      const start = new Date(now.getTime() - (days - 1) * 24 * 60 * 60 * 1000);
      start.setHours(0, 0, 0, 0);

      // Period dates for comparison
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
        this.getKpisInternal(
          storeId,
          hasBookings,
          hasInventory,
          thirtyDaysAgo,
          sixtyDaysAgo,
        ),
        this.getMetricsInternal(),
        this.getOverviewInternal(hasBookings, start, now),
        this.getTodosAlertsInternal(store as DashboardStoreInfo | null),
        this.getRecentActivityInternal(),
        hasBookings
          ? this.getRecentBookingsInternal(thirtyDaysAgo, now)
          : this.getRecentOrdersInternal(thirtyDaysAgo, now),
        hasInventory ? this.getInventoryAlertsInternal() : Promise.resolve(null),
        this.getCustomerInsightsInternal(start, now),
        this.getEarningsInternal(),
      ]);

      return {
        kpiData: kpis,
        metricsData: metrics,
        overviewData: overview,
        todosAlertsData: todosAlerts,
        activityData: recentActivity,
        recentPrimaryData: hasBookings
          ? { bookings: recentPrimary as any[] }
          : { orders: recentPrimary as any[] },
        inventoryAlertsData: inventory,
        customerInsightsData: customerInsights,
        earningsData: earnings,
        storeInfo: {
          industrySlug: industrySlug as any,
          currency: 'NGN',
          hasBookings,
          hasInventory,
        },
      };
    } catch (error) {
      logger.error({ storeId, error }, '[DashboardService.getAggregateData]');
      throw error;
    }
  }

  private async getKpisInternal(
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
      this.db.order.findMany({
        where: {
          createdAt: { gte: thirtyDaysAgo },
          status: { notIn: ['DRAFT', 'CANCELLED', 'REFUNDED'] },
        },
        select: { total: true, customerId: true, paymentStatus: true },
      }),
      this.db.customer.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
      this.db.order.groupBy({
        by: ['paymentStatus'],
        where: {
          createdAt: { gte: thirtyDaysAgo },
          status: { notIn: ['DRAFT', 'CANCELLED', 'REFUNDED'] },
        },
        _count: { _all: true },
      }),
      hasBookings
        ? this.db.booking.count({ where: { createdAt: { gte: thirtyDaysAgo } } })
        : Promise.resolve(0),
      hasBookings
        ? this.db.booking.count({
            where: { createdAt: { gte: thirtyDaysAgo }, status: 'COMPLETED' },
          })
        : Promise.resolve(0),
      hasBookings
        ? this.db.booking.count({
            where: {
              startsAt: { gte: now, lte: sevenDaysAhead },
              status: { in: ['PENDING', 'CONFIRMED'] },
            },
          })
        : Promise.resolve(0),
      hasBookings
        ? this.db.booking.count({
            where: {
              createdAt: { gte: thirtyDaysAgo },
              status: { in: ['CANCELLED', 'NO_SHOW'] },
            },
          })
        : Promise.resolve(0),
      hasInventory
        ? this.db.inventoryItem.findMany({
            where: { inventoryLocation: { storeId } },
            select: {
              available: true,
              reorderPoint: true,
              product: { select: { price: true } },
              productVariant: { select: { price: true } },
            },
          })
        : Promise.resolve([]),
      this.db.refund.findMany({
        where: { createdAt: { gte: thirtyDaysAgo }, status: 'SUCCESS' },
        select: { amount: true, orderId: true },
      }),
      this.db.refund.findMany({
        where: {
          createdAt: { gte: thirtyDaysAgo },
          status: 'SUCCESS',
          orderId: { not: null },
        },
        distinct: ['orderId'],
        select: { orderId: true },
      }),
      this.db.order.count({
        where: {
          createdAt: { gte: thirtyDaysAgo },
          status: { notIn: ['DRAFT', 'CANCELLED'] },
        },
      }),
      this.db.returnRequest.findMany({
        where: {
          merchantId: storeId,
          createdAt: { gte: thirtyDaysAgo },
          status: { not: 'CANCELLED' },
        },
        distinct: ['orderId'],
        select: { orderId: true },
      }),
      this.db.order.findMany({
        where: {
          createdAt: { gte: thirtyDaysAgo },
          fulfillmentStatus: 'RETURNED',
        },
        distinct: ['id'],
        select: { id: true },
      }),
    ]);

    const [
      previousOrders,
      previousCustomers,
      previousBookingsTotal,
      _previousBookingsCompleted,
    ] = await Promise.all([
      this.db.order.findMany({
        where: {
          createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo },
          status: { notIn: ['DRAFT', 'CANCELLED', 'REFUNDED'] },
        },
        select: { total: true, paymentStatus: true },
      }),
      this.db.customer.count({
        where: { createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo } },
      }),
      hasBookings
        ? this.db.booking.count({
            where: { createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo } },
          })
        : Promise.resolve(0),
      hasBookings
        ? this.db.booking.count({
            where: {
              createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo },
              status: 'COMPLETED',
            },
          })
        : Promise.resolve(0),
    ]);

    const currentPaidOrders = currentOrders.filter(
      (o: any) => o.paymentStatus === 'SUCCESS',
    );
    const currentRevenue = currentPaidOrders.reduce(
      (sum: number, order: any) => sum + Number(order.total || 0),
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
          .map((o: any) => o.customerId)
          .filter((id: string | null): id is string => Boolean(id)),
      ),
    );
    const priorPaidCustomerRows = activePaidCustomerIds.length
      ? await this.db.order.findMany({
          where: {
            customerId: { in: activePaidCustomerIds },
            paymentStatus: 'SUCCESS',
            createdAt: { lt: thirtyDaysAgo },
            status: { notIn: ['DRAFT', 'CANCELLED', 'REFUNDED'] },
          },
          distinct: ['customerId'],
          select: { customerId: true },
        })
      : [];
    const returningCustomers = new Set(
      (priorPaidCustomerRows || [])
        .map((r: any) => r.customerId)
        .filter((id: string | null): id is string => Boolean(id)),
    ).size;
    const repeatRate =
      activePaidCustomerIds.length > 0
        ? (returningCustomers / activePaidCustomerIds.length) * 100
        : 0;

    const refundAmount = refundRows.reduce(
      (sum: number, r: any) => sum + Number(r.amount || 0),
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
    const paySuccess = Number(paymentCountMap.get('SUCCESS') || 0);
    const payFailed = Number(paymentCountMap.get('FAILED') || 0);
    const paymentSuccessRate =
      paySuccess + payFailed > 0
        ? (paySuccess / (paySuccess + payFailed)) * 100
        : 0;
    const failedPayments = payFailed;

    const previousPaidOrders = previousOrders.filter(
      (o: any) => o.paymentStatus === 'SUCCESS',
    );
    const previousRevenue = previousPaidOrders.reduce(
      (sum: number, order: any) => sum + Number(order.total || 0),
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

  private async getMetricsInternal() {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const [salesToday, pendingOrders, totalCustomers] = await Promise.all([
      this.db.order.aggregate({
        where: { paymentStatus: 'SUCCESS', createdAt: { gte: startOfToday } },
        _sum: { total: true },
      }),
      this.db.order.count({ where: { fulfillmentStatus: 'UNFULFILLED' } }),
      this.db.customer.count(),
    ]);

    return {
      metrics: {
        revenue: { value: Number(salesToday._sum.total || 0) },
        orders: { value: pendingOrders },
        customers: { value: totalCustomers },
      },
    };
  }

  private async getOverviewInternal(
    hasBookings: boolean,
    start: Date,
    end: Date,
  ) {
    const [statusGroups, upcomingBookings, openTickets] = await Promise.all([
      hasBookings
        ? this.db.booking.groupBy({
            by: ['status'],
            where: { createdAt: { gte: start, lte: end } },
            _count: { _all: true },
          })
        : this.db.order.groupBy({
            by: ['status'],
            where: { createdAt: { gte: start, lte: end } },
            _count: { _all: true },
          }),
      this.db.booking.findMany({
        where: { startsAt: { gte: new Date() } },
        orderBy: { startsAt: 'asc' },
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
      this.db.supportTicket.findMany({
        where: { status: { in: ['open', 'pending', 'in_progress'] } },
        orderBy: { updatedAt: 'desc' },
        take: 3,
        include: { customer: true },
      }),
    ]);

    const statusCounts: Record<string, number> = {};
    statusGroups.forEach((row: any) => {
      statusCounts[String(row.status)] = Number(row._count._all || 0);
    });

    return {
      statusCounts,
      meetings: upcomingBookings.map((b: any) => ({
        id: b.id,
        title: b.service?.title || 'Booking',
        subtitle:
          `${b.customer?.firstName || ''} ${b.customer?.lastName || ''}`.trim() ||
          b.customer?.email ||
          'Customer',
        time: b.startsAt.toISOString(),
      })),
      tickets: openTickets.map((t: any) => ({
        id: t.id,
        name:
          `${t.customer?.firstName || ''} ${t.customer?.lastName || ''}`.trim() ||
          t.customer?.email ||
          'Customer',
        subject: t.subject,
        status: t.status,
        priority: t.priority,
        updatedAt: t.updatedAt.toISOString(),
      })),
    };
  }

  private async getTodosAlertsInternal(store: DashboardStoreInfo | null) {
    const [pendingOrders, totalProducts] = await Promise.all([
      this.db.order.count({ where: { status: 'PENDING_PAYMENT' } }),
      this.db.product.count(),
    ]);

    const todos = [];
    const alerts = [];

    if (!store?.onboardingCompleted) {
      todos.push({
        id: 'complete-onboarding',
        title: 'Complete Onboarding',
        description: 'Finish setting up your store to start selling',
        priority: 'high',
        icon: 'CheckCircle',
        action: { label: 'Continue Setup', href: '/onboarding' },
      });
    }

    if (!store?.isLive && store?.onboardingCompleted) {
      todos.push({
        id: 'publish-store',
        title: 'Publish Your Store',
        description: 'Make your store live and start accepting orders',
        priority: 'high',
        icon: 'Rocket',
        action: { label: 'Go Live', href: '/dashboard/settings/store' },
      });
    }

    if (totalProducts === 0) {
      todos.push({
        id: 'add-products',
        title: 'Add Your First Product',
        description: 'Start selling by adding products to your catalog',
        priority: 'high',
        icon: 'Package',
        action: { label: 'Add Product', href: '/dashboard/products/new' },
      });
    }

    if (pendingOrders > 0) {
      todos.push({
        id: 'pending-orders',
        title: `${pendingOrders} Pending Order${pendingOrders > 1 ? 's' : ''}`,
        description: 'Orders waiting for payment confirmation',
        priority: 'medium',
        icon: 'Clock',
        action: {
          label: 'View Orders',
          href: '/dashboard/orders?status=pending',
        },
      });
    }

    if (store?.plan === 'FREE' || store?.plan === 'STARTER') {
      alerts.push({
        id: 'upgrade-plan',
        type: 'info',
        title: 'Upgrade Your Plan',
        message: 'Unlock advanced features and grow your business faster',
        action: { label: 'View Plans', href: '/dashboard/billing' },
      });
    }

    return { todos, alerts };
  }

  private async getRecentActivityInternal() {
    const [orders, payouts, tickets] = await Promise.all([
      this.db.order.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { customer: true },
      }),
      this.db.payout.findMany({ take: 3, orderBy: { createdAt: 'desc' } }),
      this.db.supportTicket.findMany({
        take: 3,
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    const getTimeAgo = (date: Date) => {
      const seconds = Math.floor(
        (new Date().getTime() - new Date(date).getTime()) / 1000,
      );
      if (seconds < 60) return 'just now';
      const intervals: Record<string, number> = {
        y: 31536000,
        mo: 2592000,
        d: 86400,
        h: 3600,
        m: 60,
      };
      for (const [unit, val] of Object.entries(intervals)) {
        const interval = seconds / val;
        if (interval > 1) return Math.floor(interval) + unit + ' ago';
      }
      return 'just now';
    };

    const activities: ActivityItem[] = [
      ...orders.map((o: any) => ({
        id: o.id,
        type: 'ORDER',
        date: o.createdAt,
        time: getTimeAgo(o.createdAt),
        message: `New order ${o.orderNumber} for ₦${Number(o.total).toLocaleString()}`,
        user:
          [o.customer?.firstName, o.customer?.lastName]
            .filter(Boolean)
            .join(' ')
            .trim() ||
          o.customer?.email ||
          'Guest',
      })),
      ...payouts.map((p: any) => ({
        id: p.id,
        type: 'PAYOUT',
        date: p.createdAt,
        time: getTimeAgo(p.createdAt),
        message: `Payout of ₦${Number(p.amount).toLocaleString()} ${p.status.toLowerCase()}`,
        user: 'System',
      })),
      ...tickets.map((t: any) => ({
        id: t.id,
        type: 'TICKET',
        date: t.updatedAt,
        time: getTimeAgo(t.updatedAt),
        message: `Ticket "${t.subject}" updated (${t.status})`,
        user: 'Support',
      })),
    ]
      .sort((a, b) => b.date.getTime() - a.date.getTime())
      .slice(0, 10);

    return activities;
  }

  private async getRecentOrdersInternal(start: Date, end: Date) {
    const orders = await this.db.order.findMany({
      where: {
        createdAt: { gte: start, lte: end },
        status: { notIn: ['DRAFT'] },
      },
      orderBy: { createdAt: 'desc' },
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

    return orders.map((o: any) => ({
      id: o.id,
      orderNumber: o.orderNumber,
      refCode: o.refCode,
      status: o.status,
      paymentStatus: o.paymentStatus,
      fulfillmentStatus: o.fulfillmentStatus,
      total: Number(o.total || 0),
      currency: o.currency || 'NGN',
      createdAt: o.createdAt,
      customer: {
        name:
          [o.customer?.firstName, o.customer?.lastName]
            .filter(Boolean)
            .join(' ')
            .trim() ||
          o.customer?.email ||
          'Customer',
        email: o.customer?.email || null,
        phone: o.customer?.phone || null,
      },
      itemsPreview: o.items.map((it: any) => ({
        title: it.title,
        quantity: Number(it.quantity || 0),
      })),
      itemsCount: Number(o._count?.items || 0),
    }));
  }

  private async getRecentBookingsInternal(start: Date, end: Date) {
    const bookings = await this.db.booking.findMany({
      where: { createdAt: { gte: start, lte: end } },
      orderBy: { createdAt: 'desc' },
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
      new Intl.DateTimeFormat('en-US', {
        hour: 'numeric',
        minute: '2-digit',
      }).format(d);

    return bookings.map((b: any) => ({
      id: b.id,
      title: b.service?.title || 'Booking',
      subtitle:
        [b.customer?.firstName, b.customer?.lastName]
          .filter(Boolean)
          .join(' ')
          .trim() ||
        b.customer?.email ||
        'Customer',
      time: formatTime(new Date(b.startsAt)),
      status: b.status,
    }));
  }

  private async getInventoryAlertsInternal() {
    const LOW_STOCK_THRESHOLD = 5;
    const [lowItems, lowCount, outOfStockCount] = await Promise.all([
      this.db.inventoryItem.findMany({
        where: { available: { lte: LOW_STOCK_THRESHOLD } },
        orderBy: [{ available: 'asc' }, { updatedAt: 'desc' }],
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
      this.db.inventoryItem.count({
        where: { available: { lte: LOW_STOCK_THRESHOLD } },
      }),
      this.db.inventoryItem.count({ where: { available: { lte: 0 } } }),
    ]);

    return {
      lowStockThreshold: LOW_STOCK_THRESHOLD,
      lowCount,
      outOfStockCount,
      items: (lowItems as InventoryItemWithProduct[]).map((it) => {
        const available = Number(it.available || 0);
        const onHand = Number(it.onHand || 0);
        const reserved = Number(it.reserved || 0);
        const fallbackAvailable = Math.max(0, onHand - reserved);

        return {
          id: it.id,
          productId: it.product?.id,
          productTitle: it.product?.title || 'Product',
          variantId: it.productVariant?.id,
          variantTitle: it.productVariant?.title || null,
          available: Number.isFinite(available) ? available : fallbackAvailable,
        };
      }),
    };
  }

  private async getCustomerInsightsInternal(start: Date, end: Date) {
    const [
      totalCustomers,
      newCustomers,
      currentPeriodCustomerRows,
      topCustomerRows,
    ] = await Promise.all([
      this.db.customer.count(),
      this.db.customer.count({ where: { createdAt: { gte: start, lte: end } } }),
      this.db.order.groupBy({
        by: ['customerId'],
        where: {
          customerId: { not: null },
          paymentStatus: 'SUCCESS',
          createdAt: { gte: start, lte: end },
          status: { notIn: ['DRAFT', 'CANCELLED', 'REFUNDED'] },
        },
        _count: { _all: true },
      }),
      this.db.order.groupBy({
        by: ['customerId'],
        where: {
          customerId: { not: null },
          paymentStatus: 'SUCCESS',
          createdAt: { gte: start, lte: end },
          status: { notIn: ['DRAFT', 'CANCELLED', 'REFUNDED'] },
        },
        _sum: { total: true },
        _count: { _all: true },
        orderBy: { _sum: { total: 'desc' } },
        take: 5,
      }),
    ]);

    const currentCustomerIds = currentPeriodCustomerRows
      .map((r: any) => r.customerId)
      .filter((id: string | null): id is string => Boolean(id));

    const priorCustomerRows = currentCustomerIds.length
      ? await this.db.order.findMany({
          where: {
            customerId: { in: currentCustomerIds },
            paymentStatus: 'SUCCESS',
            createdAt: { lt: start },
            status: { notIn: ['DRAFT', 'CANCELLED', 'REFUNDED'] },
          },
          distinct: ['customerId'],
          select: { customerId: true },
        })
      : [];

    const returningCustomerIds = new Set(
      priorCustomerRows
        .map((r: any) => r.customerId)
        .filter((id: string | null): id is string => Boolean(id)),
    );

    const customersById = topCustomerRows.length
      ? await this.db.customer.findMany({
          where: {
            id: {
              in: topCustomerRows
                .map((r: any) => r.customerId)
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
      customersById.map((c: any) => [c.id, c] as const),
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
      topCustomers: topCustomerRows.map((row: any) => {
        const customerId = row.customerId || '';
        const c = customerMap.get(customerId) as any;
        const name = [c?.firstName, c?.lastName]
          .filter(Boolean)
          .join(' ')
          .trim();
        return {
          id: customerId,
          name: name || c?.email || 'Customer',
          email: c?.email || null,
          phone: c?.phone || null,
          orders: Number(row._count?._all || 0),
          spend: Number(row._sum?.total || 0),
        };
      }),
    };
  }

  private async getEarningsInternal() {
    const salesStats = await this.db.order.aggregate({
      where: { paymentStatus: 'SUCCESS' },
      _sum: { total: true },
      _count: { id: true },
    });
    const totalSales = Number(salesStats._sum.total || 0);
    const platformFee = Math.ceil(totalSales * 0.03);
    const netEarnings = totalSales - platformFee;

    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const pendingOrders = await this.db.order.findMany({
      where: {
        paymentStatus: 'SUCCESS',
        OR: [
          { fulfillmentStatus: { not: 'DELIVERED' } },
          { updatedAt: { gt: sevenDaysAgo } },
        ],
      },
      select: { total: true },
    });
    const pendingFunds = pendingOrders.reduce(
      (sum: number, o: any) => sum + Number(o.total) * 0.97,
      0,
    );
    const availableFunds = Math.max(0, netEarnings - pendingFunds);

    const payouts = await this.db.payout.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    return {
      totalSales,
      platformFee,
      netEarnings,
      pendingFunds: Math.ceil(pendingFunds),
      availableFunds: Math.floor(availableFunds),
      history: payouts.map((p: any) => ({
        id: p.id,
        amount: Number(p.amount),
        status: p.status,
        date: p.createdAt.toISOString(),
      })),
    };
  }

  /**
   * Get KPIs only (public wrapper for backward compatibility)
   */
  async getKpis(storeId: string) {
    try {
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

      const store = await this.db.store.findUnique({
        where: { id: storeId },
        select: { industrySlug: true },
      });

      const industrySlug = (store?.industrySlug || 'retail') as any;
      const config = INDUSTRY_CONFIG[industrySlug] || INDUSTRY_CONFIG.retail;
      const hasBookings = Boolean(
        config?.features?.bookings ||
        config?.features?.reservations ||
        config?.features?.viewings,
      );
      const hasInventory = Boolean(config?.features?.inventory);

      return await this.getKpisInternal(
        storeId,
        hasBookings,
        hasInventory,
        thirtyDaysAgo,
        sixtyDaysAgo,
      );
    } catch (error) {
      logger.error({ storeId, error }, '[DashboardService.getKpis]');
      throw error;
    }
  }

  /**
   * Get metrics (legacy endpoint)
   */
  async getMetrics(storeId: string) {
    try {
      return await this.getMetricsInternal();
    } catch (error) {
      logger.error({ storeId, error }, '[DashboardService.getMetrics]');
      throw error;
    }
  }

  /**
   * Get suggested actions (legacy endpoint)
   */
  async getSuggestedActions(storeId: string): Promise<{ actions: SuggestedAction[] }> {
    try {
      const store = await this.db.store.findUnique({
        where: { id: storeId },
        select: {
          isLive: true,
          onboardingCompleted: true,
          plan: true,
        },
      });

      const actions: SuggestedAction[] = [];

      if (!store?.onboardingCompleted) {
        actions.push({
          id: 'complete-onboarding',
          title: 'Complete Onboarding',
          description: 'Finish setting up your store to start selling',
          priority: 'high',
          icon: 'CheckCircle',
          action: { label: 'Continue Setup', href: '/onboarding' },
        });
      }

      const productCount = await this.db.product.count({ where: { storeId } });
      if (productCount === 0 && store?.onboardingCompleted) {
        actions.push({
          id: 'add-first-product',
          title: 'Add Your First Product',
          description: 'Start selling by adding products to your catalog',
          priority: 'high',
          icon: 'Package',
          action: { label: 'Add Product', href: '/dashboard/products/new' },
        });
      }

      return { actions };
    } catch (error) {
      logger.error({ storeId, error }, '[DashboardService.getSuggestedActions]');
      throw error;
    }
  }

  /**
   * Get alerts (legacy endpoint)
   */
  async getAlerts(storeId: string): Promise<{ alerts: Alert[] }> {
    try {
      const store = await this.db.store.findUnique({
        where: { id: storeId },
        select: {
          isLive: true,
          onboardingCompleted: true,
          plan: true,
        },
      });

      const alerts: Alert[] = [];

      if (!store?.isLive && store?.onboardingCompleted) {
        alerts.push({
          id: 'publish-store',
          type: 'warning',
          title: 'Store Not Published',
          message: 'Your store is ready but not yet live. Start accepting orders!',
          action: { label: 'Go Live', href: '/dashboard/settings/store' },
        });
      }

      if (store?.plan === 'STARTER') {
        alerts.push({
          id: 'upgrade-plan',
          type: 'info',
          title: 'Upgrade Your Plan',
          message: 'Unlock advanced features and grow your business faster',
          action: { label: 'View Plans', href: '/dashboard/billing' },
        });
      }

      const pendingOrders = await this.db.order.count({
        where: { status: 'PENDING_PAYMENT', storeId },
      });

      if (pendingOrders > 0) {
        alerts.push({
          id: 'pending-orders',
          type: 'warning',
          title: 'Pending Orders',
          message: `${pendingOrders} order${pendingOrders > 1 ? 's' : ''} awaiting payment confirmation`,
          action: { label: 'View Orders', href: '/dashboard/orders?status=pending' },
        });
      }

      return { alerts };
    } catch (error) {
      logger.error({ storeId, error }, '[DashboardService.getAlerts]');
      throw error;
    }
  }

  /**
   * Invalidate cache for a store
   */
  async invalidateCache(storeId: string): Promise<void> {
    const keysToDelete: string[] = [];
    this.cache.forEach((_, key) => {
      if (key.startsWith(`${storeId}:`)) {
        keysToDelete.push(key);
      }
    });
    keysToDelete.forEach(key => this.cache.delete(key));
  }
}
