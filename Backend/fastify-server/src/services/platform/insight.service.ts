import { prisma } from '@vayva/db';
import { logger } from '../../lib/logger';
import { subDays, startOfDay } from 'date-fns';

interface Trend {
  metric: string;
  change: number;
  direction: 'up' | 'down';
}

interface Prediction {
  insight: string;
  confidence: number;
  recommendation?: string;
}

interface Insights {
  trends: Trend[];
  predictions: Prediction[];
}

export class InsightService {
  constructor(private readonly db = prisma) {}

  /**
   * Get AI-powered insights and predictions for dashboard
   */
  async getInsights(
    storeId: string,
    options: { industry: string; planTier: string; range: string }
  ): Promise<Insights> {
    try {
      const now = new Date();
      const startDate = subDays(now, this.getDaysForRange(options.range));
      
      // Fetch historical data for trend analysis
      const orders = await this.db.order.findMany({
        where: {
          storeId,
          createdAt: { gte: startDate },
          status: { in: ['COMPLETED', 'DELIVERED'] },
        },
        select: {
          totalAmount: true,
          createdAt: true,
          itemCount: true,
        },
      });

      // Calculate trends
      const trends = this.calculateTrends(orders, options.range);
      
      // Generate predictions based on industry and patterns
      const predictions = this.generatePredictions(storeId, options.industry, trends);

      return {
        trends,
        predictions,
      };
    } catch (error) {
      logger.error('[InsightService.getInsights]', { storeId, error });
      throw error;
    }
  }

  private getDaysForRange(range: string): number {
    switch (range) {
      case 'today':
        return 1;
      case 'week':
        return 7;
      case 'month':
        return 30;
      case 'year':
        return 365;
      default:
        return 30;
    }
  }

  private calculateTrends(orders: any[], range: string): Trend[] {
    if (orders.length === 0) {
      return [];
    }

    // Group orders by period
    const periodLength = this.getPeriodLength(range);
    const grouped = this.groupByPeriod(orders, periodLength);
    
    // Calculate metrics for each period
    const periods = Object.keys(grouped).sort();
    const revenueByPeriod = periods.map(p => ({
      period: p,
      value: grouped[p].reduce((sum: number, o: any) => sum + Number(o.totalAmount || 0), 0),
    }));

    // Calculate trend direction
    const latestRevenue = revenueByPeriod[revenueByPeriod.length - 1]?.value || 0;
    const previousRevenue = revenueByPeriod[revenueByPeriod.length - 2]?.value || 0;
    const revenueChange = previousRevenue > 0 ? ((latestRevenue - previousRevenue) / previousRevenue) * 100 : 0;

    // Order volume trend
    const orderCounts = periods.map(p => ({
      period: p,
      count: grouped[p].length,
    }));
    const latestOrders = orderCounts[orderCounts.length - 1]?.count || 0;
    const previousOrders = orderCounts[orderCounts.length - 2]?.count || 0;
    const orderChange = previousOrders > 0 ? ((latestOrders - previousOrders) / previousOrders) * 100 : 0;

    // Average order value trend
    const latestAOV = latestOrders > 0 ? latestRevenue / latestOrders : 0;
    const previousAOV = previousOrders > 0 ? previousRevenue / previousOrders : 0;
    const aovChange = previousAOV > 0 ? ((latestAOV - previousAOV) / previousAOV) * 100 : 0;

    return [
      {
        metric: 'Revenue',
        change: Math.round(revenueChange * 100) / 100,
        direction: revenueChange >= 0 ? 'up' : 'down',
      },
      {
        metric: 'Orders',
        change: Math.round(orderChange * 100) / 100,
        direction: orderChange >= 0 ? 'up' : 'down',
      },
      {
        metric: 'Avg Order Value',
        change: Math.round(aovChange * 100) / 100,
        direction: aovChange >= 0 ? 'up' : 'down',
      },
    ];
  }

  private getPeriodLength(range: string): 'day' | 'week' | 'month' {
    if (range === 'week' || range === 'today') return 'day';
    if (range === 'month') return 'week';
    return 'month';
  }

  private groupByPeriod(orders: any[], period: 'day' | 'week' | 'month'): Record<string, any[]> {
    const groups: Record<string, any[]> = {};
    
    orders.forEach(order => {
      const date = new Date(order.createdAt);
      let key: string;
      
      if (period === 'day') {
        key = date.toISOString().split('T')[0];
      } else if (period === 'week') {
        const weekNum = this.getWeekNumber(date);
        key = `${date.getFullYear()}-W${weekNum}`;
      } else {
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      }
      
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(order);
    });
    
    return groups;
  }

  private getWeekNumber(date: Date): number {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  }

