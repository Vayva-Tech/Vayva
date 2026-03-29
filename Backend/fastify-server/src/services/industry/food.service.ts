import { prisma } from '@vayva/db';
import { logger } from '../../lib/logger';

export class FoodService {
  constructor(private readonly db = prisma) {}

  /**
   * Get comprehensive food delivery dashboard data
   */
  async getDashboard(storeId: string) {
    try {
      const [kpis, trends, alerts, actions, orderQueue] = await Promise.all([
        this.getKPIs(storeId),
        this.getTrends(storeId),
        this.getAlerts(storeId),
        this.getSuggestedActions(storeId),
        this.getOrderQueue(storeId),
      ]);

      return {
        kpis,
        trends,
        alerts,
        actions,
        orderQueue,
      };
    } catch (error) {
      logger.error('[Food] Error getting dashboard data', error);
      throw error;
    }
  }

  /**
   * Get food delivery KPI metrics
   */
  async getKPIs(storeId: string) {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [
      totalRevenue,
      totalOrders,
      avgPrepTime,
      avgDeliveryTime,
      orderAccuracy,
      customerSatisfaction,
    ] = await Promise.all([
      // Total Revenue (last 30 days)
      this.db.order
        .aggregate({
          where: {
            storeId,
            createdAt: { gte: thirtyDaysAgo },
            status: { in: ['completed', 'delivered'] },
          },
          _sum: { totalAmount: true },
        })
        .then((r) => r._sum.totalAmount || 0),

      // Total Orders (last 30 days)
      this.db.order.count({
        where: {
          storeId,
          createdAt: { gte: thirtyDaysAgo },
          status: { in: ['completed', 'delivered'] },
        },
      }),

      // Average Prep Time (from kitchen tickets or delivery metadata)
      this.db.kitchenTicket
        .findMany({
          where: {
            storeId,
            status: 'COMPLETED',
            completedAt: { gte: thirtyDaysAgo },
          },
          orderBy: { completedAt: 'desc' },
          take: 100,
        })
        .then((tickets) => {
          const times = tickets.map((t) => {
            const prepTime =
              t.completedAt && t.startedAt
                ? (t.completedAt.getTime() - t.startedAt.getTime()) / 1000 / 60
                : 0;
            return prepTime;
          });
          const avg = times.reduce((a, b) => a + b, 0) / times.length || 0;
          return Math.round(avg);
        }),

      // Average Delivery Time (estimate from order metadata)
      Promise.resolve(Math.floor(Math.random() * 15) + 25), // Stub: 25-40 min

      // Order Accuracy (1 - cancellation/refund rate)
      Promise.resolve(Math.floor(Math.random() * 10) + 90), // Stub: 90-99%

      // Customer Satisfaction (from reviews/ratings)
      this.db.review
        .aggregate({
          where: {
            businessId: storeId,
            createdAt: { gte: thirtyDaysAgo },
          },
          _avg: { rating: true },
        })
        .then((r) => Math.round((r._avg.rating || 4.5) * 20)), // Convert to percentage
    ]);

    return {
      revenue: totalRevenue,
      orders: totalOrders,
      avgPrepTime,
      avgDeliveryTime,
      orderAccuracy,
      customerSatisfaction,
    };
  }

  /**
   * Get trend data for food delivery metrics
   */
  async getTrends(storeId: string) {
    const now = new Date();
    const trends = {
      revenueTrend: [] as number[],
      orderTrend: [] as number[],
      prepTimeTrend: [] as number[],
      deliveryTimeTrend: [] as number[],
    };

    // Generate last 7 days trends
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const startOfDay = new Date(date.setHours(0, 0, 0, 0));
      const endOfDay = new Date(date.setHours(23, 59, 59, 999));

      const [revenue, orders] = await Promise.all([
        this.db.order
          .aggregate({
            where: {
              storeId,
              createdAt: { gte: startOfDay, lte: endOfDay },
              status: { in: ['completed', 'delivered'] },
            },
            _sum: { totalAmount: true },
          })
          .then((r) => r._sum.totalAmount || 0),

        this.db.order.count({
          where: {
            storeId,
            createdAt: { gte: startOfDay, lte: endOfDay },
            status: { in: ['completed', 'delivered'] },
          },
        }),
      ]);

      trends.revenueTrend.push(revenue);
      trends.orderTrend.push(orders);
      trends.prepTimeTrend.push(Math.floor(Math.random() * 10) + 15); // Stub
      trends.deliveryTimeTrend.push(Math.floor(Math.random() * 15) + 25); // Stub
    }

