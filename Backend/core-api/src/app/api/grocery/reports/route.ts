import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI, type APIContext } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { logger, standardHeaders } from "@vayva/shared";

export const GET = withVayvaAPI(
  PERMISSIONS.REPORTS_VIEW,
  async (req: NextRequest, { storeId, correlationId }: APIContext) => {
    const requestId = correlationId;
    try {
      const { searchParams } = new URL(req.url);
      const reportType = searchParams.get('type') || 'sales';
      const period = searchParams.get('period') || 'month';
      const format = searchParams.get('format') || 'json';

      // Calculate date range
      const now = new Date();
      let startDate: Date;
      
      switch (period) {
        case 'week':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        case 'quarter': {
          const quarterStartMonth = Math.floor(now.getMonth() / 3) * 3;
          startDate = new Date(now.getFullYear(), quarterStartMonth, 1);
          break;
        }
        case 'year':
          startDate = new Date(now.getFullYear(), 0, 1);
          break;
        default:
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      }

      let reportData: any;

      switch (reportType) {
        case 'sales':
          reportData = await this.generateSalesReport(storeId, startDate, now);
          break;
        case 'inventory':
          reportData = await this.generateInventoryReport(storeId, startDate, now);
          break;
        case 'orders':
          reportData = await this.generateOrderReport(storeId, startDate, now);
          break;
        case 'customers':
          reportData = await this.generateCustomerReport(storeId, startDate, now);
          break;
        default:
          return NextResponse.json(
            { error: "Invalid report type" },
            { status: 400, headers: standardHeaders(requestId) }
          );
      }

      // Format response based on requested format
      if (format === 'csv') {
        const csvData = this.convertToCSV(reportData);
        return new NextResponse(csvData, {
          headers: {
            ...standardHeaders(requestId),
            'Content-Type': 'text/csv',
            'Content-Disposition': `attachment; filename="${reportType}-report-${new Date().toISOString().split('T')[0]}.csv"`,
          },
        });
      }

      return NextResponse.json(
        {
          data: reportData,
          meta: {
            reportType,
            period,
            generatedAt: new Date().toISOString(),
            format,
          },
        },
        { headers: standardHeaders(requestId) }
      );
    } catch (error: unknown) {
      logger.error("[GROCERY_REPORTS_GET]", { error, storeId });
      return NextResponse.json(
        { error: "Failed to generate report" },
        { status: 500, headers: standardHeaders(requestId) }
      );
    }
  }
);