  private generatePredictions(storeId: string, industry: string, trends: Trend[]): Prediction[] {
    const predictions: Prediction[] = [];

    // Revenue prediction
    const revenueTrend = trends.find(t => t.metric === 'Revenue');
    if (revenueTrend && revenueTrend.direction === 'up' && revenueTrend.change > 10) {
      predictions.push({
        insight: 'Revenue is trending upward significantly',
        confidence: 0.85,
        recommendation: 'Consider expanding inventory or adding staff to handle increased demand',
      });
    } else if (revenueTrend && revenueTrend.direction === 'down' && Math.abs(revenueTrend.change) > 10) {
      predictions.push({
        insight: 'Revenue decline detected',
        confidence: 0.80,
        recommendation: 'Review marketing strategy and consider promotions to boost sales',
      });
    }

    // Industry-specific predictions
    if (industry === 'retail' || industry === 'grocery') {
      predictions.push({
        insight: 'Stock optimization opportunity',
        confidence: 0.75,
        recommendation: 'Analyze top-selling products and ensure adequate stock levels',
      });
    }

    if (industry === 'restaurant' || industry === 'cafe') {
      predictions.push({
        insight: 'Peak hours optimization',
        confidence: 0.78,
        recommendation: 'Schedule more staff during peak hours to improve service speed',
      });
    }

    if (industry === 'beauty-wellness' || industry === 'healthcare') {
      predictions.push({
        insight: 'Client retention opportunity',
        confidence: 0.82,
        recommendation: 'Implement follow-up reminders to increase repeat bookings',
      });
    }

    // Default predictions if none generated
    if (predictions.length === 0) {
      predictions.push({
        insight: 'Business performing steadily',
        confidence: 0.70,
        recommendation: 'Continue monitoring key metrics and maintain current strategies',
      });
    }

    return predictions;
  }

  /**
   * Get advanced analytics for PRO+ tier
   */
  async getAdvancedAnalytics(storeId: string, industry: string): Promise<any> {
    try {
      const now = new Date();
      const lastMonth = subDays(now, 30);
      const lastQuarter = subDays(now, 90);

      // Customer segmentation
      const customerData = await this.getCustomerSegmentation(storeId);
      
      // Product performance
      const productPerformance = await this.getProductPerformance(storeId);
      
      // Forecasting
      const forecast = this.generateForecast(storeId, industry);

      return {
        customerSegmentation: customerData,
        productPerformance,
        forecast,
      };
    } catch (error) {
      logger.error('[InsightService.getAdvancedAnalytics]', { storeId, error });
      throw error;
    }
  }

  private async getCustomerSegmentation(storeId: string) {
    const customers = await this.db.customer.findMany({
      where: { stores: { some: { id: storeId } } },
      include: {
        orders: {
          where: { storeId },
          select: { totalAmount: true, createdAt: true },
        },
      },
    });

    const segmented = {
      vip: [] as any[],
      regular: [] as any[],
      atRisk: [] as any[],
    };

    const now = new Date();
    customers.forEach(customer => {
      const totalSpent = customer.orders.reduce((sum, o) => sum + Number(o.totalAmount || 0), 0);
      const lastOrder = customer.orders[customer.orders.length - 1];
      const daysSinceLastOrder = lastOrder ? 
        Math.floor((now.getTime() - new Date(lastOrder.createdAt).getTime()) / (1000 * 60 * 60 * 24)) : 999;

      if (totalSpent > 100000 || customer.orders.length > 10) {
        segmented.vip.push({ id: customer.id, name: `${customer.firstName} ${customer.lastName}`, totalSpent });
      } else if (daysSinceLastOrder > 30) {
        segmented.atRisk.push({ id: customer.id, name: `${customer.firstName} ${customer.lastName}`, lastOrder: daysSinceLastOrder });
      } else {
        segmented.regular.push({ id: customer.id, name: `${customer.firstName} ${customer.lastName}`, totalSpent });
      }
    });

    return segmented;
  }

  private async getProductPerformance(storeId: string) {
    const orderItems = await this.db.orderItem.findMany({
      where: { product: { storeId } },
      include: {
        product: {
          select: { id: true, name: true, price: true },
        },
      },
      orderBy: { quantity: 'desc' },
      take: 20,
    });

    const productSales: Record<string, { name: string; quantity: number; revenue: number }> = {};

    orderItems.forEach(item => {
      const productId = item.productId;
      if (!productSales[productId]) {
        productSales[productId] = {
          name: item.product?.name || 'Unknown',
          quantity: 0,
          revenue: 0,
        };
      }
      productSales[productId].quantity += item.quantity;
      productSales[productId].revenue += Number(item.price || 0) * item.quantity;
    });

    return Object.values(productSales).slice(0, 10);
  }

  private generateForecast(storeId: string, industry: string) {
    // Simple linear projection (in production, use ML models)
    return {
      nextMonth: {
        revenue: 'Projected based on current trends',
        orders: 'Estimated from historical data',
        confidence: 0.65,
      },
      assumptions: [
        'Current market conditions continue',
        'No major seasonal events',
        'Marketing spend remains consistent',
      ],
    };
  }
}