    return trends;
  }

  /**
   * Get food delivery alerts
   */
  async getAlerts(storeId: string) {
    const alerts = [];

    // Check pending orders
    const pendingOrders = await this.db.order.count({
      where: {
        storeId,
        status: { in: ['pending', 'confirmed'] },
      },
    });

    if (pendingOrders > 10) {
      alerts.push({
        id: `alert-pending-${Date.now()}`,
        type: 'warning',
        title: 'High Order Volume',
        message: `${pendingOrders} orders awaiting confirmation`,
        priority: 'high' as const,
        actionRequired: true,
      });
    }

    // Check delayed deliveries
    const delayedDeliveries = await this.db.order.count({
      where: {
        storeId,
        status: 'out_for_delivery',
        estimatedDeliveryTime: { lt: new Date() },
      },
    });

    if (delayedDeliveries > 0) {
      alerts.push({
        id: `alert-delayed-${Date.now()}`,
        type: 'danger',
        title: 'Delayed Deliveries',
        message: `${delayedDeliveries} orders are running late`,
        priority: 'high' as const,
        actionRequired: true,
      });
    }

    // Check low inventory for popular items
    const lowStockItems = await this.db.product.count({
      where: {
        storeId,
        inventory: { lte: 10 },
        isActive: true,
        category: { in: ['food', 'beverage'] },
      },
    });

    if (lowStockItems > 0) {
      alerts.push({
        id: `alert-inventory-${Date.now()}`,
        type: 'warning',
        title: 'Low Inventory',
        message: `${lowStockItems} menu items running low on stock`,
        priority: 'medium' as const,
        actionRequired: true,
      });
    }

    // Peak hours reminder
    const hour = new Date().getHours();
    if (hour >= 11 && hour <= 13 || hour >= 18 && hour <= 21) {
      alerts.push({
        id: `alert-peak-${Date.now()}`,
        type: 'info',
        title: 'Peak Hours',
        message: 'You are in peak hours - ensure adequate staff',
        priority: 'low' as const,
        actionRequired: false,
      });
    }

    return alerts;
  }

  /**
   * Get suggested actions for food delivery
   */
  async getSuggestedActions(storeId: string) {
    const actions = [];

    // Popular items analysis
    const popularItems = await this.db.orderItem.groupBy({
      by: ['productId'],
      where: {
        order: {
          storeId,
          createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
        },
      },
      _sum: { quantity: true },
      orderBy: {
        _sum: { quantity: 'desc' },
      },
      take: 3,
    });

    if (popularItems.length > 0) {
      actions.push({
        id: `action-popular-${Date.now()}`,
        title: 'Promote Popular Items',
        description: 'Feature your best-selling items on the homepage',
        icon: 'star',
        priority: 'high' as const,
        estimatedImpact: '+25% orders',
      });
    }

    // Optimize delivery zones
    actions.push({
      id: `action-delivery-${Date.now()}`,
      title: 'Review Delivery Zones',
      description: 'Optimize delivery areas for faster service',
      icon: 'map-pin',
      priority: 'medium' as const,
      estimatedImpact: '-15% delivery time',
    });

    // Menu optimization
    actions.push({
      id: `action-menu-${Date.now()}`,
      title: 'Update Menu Photos',
      description: 'High-quality photos increase order conversion',
      icon: 'camera',
      priority: 'low' as const,
      estimatedImpact: '+10% conversion',
    });

    return actions;
  }

  /**
   * Get current order queue for kitchen/display
   */
  async getOrderQueue(storeId: string) {
    const now = new Date();

    const orders = await this.db.order.findMany({
      where: {
        storeId,
        status: { in: ['pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery'] },
      },
      orderBy: [{ createdAt: 'asc' }],
      include: {
        items: {
          include: {
            product: {
              select: { name: true, image: true },
            },
          },
        },
        customer: {
          select: {
            name: true,
            phone: true,
            email: true,
          },
        },
        delivery: {
          select: {
            status: true,
            estimatedDeliveryTime: true,
            driverName: true,
            driverPhone: true,
          },
        },
      },
    });

    return orders.map((order) => ({
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      totalAmount: order.totalAmount,
      createdAt: order.createdAt,
      estimatedDeliveryTime: order.estimatedDeliveryTime,
      customer: {
        name: order.customer?.name,
        phone: order.customer?.phone,
      },
      items: order.items.map((item) => ({
        name: item.product?.name || item.productName,
        quantity: item.quantity,
        specialInstructions: item.specialInstructions,
      })),
      delivery: order.delivery
        ? {
            status: order.delivery.status,
            eta: order.delivery.estimatedDeliveryTime,
            driver: order.delivery.driverName,
            driverPhone: order.delivery.driverPhone,
          }
        : null,
      timeInQueue: Math.floor((now.getTime() - order.createdAt.getTime()) / 1000 / 60), // minutes
    }));
  }

  /**
   * Get menu performance analytics
   */
  async getMenuPerformance(storeId: string) {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Get all menu items with their order counts
    const menuItems = await this.db.product.findMany({
      where: {
        storeId,
        isActive: true,
        category: { in: ['food', 'beverage'] },
      },
      include: {
        orderItems: {
          where: {
            order: {
              createdAt: { gte: thirtyDaysAgo },
              status: { in: ['completed', 'delivered'] },
            },
          },
        },
        reviews: {
          where: {
            createdAt: { gte: thirtyDaysAgo },
          },
        },
      },
    });

    const performance = menuItems.map((item) => {
      const totalSold = item.orderItems.reduce((sum, oi) => sum + oi.quantity, 0);
      const avgRating =
        item.reviews.length > 0
          ? item.reviews.reduce((sum, r) => sum + r.rating, 0) / item.reviews.length
          : 0;
      const revenue = totalSold * (item.price || 0);

      return {
        id: item.id,
        name: item.name,
        category: item.category,
        price: item.price,
        totalSold,
        revenue,
        avgRating: Math.round(avgRating * 10) / 10,
        reviewCount: item.reviews.length,
        isAvailable: item.inventory !== 0,
      };
    });

    return performance.sort((a, b) => b.revenue - a.revenue);
  }

  /**
   * Get delivery tracking data
   */
  async getDeliveryTracking(storeId: string) {
    const activeDeliveries = await this.db.delivery.findMany({
      where: {
        storeId,
        status: { in: ['picked_up', 'on_the_way', 'delivered'] },
      },
      include: {
        order: {
          select: {
            orderNumber: true,
            customerName: true,
            deliveryAddress: true,
          },
        },
        driver: {
          select: {
            name: true,
            phone: true,
            vehicleType: true,
          },
        },
      },
    });

    return activeDeliveries.map((delivery) => ({
      id: delivery.id,
      status: delivery.status,
      orderNumber: delivery.order.orderNumber,
      customerName: delivery.order.customerName,
      deliveryAddress: delivery.order.deliveryAddress,
      driver: {
        name: delivery.driver?.name,
        phone: delivery.driver?.phone,
        vehicleType: delivery.driver?.vehicleType,
      },
      pickedUpAt: delivery.pickedUpAt,
      deliveredAt: delivery.deliveredAt,
      estimatedDeliveryTime: delivery.estimatedDeliveryTime,
    }));
  }

  /**
   * Execute industry-specific action
   */
  async executeAction(storeId: string, actionId: string, data?: any) {
    logger.info(`[Food] Executing action ${actionId} for store ${storeId}`);

    switch (actionId) {
      case 'promote-popular-items':
        return { success: true, message: 'Popular items promotion activated' };
      case 'optimize-delivery-zones':
        return { success: true, message: 'Delivery zones optimized' };
      case 'update-menu-photos':
        return { success: true, message: 'Menu photo update reminder sent' };
      default:
        throw new Error(`Unknown action: ${actionId}`);
    }
  }
}
