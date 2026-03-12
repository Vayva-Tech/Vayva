import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI, type APIContext } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { logger, standardHeaders } from "@vayva/shared";

export const GET = withVayvaAPI(
  PERMISSIONS.WHOLESALE_VIEW,
  async (req: NextRequest, { storeId, correlationId }: APIContext) => {
    const requestId = correlationId;
    try {
      const { searchParams } = new URL(req.url);
      const period = searchParams.get('period') || 'month';
      const comparePeriod = searchParams.get('compare') === 'true';
      
      // Calculate date ranges
      const now = new Date();
      let startDate: Date, comparisonStartDate: Date, comparisonEndDate: Date;
      
      switch (period) {
        case 'week':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
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
          startDate = new Date(now.getFullYear(), 0, 1);
          comparisonStartDate = new Date(now.getFullYear() - 1, 0, 1);
          comparisonEndDate = startDate;
          break;
        default:
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          comparisonStartDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
          comparisonEndDate = startDate;
      }

      // Fetch all required data in parallel
      const [
        currentOrders,
        comparisonOrders,
        currentCustomers,
        comparisonCustomers,
        currentProducts,
        currentSuppliers,
        currentInventory,
        topCustomers,
        topProducts,
        salesByCategory,
      ] = await Promise.all([
        // Current period data
        prisma.wholesaleOrder.findMany({
          where: {
            storeId,
            createdAt: { gte: startDate },
            status: { not: "cancelled" },
          },
          include: {
            customer: { select: { id: true, companyName: true } },
            items: { select: { productId: true, quantity: true, totalPrice: true } },
          },
        }),
        
        // Comparison period data
        comparePeriod ? prisma.wholesaleOrder.findMany({
          where: {
            storeId,
            createdAt: { gte: comparisonStartDate, lt: comparisonEndDate },
            status: { not: "cancelled" },
          },
        }) : Promise.resolve([]),
        
        prisma.wholesaleCustomer.count({
          where: {
            storeId,
            createdAt: { gte: startDate },
          },
        }),
        
        comparePeriod ? prisma.wholesaleCustomer.count({
          where: {
            storeId,
            createdAt: { gte: comparisonStartDate, lt: comparisonEndDate },
          },
        }) : Promise.resolve(0),
        
        prisma.wholesaleProduct.count({
          where: { storeId, active: true },
        }),
        
        prisma.wholesaleSupplier.count({
          where: { storeId, active: true },
        }),
        
        prisma.wholesaleInventory.findMany({
          where: { storeId },
          select: { currentStock: true, reservedStock: true, reorderPoint: true },
        }),
        
        prisma.wholesaleCustomer.findMany({
          where: { storeId },
          include: {
            _count: {
              select: {
                orders: {
                  where: {
                    createdAt: { gte: startDate },
                    status: { not: "cancelled" },
                  },
                },
              },
            },
            orders: {
              where: {
                createdAt: { gte: startDate },
                status: { not: "cancelled" },
              },
              select: { totalAmount: true },
            },
          },
          orderBy: { orders: { _count: "desc" } },
          take: 10,
        }),
        
        prisma.wholesaleProduct.findMany({
          where: { storeId },
          include: {
            _count: {
              select: {
                orderItems: {
                  where: {
                    order: {
                      createdAt: { gte: startDate },
                      status: { not: "cancelled" },
                    },
                  },
                },
              },
            },
            orderItems: {
              where: {
                order: {
                  createdAt: { gte: startDate },
                  status: { not: "cancelled" },
                },
              },
              select: { quantity: true, totalPrice: true },
            },
          },
          orderBy: { orderItems: { _count: "desc" } },
          take: 10,
        }),
        
        prisma.wholesaleCategory.findMany({
          where: { storeId },
          include: {
            products: {
              where: {
                orderItems: {
                  some: {
                    order: {
                      createdAt: { gte: startDate },
                      status: { not: "cancelled" },
                    },
                  },
                },
              },
              select: {
                id: true,
                orderItems: {
                  where: {
                    order: {
                      createdAt: { gte: startDate },
                      status: { not: "cancelled" },
                    },
                  },
                  select: { quantity: true, totalPrice: true },
                },
              },
            },
          },
        }),
      ]);

      // Calculate metrics
      const currentRevenue = currentOrders.reduce((sum, order) => sum + order.totalAmount, 0);
      const currentOrderCount = currentOrders.length;
      const averageOrderValue = currentOrderCount > 0 ? currentRevenue / currentOrderCount : 0;
      
      const comparisonRevenue = comparisonOrders.reduce((sum, order) => sum + order.totalAmount, 0);
      const comparisonOrderCount = comparisonOrders.length;
      
      // Customer metrics
      const activeCustomers = currentCustomers;
      const newCustomers = currentCustomers;
      const customerRetentionRate = activeCustomers > 0 
        ? (activeCustomers / (activeCustomers + newCustomers)) * 100 
        : 0;
      
      // Inventory metrics
      const totalStockValue = currentInventory.reduce((sum, inv) => 
        sum + (inv.currentStock * 10), 0); // Assuming $10 average cost
      const lowStockItems = currentInventory.filter(inv => 
        inv.currentStock <= inv.reorderPoint).length;
      const stockoutItems = currentInventory.filter(inv => inv.currentStock <= 0).length;
      
      // Top performing customers
      const topCustomersData = topCustomers.map(customer => ({
        id: customer.id,
        companyName: customer.companyName,
        orderCount: customer._count.orders,
        totalSpent: customer.orders.reduce((sum, order) => sum + order.totalAmount, 0),
      }));
      
      // Top selling products
      const topProductsData = topProducts.map(product => ({
        id: product.id,
        name: product.name,
        unitsSold: product.orderItems.reduce((sum, item) => sum + item.quantity, 0),
        revenue: product.orderItems.reduce((sum, item) => sum + item.totalPrice, 0),
      }));
      
      // Sales by category
      const categorySales = salesByCategory.map(category => ({
        id: category.id,
        name: category.name,
        unitsSold: category.products.flatMap(p => 
          p.orderItems.map(item => item.quantity)).reduce((a, b) => a + b, 0),
        revenue: category.products.flatMap(p => 
          p.orderItems.map(item => item.totalPrice)).reduce((a, b) => a + b, 0),
      }));

      const analyticsData = {
        overview: {
          revenue: {
            current: currentRevenue,
            previous: comparisonRevenue,
            change: comparisonRevenue > 0 
              ? ((currentRevenue - comparisonRevenue) / comparisonRevenue) * 100
              : 0,
          },
          orders: {
            current: currentOrderCount,
            previous: comparisonOrderCount,
            change: comparisonOrderCount > 0 
              ? ((currentOrderCount - comparisonOrderCount) / comparisonOrderCount) * 100
              : 0,
          },
          averageOrderValue: {
            current: averageOrderValue,
            previous: comparisonOrderCount > 0 
              ? comparisonRevenue / comparisonOrderCount 
              : 0,
            change: comparisonOrderCount > 0 
              ? ((averageOrderValue - (comparisonRevenue / comparisonOrderCount)) / 
                 (comparisonRevenue / comparisonOrderCount)) * 100
              : 0,
          },
        },
        customers: {
          active: activeCustomers,
          new: newCustomers,
          retentionRate: customerRetentionRate,
          topCustomers: topCustomersData,
        },
        inventory: {
          totalProducts: currentProducts,
          activeSuppliers: currentSuppliers,
          totalStockValue,
          lowStockItems,
          stockoutItems,
        },
        products: {
          topSellers: topProductsData,
        },
        categories: {
          salesByCategory: categorySales,
        },
        period: {
          current: {
            start: startDate.toISOString(),
            end: now.toISOString(),
          },
          comparison: comparePeriod ? {
            start: comparisonStartDate.toISOString(),
            end: comparisonEndDate.toISOString(),
          } : null,
        },
      };

      return NextResponse.json(
        { data: analyticsData },
        { headers: standardHeaders(requestId) }
      );
    } catch (error: unknown) {
      logger.error("[WHOLESALE_ANALYTICS_GET]", { error, storeId });
      return NextResponse.json(
        { error: "Failed to fetch analytics data" },
        { status: 500, headers: standardHeaders(requestId) }
      );
    }
  }
);