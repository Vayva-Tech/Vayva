import { prisma } from '@vayva/db';
import { logger } from '../../lib/logger';

export class AnalyticsService {
  constructor(private readonly db = prisma) {}

  async getAnalyticsOverview(storeId: string, range: string) {
    const days = parseInt(range.replace('d', ''), 10) || 7;
    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - days);

    const [currentPeriod, previousPeriod] = await Promise.all([
      this.getPeriodStats(storeId, fromDate, new Date()),
      this.getPeriodStats(storeId, new Date(fromDate.getTime() - days * 24 * 60 * 60 * 1000), fromDate),
    ]);

    return {
      current: currentPeriod,
      previous: previousPeriod,
      growth: {
        revenue: currentPeriod.revenue - previousPeriod.revenue,
        orders: currentPeriod.orders - previousPeriod.orders,
        customers: currentPeriod.customers - previousPeriod.customers,
        conversionRate: currentPeriod.conversionRate - previousPeriod.conversionRate,
      },
    };
  }

  private async getPeriodStats(storeId: string, from: Date, to: Date) {
    const [orders, revenue, customers, totalVisitors] = await Promise.all([
      this.db.order.count({ where: { storeId, createdAt: { gte: from, lte: to } } }),
      this.db.order.aggregate({
        where: { storeId, createdAt: { gte: from, lte: to } },
        _sum: { totalAmount: true },
      }),
      this.db.customer.count({ where: { storeId, createdAt: { gte: from, lte: to } } }),
      this.db.analyticsEvent.count({
        where: {
          storeId,
          eventType: 'PAGE_VIEW',
          timestamp: { gte: from, lte: to },
        },
      }),
    ]);

    const conversionRate = totalVisitors > 0 ? (orders / totalVisitors) * 100 : 0;

    return {
      revenue: revenue._sum.totalAmount || 0,
      orders,
      customers,
      conversionRate: parseFloat(conversionRate.toFixed(2)),
    };
  }

  async getPerformanceMetrics(storeId: string, filters: any) {
    const page = filters.page || 1;
    const limit = Math.min(filters.limit || 50, 100);
    const where: any = { storeId };

    if (filters.fromDate || filters.toDate) {
      where.timestamp = {};
      if (filters.fromDate) where.timestamp.gte = filters.fromDate;
      if (filters.toDate) where.timestamp.lte = filters.toDate;
    }

    const [events, total] = await Promise.all([
      this.db.analyticsEvent.findMany({
        where,
        orderBy: { timestamp: 'desc' },
        take: limit,
        skip: (page - 1) * limit,
      }),
      this.db.analyticsEvent.count({ where }),
    ]);

    return { events, total, page, limit, pages: Math.ceil(total / limit) };
  }

  /**
   * Get comprehensive platform analytics for ops dashboard
   */
  async getComprehensiveAnalytics() {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

    const [
      merchantCount,
      activeMerchantCount,
      totalGMVResult,
      totalOrdersCount,
      avgOrderValueResult,
      newMerchantsThisMonth,
      newMerchantsLastMonth,
      gmvThisMonth,
      gmvLastMonth,
      ordersThisMonth,
      ordersLastMonth,
      openTickets,
      pendingKyc,
      totalRevenueResult,
      totalRefundsResult,
    ] = await Promise.all([
      this.db.store.count(),
      this.db.store.count({ where: { isActive: true } }),
      this.db.order.aggregate({ _sum: { totalAmount: true } }),
      this.db.order.count(),
      this.db.order.aggregate({ _avg: { totalAmount: true } }),
      this.db.store.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
      this.db.store.count({ where: { createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo } } }),
      this.db.order.aggregate({ _sum: { totalAmount: true }, where: { createdAt: { gte: thirtyDaysAgo } } }),
      this.db.order.aggregate({ _sum: { totalAmount: true }, where: { createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo } } }),
      this.db.order.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
      this.db.order.count({ where: { createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo } } }),
      this.db.supportTicket.count({ where: { status: { in: ['OPEN', 'IN_PROGRESS'] } } }),
      this.db.kycRecord.count({ where: { status: 'PENDING' } }),
      this.db.subscriptionPayment.count({}),
      this.db.refund.count({}),
    ]);

    return {
      overview: {
        totalMerchants: merchantCount,
        activeMerchants: activeMerchantCount,
        totalGMV: totalGMVResult._sum.totalAmount || 0,
        totalOrders: totalOrdersCount,
        avgOrderValue: avgOrderValueResult._avg.totalAmount || 0,
      },
      growth: {
        merchantGrowthRate: newMerchantsLastMonth > 0 ? ((newMerchantsThisMonth - newMerchantsLastMonth) / newMerchantsLastMonth) * 100 : 0,
        gmvGrowthRate: gmvLastMonth._sum.totalAmount && gmvLastMonth._sum.totalAmount! > 0 ? ((gmvThisMonth._sum.totalAmount! - gmvLastMonth._sum.totalAmount!) / gmvLastMonth._sum.totalAmount!) * 100 : 0,
        orderGrowthRate: ordersLastMonth > 0 ? ((ordersThisMonth - ordersLastMonth) / ordersLastMonth) * 100 : 0,
      },
      operational: {
        openTickets,
        pendingKyc,
      },
      financial: {
        totalRevenue: totalRevenueResult,
        totalRefunds: totalRefundsResult,
      },
    };
  }

  /**
   * Get dashboard stats for ops
   */
  async getDashboardStats() {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

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
      this.db.store?.count({ where: { isActive: true } }),
      this.db.store?.count({ where: { isActive: true, createdAt: { lt: thirtyDaysAgo } } }),
      this.db.subscriptionPayment.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
      this.db.subscriptionPayment.count({ where: { createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo } } }),
      this.db.order.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
      this.db.order.count({ where: { createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo } } }),
      this.db.supportTicket.count({ where: { status: { in: ['OPEN', 'IN_PROGRESS'] } } }),
      this.db.opsAuditEvent.findMany({ take: 10, orderBy: { createdAt: 'desc' } }),
      this.db.merchantAiSubscription.count({ where: { status: 'ACTIVE' } }),
      this.db.merchantAiSubscription.aggregate({ _sum: { monthlyFee: true } }),
      this.db.store.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
    ]);

    return {
      stats: {
        merchants: {
          current: currentMerchantCount || 0,
          delta: (currentMerchantCount || 0) - (prevMerchantCount || 0),
        },
        revenue: {
          current: currentRevenue || 0,
          delta: currentRevenue - prevRevenue,
        },
        orders: {
          current: currentOrders || 0,
          delta: currentOrders - prevOrders,
        },
        tickets: {
          open: openTickets || 0,
        },
        subscriptions: {
          active: activeSubscriptions || 0,
          mrr: mrrTotal._sum.monthlyFee || 0,
        },
        activity: {
          newMerchantsThisWeek: newMerchantsThisWeek || 0,
          recentLogs: recentActivity,
        },
      },
    };
  }

  /**
   * Get platform analytics breakdown
   */
  async getPlatformBreakdown() {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

    const [
      totalMerchants,
      activeMerchants,
      newMerchantsThisMonth,
      newMerchantsLastMonth,
      industryData,
      planData,
      topMerchantsData,
    ] = await Promise.all([
      this.db.store.count(),
      this.db.store.count({
        where: {
          orders: {
            some: {
              createdAt: { gte: thirtyDaysAgo },
            },
          },
        },
      }),
      this.db.store.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
      this.db.store.count({ where: { createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo } } }),
      this.db.store.groupBy({
        by: ['industrySlug'],
        _count: { id: true },
      }),
      this.db.store.groupBy({
        by: ['planKey'],
        _count: { id: true },
      }),
      this.db.store.findMany({
        take: 10,
        orderBy: {
          orders: {
            _count: 'desc',
          },
        },
        include: {
          orders: {
            select: { total: true },
            where: { createdAt: { gte: thirtyDaysAgo } },
          },
        },
      }),
    ]);

    return {
      overview: {
        totalMerchants,
        activeMerchants,
        growthRate: newMerchantsLastMonth > 0 ? ((newMerchantsThisMonth - newMerchantsLastMonth) / newMerchantsLastMonth) * 100 : 0,
      },
      breakdown: {
        byIndustry: industryData.map((d: any) => ({ category: d.industrySlug || 'Unknown', count: d._count.id })),
        byPlan: planData.map((d: any) => ({ planKey: d.planKey || 'Unknown', count: d._count.id })),
      },
      topPerformers: topMerchantsData.map((m: any) => ({
        id: m.id,
        name: m.name,
        orderCount: m.orders.length,
        totalRevenue: m.orders.reduce((sum: number, o: any) => sum + (Number(o.total) || 0), 0),
      })),
    };
  }

  /**
   * Get time series data for metrics
   */
  async getTimeSeries(metric: string, periodDays: number, granularity: string) {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - periodDays);

    let data: Array<{ date: string; value: number; label: string }> = [];

    if (metric === 'gmv') {
      const orders = await this.db.order.findMany({
        where: {
          createdAt: { gte: startDate, lte: endDate },
          paymentStatus: 'SUCCESS',
        },
        select: {
          createdAt: true,
          total: true,
        },
        orderBy: { createdAt: 'asc' },
      });

      const groupedData = new Map<string, number>();
      orders.forEach((order) => {
        const dateKey = order.createdAt.toISOString().split('T')[0];
        groupedData.set(dateKey, (groupedData.get(dateKey) || 0) + Number(order.total || 0));
      });

      data = Array.from(groupedData.entries()).map(([date, value]) => ({
        date,
        value,
        label: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      }));
    } else if (metric === 'merchants') {
      const merchants = await this.db.store.findMany({
        where: {
          createdAt: { gte: startDate, lte: endDate },
        },
        select: {
          createdAt: true,
        },
        orderBy: { createdAt: 'asc' },
      });

      const groupedData = new Map<string, number>();
      merchants.forEach((merchant) => {
        const dateKey = merchant.createdAt.toISOString().split('T')[0];
        groupedData.set(dateKey, (groupedData.get(dateKey) || 0) + 1);
      });

      let cumulative = 0;
      data = Array.from(groupedData.entries()).map(([date, value]) => {
        cumulative += value;
        return {
          date,
          value: cumulative,
          label: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        };
      });
    } else if (metric === 'orders') {
      const orders = await this.db.order.findMany({
        where: {
          createdAt: { gte: startDate, lte: endDate },
        },
        select: {
          createdAt: true,
        },
        orderBy: { createdAt: 'asc' },
      });

      const groupedData = new Map<string, number>();
      orders.forEach((order) => {
        const dateKey = order.createdAt.toISOString().split('T')[0];
        groupedData.set(dateKey, (groupedData.get(dateKey) || 0) + 1);
      });

      data = Array.from(groupedData.entries()).map(([date, value]) => ({
        date,
        value,
        label: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      }));
    }

    return { data, metric, period: `${periodDays}d` };
  }

  /**
   * Get CSAT scores
   */
  async getCsatScores() {
    const feedbacks = await this.db.supportTicketFeedback.findMany({
      select: { rating: true },
    });

    const total = feedbacks.length;
    const great = feedbacks.filter((f) => f.rating === 'GREAT').length;
    const okay = feedbacks.filter((f) => f.rating === 'OKAY').length;
    const bad = feedbacks.filter((f) => f.rating === 'BAD').length;

    const csatScore = total > 0 ? Math.round((great / total) * 100) : 0;

    return {
      data: {
        total,
        great,
        okay,
        bad,
        csatScore,
        target: 85,
      },
    };
  }

  async trackEvent(storeId: string, eventData: any) {
    const { eventType, userId, metadata, sessionId } = eventData;

    const event = await this.db.analyticsEvent.create({
      data: {
        id: `ae-${Date.now()}`,
        storeId,
        eventType,
        userId: userId || null,
        sessionId: sessionId || null,
        metadata: metadata || {},
        timestamp: new Date(),
      },
    });

    return event;
  }

  async getInsights(storeId: string) {
    const [
      topProducts,
      customerSegments,
      salesByHour,
      salesByDayOfWeek,
    ] = await Promise.all([
      this.db.orderItem.groupBy({
        by: ['productId'],
        where: {
          order: { storeId, status: 'COMPLETED' },
        },
        _sum: { quantity: true, totalPrice: true },
        orderBy: { _sum: { quantity: 'desc' } },
        take: 10,
      }),
      this.db.customer.groupBy({
        by: ['segment'],
        where: { storeId, segment: { not: null } },
        _count: { id: true },
      }),
      this.db.order.groupBy({
        by: ['createdAt'],
        where: {
          storeId,
          status: 'COMPLETED',
          createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
        },
        _sum: { totalAmount: true },
      }),
      this.db.order.groupBy({
        by: ['createdAt'],
        where: {
          storeId,
          status: 'COMPLETED',
          createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
        },
        _sum: { totalAmount: true },
      }),
    ]);

    return {
      topProducts: topProducts.map((p) => ({
        productId: p.productId,
        quantitySold: p._sum.quantity,
        revenue: p._sum.totalPrice,
      })),
      customerSegments: customerSegments.map((s) => ({
        segment: s.segment,
        count: s._count,
      })),
      salesByHour: this.aggregateByHour(salesByHour),
      salesByDayOfWeek: this.aggregateByDayOfWeek(salesByDayOfWeek),
    };
  }

  private aggregateByHour(data: any[]) {
    const hourlyData = new Array(24).fill(0);
    data.forEach((item) => {
      const hour = new Date(item.createdAt as any).getHours();
      hourlyData[hour] += (item._sum.totalAmount as number) || 0;
    });
    return hourlyData;
  }

  private aggregateByDayOfWeek(data: any[]) {
    const dailyData = new Array(7).fill(0);
    data.forEach((item) => {
      const day = new Date(item.createdAt as any).getDay();
      dailyData[day] += (item._sum.totalAmount as number) || 0;
    });
    return dailyData;
  }

  async getEnhancedAnalytics(storeId: string, metrics: string[]) {
    const results: any = {};

    if (metrics.includes('revenue_trend')) {
      results.revenueTrend = await this.db.order.groupBy({
        by: ['createdAt'],
        where: {
          storeId,
          status: 'COMPLETED',
          createdAt: { gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) },
        },
        _sum: { totalAmount: true },
        _count: { id: true },
      });
    }

    if (metrics.includes('customer_lifetime_value')) {
      results.customerLifetimeValue = await this.db.customer.findMany({
        where: { storeId },
        include: {
          orders: {
            select: { totalAmount: true },
          },
        },
      });
    }

    if (metrics.includes('inventory_turnover')) {
      results.inventoryTurnover = await this.db.productVariant.findMany({
        where: { product: { storeId } },
        include: {
          product: true,
        },
      });
    }

    return results;
  }
}
