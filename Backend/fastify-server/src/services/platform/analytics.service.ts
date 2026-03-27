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
