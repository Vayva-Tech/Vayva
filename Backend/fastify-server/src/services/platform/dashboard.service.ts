import { prisma } from '@vayva/db';
import { logger } from '../../lib/logger';

export class DashboardService {
  constructor(private readonly db = prisma) {}

  async getMetrics(storeId: string) {
    const [
      totalOrders,
      pendingOrders,
      completedOrders,
      totalRevenue,
      todayRevenue,
      totalCustomers,
      totalProducts,
      lowStockProducts,
    ] = await Promise.all([
      this.db.order.count({ where: { storeId } }),
      this.db.order.count({ where: { storeId, status: 'PENDING' } }),
      this.db.order.count({ where: { storeId, status: 'COMPLETED' } }),
      this.db.order.aggregate({
        where: { storeId },
        _sum: { totalAmount: true },
      }),
      this.db.order.aggregate({
        where: {
          storeId,
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
          },
        },
        _sum: { totalAmount: true },
      }),
      this.db.customer.count({ where: { storeId } }),
      this.db.product.count({ where: { storeId } }),
      this.db.productVariant.count({
        where: {
          product: { storeId },
          quantity: { lte: 10 },
        },
      }),
    ]);

    return {
      orders: {
        total: totalOrders,
        pending: pendingOrders,
        completed: completedOrders,
      },
      revenue: {
        total: totalRevenue._sum.totalAmount || 0,
        today: todayRevenue._sum.totalAmount || 0,
      },
      customers: {
        total: totalCustomers,
      },
      products: {
        total: totalProducts,
        lowStock: lowStockProducts,
      },
    };
  }

  async getRecentOrders(storeId: string, limit = 10) {
    const orders = await this.db.order.findMany({
      where: { storeId },
      include: {
        customer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        items: {
          take: 2,
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return orders;
  }

  async getIndustryOverview(storeId: string) {
    const industryStats = await Promise.all([
      this.db.order.aggregate({
        where: { storeId },
        _sum: { totalAmount: true },
        _count: { id: true },
      }),
      this.db.customer.aggregate({
        where: { storeId },
        _count: { id: true },
      }),
      this.db.product.aggregate({
        where: { storeId },
        _sum: { price: true },
        _count: { id: true },
      }),
    ]);

    return {
      totalRevenue: industryStats[0]._sum.totalAmount || 0,
      totalOrders: industryStats[0]._count,
      totalCustomers: industryStats[1]._count,
      totalProducts: industryStats[2]._count,
      averageProductPrice: industryStats[2]._sum.price 
        ? industryStats[2]._sum.price / industryStats[2]._count 
        : 0,
    };
  }

  async getDashboardStats(storeId: string, period: { from: Date; to: Date }) {
    const [
      orderCount,
      revenue,
      customerGrowth,
      productPerformance,
    ] = await Promise.all([
      this.db.order.count({
        where: {
          storeId,
          createdAt: { gte: period.from, lte: period.to },
        },
      }),
      this.db.order.aggregate({
        where: {
          storeId,
          createdAt: { gte: period.from, lte: period.to },
        },
        _sum: { totalAmount: true },
      }),
      this.db.customer.count({
        where: {
          storeId,
          createdAt: { gte: period.from, lte: period.to },
        },
      }),
      this.db.orderItem.groupBy({
        by: ['productId'],
        where: {
          order: {
            storeId,
            createdAt: { gte: period.from, lte: period.to },
          },
        },
        _sum: { quantity: true },
        take: 10,
      }),
    ]);

    return {
      orders: orderCount,
      revenue: revenue._sum.totalAmount || 0,
      newCustomers: customerGrowth,
      topProducts: productPerformance,
    };
  }

  async getActivityFeed(storeId: string, limit = 20) {
    const [recentOrders, recentCustomers, recentProducts] = await Promise.all([
      this.db.order.findMany({
        where: { storeId },
        include: {
          customer: {
            select: { firstName: true, lastName: true, email: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: Math.ceil(limit / 3),
      }),
      this.db.customer.findMany({
        where: { storeId },
        orderBy: { createdAt: 'desc' },
        take: Math.ceil(limit / 3),
      }),
      this.db.product.findMany({
        where: { storeId },
        orderBy: { createdAt: 'desc' },
        take: Math.ceil(limit / 3),
      }),
    ]);

    const activityFeed = [
      ...recentOrders.map((order) => ({
        type: 'ORDER',
        title: `New order from ${order.customer?.firstName || 'Customer'}`,
        description: `Order #${order.orderNumber || order.id}`,
        amount: order.totalAmount,
        timestamp: order.createdAt,
      })),
      ...recentCustomers.map((customer) => ({
        type: 'CUSTOMER',
        title: 'New customer registered',
        description: `${customer.firstName} ${customer.lastName}`,
        timestamp: customer.createdAt,
      })),
      ...recentProducts.map((product) => ({
        type: 'PRODUCT',
        title: 'New product added',
        description: product.name,
        timestamp: product.createdAt,
      })),
    ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return activityFeed.slice(0, limit);
  }
}
