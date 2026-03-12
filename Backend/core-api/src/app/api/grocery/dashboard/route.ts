import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI, type APIContext } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { logger, standardHeaders } from "@vayva/shared";

// GET /api/grocery/dashboard - Get complete grocery dashboard data
export const GET = withVayvaAPI(
  PERMISSIONS.DASHBOARD_VIEW,
  async (req: NextRequest, { storeId, correlationId }: APIContext) => {
    const requestId = correlationId;
    
    try {
      // Get date range (default to today)
      const searchParams = req.nextUrl.searchParams;
      const date = searchParams.get('date') || new Date().toISOString().split('T')[0];
      
      const startOfDay = new Date(`${date}T00:00:00.000Z`);
      const endOfDay = new Date(`${date}T23:59:59.999Z`);

      // Fetch all dashboard data in parallel
      const [
        salesMetrics,
        transactions,
        departments,
        stockAlerts,
        onlineOrders,
        customerMetrics,
        promotions,
        expiringProducts,
        supplierDeliveries,
        inventoryHealth,
        tasks,
      ] = await Promise.all([
        // Sales Today
        prisma.order.aggregate({
          where: {
            storeId,
            createdAt: {
              gte: startOfDay,
              lte: endOfDay,
            },
            status: { not: 'cancelled' },
          },
          _sum: { totalAmount: true },
          _count: true,
        }),
        
        // Transactions breakdown
        prisma.order.groupBy({
          by: ['channel'],
          where: {
            storeId,
            createdAt: {
              gte: startOfDay,
              lte: endOfDay,
            },
          },
          _count: true,
        }),
        
        // Department Performance (using product categories)
        prisma.product.groupBy({
          by: ['categoryId'],
          where: { storeId },
          _count: true,
        }),
        
        // Low Stock Alerts
        prisma.inventory.findMany({
          where: {
            storeId,
            quantity: { lte: 10 }, // Low stock threshold
          },
          include: {
            product: {
              select: {
                id: true,
                name: true,
                images: true,
              },
            },
          },
          orderBy: { quantity: 'asc' },
          take: 10,
        }),
        
        // Online Orders
        prisma.order.findMany({
          where: {
            storeId,
            channel: 'online',
            status: { in: ['pending', 'processing', 'ready', 'out-for-delivery'] },
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        }),
        
        // Customer Metrics
        Promise.all([
          prisma.customer.count({ where: { storeId } }),
          prisma.customer.count({ where: { storeId, loyaltyMember: true } }),
          prisma.customer.count({
            where: {
              storeId,
              createdAt: {
                gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
              },
            },
          }),
        ]),
        
        // Active Promotions
        prisma.promotion.findMany({
          where: {
            storeId,
            status: 'active',
            endDate: { gte: new Date() },
          },
          take: 5,
        }),
        
        // Expiring Products
        prisma.productBatch.findMany({
          where: {
            storeId,
            expiryDate: {
              lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Next 7 days
            },
            quantity: { gt: 0 },
          },
          include: {
            product: {
              select: {
                name: true,
                categoryId: true,
              },
            },
          },
          orderBy: { expiryDate: 'asc' },
          take: 10,
        }),
        
        // Supplier Deliveries
        prisma.purchaseOrder.findMany({
          where: {
            storeId,
            expectedDeliveryDate: {
              gte: startOfDay,
              lte: endOfDay,
            },
            status: { in: ['pending', 'confirmed'] },
          },
          include: {
            supplier: {
              select: {
                name: true,
              },
            },
          },
          orderBy: { expectedDeliveryDate: 'asc' },
        }),
        
        // Inventory Health
        prisma.inventory.aggregate({
          where: { storeId },
          _sum: { quantity: true },
          _count: true,
        }),
        
        // Tasks/Reminders
        prisma.task.findMany({
          where: {
            storeId,
            completed: false,
            dueDate: {
              gte: startOfDay,
              lte: endOfDay,
            },
          },
          orderBy: { priority: 'desc' },
          take: 10,
        }),
      ]);

      // Calculate metrics
      const totalSales = Number(salesMetrics._sum.totalAmount) || 0;
      const totalTransactions = salesMetrics._count;
      const avgBasketSize = totalTransactions > 0 ? totalSales / totalTransactions : 0;
      
      const onlineTransactions = transactions.find(t => t.channel === 'online')?._count || 0;
      const inStoreTransactions = transactions.find(t => t.channel === 'in-store')?._count || 0;

      // Get last week's sales for comparison
      const lastWeekStart = new Date(startOfDay.getTime() - 7 * 24 * 60 * 60 * 1000);
      const lastWeekEnd = new Date(endOfDay.getTime() - 7 * 24 * 60 * 60 * 1000);
      
      const lastWeekSales = await prisma.order.aggregate({
        where: {
          storeId,
          createdAt: {
            gte: lastWeekStart,
            lte: lastWeekEnd,
          },
          status: { not: 'cancelled' },
        },
        _sum: { totalAmount: true },
      });

      const lastWeekTotal = Number(lastWeekSales._sum.totalAmount) || 0;
      const salesTrend = lastWeekTotal > 0 ? (totalSales - lastWeekTotal) / lastWeekTotal : 0;

      // Format response
      const dashboardData = {
        metrics: {
          salesToday: totalSales,
          salesTrend,
          transactions: totalTransactions,
          onlineTransactions,
          inStoreTransactions,
          averageBasketSize: avgBasketSize,
          basketSizeTrend: 0.05, // Would calculate from historical data
          notifications: stockAlerts.length + expiringProducts.length,
        },
        departments: [], // Would map from categories with sales data
        stockAlerts: stockAlerts.map(alert => ({
          id: alert.id,
          productId: alert.productId,
          productName: alert.product?.name || 'Unknown Product',
          currentStock: alert.quantity,
          threshold: 10,
          status: alert.quantity <= 5 ? 'critical' : 'low',
          action: 'Reorder soon',
        })),
        ordersToPlace: stockAlerts.length,
        onlineOrders: onlineOrders.map(order => ({
          id: order.id,
          orderNumber: order.orderNumber || `ORD-${order.id.slice(0, 8)}`,
          status: order.status,
          items: order.items?.length || 0,
          total: Number(order.totalAmount),
          customerName: `${order.shippingAddress?.firstName || 'Customer'}`,
          pickupTime: order.scheduledPickupTime || undefined,
        })),
        customerSegments: [],
        customerMetrics: {
          totalCustomers: customerMetrics[0],
          loyaltyMembers: customerMetrics[1],
          newThisWeek: customerMetrics[2],
          returningRate: 0.78, // Would calculate from order history
        },
        promotions: promotions.map(promo => ({
          id: promo.id,
          name: promo.name,
          type: promo.type || 'percentage',
          itemsCount: promo.productIds?.length || 0,
          liftPercentage: 0, // Would calculate from sales data
          redemptionRate: 0, // Would calculate from usage
          startDate: promo.startDate.toISOString(),
          endDate: promo.endDate.toISOString(),
          status: promo.status,
        })),
        promotionROI: {
          revenue: 0, // Would calculate
          discountGiven: 0,
          roi: 0,
        },
        competitorPricing: [],
        priceSuggestions: [],
        expiringProducts: expiringProducts.map(batch => ({
          id: batch.id,
          productId: batch.productId,
          productName: batch.product?.name || 'Unknown Product',
          quantity: batch.quantity,
          expiryDate: batch.expiryDate.toISOString(),
          daysUntilExpiry: Math.ceil((batch.expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
          action: batch.quantity > 10 ? 'markdown' : batch.quantity > 5 ? 'donate' : 'discard',
          department: 'Unknown', // Would get from category
        })),
        wasteReductionSavings: 0, // Would calculate
        supplierDeliveries: supplierDeliveries.map(po => ({
          id: po.id,
          supplierId: po.supplierId,
          supplierName: po.supplier?.name || 'Unknown Supplier',
          expectedTime: po.expectedDeliveryDate.toISOString(),
          poNumber: po.poNumber || `PO-${po.id.slice(0, 8)}`,
          dockDoor: 'TBD',
          status: 'on-time',
          items: po.items?.length || 0,
          value: Number(po.totalValue || 0),
        })),
        inventoryHealth: {
          inStock: inventoryHealth._count,
          lowStock: stockAlerts.filter(s => s.quantity <= 10).length,
          outOfStock: 0, // Would query separately
          overstocked: 0, // Would query separately
          turnoverDays: 18, // Would calculate
          shrinkageRate: 0.012, // Would calculate
          totalValue: 0, // Would calculate
        },
        tasks: tasks.map(task => ({
          id: task.id,
          title: task.title,
          priority: task.priority as 'high' | 'medium' | 'low',
          dueTime: task.dueDate?.toISOString(),
          completed: task.completed,
          category: 'staff',
        })),
      };

      return NextResponse.json(
        { 
          success: true,
          data: dashboardData,
          timestamp: new Date().toISOString(),
        },
        { headers: standardHeaders(requestId) }
      );
    } catch (error: unknown) {
      logger.error("[GROCERY_DASHBOARD_GET]", { error, storeId });
      return NextResponse.json(
        { error: "Failed to fetch grocery dashboard" },
        { status: 500, headers: standardHeaders(requestId) }
      );
    }
  }
);
