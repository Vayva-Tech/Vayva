import { prisma } from '@vayva/db';
import { logger } from '../lib/logger';
import { startOfDay, subDays } from 'date-fns';

interface DashboardOverview {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  conversionRate: number;
  revenueGrowth: number;
  ordersGrowth: number;
}

interface ChartDataPoint {
  date: string;
  value: number;
}

export class DashboardService {
  constructor(private readonly db = prisma) {}

  /**
   * Get dashboard overview metrics
   */
  async getOverview(storeId: string, period: '7d' | '30d' | '90d' = '30d'): Promise<DashboardOverview> {
    try {
      const days = parseInt(period.replace('d', ''), 10);
      const startDate = startOfDay(subDays(new Date(), days));

      // Get orders for period
      const orders = await this.db.order.findMany({
        where: {
          storeId,
          createdAt: { gte: startDate },
        },
        select: {
          id: true,
          total: true,
          status: true,
          customerId: true,
          createdAt: true,
        },
      });

      // Calculate metrics
      const totalRevenue = orders.reduce((sum, order) => sum + Number(order.total || 0), 0);
      const totalOrders = orders.length;
      const uniqueCustomers = new Set(orders.map(o => o.customerId)).size;

      // Calculate conversion rate (simplified - would need session data for accuracy)
      const conversionRate = totalOrders > 0 ? (uniqueCustomers / totalOrders) * 100 : 0;

      // Calculate growth vs previous period
      const previousStartDate = startOfDay(subDays(startDate, days));
      const previousOrders = await this.db.order.count({
        where: {
          storeId,
          createdAt: {
            gte: previousStartDate,
            lt: startDate,
          },
        },
      });

      const previousRevenueResult = await this.db.order.aggregate({
        where: {
          storeId,
          createdAt: {
            gte: previousStartDate,
            lt: startDate,
          },
        },
        _sum: { total: true },
      });
      const previousRevenue = Number(previousRevenueResult._sum.total || 0);

      const revenueGrowth = previousRevenue > 0 
        ? ((totalRevenue - previousRevenue) / previousRevenue) * 100 
        : 0;
      
      const ordersGrowth = previousOrders > 0 
        ? ((totalOrders - previousOrders) / previousOrders) * 100 
        : 0;

      return {
        totalRevenue,
        totalOrders,
        totalCustomers: uniqueCustomers,
        conversionRate,
        revenueGrowth,
        ordersGrowth,
      };
    } catch (error) {
      logger.error('[DashboardService.getOverview]', { storeId, period, error });
      throw error;
    }
  }

  /**
   * Get revenue chart data
   */
  async getRevenueChartData(
    storeId: string,
    period: '7d' | '30d' | '90d' = '30d'
  ): Promise<ChartDataPoint[]> {
    try {
      const days = parseInt(period.replace('d', ''), 10);
      const startDate = startOfDay(subDays(new Date(), days));

      const orders = await this.db.order.findMany({
        where: {
          storeId,
          createdAt: { gte: startDate },
        },
        select: {
          total: true,
          createdAt: true,
        },
      });

      // Group by date
      const chartData: Record<string, number> = {};
      
      orders.forEach(order => {
        const date = order.createdAt.toISOString().split('T')[0];
        chartData[date] = (chartData[date] || 0) + Number(order.total || 0);
      });

      // Convert to array and sort by date
      return Object.entries(chartData)
        .map(([date, value]) => ({ date, value }))
        .sort((a, b) => a.date.localeCompare(b.date));
    } catch (error) {
      logger.error('[DashboardService.getRevenueChartData]', { storeId, error });
      throw error;
    }
  }

  /**
   * Get recent orders
   */
  async getRecentOrders(storeId: string, limit = 10) {
    try {
      const orders = await this.db.order.findMany({
        where: { storeId },
        orderBy: { createdAt: 'desc' },
        take: limit,
        include: {
          customer: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      });

      return orders;
    } catch (error) {
      logger.error('[DashboardService.getRecentOrders]', { storeId, error });
      throw error;
    }
  }

  /**
   * Get top products
   */
  async getTopProducts(storeId: string, limit = 10) {
    try {
      const orderItems = await this.db.orderItem.findMany({
        where: {
          product: {
            storeId,
          },
        },
        include: {
          product: {
            select: {
              id: true,
              title: true,
              images: true,
            },
          },
        },
        orderBy: { quantity: 'desc' },
        take: limit,
      });

      // Aggregate by product
      const productSales: Record<string, any> = {};
      
      orderItems.forEach(item => {
        const productId = item.productId;
        if (!productSales[productId]) {
          productSales[productId] = {
            product: item.product,
            quantitySold: 0,
            revenue: 0,
          };
        }
        productSales[productId].quantitySold += item.quantity;
        productSales[productId].revenue += Number(item.price || 0) * item.quantity;
      });

      return Object.values(productSales).sort((a, b) => b.revenue - a.revenue);
    } catch (error) {
      logger.error('[DashboardService.getTopProducts]', { storeId, error });
      throw error;
    }
  }
}