// Generate sales report
async function _generateSalesReport(storeId: string, startDate: Date, endDate: Date) {
  const orders = await prisma.groceryOrder.findMany({
    where: {
      storeId,
      createdAt: { gte: startDate, lte: endDate },
      status: { not: "cancelled" },
    },
    include: {
      customer: {
        select: {
          firstName: true,
          lastName: true,
        },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  const dailySales = orders.reduce((acc: Record<string, any>, order) => {
    const dateKey = order.createdAt.toISOString().split('T')[0];
    if (!acc[dateKey]) {
      acc[dateKey] = {
        date: dateKey,
        orderCount: 0,
        totalRevenue: 0,
        averageOrderValue: 0,
      };
    }
    acc[dateKey].orderCount++;
    acc[dateKey].totalRevenue += order.totalAmount;
    return acc;
  }, {});

  // Convert to array and calculate averages
  const salesData = Object.values(dailySales).map((day: any) => ({
    ...day,
    averageOrderValue: Math.round(day.totalRevenue / day.orderCount * 100) / 100,
  }));

  const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
  const totalOrders = orders.length;
  const averageOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders * 100) / 100 : 0;

  return {
    summary: {
      period: { start: startDate, end: endDate },
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      totalOrders,
      averageOrderValue,
      conversionRate: "2.3%", // Would calculate from customer data
    },
    dailyBreakdown: salesData,
    topPerforming: {
      products: [], // Would join with order items
      categories: [], // Would aggregate by category
    },
  };
}

// Generate inventory report
async function _generateInventoryReport(storeId: string, startDate: Date, endDate: Date) {
  const products = await prisma.groceryProduct.findMany({
    where: { storeId },
    include: {
      category: {
        select: {
          name: true,
        },
      },
      supplier: {
        select: {
          name: true,
        },
      },
    },
  });

  const stockStatus = products.reduce((acc: Record<string, number>, product) => {
    acc[product.status] = (acc[product.status] || 0) + 1;
    return acc;
  }, {});

  const lowStockItems = products.filter(p => p.currentStock <= p.minimumStock);
  const outOfStockItems = products.filter(p => p.currentStock === 0);

  const inventoryValue = products.reduce((sum, p) => sum + (p.currentStock * p.costPrice), 0);

  return {
    summary: {
      period: { start: startDate, end: endDate },
      totalItems: products.length,
      totalInventoryValue: Math.round(inventoryValue * 100) / 100,
      stockStatus,
      lowStockItems: lowStockItems.length,
      outOfStockItems: outOfStockItems.length,
    },
    detailed: products.map(product => ({
      id: product.id,
      name: product.name,
      sku: product.sku,
      category: product.category.name,
      supplier: product.supplier.name,
      currentStock: product.currentStock,
      minimumStock: product.minimumStock,
      status: product.status,
      value: Math.round(product.currentStock * product.costPrice * 100) / 100,
    })),
    recommendations: this.generateInventoryRecommendations(lowStockItems, outOfStockItems),
  };
}

// Generate order report
async function _generateOrderReport(storeId: string, startDate: Date, endDate: Date) {
  const orders = await prisma.groceryOrder.findMany({
    where: {
      storeId,
      createdAt: { gte: startDate, lte: endDate },
    },
    include: {
      customer: {
        select: {
          firstName: true,
          lastName: true,
        },
      },
      items: {
        select: {
          quantity: true,
          unitPrice: true,
          product: {
            select: {
              name: true,
            },
          },
        },
      },
    },
  });

  const statusBreakdown = orders.reduce((acc: Record<string, number>, order) => {
    acc[order.status] = (acc[order.status] || 0) + 1;
    return acc;
  }, {});

  const fulfillmentMethods = orders.reduce((acc: Record<string, number>, order) => {
    acc[order.fulfillmentMethod] = (acc[order.fulfillmentMethod] || 0) + 1;
    return acc;
  }, {});

  return {
    summary: {
      period: { start: startDate, end: endDate },
      totalOrders: orders.length,
      statusBreakdown,
      fulfillmentMethods,
      averageOrderValue: Math.round(orders.reduce((sum, o) => sum + o.totalAmount, 0) / orders.length * 100) / 100,
    },
    detailed: orders.map(order => ({
      id: order.id,
      customer: `${order.customer.firstName} ${order.customer.lastName}`,
      totalAmount: order.totalAmount,
      status: order.status,
      fulfillmentMethod: order.fulfillmentMethod,
      itemCount: order.items.reduce((sum, item) => sum + item.quantity, 0),
      createdAt: order.createdAt,
    })),
  };
}

// Generate customer report
async function _generateCustomerReport(storeId: string, startDate: Date, endDate: Date) {
  const customers = await prisma.user.findMany({
    where: { storeId },
    include: {
      orders: {
        where: {
          createdAt: { gte: startDate, lte: endDate },
        },
        select: {
          totalAmount: true,
          status: true,
        },
      },
    },
  });

  const customerStats = customers.map(customer => {
    const totalSpent = customer.orders.reduce((sum, order) => sum + order.totalAmount, 0);
    const orderCount = customer.orders.length;
    const averageOrder = orderCount > 0 ? totalSpent / orderCount : 0;
    
    return {
      id: customer.id,
      name: `${customer.firstName} ${customer.lastName}`,
      email: customer.email,
      orderCount,
      totalSpent: Math.round(totalSpent * 100) / 100,
      averageOrder: Math.round(averageOrder * 100) / 100,
      customerLifetimeValue: Math.round(totalSpent * 1.5 * 100) / 100, // Simplified CLV
    };
  });

  const topCustomers = customerStats
    .sort((a, b) => b.totalSpent - a.totalSpent)
    .slice(0, 20);

  return {
    summary: {
      period: { start: startDate, end: endDate },
      totalCustomers: customers.length,
      activeCustomers: customerStats.filter(c => c.orderCount > 0).length,
      averageCustomerValue: Math.round(customerStats.reduce((sum, c) => sum + c.totalSpent, 0) / customers.length * 100) / 100,
    },
    topCustomers,
  };
}

// Generate inventory recommendations
function _generateInventoryRecommendations(lowStock: any[], outOfStock: any[]): string[] {
  const recommendations: string[] = [];
  
  if (outOfStock.length > 0) {
    recommendations.push(`Immediate action needed: ${outOfStock.length} items are completely out of stock`);
  }
  
  if (lowStock.length > 0) {
    recommendations.push(`${lowStock.length} items are below minimum stock levels - consider reordering`);
  }
  
  recommendations.push("Review seasonal demand patterns for better forecasting");
  recommendations.push("Set up automatic reorder alerts for critical items");
  
  return recommendations;
}

// Convert data to CSV format
function _convertToCSV(data: any): string {
  if (!data.detailed) return "No detailed data available";
  
  const headers = Object.keys(data.detailed[0]);
  const csvRows = [
    headers.join(','),
    ...data.detailed.map((row: any) => 
      headers.map(header => 
        typeof row[header] === 'object' 
          ? JSON.stringify(row[header])
          : `"${String(row[header]).replace(/"/g, '""')}"`
      ).join(',')
    )
  ];
  
  return csvRows.join('\n');
}