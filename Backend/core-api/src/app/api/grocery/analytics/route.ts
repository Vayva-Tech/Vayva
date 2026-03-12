import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI, type APIContext } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { logger, standardHeaders } from "@vayva/shared";

export const GET = withVayvaAPI(
  PERMISSIONS.ANALYTICS_VIEW,
  async (req: NextRequest, { storeId, correlationId }: APIContext) => {
    const requestId = correlationId;
    try {
      const { searchParams } = new URL(req.url);
      const period = searchParams.get('period') || 'month'; // day, week, month, quarter, year
      const comparePeriod = searchParams.get('compare') === 'true';
      
      // Calculate date ranges
      const now = new Date();
      let startDate: Date, comparisonStartDate: Date, comparisonEndDate: Date;
      
      switch (period) {
        case 'day':
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          comparisonStartDate = new Date(startDate.getTime() - 24 * 60 * 60 * 1000);
          comparisonEndDate = startDate;
          break;
        case 'week':
          const dayOfWeek = now.getDay();
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - dayOfWeek);
          comparisonStartDate = new Date(startDate.getTime() - 7 * 24 * 60 * 60 * 1000);
          comparisonEndDate = startDate;
          break;
        case 'month':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          comparisonStartDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
          comparisonEndDate = startDate;
          break;
        case 'quarter':
          const quarterStartMonth = Math.floor(now.getMonth() / 3) * 3;
          startDate = new Date(now.getFullYear(), quarterStartMonth, 1);
          comparisonStartDate = new Date(now.getFullYear(), quarterStartMonth - 3, 1);
          comparisonEndDate = startDate;
          break;
        case 'year':
        default:
          startDate = new Date(now.getFullYear(), 0, 1);
          comparisonStartDate = new Date(now.getFullYear() - 1, 0, 1);
          comparisonEndDate = startDate;
          break;
      }

      // Fetch all required data in parallel
      const [
        salesData,
        inventoryData,
        orderData,
        customerData,
        categoryData,
        supplierData
      ] = await Promise.all([
        this.getSalesAnalytics(storeId, startDate, now, comparisonStartDate, comparisonEndDate),
        this.getInventoryAnalytics(storeId, startDate, now),
        this.getOrderAnalytics(storeId, startDate, now),
        this.getCustomerAnalytics(storeId, startDate, now),
        this.getCategoryAnalytics(storeId, startDate, now),
        this.getSupplierAnalytics(storeId, startDate, now),
      ]);

      // Combine all analytics
      const analytics = {
        period,
        timeframe: {
          current: { start: startDate, end: now },
          previous: { start: comparisonStartDate, end: comparisonEndDate },
        },
        overview: {
          totalRevenue: salesData.current,
          revenueChange: salesData.change,
          revenueChangePercent: salesData.changePercent,
          totalOrders: orderData.total,
          orderGrowth: orderData.growth,
          averageOrderValue: orderData.averageValue,
          conversionRate: customerData.conversionRate,
        },
        sales: {
          revenue: salesData,
          orders: orderData,
          customers: customerData,
        },
        inventory: {
          ...inventoryData,
          stockoutRate: inventoryData.outOfStockItems > 0 
            ? Math.round((inventoryData.outOfStockItems / inventoryData.totalItems) * 10000) / 100
            : 0,
        },
        categories: categoryData,
        suppliers: supplierData,
        trends: await this.generateTrends(storeId, period),
        insights: this.generateInsights(salesData, inventoryData, orderData, customerData),
      };

      return NextResponse.json(
        { data: analytics },
        { headers: standardHeaders(requestId) }
      );
    } catch (error: unknown) {
      logger.error("[GROCERY_ANALYTICS_GET]", { error, storeId });
      return NextResponse.json(
        { error: "Failed to fetch analytics" },
        { status: 500, headers: standardHeaders(requestId) }
      );
    }
  }
);

// Sales analytics
async function getSalesAnalytics(storeId: string, startDate: Date, endDate: Date, compStart: Date, compEnd: Date) {
  const [currentSales, previousSales] = await Promise.all([
    prisma.groceryOrder.aggregate({
      where: {
        storeId,
        createdAt: { gte: startDate, lte: endDate },
        status: { not: "cancelled" },
      },
      _sum: { totalAmount: true },
    }),
    prisma.groceryOrder.aggregate({
      where: {
        storeId,
        createdAt: { gte: compStart, lte: compEnd },
        status: { not: "cancelled" },
      },
      _sum: { totalAmount: true },
    }),
  ]);

  const current = currentSales._sum.totalAmount || 0;
  const previous = previousSales._sum.totalAmount || 0;
  const change = current - previous;
  const changePercent = previous > 0 ? Math.round((change / previous) * 10000) / 100 : 0;

  return { current, previous, change, changePercent };
}

// Inventory analytics
async function getInventoryAnalytics(storeId: string, startDate: Date, endDate: Date) {
  const products = await prisma.groceryProduct.findMany({
    where: { storeId },
  });

  const totalItems = products.length;
  const inStockItems = products.filter(p => p.status === "in_stock").length;
  const lowStockItems = products.filter(p => p.status === "low_stock").length;
  const outOfStockItems = products.filter(p => p.status === "out_of_stock").length;
  
  const totalInventoryValue = products.reduce((sum, p) => sum + (p.currentStock * p.costPrice), 0);
  const stockTurnoverRate = products.length > 0 
    ? Math.round(products.reduce((sum, p) => sum + (p.currentStock / (p.minimumStock + 1)), 0) / products.length * 100) / 100
    : 0;

  return {
    totalItems,
    inStockItems,
    lowStockItems,
    outOfStockItems,
    totalInventoryValue: Math.round(totalInventoryValue * 100) / 100,
    stockTurnoverRate,
  };
}

// Order analytics
async function getOrderAnalytics(storeId: string, startDate: Date, endDate: Date) {
  const [orders, fulfilledOrders] = await Promise.all([
    prisma.groceryOrder.findMany({
      where: {
        storeId,
        createdAt: { gte: startDate, lte: endDate },
      },
    }),
    prisma.groceryOrder.findMany({
      where: {
        storeId,
        createdAt: { gte: startDate, lte: endDate },
        status: "delivered",
      },
    }),
  ]);

  const total = orders.length;
  const fulfilled = fulfilledOrders.length;
  const fulfillmentRate = total > 0 ? Math.round((fulfilled / total) * 10000) / 100 : 0;
  
  const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
  const averageValue = total > 0 ? Math.round(totalRevenue / total * 100) / 100 : 0;

  return {
    total,
    fulfilled,
    fulfillmentRate,
    averageValue,
    totalRevenue: Math.round(totalRevenue * 100) / 100,
    growth: total, // Simplified growth metric
  };
}

// Customer analytics
async function getCustomerAnalytics(storeId: string, startDate: Date, endDate: Date) {
  const [customers, newCustomers, orders] = await Promise.all([
    prisma.user.count({ where: { storeId } }),
    prisma.user.count({
      where: { 
        storeId, 
        createdAt: { gte: startDate, lte: endDate },
      },
    }),
    prisma.groceryOrder.count({
      where: {
        storeId,
        createdAt: { gte: startDate, lte: endDate },
      },
    }),
  ]);

  const conversionRate = customers > 0 ? Math.round((orders / customers) * 10000) / 100 : 0;

  return {
    totalCustomers: customers,
    newCustomers,
    orders,
    conversionRate,
  };
}

// Category analytics
async function getCategoryAnalytics(storeId: string, startDate: Date, endDate: Date) {
  const categories = await prisma.groceryCategory.findMany({
    where: { storeId, status: "active" },
    include: {
      _count: {
        select: {
          products: true,
        },
      },
    },
  });

  // Mock category performance data
  return categories.map(category => ({
    id: category.id,
    name: category.name,
    productCount: category._count.products,
    revenue: Math.floor(Math.random() * 50000) + 10000,
    growth: Math.floor(Math.random() * 30) - 10, // -10% to +20%
  }));
}

// Supplier analytics
async function getSupplierAnalytics(storeId: string, startDate: Date, endDate: Date) {
  const suppliers = await prisma.grocerySupplier.findMany({
    where: { storeId, status: "active" },
  });

  // Mock supplier performance data
  return suppliers.map(supplier => ({
    id: supplier.id,
    name: supplier.name,
    orderCount: Math.floor(Math.random() * 50) + 10,
    onTimeRate: Math.floor(Math.random() * 20) + 80, // 80-100%
    qualityScore: Math.floor(Math.random() * 200) / 100 + 3, // 3.0-5.0
  }));
}

// Generate trends data
async function generateTrends(storeId: string, period: string) {
  // Mock trend data - would connect to actual time-series data
  return {
    revenue: [45000, 48000, 52000, 49000, 55000],
    orders: [1200, 1250, 1320, 1280, 1400],
    customers: [850, 870, 920, 890, 950],
    inventory: [1200, 1180, 1250, 1220, 1300],
  };
}

// Generate business insights
function generateInsights(sales: any, inventory: any, orders: any, customers: any): string[] {
  const insights: string[] = [];
  
  if (sales.changePercent > 10) {
    insights.push("Strong sales growth - consider expanding popular product categories");
  } else if (sales.changePercent < -5) {
    insights.push("Sales declining - investigate pricing or marketing strategies");
  }
  
  if (inventory.outOfStockItems > inventory.totalItems * 0.1) {
    insights.push("High stockout rate - improve inventory forecasting and reorder processes");
  }
  
  if (orders.fulfillmentRate < 95) {
    insights.push("Order fulfillment below 95% - review logistics and processing efficiency");
  }
  
  if (customers.conversionRate < 2) {
    insights.push("Low conversion rate - optimize website UX and checkout process");
  }
  
  return insights.length > 0 ? insights : ["Business metrics looking healthy - maintain current operations"];
}